/**
 * VoiceFlowPanel.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Flujo secuencial de DIAGNÓSTICO POR VOZ en 2 etapas:
 *   Etapa 1 → detecta subsistema  (lubricacion / hidraulica / mecanico / electrico)
 *   Etapa 2 → detecta síntoma del subsistema elegido
 *   → llama onComplete(categoryId, symptomId) para abrir la vista de solución
 *
 * El reconocimiento de voz se inicia automáticamente al montar el componente.
 *
 * Props:
 *   onBack()                           → volver a selección de modo
 *   onComplete(categoryId, symptomId)  → navegar a vista de solución
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Platform, ScrollView,
} from 'react-native';
import { Mic, MicOff, ChevronRight } from 'lucide-react-native';

// ─── Datos reales del árbol de diagnóstico ────────────────────────────────────
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

// ─── Mapa de palabras clave → subsistema ──────────────────────────────────────
const CATEGORY_KEYWORDS = [
  { id: 'lubricacion', kw: ['lubricacion','lubricación','aceite','grasa','caudal','deposito','bomba de aceite','drenaje'] },
  { id: 'hidraulica',  kw: ['hidraulico','hidráulico','hidraulica','hidráulica','pistón','piston','valvula','válvula','manguera','presion','presión'] },
  { id: 'mecanico',    kw: ['mecanico','mecánico','transmision','transmisión','engranaje','rodamiento','acople','buje','eje','vibracion','vibración','trabamiento'] },
  { id: 'electrico',   kw: ['electrico','eléctrico','motor','sensor','cable','plc','contactor','rele','relé','comunicacion','comunicación'] },
];

// ─── Mapa de palabras clave → síntoma ────────────────────────────────────────
const SYMPTOM_KEYWORDS = {
  lubricacion: [
    { id: 'overheat', kw: ['sobrecalenta','temperatura','caliente','85','critico','crítico'] },
    { id: 'l1',       kw: ['presion baja','presión baja','grasa baja','distribuidor','caudal bajo'] },
    { id: 'l2',       kw: ['contaminacion','contaminación','polvo','particula','partícula','suciedad'] },
    { id: 'l3',       kw: ['filtro','tapado','bypass','alarma'] },
  ],
  hidraulica: [
    { id: 'overheat', kw: ['sobrecalenta','temperatura','caliente','85','critico','crítico'] },
    { id: 'h1',       kw: ['presion inestable','presión inestable','presion baja','presión baja','inestable','fluctua','fluctúa'] },
    { id: 'h2',       kw: ['sobretemperatura','aceite caliente','temperatura aceite','sobretempera'] },
    { id: 'h3',       kw: ['cavitacion','cavitación','ruido','bomba','golpe','pompeo'] },
  ],
  mecanico: [
    { id: 'overheat', kw: ['sobrecalenta','temperatura','caliente','85','critico','crítico'] },
    { id: 'm1',       kw: ['vibracion','vibración','cojinete','buje','anormal','golpe'] },
    { id: 'm2',       kw: ['reemplazo','desgaste','buje excentrica','buje excéntrica','desgaste buje'] },
    { id: 'm3',       kw: ['trabamiento','trabado','dificultad de giro','no gira','atascado'] },
  ],
  electrico: [
    { id: 'e1',       kw: ['rele','relé','termico','térmico','disparo','termico','proteccion','protección'] },
    { id: 'e2',       kw: ['plc','bus','comunicacion','comunicación','falla comunicacion','red'] },
    { id: 'e3',       kw: ['sensor','flujo','erratico','errático','lectura','fluctua'] },
  ],
};

function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function matchCategory(transcript) {
  const t = normalize(transcript);
  for (const { id, kw } of CATEGORY_KEYWORDS) {
    if (kw.some(k => t.includes(normalize(k)))) return id;
  }
  return null;
}

function matchSymptom(transcript, categoryId) {
  const t = normalize(transcript);
  const list = SYMPTOM_KEYWORDS[categoryId] || [];
  for (const { id, kw } of list) {
    if (kw.some(k => t.includes(normalize(k)))) return id;
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

// ─── Simulación (prueba en ambientes ruidosos) ───────────────────────────────
const DEMO_STEPS = [
  { text: 'sistema hidráulico presión inestable', delay: 0 },
  { text: 'presión inestable baja bomba hidráulica', delay: 1200 },
];

export default function VoiceFlowPanel({ onBack, onComplete }) {
  // stage: 1 = seleccionando subsistema, 2 = seleccionando síntoma
  const [stage, setStage]                 = useState(1);
  const [listening, setListening]         = useState(false);
  const [transcript, setTranscript]       = useState('');
  const [confirmedCat, setConfirmedCat]   = useState(null); // { id, name }
  const [confirmedSym, setConfirmedSym]   = useState(null); // { id, title }
  const [confirmAnim, setConfirmAnim]     = useState(false); // flash verde al confirmar
  const [supported, setSupported]         = useState(true);
  const [simRunning, setSimRunning]       = useState(false);

  const recognitionRef = useRef(null);
  const pulseAnim      = useRef(new Animated.Value(1)).current;
  const pulseLoop      = useRef(null);

  // ── Animación de pulso ────────────────────────────────────────────────────
  const startPulse = useCallback(() => {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.35, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 500, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    if (pulseLoop.current) pulseLoop.current.stop();
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  // ── Iniciar SpeechRecognition ─────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (Platform.OS !== 'web') { setSupported(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const rec = new SR();
    rec.lang = 'es-CL';
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => { setListening(true); startPulse(); };

    rec.onresult = (event) => {
      let interim = '';
      let final   = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const resultText = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += resultText;
        else interim += resultText;
      }
      setTranscript(final || interim);
    };

    rec.onend = () => {
      setListening(false);
      stopPulse();
      // Auto-procesar al terminar
      setTranscript(prev => { processVoice(prev); return prev; });
    };

    rec.onerror = (e) => {
      if (e.error === 'aborted') return;
      setListening(false);
      stopPulse();
    };

    recognitionRef.current = rec;
    try { rec.start(); } catch (_) { setSupported(false); }
  }, [startPulse, stopPulse]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
    stopPulse();
  }, [stopPulse]);

  // ── Autoarranque al montar ────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => startListening(), 400);
    return () => {
      clearTimeout(timer);
      recognitionRef.current?.abort();
      stopPulse();
    };
  }, []); // eslint-disable-line

  // ── Reinicio de escucha al cambiar de etapa ───────────────────────────────
  useEffect(() => {
    if (stage === 2) {
      setTranscript('');
      const timer = setTimeout(() => startListening(), 600);
      return () => clearTimeout(timer);
    }
  }, [stage]); // eslint-disable-line

  // ── Procesar lo escuchado ─────────────────────────────────────────────────
  function processVoice(text) {
    if (!text || !text.trim()) return;

    if (stage === 1) {
      const catId = matchCategory(text);
      if (catId) {
        const cat = CATEGORIES.find(c => c.id === catId);
        setConfirmedCat(cat);
        setConfirmAnim(true);
        setTimeout(() => { setConfirmAnim(false); setStage(2); }, 900);
      } else {
        // No reconocido → reintentar
        setTimeout(() => startListening(), 400);
      }
    } else if (stage === 2 && confirmedCat) {
      const symId = matchSymptom(text, confirmedCat.id);
      if (symId) {
        const sym = SYMPTOMS[confirmedCat.id].find(s => s.id === symId);
        setConfirmedSym(sym);
        setConfirmAnim(true);
        setTimeout(() => {
          setConfirmAnim(false);
          onComplete(confirmedCat.id, symId);
        }, 900);
      } else {
        setTimeout(() => startListening(), 400);
      }
    }
  }

  // ── Selección manual (toque en tarjeta) ──────────────────────────────────
  function selectCategory(cat) {
    stopListening();
    setConfirmedCat(cat);
    setConfirmAnim(true);
    setTimeout(() => { setConfirmAnim(false); setStage(2); }, 900);
  }

  function selectSymptom(sym) {
    stopListening();
    setConfirmedSym(sym);
    setConfirmAnim(true);
    setTimeout(() => {
      setConfirmAnim(false);
      onComplete(confirmedCat.id, sym.id);
    }, 900);
  }

  // ── Simulación de dictado (prueba en ambientes ruidosos) ──────────────────
  function runSimulation() {
    if (simRunning) return;
    setSimRunning(true);
    stopListening();
    // Etapa 1: simular "hidráulico"
    const simText1 = 'sistema hidráulico';
    setTranscript(simText1);
    const cat = CATEGORIES.find(c => c.id === 'hidraulica');
    setConfirmedCat(cat);
    setConfirmAnim(true);
    setTimeout(() => {
      setConfirmAnim(false);
      setStage(2);
      setTranscript('');
      // Etapa 2: simular "presión inestable"
      setTimeout(() => {
        const simText2 = 'presión inestable baja';
        setTranscript(simText2);
        const sym = SYMPTOMS['hidraulica'].find(s => s.id === 'h1');
        setConfirmedSym(sym);
        setConfirmAnim(true);
        setTimeout(() => {
          setConfirmAnim(false);
          setSimRunning(false);
          onComplete('hidraulica', 'h1');
        }, 900);
      }, 800);
    }, 900);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const currentSymptoms = confirmedCat ? SYMPTOMS[confirmedCat.id] : [];

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

      {/* ── Botón Volver ─────────────────────────────────────────────────── */}
      <TouchableOpacity style={s.backBtn} onPress={() => { stopListening(); onBack(); }} activeOpacity={0.8}>
        <Text style={s.backBtnText}>← VOLVER A SELECCIÓN DE MODO</Text>
      </TouchableOpacity>

      {/* ── Barra de estado de escucha ───────────────────────────────────── */}
      <View style={[s.statusBar, listening && s.statusBarActive, !supported && s.statusBarOff]}>
        <Animated.View style={[s.micDot, { transform: [{ scale: pulseAnim }] }]} />
        <Text style={[s.statusText, listening && s.statusTextActive]}>
          {!supported
            ? '⚠ Voz no disponible — use las tarjetas o simulación'
            : listening
            ? '🎙️  ESCUCHANDO EN VIVO... HABLE AHORA'
            : '⏸  EN PAUSA — toque una tarjeta o pulse el micrófono'}
        </Text>
        <TouchableOpacity
          style={s.micToggle}
          onPress={listening ? stopListening : startListening}
          activeOpacity={0.8}
        >
          {listening
            ? <MicOff color={RED} size={20} strokeWidth={2} />
            : <Mic color={CYAN} size={20} strokeWidth={2} />}
        </TouchableOpacity>
      </View>

      {/* ── Transcripción en vivo ────────────────────────────────────────── */}
      {transcript ? (
        <View style={s.transcriptBox}>
          <Text style={s.transcriptLabel}>CAPTADO:</Text>
          <Text style={s.transcriptText}>"{transcript}"</Text>
        </View>
      ) : null}

      {/* ── PROGRESO ACUMULATIVO ─────────────────────────────────────────── */}
      <View style={s.progressBlock}>

        {/* Etapa 1 */}
        <View style={[s.progressRow, confirmedCat && s.progressRowDone, confirmAnim && stage === 1 && s.progressRowFlash]}>
          <Text style={s.progressLabel}>SUBSISTEMA:</Text>
          <Text style={[s.progressValue, confirmedCat ? s.progressValueDone : s.progressValueWaiting]}>
            {confirmedCat ? `${confirmedCat.name} ✓` : '[ ESCUCHANDO SUBSISTEMA... ]'}
          </Text>
        </View>

        {/* Etapa 2 (visible solo cuando subsistema confirmado) */}
        {confirmedCat && (
          <View style={[s.progressRow, confirmedSym && s.progressRowDone, confirmAnim && stage === 2 && s.progressRowFlash]}>
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
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={s.catCard}
              onPress={() => selectCategory(cat)}
              activeOpacity={0.82}
            >
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
          <Text style={s.sectionLabel}>TOQUE O DIGA EL SÍNTOMA:</Text>
          {currentSymptoms.map(sym => (
            <TouchableOpacity
              key={sym.id}
              style={[s.symCard, sym.isCritical && s.symCardCritical]}
              onPress={() => selectSymptom(sym)}
              activeOpacity={0.82}
            >
              <View style={s.symCardInner}>
                {sym.isCritical && (
                  <Text style={s.symCriticalBadge}>⚠ SÍNTOMA CRÍTICO</Text>
                )}
                <Text style={[s.symCardTitle, sym.isCritical && s.symCardTitleCritical]}>
                  {sym.title}
                </Text>
                <Text style={s.symCardCode}>{sym.code}</Text>
              </View>
              <ChevronRight color={sym.isCritical ? RED : AMBER} size={22} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Simulación (prueba en ambientes ruidosos) ────────────────────── */}
      <TouchableOpacity style={s.simBtn} onPress={runSimulation} activeOpacity={0.85} disabled={simRunning}>
        <Text style={s.simBtnText}>
          {simRunning ? '⏳ SIMULANDO FLUJO...' : '⚡ SIMULAR RESPUESTA DE VOZ (PRUEBA EN TERRENO)'}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  scroll: { flex: 1 },
  container: {
    paddingHorizontal: 12,
    paddingBottom: 32,
    gap: 12,
  },

  // Volver
  backBtn: {
    backgroundColor: '#0D1A28',
    borderWidth: 1,
    borderColor: '#1E3A5A',
    borderRadius: 10,
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  backBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // Barra de estado
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1E2E',
    borderWidth: 1.5,
    borderColor: '#1E3A5A',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
    minHeight: 56,
  },
  statusBarActive: {
    borderColor: CYAN,
    backgroundColor: 'rgba(6,182,212,0.08)',
  },
  statusBarOff: {
    borderColor: AMBER,
    backgroundColor: 'rgba(245,158,11,0.07)',
  },
  micDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: CYAN,
    flexShrink: 0,
  },
  statusText: {
    flex: 1,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusTextActive: {
    color: '#FFFFFF',
  },
  micToggle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#0D1A28',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Transcripción
  transcriptBox: {
    backgroundColor: '#061420',
    borderWidth: 1,
    borderColor: '#1E3A5A',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  transcriptLabel: {
    color: DIM,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  transcriptText: {
    color: '#C8DCF0',
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
  },

  // Progreso acumulativo
  progressBlock: {
    gap: 8,
  },
  progressRow: {
    backgroundColor: CARD,
    borderWidth: 1.5,
    borderColor: '#1E3A5A',
    borderRadius: 10,
    padding: 14,
    gap: 4,
  },
  progressRowDone: {
    borderColor: GREEN,
    backgroundColor: 'rgba(16,185,129,0.07)',
  },
  progressRowFlash: {
    borderColor: GREEN,
    backgroundColor: 'rgba(16,185,129,0.20)',
  },
  progressLabel: {
    color: DIM,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  progressValueWaiting: {
    color: CYAN,
  },
  progressValueDone: {
    color: GREEN,
    fontSize: 15,
  },

  // Sección con tarjetas
  section: {
    gap: 8,
  },
  sectionLabel: {
    color: DIM,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },

  // Tarjetas de categoría
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderWidth: 1.5,
    borderColor: '#1E3A5A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 12,
    minHeight: 68,
  },
  catCardInner: { flex: 1, gap: 3 },
  catCardName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  catCardDesc: {
    color: TEXT,
    fontSize: 12,
    lineHeight: 17,
  },

  // Tarjetas de síntoma
  symCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderWidth: 1.5,
    borderColor: '#2A3A1A',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 12,
    minHeight: 64,
  },
  symCardCritical: {
    borderColor: RED + '88',
    backgroundColor: '#1A0808',
  },
  symCardInner: { flex: 1, gap: 3 },
  symCriticalBadge: {
    color: RED,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  symCardTitle: {
    color: '#E2F0FF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  symCardTitleCritical: {
    color: '#FCA5A5',
  },
  symCardCode: {
    color: DIM,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Botón simulación
  simBtn: {
    backgroundColor: '#0D1A28',
    borderWidth: 1.5,
    borderColor: '#2A3A5A',
    borderRadius: 10,
    minHeight: 54,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  simBtnText: {
    color: AMBER,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
});
