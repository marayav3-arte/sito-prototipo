/**
 * VoiceFlowPanel.js  v2.0
 * ─────────────────────────────────────────────────────────────────────────────
 * Flujo secuencial de DIAGNÓSTICO POR VOZ en 2 etapas:
 *   Etapa 1 → detecta subsistema
 *   Etapa 2 → detecta síntoma del subsistema elegido
 *   → llama onComplete(categoryId, symptomId) para abrir la vista de solución
 *
 * Correcciones v2:
 *  - stageRef + confirmedCatRef evitan closures desactualizados en onresult
 *  - Auto-restart en onend mientras sigue en modo activo
 *  - Matching dinámico por palabras clave extraídas del título de síntoma
 *  - Matching por número de opción ("uno", "primero", "dos"…)
 *  - Transcript en vivo visible en pantalla ("Oído: …")
 *  - Simulación avanza en ambas etapas
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Platform, ScrollView,
} from 'react-native';
import { Mic, MicOff, ChevronRight } from 'lucide-react-native';

// ─── Datos reales del árbol ───────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'lubricacion',  name: 'SISTEMA DE LUBRICACIÓN',  desc: 'Depósitos, caudal, bombas de aceite, drenaje' },
  { id: 'hidraulica',   name: 'SISTEMA HIDRÁULICO',       desc: 'Bomba, válvulas, mangueras, pistones' },
  { id: 'mecanico',     name: 'TRANSMISIÓN Y MECÁNICA',   desc: 'Engranajes, rodamientos, acoples, buje' },
  { id: 'electrico',    name: 'SISTEMA ELÉCTRICO',        desc: 'Motor, sensores, cables, PLC, contactores' },
];

const SYMPTOMS = {
  lubricacion: [
    { id: 'overheat', title: 'EL CHANCADOR SE SOBRECALIENTA (>85°C)',   code: 'SYM-CRIT-01', isCritical: true },
    { id: 'l1',       title: 'PRESIÓN DE GRASA BAJA EN DISTRIBUIDOR',   code: 'SYM-LUB-01' },
    { id: 'l2',       title: 'CONTAMINACIÓN CON POLVO O PARTÍCULAS',    code: 'SYM-LUB-02' },
    { id: 'l3',       title: 'FILTRO TAPADO / ALARMA DE BYPASS',        code: 'SYM-LUB-03' },
  ],
  hidraulica: [
    { id: 'overheat', title: 'EL CHANCADOR SE SOBRECALIENTA (>85°C)',   code: 'SYM-CRIT-01', isCritical: true },
    { id: 'h1',       title: 'PRESIÓN INESTABLE / BAJA',                code: 'SYM-HYD-01' },
    { id: 'h2',       title: 'SOBRETEMPERATURA EN ACEITE (>85°C)',      code: 'SYM-HYD-02' },
    { id: 'h3',       title: 'CAVITACIÓN / RUIDO EN BOMBA',             code: 'SYM-HYD-03' },
  ],
  mecanico: [
    { id: 'overheat', title: 'EL CHANCADOR SE SOBRECALIENTA (>85°C)',   code: 'SYM-CRIT-01', isCritical: true },
    { id: 'm1',       title: 'VIBRACIÓN ANORMAL EN COJINETES / BUJE',  code: 'SYM-MEC-01' },
    { id: 'm2',       title: 'REEMPLAZO O DESGASTE DE BUJE EXCÉNTRICA',code: 'SYM-MEC-02' },
    { id: 'm3',       title: 'TRABAMIENTO / DIFICULTAD DE GIRO',        code: 'SYM-MEC-03' },
  ],
  electrico: [
    { id: 'e1',       title: 'DISPARO DE RELÉ TÉRMICO',                 code: 'SYM-ELE-01' },
    { id: 'e2',       title: 'FALLA DE COMUNICACIÓN PLC (BUS)',         code: 'SYM-ELE-02' },
    { id: 'e3',       title: 'LECTURA ERRÁTICA DE SENSOR DE FLUJO',     code: 'SYM-ELE-03' },
  ],
};

// ─── Mapa fijo de subsistema (etapa 1) ───────────────────────────────────────
const CATEGORY_KEYWORDS = [
  { id: 'lubricacion', kw: ['lubricacion','aceite','grasa','caudal','deposito','bomba de aceite','drenaje','lubric'] },
  { id: 'hidraulica',  kw: ['hidraulico','hidraulica','piston','valvula','manguera','presion hidraulica','hidrau'] },
  { id: 'mecanico',    kw: ['mecanico','mecanica','transmision','engranaje','rodamiento','acople','buje','eje','vibracion','trabamiento','transmis'] },
  { id: 'electrico',   kw: ['electrico','electrica','motor','sensor','cable','plc','contactor','rele','comunicacion','electr'] },
];

// ─── Helpers de normalización ─────────────────────────────────────────────────
function normalizarTexto(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // quitar tildes
    .replace(/[/\-().°><%,;:!?¿¡"']/g, ' ')            // quitar puntuación
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extrae palabras de > 3 letras de un título de síntoma para matching dinámico */
function extraerKeywords(titulo) {
  return normalizarTexto(titulo)
    .split(' ')
    .filter(w => w.length > 3)
    .map(w => w);
}

