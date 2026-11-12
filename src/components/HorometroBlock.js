/**
 * HorometroBlock.js — Horómetro General de Operación y Detenciones
 * ─────────────────────────────────────────────────────────────────────────────
 * Componente industrial estilo odómetro / horómetro Honeywell.
 * Muestra dos contadores en tiempo real:
 *
 *   ① TRABAJO EFECTIVO  — avanza cuando status === 'OPERACION'
 *   ② DETENCIONES       — avanza cuando status === 'PARADA' | 'FALLA'
 *
 * Props:
 *   status: 'OPERACION' | 'PARADA' | 'FALLA'
 *
 * Velocidad demo: 1 tick cada 6 seg = +0.1 h simuladas (60× real time)
 * En producción reemplazar con sincronización a backend / contexto global.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useHorometro, BASE_WORK_H, PAUTAS } from '../context/HorometroContext';

// ─── COLORES ─────────────────────────────────────────────────────────────────
const CY  = '#00F0FF';   // cyan — trabajo efectivo
const GR  = '#10B981';   // verde — operativo
const AM  = '#FFB800';   // ámbar — detenciones
const RD  = '#EF4444';   // rojo — falla crítica

// ─── HELPER: formatea horas → array de caracteres de display ─────────────────
// Salida: ['0','1','4','8','3','2','.','4']  para 14832.4 h
function formatOdometer(hours) {
  const tenths    = Math.round(hours * 10);
  const fracPart  = tenths % 10;
  const wholePart = Math.floor(tenths / 10);
  const hoursStr  = String(wholePart).padStart(5, '0');
  return [...hoursStr.split(''), fracPart];
}

// ─── HELPER: disponibilidad % ─────────────────────────────────────────────────
function calcAvailability(work, down) {
  const total = work + down;
  if (total === 0) return 100;
  return Math.min(100, (work / total) * 100);
}

// ─── SUB: celda dígito individual (estilo rodillo mecánico) ──────────────────
function DigitCell({ digit, accent, isChanging }) {
  return (
    <View style={[
      hs.digitCell,
      accent && { backgroundColor: accent + '22', borderColor: accent + '66' },
      isChanging && { shadowColor: accent, shadowOpacity: 0.9, shadowRadius: 4 },
    ]}>
      <Text style={[hs.digitTxt, { color: accent || CY }]}>{digit}</Text>
    </View>
  );
}

// ─── SUB: display odómetro completo ──────────────────────────────────────────
function OdometerDisplay({ hours, accent, isRunning }) {
  const chars   = formatOdometer(hours);
  // chars[0..4] = whole digits, chars[5] = tenths (changing digit)
  const whole   = chars.slice(0, 5);
  const tenths  = chars[5];

  return (
    <View style={hs.odometerRow}>
      {/* 5 dígitos de horas */}
      {whole.map((d, i) => (
        <DigitCell key={`w${i}`} digit={d} accent={accent} isChanging={false} />
      ))}

      {/* Separador decimal */}
      <View style={hs.dotCell}>
        <Text style={[hs.dotTxt, { color: accent }]}>.</Text>
      </View>

      {/* Dígito de décimas (cambia activamente) */}
      <DigitCell
        key="t"
        digit={String(tenths)}
        accent={isRunning ? '#FACC15' : '#374151'}
        isChanging={isRunning}
      />

      {/* Label unidad */}
      <View style={hs.unitCell}>
        <Text style={[hs.unitTxt, { color: accent + 'AA' }]}>h</Text>
      </View>
    </View>
  );
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
export default function HorometroBlock() {
  // Lee estado global desde HorometroContext (tick gestionado en el Provider)
  const { workH, downH, equipStatus } = useHorometro();

  const isOperating = equipStatus === 'OPERACION';
  const isFalla     = equipStatus === 'FALLA';

  // Pulso visual local — único estado local necesario
  const [tickFlash, setTickFlash] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setTickFlash(f => !f), 6000);
    return () => clearInterval(t);
  }, []);

  // Próxima pauta preventiva
  const nextPauta      = PAUTAS.find(p => p.horas > workH) ?? PAUTAS[PAUTAS.length - 1];
  const horasRestantes = Math.max(0, nextPauta.horas - workH).toFixed(1);

  const availability = calcAvailability(workH, downH);
  const availColor   = availability >= 98 ? GR : availability >= 92 ? AM : RD;
  const downColor    = isFalla ? RD : AM;

  return (
    <View style={hs.wrapper}>

      {/* ── CABECERA ─────────────────────────────────────────── */}
      <View style={hs.header}>
        <View style={hs.headerLeft}>
          {/* Indicador de pulso de reloj */}
          <View style={[hs.pulseDot, { backgroundColor: isOperating ? GR : downColor }]} />
          <Text style={hs.headerTitle}>HORÓMETRO</Text>
        </View>
        <View style={[hs.statusChip, { borderColor: isOperating ? GR + '80' : downColor + '80' }]}>
          <Text style={[hs.statusChipTxt, { color: isOperating ? GR : downColor }]}>
            {isOperating ? 'EN OP.' : isFalla ? 'FALLA' : 'PARADA'}
          </Text>
        </View>
      </View>

      {/* Referencia técnica */}
      <Text style={hs.ref}>CH-02 · Nordberg Omnicone SX 1560</Text>

      {/* ── CONTADOR 1: TRABAJO EFECTIVO ─────────────────────── */}
      <View style={[hs.counterCard, isOperating && { borderColor: GR + '50' }]}>
        <View style={hs.counterHeader}>
          <View style={[hs.counterDot, { backgroundColor: isOperating ? GR : '#1A3020' }]} />
          <Text style={[hs.counterLabel, { color: isOperating ? GR : '#374151' }]}>
            TRABAJO EFECTIVO
          </Text>
          {isOperating && (
            <View style={[hs.runBadge, { opacity: tickFlash ? 1 : 0.4 }]}>
              <Text style={hs.runBadgeTxt}>▶ ACTIVO</Text>
            </View>
          )}
        </View>

        <OdometerDisplay
          hours={workH}
          accent={isOperating ? CY : '#2A4060'}
          isRunning={isOperating}
        />

        {/* Barra de progreso sesión actual */}
        <View style={hs.sessionBar}>
          <Text style={hs.sessionLbl}>TURNO ACTUAL</Text>
          <View style={hs.sessionTrack}>
            <View style={[hs.sessionFill, {
              width: `${Math.min(100, ((workH - BASE_WORK_H) / 12) * 100)}%`,
              backgroundColor: isOperating ? GR : '#1A3020',
            }]} />
          </View>
        </View>
      </View>

      {/* ── CONTADOR 2: DETENCIONES ──────────────────────────── */}
      <View style={[hs.counterCard, !isOperating && { borderColor: downColor + '50' }]}>
        <View style={hs.counterHeader}>
          <View style={[hs.counterDot, { backgroundColor: !isOperating ? downColor : '#2A1800' }]} />
          <Text style={[hs.counterLabel, { color: !isOperating ? downColor : '#374151' }]}>
            DETENCIONES
          </Text>
          {!isOperating && (
            <View style={[hs.runBadge, {
              borderColor: downColor + '80',
              opacity: tickFlash ? 1 : 0.5,
            }]}>
              <Text style={[hs.runBadgeTxt, { color: downColor }]}>
                ⏸ {isFalla ? 'FALLA' : 'PARADA'}
              </Text>
            </View>
          )}
        </View>

        <OdometerDisplay
          hours={downH}
          accent={!isOperating ? downColor : '#2A2010'}
          isRunning={!isOperating}
        />
      </View>

      {/* ── DISPONIBILIDAD ───────────────────────────────────── */}
      <View style={hs.availRow}>
        <View style={hs.availLeft}>
          <Text style={hs.availLbl}>DISPONIBILIDAD</Text>
          <Text style={[hs.availPct, { color: availColor }]}>
            {availability.toFixed(1)}%
          </Text>
        </View>

        {/* Barra de disponibilidad */}
        <View style={hs.availTrack}>
          <View style={[hs.availFill, {
            width: `${availability}%`,
            backgroundColor: availColor,
          }]} />
          {/* Línea de objetivo (98%) */}
          <View style={hs.availTarget} />
          <Text style={hs.availTargetLbl}>98%</Text>
        </View>
      </View>

      {/* ── PIE: escala 1/10 h ────────────────────────────────── */}
      <View style={hs.footer}>
        <Text style={hs.footerTxt}>▼ 1/10 h · Resolución mínima 6 min</Text>
      </View>

    </View>
  );
}

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const hs = StyleSheet.create({
  wrapper: {
    marginTop: 8,
    backgroundColor: '#07101E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A2D45',
    overflow: 'hidden',
  },

  // Cabecera
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  headerTitle: {
    color: '#8CAAD0',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    fontFamily: 'monospace',
  },
  statusChip: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  statusChipTxt: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  ref: {
    color: '#2A3D55',
    fontSize: 7,
    fontWeight: '600',
    letterSpacing: 0.3,
    paddingHorizontal: 10,
    paddingBottom: 6,
    fontFamily: 'monospace',
  },

  // Tarjeta contador
  counterCard: {
    marginHorizontal: 8,
    marginBottom: 6,
    backgroundColor: '#04090F',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#1A2D45',
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  counterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  counterDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    flexShrink: 0,
  },
  counterLabel: {
    flex: 1,
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  runBadge: {
    borderWidth: 1,
    borderColor: '#10B98180',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
  },
  runBadgeTxt: {
    color: '#10B981',
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // Odómetro
  odometerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginBottom: 6,
  },
  digitCell: {
    width: 18,
    height: 24,
    backgroundColor: '#020609',
    borderWidth: 1,
    borderColor: '#1A2D45',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    // Efecto mecánico: sombra interna superior
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  digitTxt: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'monospace',
    lineHeight: 16,
    textAlign: 'center',
  },
  dotCell: {
    width: 6,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 1,
  },
  dotTxt: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 16,
  },
  unitCell: {
    marginLeft: 2,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  unitTxt: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Barra turno
  sessionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sessionLbl: {
    color: '#2A4060',
    fontSize: 6.5,
    fontWeight: '800',
    letterSpacing: 0.3,
    width: 46,
    flexShrink: 0,
  },
  sessionTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#0A1628',
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1A2D45',
  },
  sessionFill: {
    height: '100%',
    borderRadius: 2,
    minWidth: 2,
  },

  // Disponibilidad
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: '#1A2D45',
    gap: 8,
  },
  availLeft: {
    gap: 1,
    flexShrink: 0,
    width: 56,
  },
  availLbl: {
    color: '#2A4060',
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  availPct: {
    fontSize: 15,
    fontWeight: '900',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  availTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#0A1628',
    borderRadius: 4,
    overflow: 'visible',
    borderWidth: 1,
    borderColor: '#1A2D45',
    position: 'relative',
  },
  availFill: {
    height: '100%',
    borderRadius: 4,
  },
  availTarget: {
    position: 'absolute',
    left: '98%',
    top: -3,
    bottom: -3,
    width: 1,
    backgroundColor: '#FACC15',
    opacity: 0.6,
  },
  availTargetLbl: {
    position: 'absolute',
    left: '99%',
    top: -9,
    color: '#FACC15',
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  // Pie
  footer: {
    paddingHorizontal: 10,
    paddingBottom: 7,
    paddingTop: 2,
  },
  footerTxt: {
    color: '#1E3050',
    fontSize: 6.5,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});
