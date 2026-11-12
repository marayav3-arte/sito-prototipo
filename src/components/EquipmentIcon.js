/**
 * EquipmentIcon.js — Nordberg Omnicone SX 1560
 * ─────────────────────────────────────────────────────────────────────────────
 * Ilustración SVG vectorial técnica del Chancador Cónico Nordberg Omnicone SX.
 * Capas interactivas con ID asignable:
 *
 *   #layer-mechanical   → Cuerpo principal, tolva, carcasa, base
 *   #layer-hydraulic    → Cilindros hidráulicos, brazos, líneas de presión
 *   #layer-transmission → Contraeje, poleas V-belt, transmisión
 *   #layer-lubrication  → Tuberías de aceite, juntas, drenaje
 *
 * Props:
 *   activeLayer: 'LUBRICACIÓN' | 'HIDRÁULICA' | 'TRANSMISIÓN' | 'ELECTRICIDAD' | null
 *   style: override del contenedor externo
 */

import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
// Mapeo capa SVG → nombre de eje (EJE_COLORS de EstadoEquipoScreen)
const LAYER_EJE = {
  mechanical:   'ELECTRICIDAD',
  hydraulic:    'HIDRÁULICA',
  transmission: 'TRANSMISIÓN',
  lubrication:  'LUBRICACIÓN',
};

// Color cuando la capa está activa (coincide con EJE_COLORS)
const LAYER_ACTIVE_COLOR = {
  mechanical:   '#EAB308',
  hydraulic:    '#3B82F6',
  transmission: '#A855F7',
  lubrication:  '#F97316',
};

const DEFAULT_COLOR = '#00F0FF';   // cyan por defecto (sin selección)
const DIM_OPACITY   = 0.18;
const FULL_OPACITY  = 1.0;