/** Alias numéricos para selección por número hablado */
const NUM_ALIASES = {
  1: ['uno','primero','primera','opcion uno','opcion 1','numero uno'],
  2: ['dos','segundo','segunda','opcion dos','opcion 2','numero dos'],
  3: ['tres','tercero','tercera','opcion tres','opcion 3','numero tres'],
  4: ['cuatro','cuarto','cuarta','opcion cuatro','opcion 4','numero cuatro'],
};

function matchCategory(transcript) {
  const t = normalizarTexto(transcript);
  for (const { id, kw } of CATEGORY_KEYWORDS) {
    if (kw.some(k => t.includes(normalizarTexto(k)))) return id;
  }
  return null;
}

function matchSymptom(transcript, categoryId) {
  const t = normalizarTexto(transcript);
  const list = SYMPTOMS[categoryId] || [];

  // 1️⃣ Matching dinámico por keywords del título
  for (const sym of list) {
    const kws = extraerKeywords(sym.title);
    const matchCount = kws.filter(k => t.includes(k)).length;
    if (matchCount >= 1) return sym.id;
  }

  // 2️⃣ Matching por número de opción hablado
  for (const [numStr, aliases] of Object.entries(NUM_ALIASES)) {
    const idx = parseInt(numStr) - 1;
    if (idx < list.length && aliases.some(a => t.includes(a))) {
      return list[idx].id;
    }
  }

  return null;
}

// ─── Colores ──────────────────────────────────────────────────────────────────
const CYAN   = '#06B6D4';
const AMBER  = '#F59E0B';
const GREEN  = '#10B981';
const RED    = '#EF4444';
const BG     = '#050D1A';
const CARD   = '#0B1929';
const TEXT   = '#CBD5E1';
const DIM    = '#475569';

const BACK_KEYWORDS = ['atras','volver','regresar','anterior','retroceder','back'];
function detectBack(transcript) {
  const t = normalizarTexto(transcript);
  return BACK_KEYWORDS.some(k => t.includes(k));
}

