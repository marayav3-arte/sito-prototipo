/**
 * VoiceBackBanner.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Banner compacto que corre en la vista de Acciones Correctivas (step=3)
 * cuando la sesión fue iniciada desde DIAGNÓSTICO POR VOZ.
 *
 * - Escucha permanentemente "ATRÁS" / "VOLVER" / "REGRESAR" / "ANTERIOR"
 * - Auto-reinicia el reconocimiento (mismo patrón que VoiceFlowPanel)
 * - Muestra aviso visual "↩️ VOLVIENDO ATRÁS..." durante 500ms antes de navegar
 *
 * Props:
 *   onBack()   → callback para retroceder (ejecutado tras 500ms flash)
 *   onStop()   → apagar sesión de voz (opcional, llamado al desmontarse)
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { Mic } from 'lucide-react-native';

const BACK_KEYWORDS = ['atras','volver','regresar','anterior','retroceder','back'];

function normalizar(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .trim();
}

function detectBack(transcript) {
  const t = normalizar(transcript);
  return BACK_KEYWORDS.some(k => t.includes(k));
}

export default function VoiceBackBanner({ onBack }) {
  const [listening, setListening]   = useState(false);
  const [supported, setSupported]   = useState(true);
  const [goingBack, setGoingBack]   = useState(false);

  const recRef    = useRef(null);
  const doneRef   = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loopRef   = useRef(null);

  const startPulse = useCallback(() => {
    loopRef.current?.stop();
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 500, useNativeDriver: true }),
      ])
    );
    loopRef.current.start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    loopRef.current?.stop();
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  const startListening = useCallback(() => {
    if (Platform.OS !== 'web' || doneRef.current) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    try { recRef.current?.abort(); } catch (_) {}

    const rec = new SR();
    rec.lang = 'es-CL';
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => { setListening(true); startPulse(); };

    rec.onresult = (event) => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      if (detectBack(text) && !doneRef.current) {
        doneRef.current = true;
        try { recRef.current?.abort(); } catch (_) {}
        setListening(false);
        stopPulse();
        setGoingBack(true);
        setTimeout(() => { setGoingBack(false); onBack(); }, 500);
      }
    };

    rec.onend = () => {
      setListening(false);
      stopPulse();
      if (!doneRef.current) {
        setTimeout(() => { if (!doneRef.current) startListening(); }, 350);
      }
    };

    rec.onerror = (e) => {
      if (e.error === 'aborted' || e.error === 'no-speech') return;
      setListening(false); stopPulse();
    };

    recRef.current = rec;
    try { rec.start(); } catch (_) { setSupported(false); }
  }, [startPulse, stopPulse, onBack]);

  // Arranque automático
  useEffect(() => {
    const t = setTimeout(() => startListening(), 300);
    return () => {
      clearTimeout(t);
      doneRef.current = true;
      try { recRef.current?.abort(); } catch (_) {}
      stopPulse();
    };
  }, []); // eslint-disable-line

  // Simular "ATRÁS"
  function simulateBack() {
    if (doneRef.current) return;
    doneRef.current = true;
    try { recRef.current?.abort(); } catch (_) {}
    setListening(false); stopPulse();
    setGoingBack(true);
    setTimeout(() => { setGoingBack(false); onBack(); }, 500);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (goingBack) {
    return (
      <View style={s.flashBack}>
        <Text style={s.flashBackText}>↩️  VOLVIENDO ATRÁS...</Text>
      </View>
    );
  }

  return (
    <View style={s.banner}>
      {/* Indicador de escucha */}
      <View style={s.bannerLeft}>
        <Animated.View style={[s.dot, { transform: [{ scale: pulseAnim }] }, !listening && s.dotOff]} />
        <Text style={s.bannerText}>
          {!supported
            ? '⚠ Voz no disponible'
            : listening
            ? '🎙️  VOZ ACTIVA — Diga "ATRÁS" para volver a Síntomas'
            : '⏸  Reiniciando micrófono...'}
        </Text>
      </View>

      {/* Botón táctil de respaldo */}
      <TouchableOpacity style={s.backBtn} onPress={simulateBack} activeOpacity={0.82}>
        <Text style={s.backBtnText}>← ATRÁS</Text>
      </TouchableOpacity>
    </View>
  );
}

const CYAN  = '#06B6D4';
const AMBER = '#F59E0B';

const s = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6,182,212,0.08)',
    borderWidth: 1.5,
    borderColor: CYAN,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 12,
    marginBottom: 10,
    gap: 10,
    minHeight: 52,
  },
  bannerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: CYAN, flexShrink: 0,
  },
  dotOff: { backgroundColor: '#475569' },
  bannerText: { flex: 1, color: '#E0F7FF', fontSize: 12, fontWeight: '700', lineHeight: 17 },
  backBtn: {
    backgroundColor: '#071320',
    borderWidth: 1, borderColor: CYAN,
    borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8,
    flexShrink: 0, minHeight: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: CYAN, fontSize: 12, fontWeight: '900' },

  // Flash "VOLVIENDO ATRÁS"
  flashBack: {
    backgroundColor: 'rgba(6,182,212,0.18)',
    borderWidth: 2, borderColor: CYAN,
    borderRadius: 10,
    marginHorizontal: 12, marginBottom: 10,
    paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center',
    minHeight: 52,
  },
  flashBackText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
});