// ─── FUNCIÓN PURA (no Hook) — calcula estado visual de cada capa ──────────────
// Renombrada de useLayer → calcLayerStyle para evitar confusión con las reglas
// de Hooks de React (los prefijos "use" indican Hooks al linter/runtime).
function calcLayerStyle(layerName, activeLayer) {
  const safeActiveLayer = activeLayer ?? null;
  const isActive  = !safeActiveLayer || LAYER_EJE[layerName] === safeActiveLayer;
  const opacity   = safeActiveLayer ? (isActive ? FULL_OPACITY : DIM_OPACITY) : FULL_OPACITY;
  // Null-safe color lookup con fallback al cyan default
  const baseColor = (safeActiveLayer && isActive)
    ? (LAYER_ACTIVE_COLOR[layerName] ?? DEFAULT_COLOR)
    : DEFAULT_COLOR;
  const fillColor = baseColor + '18';   // ~10% opacity para rellenos
  const glowColor = baseColor + 'AA';   // ~67% para halos
  return { opacity, color: baseColor, fillColor, glowColor, isActive };
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
export default function EquipmentIcon({ activeLayer = null, style }) {
  // useState / useRef declarados en nivel superior (aun sin uso activo,
  // satisface la regla de importación estándar requerida)
  const [_ready, _setReady] = useState(true);
  const containerRef = useRef(null);

  // useMemo: recalcula capas sólo cuando activeLayer cambia
  const layers = useMemo(() => ({
    mech: calcLayerStyle('mechanical',   activeLayer),
    hydr: calcLayerStyle('hydraulic',    activeLayer),
    tran: calcLayerStyle('transmission', activeLayer),
    lubr: calcLayerStyle('lubrication',  activeLayer),
  }), [activeLayer]);

  const { mech, hydr, tran, lubr } = layers;

  // Capa activa para el indicador inferior (null-safe)
  const activeLayerKey = activeLayer
    ? (Object.keys(LAYER_EJE).find(k => LAYER_EJE[k] === activeLayer) ?? null)
    : null;
  const activePillColor = activeLayerKey
    ? (LAYER_ACTIVE_COLOR[activeLayerKey] ?? DEFAULT_COLOR)
    : DEFAULT_COLOR;

  return (
    <View
      ref={containerRef}
      nativeID="sidebar-equipment-view"
      style={[ss.wrapper, style]}
    >
      {/* ── SVG Ilustración Técnica Nordberg Omnicone SX 1560 ─── */}
      <svg
        viewBox="0 0 290 300"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: '100%',
          display: 'block',
          overflow: 'hidden',
          objectFit: 'contain',
        }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="eqp-glow-soft" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="eqp-drop-neon" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5"
              floodColor="#00F0FF" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* ════════════════════════════════════════════════════════
            LAYER: LUBRICATION  (#layer-lubrication)
            Tubería aceite izquierda · juntas · drenaje · sensor
            ════════════════════════════════════════════════════════ */}
        <g
          id="layer-lubrication"
          opacity={lubr.opacity}
          filter={lubr.isActive && activeLayer ? 'url(#eqp-glow-soft)' : ''}
        >
          {/* Tubería vertical principal */}
          <rect x="16" y="124" width="11" height="108" rx="3"
            fill={lubr.fillColor} stroke={lubr.color} strokeWidth="1.3" />

          {/* Tapa superior */}
          <rect x="11" y="119" width="21" height="8" rx="2"
            fill={lubr.fillColor} stroke={lubr.color} strokeWidth="1.2" />

          {/* Juntas de conexión */}
          <rect x="11" y="153" width="21" height="7" rx="2"
            fill={lubr.fillColor} stroke={lubr.color} strokeWidth="1.2" />
          <rect x="11" y="183" width="21" height="7" rx="2"
            fill={lubr.fillColor} stroke={lubr.color} strokeWidth="1.2" />
          <rect x="11" y="213" width="21" height="7" rx="2"
            fill={lubr.fillColor} stroke={lubr.color} strokeWidth="1.2" />

          {/* Válvula de drenaje */}
          <circle cx="21" cy="242" r="8"
            fill={lubr.fillColor} stroke={lubr.color} strokeWidth="1.3" />
          <circle cx="21" cy="242" r="3.5" fill={lubr.color} opacity="0.4" />
          <line x1="21" y1="232" x2="21" y2="230" stroke={lubr.color} strokeWidth="1" />

          {/* Líneas de conexión al cuerpo */}
          <line x1="27" y1="157" x2="38" y2="157" stroke={lubr.color} strokeWidth="1.1" />
          <line x1="27" y1="187" x2="38" y2="187" stroke={lubr.color} strokeWidth="1.1" />

          {/* Sensor de temperatura */}
          <rect x="39" y="152" width="9" height="10" rx="2"
            fill={lubr.fillColor} stroke={lubr.color} strokeWidth="1" />
          <line x1="43" y1="148" x2="43" y2="152" stroke={lubr.color} strokeWidth="0.8" />

          {/* Retorno de aceite (discontinuo) */}
          <line x1="27" y1="217" x2="38" y2="217"
            stroke={lubr.color} strokeWidth="1.1" strokeDasharray="2,1.5" />
        </g>

        {/* ════════════════════════════════════════════════════════
            LAYER: HYDRAULIC  (#layer-hydraulic)
            Cilindro hidráulico izquierdo + cilindro ajuste derecho
            ════════════════════════════════════════════════════════ */}
        <g
          id="layer-hydraulic"
          opacity={hydr.opacity}
          filter={hydr.isActive && activeLayer ? 'url(#eqp-glow-soft)' : ''}
        >
          {/* Cuerpo cilindro izquierdo */}
          <rect x="38" y="140" width="19" height="84" rx="4"
            fill={hydr.fillColor} stroke={hydr.color} strokeWidth="1.4" />

          {/* Vástago pistón */}
          <rect x="44" y="112" width="7" height="32" rx="2"
            fill={hydr.fillColor} stroke={hydr.color} strokeWidth="1.2" />

          {/* Tapa superior */}
          <rect x="33" y="135" width="29" height="8" rx="3"
            fill={hydr.fillColor} stroke={hydr.color} strokeWidth="1.4" />

          {/* Cabezal pistón */}
          <rect x="40" y="108" width="15" height="7" rx="2"
            fill={hydr.fillColor} stroke={hydr.color} strokeWidth="1.2" />

          {/* Horquilla inferior */}
          <path d="M 38 224 L 30 244 L 70 244 L 62 224"
            fill={hydr.fillColor} stroke={hydr.color} strokeWidth="1.2" />
          <circle cx="50" cy="243" r="5"
            fill={hydr.fillColor} stroke={hydr.color} strokeWidth="1" />

          {/* Brazo al cuerpo principal */}
          <line x1="57" y1="182" x2="78" y2="182"
            stroke={hydr.color} strokeWidth="1.4" />
          <rect x="56" y="178" width="7" height="8" rx="1"
            fill={hydr.fillColor} stroke={hydr.color} strokeWidth="1" />

          {/* Puertos hidráulicos */}
          <circle cx="48" cy="165" r="3.5"
            fill={hydr.fillColor} stroke={hydr.color} strokeWidth="1" />
          <circle cx="48" cy="198" r="3.5"
            fill={hydr.fillColor} stroke={hydr.color} strokeWidth="1" />

          {/* Cilindro ajuste derecho */}
          <rect x="218" y="148" width="16" height="58" rx="3"
            fill={hydr.fillColor} stroke={hydr.color} strokeWidth="1.2" />
          <rect x="222" y="133" width="8" height="18" rx="2"
            fill={hydr.fillColor} stroke={hydr.color} strokeWidth="1.1" />
          <rect x="213" y="144" width="26" height="7" rx="2"
            fill={hydr.fillColor} stroke={hydr.color} strokeWidth="1.2" />

          {/* Brazo derecho al cuerpo */}
          <line x1="218" y1="175" x2="208" y2="175"
            stroke={hydr.color} strokeWidth="1.3" />
          <rect x="208" y="171" width="7" height="8" rx="1"
            fill={hydr.fillColor} stroke={hydr.color} strokeWidth="1" />
          <circle cx="226" cy="185" r="3"
            fill={hydr.fillColor} stroke={hydr.color} strokeWidth="1" />

          {/* Líneas de presión (discontinuas) */}
          <line x1="57" y1="165" x2="90" y2="165"
            stroke={hydr.color} strokeWidth="1" strokeDasharray="3,2" />
          <line x1="57" y1="198" x2="85" y2="198"
            stroke={hydr.color} strokeWidth="1" strokeDasharray="3,2" />
        </g>

        {/* ════════════════════════════════════════════════════════
            LAYER: TRANSMISSION  (#layer-transmission)
            Contraeje · poleas V-belt · eje propulsor
            ════════════════════════════════════════════════════════ */}
        <g
          id="layer-transmission"
          opacity={tran.opacity}
          filter={tran.isActive && activeLayer ? 'url(#eqp-glow-soft)' : ''}
        >
          {/* Carcasa contraeje */}
          <rect x="228" y="204" width="50" height="52" rx="5"
            fill={tran.fillColor} stroke={tran.color} strokeWidth="1.4" />

          {/* Eje motriz → interior máquina */}
          <line x1="228" y1="230" x2="210" y2="230"
            stroke={tran.color} strokeWidth="2.2" />
          <line x1="228" y1="225" x2="210" y2="225"
            stroke={tran.color} strokeWidth="0.8" />
          <line x1="228" y1="235" x2="210" y2="235"
            stroke={tran.color} strokeWidth="0.8" />

          {/* Polea V-belt principal (grande) */}
          <circle cx="253" cy="256" r="32"
            fill={tran.fillColor} stroke={tran.color} strokeWidth="1.6" />
          <circle cx="253" cy="256" r="27"
            fill="none" stroke={tran.color} strokeWidth="0.7" />
          <circle cx="253" cy="256" r="22"
            fill="none" stroke={tran.color} strokeWidth="0.7" />
          <circle cx="253" cy="256" r="9"
            fill={tran.fillColor} stroke={tran.color} strokeWidth="1.3" />
          <circle cx="253" cy="256" r="4" fill={tran.color} opacity="0.5" />

          {/* Rayos polea grande (6 rayos) */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line key={`spoke-big-${i}`}
                x1={253 + 9 * Math.cos(rad)}
                y1={256 + 9 * Math.sin(rad)}
                x2={253 + 22 * Math.cos(rad)}
                y2={256 + 22 * Math.sin(rad)}
                stroke={tran.color} strokeWidth="1"
              />
            );
          })}

          {/* Polea V-belt pequeña (superior) */}
          <circle cx="253" cy="200" r="19"
            fill={tran.fillColor} stroke={tran.color} strokeWidth="1.4" />
          <circle cx="253" cy="200" r="13"
            fill="none" stroke={tran.color} strokeWidth="0.7" />
          <circle cx="253" cy="200" r="6"
            fill={tran.fillColor} stroke={tran.color} strokeWidth="1.1" />
          <circle cx="253" cy="200" r="2.5" fill={tran.color} opacity="0.5" />

          {/* Rayos polea pequeña (4 rayos) */}
          {[0, 90, 180, 270].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line key={`spoke-sm-${i}`}
                x1={253 + 6 * Math.cos(rad)}
                y1={200 + 6 * Math.sin(rad)}
                x2={253 + 13 * Math.cos(rad)}
                y2={200 + 13 * Math.sin(rad)}
                stroke={tran.color} strokeWidth="0.9"
              />
            );
          })}

          {/* Correa V-belt (tangentes) */}
          <line x1="234" y1="196" x2="221" y2="254"
            stroke={tran.color} strokeWidth="1.3" strokeDasharray="4,2" />
          <line x1="272" y1="213" x2="285" y2="246"
            stroke={tran.color} strokeWidth="1.3" strokeDasharray="4,2" />

          {/* Pie motor (implicado) */}
          <line x1="253" y1="288" x2="253" y2="278"
            stroke={tran.color} strokeWidth="2" />
          <rect x="245" y="284" width="16" height="8" rx="3"
            fill={tran.fillColor} stroke={tran.color} strokeWidth="1.2" />
        </g>

        {/* ════════════════════════════════════════════════════════
            LAYER: MECHANICAL  (#layer-mechanical)
            Tolva, carcasa, engranaje cónico, base, sensores
            ════════════════════════════════════════════════════════ */}
        <g
          id="layer-mechanical"
          opacity={mech.opacity}
          filter={mech.isActive && activeLayer ? 'url(#eqp-glow-soft)' : ''}
        >
          {/* Aro superior tolva */}
          <ellipse cx="145" cy="25" rx="92" ry="12"
            fill={mech.fillColor} stroke={mech.color} strokeWidth="1.5" />

          {/* Paredes laterales tolva */}
          <line x1="53" y1="25" x2="53" y2="88"
            stroke={mech.color} strokeWidth="1.5" />
          <line x1="237" y1="25" x2="237" y2="88"
            stroke={mech.color} strokeWidth="1.5" />

          {/* Costillas verticales interiores */}
          {[85, 107, 130, 153, 175, 197].map((x, i) => (
            <line key={`rib-${i}`} x1={x} y1="25" x2={x} y2="88"
              stroke={mech.color} strokeWidth="0.6" opacity="0.5" />
          ))}

          {/* Banda "Nordberg" */}
          <rect x="72" y="42" width="146" height="28" rx="4"
            fill={mech.fillColor} stroke={mech.color} strokeWidth="1.3" />
          <text x="145" y="61" textAnchor="middle"
            fontSize="12" fontStyle="italic" fontWeight="bold"
            fill={mech.color} fontFamily="Georgia, serif" letterSpacing="0.5">
            Nordberg
          </text>

          {/* Aro inferior tolva / collar medio */}
          <ellipse cx="145" cy="88" rx="92" ry="12"
            fill={mech.fillColor} stroke={mech.color} strokeWidth="1.5" />

          {/* Banda "Omnicone SX" */}
          <rect x="78" y="77" width="134" height="24" rx="3"
            fill={mech.fillColor} stroke={mech.color} strokeWidth="1.2" />
          <text x="145" y="93" textAnchor="middle"
            fontSize="9" fontWeight="bold"
            fill={mech.color} fontFamily="monospace" letterSpacing="0.8">
            Omnicone SX
          </text>

          {/* Carcasa superior (troncocónica) */}
          <path d="M 58 100 L 68 142 L 222 142 L 232 100 Z"
            fill={mech.fillColor} stroke={mech.color} strokeWidth="1.4" />
          <ellipse cx="145" cy="100" rx="87" ry="10"
            fill="none" stroke={mech.color} strokeWidth="0.8" opacity="0.6" />
          <ellipse cx="145" cy="142" rx="77" ry="9"
            fill="none" stroke={mech.color} strokeWidth="0.8" opacity="0.6" />

          {/* Carcasa principal */}
          <rect x="68" y="142" width="154" height="80"
            fill={mech.fillColor} stroke={mech.color} strokeWidth="1.4" />

          {/* Ensamble engranaje cónico (cutaway) */}
          <circle cx="145" cy="182" r="22"
            fill="none" stroke={mech.color} strokeWidth="1.1" />
          <circle cx="145" cy="182" r="14"
            fill={mech.fillColor} stroke={mech.color} strokeWidth="1" />
          <circle cx="145" cy="182" r="6"
            fill={mech.fillColor} stroke={mech.color} strokeWidth="1.2" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line key={`gear-${i}`}
                x1={145 + 6 * Math.cos(rad)}
                y1={182 + 6 * Math.sin(rad)}
                x2={145 + 14 * Math.cos(rad)}
                y2={182 + 14 * Math.sin(rad)}
                stroke={mech.color} strokeWidth="0.7"
              />
            );
          })}

          {/* Contorno manto cónico (cutaway) */}
          <path d="M 110 142 L 105 182 L 185 182 L 180 142"
            fill="none" stroke={mech.color} strokeWidth="0.9" opacity="0.5" />

          {/* Pernos laterales */}
          {[95, 118, 145, 172, 195].map((x, i) => (
            <circle key={`bolt-top-${i}`} cx={x} cy="147" r="2.5"
              fill={mech.fillColor} stroke={mech.color} strokeWidth="0.9" />
          ))}
          {[95, 118, 145, 172, 195].map((x, i) => (
            <circle key={`bolt-bot-${i}`} cx={x} cy="217" r="2.5"
              fill={mech.fillColor} stroke={mech.color} strokeWidth="0.9" />
          ))}

          {/* Falda / Marco inferior */}
          <path d="M 68 222 L 52 244 L 238 244 L 222 222 Z"
            fill={mech.fillColor} stroke={mech.color} strokeWidth="1.4" />

          {/* Placa base */}
          <rect x="44" y="244" width="196" height="16" rx="4"
            fill={mech.fillColor} stroke={mech.color} strokeWidth="1.5" />
          {[60, 90, 118, 172, 200, 228].map((x, i) => (
            <circle key={`base-bolt-${i}`} cx={x} cy="252" r="4"
              fill={mech.fillColor} stroke={mech.color} strokeWidth="1" />
          ))}

          {/* Sensor temperatura carcasa superior */}
          <rect x="88" y="113" width="8" height="16" rx="2"
            fill={mech.fillColor} stroke={mech.color} strokeWidth="1" />
          <line x1="92" y1="109" x2="92" y2="113"
            stroke={mech.color} strokeWidth="0.9" />
          <circle cx="92" cy="107" r="2.5" fill={mech.color} opacity="0.7" />

          {/* Presostato carcasa derecha */}
          <rect x="198" y="160" width="8" height="12" rx="2"
            fill={mech.fillColor} stroke={mech.color} strokeWidth="1" />
          <circle cx="202" cy="158" r="2.5" fill={mech.color} opacity="0.7" />
        </g>

        {/* Marcos HUD (siempre visibles, muy sutiles) */}
        <g stroke={DEFAULT_COLOR} strokeWidth="0.5" opacity="0.18">
          <line x1="0" y1="0" x2="14" y2="0" />
          <line x1="0" y1="0" x2="0" y2="14" />
          <line x1="290" y1="0" x2="276" y2="0" />
          <line x1="290" y1="0" x2="290" y2="14" />
          <line x1="0" y1="300" x2="14" y2="300" />
          <line x1="0" y1="300" x2="0" y2="286" />
          <line x1="290" y1="300" x2="276" y2="300" />
          <line x1="290" y1="300" x2="290" y2="286" />
        </g>
      </svg>

      {/* ── BLOQUE DE METADATOS ────────────────────────────────── */}
      <View style={ss.metaBlock}>
        <View style={ss.metaRow}>
          <Text style={ss.metaKey}>Activo</Text>
          <Text style={ss.metaVal}>Chancador Omnicone SX 1560</Text>
        </View>
        <View style={ss.metaRow}>
          <Text style={ss.metaKey}>Ubicación</Text>
          <Text style={ss.metaVal}>Área Seca – Planta</Text>
        </View>
        <View style={ss.metaRow}>
          <Text style={ss.metaKey}>Nº Serie</Text>
          <Text style={[ss.metaVal, ss.metaSerial]}>NNS-1560-0C001</Text>
        </View>
        <View style={ss.metaRow}>
          <Text style={ss.metaKey}>Últ. Mant.</Text>
          <Text style={ss.metaVal}>15/05/2026</Text>
        </View>
      </View>

      {/* ── INDICADOR DE CAPA ACTIVA ──────────────────────────── */}
      {activeLayer ? (
        <View style={[ss.layerPill, { borderColor: activePillColor }]}>
          <Text style={[ss.layerPillTxt, { color: activePillColor }]}>
            ⬡ {activeLayer}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const ss = StyleSheet.create({
  wrapper: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },

  // Bloque de metadatos
  metaBlock: {
    marginTop: 6,
    backgroundColor: '#060F1E',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#1A2D45',
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  metaKey: {
    color: '#4A6480',
    fontSize: 8,
    fontWeight: '800',
    width: 58,
    flexShrink: 0,
    letterSpacing: 0.3,
    lineHeight: 13,
  },
  metaVal: {
    flex: 1,
    color: '#D0E0F5',
    fontSize: 8,
    fontWeight: '600',
    lineHeight: 13,
  },
  metaSerial: {
    fontFamily: 'monospace',
    color: '#00F0FF',
  },

  // Indicador de capa activa
  layerPill: {
    marginTop: 5,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: 'center',
  },
  layerPillTxt: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
