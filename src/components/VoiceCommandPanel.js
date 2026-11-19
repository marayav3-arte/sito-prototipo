/**
 * VoiceCommandPanel.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Panel de COMANDO POR VOZ (Manos Libres) para DiagnosticoScreen — OPERATIVO.
 * Utiliza Web Speech API (SpeechRecognition) en es-CL / es-ES.
 *
 * Props:
 *   onNavigateToCategory(categoryId)  → cb para seleccionar subsistema
 *   onActivateOverheat()              → cb para activar flujo sobrecalentamiento
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Platform,
} from 'react-native';
import { Mic } from 'lucide-react-native';

// Mapa de palabras clave → acción
const KEYWORD_MAP = [
  { keywords: ['sobrecalentamiento', 'temperatura', 'calor', 'caliente', 'overheat', 'termico', 'térmico'], action: 'overheat' },
  { keywords: ['lubricacion', 'lubricación', 'aceite', 'lubric', 'lubricante', 'depósito', 'deposito', 'bomba de aceite', 'caudal'], action: 'lubricacion' },
  { keywords: ['hidraulico', 'hidráulico', 'hidraulica', 'hidráulica', 'hidro', 'piston', 'pistón', 'válvula', 'valvula', 'manguera'], action: 'hidraulica' },
  { keywords: ['transmision', 'transmisión', 'mecanica', 'mecánica', 'engranaje', 'piñon', 'piñón', 'eje', 'corona', 'buje'], action: 'transmision' },
  { keywords: ['electrico', 'eléctrico', 'electrica', 'eléctrica', 'motor', 'sensor', 'cable', 'plc', 'contactor', 'fusible'], action: 'electrico' },
];

const DEMO_PHRASE = 'Temperatura de aceite en retorno elevada, revisar sistema de lubricación urgente';

function detectKeyword(transcript) {
  const lower = transcript.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const { keywords, action } of KEYWORD_MAP) {
    for (const kw of keywords) {
      const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (lower.includes(kwNorm)) return action;
    }
  }
  return null;
}

export default function VoiceCommandPanel({ onNavigateToCategory, onActivateOverheat }) {
  const [status, setStatus] = useState('idle'); // idle | listening | processing | result | error | unsupported
  const [transcript, setTranscript] = useState('');
  const [detectedAction, setDetectedAction] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recognitionRef = useRef(null);
  const pulseLoopRef = useRef(null);

  // Detectar soporte
  const isSpeechSupported = Platform.OS === 'web'
    && typeof window !== 'undefined'
    && (window.SpeechRecognition || window.webkitSpeechRecognition);

  // Animación pulsante mientras escucha
  useEffect(() => {
    if (status === 'listening') {
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        ])
      );
      pulseLoopRef.current.start();
    } else {
      if (pulseLoopRef.current) pulseLoopRef.current.stop();
      pulseAnim.setValue(1);
    }
  }, [status]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stopRecognition();
    };
  }, []);

  function stopRecognition() {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current = null;
    }
  }

  function handleStart() {
    if (!isSpeechSupported) {
      setStatus('unsupported');
      return;
    }
    setTranscript('');
    setDetectedAction(null);
    setErrorMsg('');
    setStatus('listening');

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.lang = 'es-CL';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const resultText = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += resultText;
        else interim += resultText;
      }
      setTranscript(final || interim);
    };

    recognition.onend = () => {
      setStatus(prev => {
        if (prev === 'listening') {
          // Procesar resultado
          processTranscript();
          return 'processing';
        }
        return prev;
      });
    };

    recognition.onerror = (event) => {
      const msgs = {
        'not-allowed': 'Micrófono bloqueado. Concede permiso en el navegador.',
        'no-speech': 'No se detectó audio. Intente hablar más fuerte.',
        'network': 'Sin conexión para reconocimiento de voz.',
        'aborted': null,
      };
      const msg = msgs[event.error] || `Error de voz: ${event.error}`;
      if (msg) {
        setErrorMsg(msg);
        setStatus('error');
      } else {
        setStatus('idle');
      }
    };

    try {
      recognition.start();
    } catch (e) {
      setErrorMsg('No se pudo iniciar el micrófono.');
      setStatus('error');
    }
  }

  function handleStop() {
    stopRecognition();
    setStatus(transcript ? 'processing' : 'idle');
    if (transcript) processTranscript();
  }

  function processTranscript(text) {
    const inputText = text || transcript;
    if (!inputText.trim()) { setStatus('idle'); return; }
    const action = detectKeyword(inputText);
    setDetectedAction(action);
    setStatus('result');
  }

  function handleDemoSimulate() {
    const phrase = DEMO_PHRASE;
    setTranscript(phrase);
    setStatus('processing');
    setTimeout(() => processTranscript(phrase), 400);
  }

  function handleExecuteAction() {
    if (detectedAction === 'overheat') {
      onActivateOverheat?.();
    } else if (detectedAction) {
      onNavigateToCategory?.(detectedAction);
    }
    handleReset();
  }

  function handleReset() {
    stopRecognition();
    setStatus('idle');
    setTranscript('');
    setDetectedAction(null);
    setErrorMsg('');
  }

  // ─── Render helpers ───────────────────────────────────────────────────────

  const ACTION_LABELS = {
    overheat:    '🔥 Activar flujo: SOBRECALENTAMIENTO',
    lubricacion: '🛢️  Ir a: SISTEMA DE LUBRICACIÓN',
    hidraulica:  '💧 Ir a: SISTEMA HIDRÁULICO',
    transmision: '⚙️  Ir a: TRANSMISIÓN Y MECÁNICA',
    electrico:   '⚡ Ir a: SISTEMA ELÉCTRICO',
  };

  return (
    <View style={s.wrapper}>

      {/* ── Botón principal — ergonómico para uso con guantes ── */}
      {status === 'idle' || status === 'unsupported' ? (
        <TouchableOpacity
          style={s.mainBtn}
          activeOpacity={0.82}
          onPress={handleStart}
        >
          {/* Izquierda: halo circular del micrófono */}
          <View style={s.micHalo}>
            <Mic color={CYAN} size={22} strokeWidth={2} />
          </View>

          {/* Centro: título + subtítulo */}
          <View style={s.mainBtnTextBlock}>
            <Text style={s.mainBtnTitle}>DIAGNÓSTICO POR VOZ</Text>
            <Text style={s.mainBtnSub}>Dicte el síntoma sin quitarse los guantes</Text>
          </View>

          {/* Derecha: badge ACTIVAR */}
          <View style={s.activarBadge}>
            <Text style={s.activarBadgeText}>ACTIVAR</Text>
          </View>
        </TouchableOpacity>
      ) : null}

      {/* ── Fallback: API no soportada ────────────────────────── */}
      {status === 'unsupported' && (
        <View style={s.unsupportedBox}>
          <Text style={s.unsupportedText}>
            Este navegador no soporta reconocimiento de voz nativo.
          </Text>
          <TouchableOpacity style={s.demoBtn} onPress={handleDemoSimulate}>
            <Text style={s.demoBtnText}>▶ Simular dictado técnico</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Panel escuchando ──────────────────────────────────── */}
      {status === 'listening' && (
        <View style={s.listeningPanel}>
          <View style={s.listeningHeader}>
            <Animated.View style={[s.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={s.listeningLabel}>ESCUCHANDO EN TERRENO...</Text>
            <TouchableOpacity style={s.stopBtn} onPress={handleStop}>
              <Text style={s.stopBtnText}>■ Detener</Text>
            </TouchableOpacity>
          </View>
          {transcript ? (
            <Text style={s.liveTranscript}>"{transcript}"</Text>
          ) : (
            <Text style={s.listeningHint}>Diga: "sobrecalentamiento", "lubricación", "hidráulico"…</Text>
          )}
          <TouchableOpacity style={s.demoBtn} onPress={handleDemoSimulate}>
            <Text style={s.demoBtnText}>▶ Simular dictado técnico</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Procesando ─────────────────────────────────────────── */}
      {status === 'processing' && (
        <View style={s.listeningPanel}>
          <Text style={s.listeningLabel}>⏳ Analizando comando...</Text>
          {transcript ? <Text style={s.liveTranscript}>"{transcript}"</Text> : null}
        </View>
      )}

      {/* ── Resultado ──────────────────────────────────────────── */}
      {status === 'result' && (
        <View style={s.resultPanel}>
          <Text style={s.resultTranscript}>🗣️ "{transcript}"</Text>
          {detectedAction ? (
            <>
              <Text style={s.resultDetected}>Comando detectado:</Text>
              <TouchableOpacity style={s.executeBtn} onPress={handleExecuteAction} activeOpacity={0.85}>
                <Text style={s.executeBtnText}>{ACTION_LABELS[detectedAction]}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={s.noActionText}>
              ⚠ No se reconoció ningún subsistema. Diga "lubricación", "hidráulico", "eléctrico", "transmisión" o "sobrecalentamiento".
            </Text>
          )}
          <TouchableOpacity style={s.resetLink} onPress={handleReset}>
            <Text style={s.resetLinkText}>✕ Cancelar / Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Error ──────────────────────────────────────────────── */}
      {status === 'error' && (
        <View style={s.errorPanel}>
          <Text style={s.errorText}>⚠ {errorMsg}</Text>
          <View style={s.errorActions}>
            <TouchableOpacity style={s.demoBtn} onPress={handleDemoSimulate}>
              <Text style={s.demoBtnText}>▶ Simular dictado técnico</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.resetLink} onPress={handleReset}>
              <Text style={s.resetLinkText}>✕ Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </View>
  );
}

const CYAN   = '#06B6D4';
const AMBER  = '#F59E0B';
const RED    = '#EF4444';
const BG     = '#071320';
const BORDER = '#1A3A5C';
const TEXT   = '#94A3B8';

const s = StyleSheet.create({
  wrapper: {
    marginHorizontal: 12,
    marginBottom: 12,
  },

  // ── TARJETA XXL IDLE ────────────────────────────────────────
  card: {
    backgroundColor: 'rgba(6, 182, 212, 0.10)',
    borderWidth: 2,
    borderColor: CYAN,
    borderRadius: 12,
    padding: 20,
    minHeight: 120,
    gap: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  micHaloXL: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.25)',
    borderWidth: 1.5,
    borderColor: CYAN,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTextBlock: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  cardTitleSub: {
    color: CYAN,
    fontSize: 14,
    fontWeight: '800',
  },
  cardDesc: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 19,
  },
  unsupportedInCard: {
    color: AMBER,
    fontSize: 11,
    lineHeight: 16,
  },
  // Botón de ancho completo dentro de la tarjeta
  pulseBtn: {
    backgroundColor: CYAN,
    borderRadius: 10,
    minHeight: 54,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseBtnText: {
    color: '#04101A',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
    textAlign: 'center',
  },

  // ── TARJETA ESCUCHANDO ────────────────────────────────────
  cardListening: {
    backgroundColor: '#0C1A10',
    borderWidth: 2.5,
    borderColor: AMBER,
    borderRadius: 12,
    padding: 20,
    gap: 12,
    shadowColor: AMBER,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  listeningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pulseDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: RED,
    flexShrink: 0,
  },
  listeningLabel: {
    flex: 1,
    color: AMBER,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  liveTranscript: {
    color: '#E2F0FF',
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  listeningHint: {
    color: TEXT,
    fontSize: 12,
    lineHeight: 18,
  },
  // Botón DETENER ancho completo
  stopBtnXL: {
    backgroundColor: '#2D0A0A',
    borderWidth: 2,
    borderColor: RED,
    borderRadius: 10,
    minHeight: 54,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopBtnXLText: {
    color: RED,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  // Botón demo amplio
  demoBtnXL: {
    backgroundColor: '#0D1E30',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    minHeight: 48,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBtnXLText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  // ── RESULTADO ─────────────────────────────────────────────
  resultPanel: {
    backgroundColor: BG,
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 18,
    gap: 10,
  },
  resultTranscript: {
    color: '#C8DCF0',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  resultDetected: {
    color: TEXT,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  executeBtn: {
    backgroundColor: '#0D2416',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 10,
    minHeight: 54,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  executeBtnText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  noActionText: {
    color: AMBER,
    fontSize: 13,
    lineHeight: 19,
  },

  // ── ERROR ────────────────────────────────────────────────
  errorPanel: {
    backgroundColor: '#1A0808',
    borderWidth: 2,
    borderColor: RED,
    borderRadius: 12,
    padding: 18,
    gap: 10,
  },
  errorText: {
    color: RED,
    fontSize: 13,
    lineHeight: 19,
  },
});