export default function VoiceFlowPanel({ onBack, onComplete }) {
  const [stage, setStage]               = useState(1);           // 1 | 2
  const [listening, setListening]       = useState(false);
  const [liveText, setLiveText]         = useState('');          // "Oído: …"
  const [confirmedCat, setConfirmedCat] = useState(null);
  const [confirmedSym, setConfirmedSym] = useState(null);
  const [flashGreen, setFlashGreen]     = useState(false);
  const [supported, setSupported]       = useState(true);
  const [simRunning, setSimRunning]     = useState(false);
  const [done, setDone]                 = useState(false);        // bloquea restart
  const [goingBack, setGoingBack]       = useState(false);

  // ── Refs anti-closure ────────────────────────────────────────────────────
  const stageRef        = useRef(1);
  const confirmedCatRef = useRef(null);
  const doneRef         = useRef(false);
  const recRef          = useRef(null);

  // ── Animación de pulso ────────────────────────────────────────────────────
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);

  const startPulse = useCallback(() => {
    pulseLoop.current?.stop();
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 480, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 480, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    pulseLoop.current?.stop();
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  // ── Lógica de procesamiento (usa refs para evitar closures viejos) ────────
  const processText = useCallback((text) => {
    if (!text || !text.trim() || doneRef.current) return;
    const currentStage = stageRef.current;

    // ── PRIORIDAD: "ATRÁS" antes que cualquier subsistema o síntoma ──────────
    if (detectBack(text)) {
      if (currentStage === 1) {
        // Etapa 1 → salir del modo voz por completo
        doneRef.current = true;
        try { recRef.current?.abort(); } catch (_) {}
        setListening(false); stopPulse();
        setGoingBack(true);
        setTimeout(() => { setGoingBack(false); onBack(); }, 500);
      } else if (currentStage === 2) {
        // Etapa 2 → retroceder a etapa 1
        try { recRef.current?.abort(); } catch (_) {}
        setListening(false); stopPulse();
        setGoingBack(true);
        setTimeout(() => {
          setGoingBack(false);
          confirmedCatRef.current = null;
          setConfirmedCat(null);
          setConfirmedSym(null);
          setLiveText('');
          stageRef.current = 1;
          setStage(1);
          doneRef.current = false;
        }, 500);
      }
      return;
    }

    if (currentStage === 1) {
      const catId = matchCategory(text);
      if (!catId) return; // no reconocido → continuar escuchando

      const cat = CATEGORIES.find(c => c.id === catId);
      confirmedCatRef.current = cat;
      setConfirmedCat(cat);
      setFlashGreen(true);
      setLiveText('');
      setTimeout(() => {
        setFlashGreen(false);
        stageRef.current = 2;
        setStage(2);
      }, 900);

    } else if (currentStage === 2) {
      const catId = confirmedCatRef.current?.id;
      if (!catId) return;
      const symId = matchSymptom(text, catId);
      if (!symId) return; // no reconocido → continuar escuchando

      const sym = SYMPTOMS[catId]?.find(s => s.id === symId);
      if (!sym) return;

      doneRef.current = true;
      setDone(true);
      setConfirmedSym(sym);
      setFlashGreen(true);
      setLiveText('');
      try { recRef.current?.abort(); } catch (_) {}
      setListening(false);
      stopPulse();
      setTimeout(() => {
        setFlashGreen(false);
        onComplete(catId, symId);
      }, 800);
    }
  }, [onComplete, stopPulse, onBack]);

  // ── Crear e iniciar recognition ───────────────────────────────────────────
  const startListening = useCallback(() => {
    if (Platform.OS !== 'web') { setSupported(false); return; }
    if (doneRef.current) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    // Si ya hay una sesión, abortarla limpiamente
    try { recRef.current?.abort(); } catch (_) {}

    const rec = new SR();
    rec.lang = 'es-CL';
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 3;

    rec.onstart = () => {
      setListening(true);
      startPulse();
    };

    rec.onresult = (event) => {
      let interim = '';
      let final   = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const resultText = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += resultText;
        else interim += resultText;
      }
      const heard = final || interim;
      setLiveText(heard);
      // Intentar match en tiempo real (incluso con texto provisional)
      if (heard.trim()) processText(heard);
    };

    rec.onend = () => {
      setListening(false);
      stopPulse();
      // Auto-restart si aún no terminamos
      if (!doneRef.current) {
        setTimeout(() => {
          if (!doneRef.current) startListening();
        }, 350);
      }
    };

    rec.onerror = (e) => {
      if (e.error === 'aborted' || e.error === 'no-speech') return; // reiniciará en onend
      setListening(false);
      stopPulse();
    };

    recRef.current = rec;
    try { rec.start(); } catch (_) { setSupported(false); }
  }, [startPulse, stopPulse, processText]);

  const stopListening = useCallback(() => {
    doneRef.current = true;
    try { recRef.current?.abort(); } catch (_) {}
    setListening(false);
    stopPulse();
  }, [stopPulse]);

  // ── Autoarranque al montar ────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => startListening(), 400);
    return () => {
      clearTimeout(timer);
      doneRef.current = true;
      try { recRef.current?.abort(); } catch (_) {}
      stopPulse();
    };
  }, []); // eslint-disable-line

  // ── Selección manual (toque en tarjeta) ──────────────────────────────────
  function selectCategory(cat) {
    if (doneRef.current) return;
    try { recRef.current?.abort(); } catch (_) {}
    confirmedCatRef.current = cat;
    setConfirmedCat(cat);
    setFlashGreen(true);
    setLiveText('');
    setTimeout(() => {
      setFlashGreen(false);
      stageRef.current = 2;
      setStage(2);
      // Reiniciar escucha en etapa 2
      doneRef.current = false;
      setTimeout(() => startListening(), 350);
    }, 900);
  }

  function selectSymptom(sym) {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    try { recRef.current?.abort(); } catch (_) {}
    setListening(false);
    stopPulse();
    setConfirmedSym(sym);
    setFlashGreen(true);
    setLiveText('');
    setTimeout(() => {
      setFlashGreen(false);
      onComplete(confirmedCatRef.current?.id || confirmedCat?.id, sym.id);
    }, 800);
  }

  // ── Simulación (prueba en ambientes ruidosos) ─────────────────────────────
  function runSimulation() {
    if (simRunning || doneRef.current) return;
    setSimRunning(true);
    // Forzar abort limpio
    doneRef.current = false;
    try { recRef.current?.abort(); } catch (_) {}
    setListening(false);
    stopPulse();

    // Etapa 1: "hidráulico"
    setLiveText('sistema hidráulico');
    const cat = CATEGORIES.find(c => c.id === 'hidraulica');
    confirmedCatRef.current = cat;
    setConfirmedCat(cat);
    setFlashGreen(true);
    setTimeout(() => {
      setFlashGreen(false);
      stageRef.current = 2;
      setStage(2);
      setLiveText('');
      // Etapa 2: "presión inestable"
      setTimeout(() => {
        setLiveText('presión inestable baja');
        const sym = SYMPTOMS['hidraulica'].find(s => s.id === 'h1');
        doneRef.current = true;
        setDone(true);
        setConfirmedSym(sym);
        setFlashGreen(true);
        setTimeout(() => {
          setFlashGreen(false);
          setSimRunning(false);
          onComplete('hidraulica', 'h1');
        }, 800);
      }, 900);
    }, 900);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const currentSymptoms = confirmedCat ? SYMPTOMS[confirmedCat.id] : [];

  const statusMsg = !supported
    ? '⚠ Voz no disponible — use las tarjetas o simulación'
    : done
    ? '✓ Comando reconocido — abriendo inspección...'
    : listening
    ? (stage === 1 ? '🎙️  ESCUCHANDO SUBSISTEMA... HABLE AHORA' : '🎙️  ESCUCHANDO SÍNTOMA... HABLE AHORA')
    : '⏸  Reiniciando micrófono...';

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

      {/* ── Volver ───────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={s.backBtn}
        onPress={() => { stopListening(); onBack(); }}
        activeOpacity={0.8}
      >
        <Text style={s.backBtnText}>← VOLVER A SELECCIÓN DE MODO</Text>
      </TouchableOpacity>

      {/* ── Barra de estado ──────────────────────────────────────────────── */}
      <View style={[
        s.statusBar,
        listening && s.statusBarActive,
        done && s.statusBarDone,
        !supported && s.statusBarOff,
      ]}>
        <Animated.View style={[
          s.micDot,
          { transform: [{ scale: pulseAnim }] },
          done && { backgroundColor: GREEN },
          !listening && !done && { backgroundColor: DIM },
        ]} />
        <Text style={[s.statusText, (listening || done) && s.statusTextActive]}>
          {statusMsg}
        </Text>
        {!done && (
          <TouchableOpacity
            style={s.micToggle}
            onPress={listening ? () => { try { recRef.current?.stop(); } catch (_) {} } : startListening}
            activeOpacity={0.8}
          >
            {listening
              ? <MicOff color={RED}  size={20} strokeWidth={2} />
              : <Mic    color={CYAN} size={20} strokeWidth={2} />}
          </TouchableOpacity>
        )}
      </View>

      {/* ── Texto en vivo "Oído: …" ──────────────────────────────────────── */}
      {liveText ? (
        <View style={s.liveBox}>
          <Text style={s.liveLabel}>OÍ​DO:</Text>
          <Text style={s.liveText}>"{liveText}"</Text>
        </View>
      ) : null}

      {/* ── Progreso acumulativo ─────────────────────────────────────────── */}
      <View style={s.progressBlock}>

        {/* Etapa 1 */}
        <View style={[
          s.progressRow,
          confirmedCat && s.progressRowDone,
          flashGreen && stage === 1 && s.progressRowFlash,
        ]}>
          <Text style={s.progressLabel}>SUBSISTEMA:</Text>
          <Text style={[s.progressValue, confirmedCat ? s.progressValueDone : s.progressValueWaiting]}>
            {confirmedCat ? `${confirmedCat.name} ✓` : '[ ESCUCHANDO SUBSISTEMA... ]'}
          </Text>
        </View>

        {/* Etapa 2 */}
        {confirmedCat && (
          <View style={[
            s.progressRow,
            confirmedSym && s.progressRowDone,
            flashGreen && stage === 2 && s.progressRowFlash,
          ]}>
            <Text style={s.progressLabel}>SÍNTOMA:</Text>
            <Text style={[s.progressValue, confirmedSym ? s.progressValueDone : s.progressValueWaiting]}>
              {confirmedSym ? `${confirmedSym.title} ✓` : '[ ESCUCHANDO SÍNTOMA... ]'}
            </Text>
          </View>
        )}
      </View>

      {/* ── ETAPA 1: Tarjetas de subsistema ─────────────────────────────── */}
      {stage === 1 && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>TOQUE O DIGA EL SUBSISTEMA:</Text>
          {CATEGORIES.map((cat, idx) => (
            <TouchableOpacity
              key={cat.id}
              style={s.catCard}
              onPress={() => selectCategory(cat)}
              activeOpacity={0.82}
            >
              <View style={s.catCardNumBadge}>
                <Text style={s.catCardNumText}>{idx + 1}</Text>
              </View>
              <View style={s.catCardInner}>
                <Text style={s.catCardName}>{cat.name}</Text>
                <Text style={s.catCardDesc}>{cat.desc}</Text>
              </View>
              <ChevronRight color={CYAN} size={22} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── ETAPA 2: Tarjetas de síntoma ────────────────────────────────── */}
      {stage === 2 && confirmedCat && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>TOQUE O DIGA EL SÍNTOMA (o diga "UNO", "DOS"…):</Text>
          {currentSymptoms.map((sym, idx) => (
            <TouchableOpacity
              key={sym.id}
              style={[s.symCard, sym.isCritical && s.symCardCritical]}
              onPress={() => selectSymptom(sym)}
              activeOpacity={0.82}
            >
              <View style={[s.symNumBadge, sym.isCritical && s.symNumBadgeCrit]}>
                <Text style={[s.symNumText, sym.isCritical && { color: RED }]}>{idx + 1}</Text>
              </View>
              <View style={s.symCardInner}>
                {sym.isCritical && <Text style={s.symCritBadge}>⚠ SÍNTOMA CRÍTICO</Text>}
                <Text style={[s.symCardTitle, sym.isCritical && s.symCardTitleCrit]}>
                  {sym.title}
                </Text>
                <Text style={s.symCardCode}>{sym.code}</Text>
              </View>
              <ChevronRight color={sym.isCritical ? RED : AMBER} size={22} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Botones de simulación ─────────────────────────────────────────── */}
      {!done && (
        <View style={s.simRow}>
          <TouchableOpacity
            style={[s.simBtn, { flex: 1 }]}
            onPress={runSimulation}
            activeOpacity={0.85}
            disabled={simRunning}
          >
            <Text style={s.simBtnText}>
              {simRunning ? '⏳ SIMULANDO...' : '⚡ SIMULAR VOZ (PRUEBA)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.simBtn, s.simBtnBack]}
            onPress={() => processText('atrás')}
            activeOpacity={0.85}
          >
            <Text style={[s.simBtnText, { color: '#06B6D4' }]}>↩ "ATRÁS"</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Flash "VOLVIENDO ATRÁS" */}
      {goingBack && (
        <View style={s.flashBack}>
          <Text style={s.flashBackText}>↩️  VOLVIENDO ATRÁS...</Text>
        </View>
      )}

    </ScrollView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  scroll:     { flex: 1 },
  container:  { paddingHorizontal: 12, paddingBottom: 32, gap: 12 },

  backBtn: {
    backgroundColor: '#0D1A28',
    borderWidth: 1, borderColor: '#1E3A5A', borderRadius: 10,
    minHeight: 48, paddingVertical: 12, paddingHorizontal: 16,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  backBtnText: { color: '#94A3B8', fontSize: 13, fontWeight: '700', letterSpacing: 0.4 },

  // Status bar
  statusBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0D1E2E', borderWidth: 1.5, borderColor: '#1E3A5A',
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16,
    gap: 10, minHeight: 56,
  },
  statusBarActive: { borderColor: CYAN, backgroundColor: 'rgba(6,182,212,0.08)' },
  statusBarDone:   { borderColor: GREEN, backgroundColor: 'rgba(16,185,129,0.08)' },
  statusBarOff:    { borderColor: AMBER, backgroundColor: 'rgba(245,158,11,0.07)' },
  micDot: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: CYAN, flexShrink: 0,
  },
  statusText: { flex: 1, color: '#64748B', fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
  statusTextActive: { color: '#FFFFFF' },
  micToggle: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: '#0D1A28',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },

  // Texto en vivo
  liveBox: {
    backgroundColor: '#061420', borderWidth: 1, borderColor: '#1E3A5A',
    borderRadius: 10, padding: 12, gap: 3,
  },
  liveLabel: { color: DIM, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  liveText:  { color: '#C8DCF0', fontSize: 15, fontStyle: 'italic', lineHeight: 22 },

  // Progreso
  progressBlock: { gap: 8 },
  progressRow: {
    backgroundColor: CARD, borderWidth: 1.5, borderColor: '#1E3A5A',
    borderRadius: 10, padding: 14, gap: 4,
  },
  progressRowDone:  { borderColor: GREEN, backgroundColor: 'rgba(16,185,129,0.07)' },
  progressRowFlash: { borderColor: GREEN, backgroundColor: 'rgba(16,185,129,0.22)' },
  progressLabel: { color: DIM, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  progressValue:        { fontSize: 14, fontWeight: '900', letterSpacing: 0.3 },
  progressValueWaiting: { color: CYAN },
  progressValueDone:    { color: GREEN, fontSize: 15 },

  // Sección
  section:      { gap: 8 },
  sectionLabel: { color: DIM, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 2 },

  // Tarjetas subsistema
  catCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderWidth: 1.5, borderColor: '#1E3A5A',
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16,
    gap: 12, minHeight: 68,
  },
  catCardNumBadge: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: 'rgba(6,182,212,0.15)', borderWidth: 1, borderColor: CYAN,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  catCardNumText: { color: CYAN, fontSize: 14, fontWeight: '900' },
  catCardInner:   { flex: 1, gap: 3 },
  catCardName:    { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  catCardDesc:    { color: TEXT, fontSize: 12, lineHeight: 17 },

  // Tarjetas síntoma
  symCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderWidth: 1.5, borderColor: '#1E3A5A',
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16,
    gap: 12, minHeight: 64,
  },
  symCardCritical: { borderColor: RED + '88', backgroundColor: '#1A0808' },
  symNumBadge: {
    width: 28, height: 28, borderRadius: 7,
    backgroundColor: 'rgba(234,179,8,0.14)', borderWidth: 1, borderColor: AMBER,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  symNumBadgeCrit: { backgroundColor: 'rgba(239,68,68,0.14)', borderColor: RED },
  symNumText:      { color: AMBER, fontSize: 13, fontWeight: '900' },
  symCardInner:    { flex: 1, gap: 3 },
  symCritBadge:    { color: RED, fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  symCardTitle:    { color: '#E2F0FF', fontSize: 14, fontWeight: '700', lineHeight: 20 },
  symCardTitleCrit:{ color: '#FCA5A5' },
  symCardCode:     { color: DIM, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  // Simulación
  simBtn: {
    backgroundColor: '#0D1A28', borderWidth: 1.5, borderColor: '#2A3A5A',
    borderRadius: 10, minHeight: 54, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  simBtnText: { color: AMBER, fontSize: 13, fontWeight: '700', letterSpacing: 0.4, textAlign: 'center' },
  simRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  simBtnBack: {
    borderColor: '#06B6D4',
    backgroundColor: 'rgba(6,182,212,0.07)',
    minWidth: 110, flex: 0,
  },
  flashBack: {
    backgroundColor: 'rgba(6,182,212,0.18)',
    borderWidth: 2, borderColor: '#06B6D4',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center',
    minHeight: 52,
  },
  flashBackText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
});
