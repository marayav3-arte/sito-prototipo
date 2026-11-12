/**
 * EPPSilhouette.js — v3.0 Neon HUD
 * ─────────────────────────────────────────────────────────────────────────────
 * Componente EPP Dinámico: silueta andrógina vectorial estilo HUD con overlays
 * de equipamiento en Cyan #00F0FF / Amarillo #FFE600 sobre fondo transparente.
 *
 * Layout: [SVG Figure ← 38%] | [EPP Item List → 62%]  (side-by-side)
 * Height fija: 210px total → no produce scroll en el panel lateral.
 *
 * Detección por asset ID (CH-/MOL-/CL-/ESP-) o por nombre del equipo en la OT.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ─── PALETA HUD ──────────────────────────────────────────────────────────────
const CY  = '#00F0FF';   // Cyan principal
const YW  = '#FFE600';   // Amarillo / linterna
const GR  = '#10B981';   // Verde neón (ruta)
const DK  = '#050D1A';   // Fondo oscuro
const BD  = '#0A1628';   // Body base

// ─── MATRIZ EPP POR TIPO ──────────────────────────────────────────────────────
const EPP_MATRIX = {
  CHANCADOR: {
    label: 'Chancado / Trituración',
    accent: '#FF6B35',
    risk: 'ALTO',
    items: [
      { id: 'overol',     zone: 'torso', icon: '🦺', name: 'Overol de Trabajo',       detail: 'Alta vis. · Clase 3' },
      { id: 'geologo',    zone: 'ears',  icon: '🔇', name: 'Chaleco Geólogo',          detail: 'SNR 35 dB · >85 dB' },
      { id: 'casco',      zone: 'head',  icon: '⛑️', name: 'Casco con Linterna',       detail: 'Clase A · LED frontal' },
      { id: 'guantes',    zone: 'hands', icon: '🧤', name: 'Guantes Industriales',     detail: 'Anti-impacto Niv.5' },
      { id: 'bototos',    zone: 'feet',  icon: '🥾', name: 'Bototos de Seguridad',     detail: 'Punta acero · ADS' },
      { id: 'respirador', zone: 'face',  icon: '😷', name: 'Respirador Doble Filtro',  detail: 'P100 · vapores' },
    ],
  },
  MOLINO: {
    label: 'Molienda SAG / Bolas',
    accent: '#A855F7',
    risk: 'ALTO',
    items: [
      { id: 'overol',     zone: 'torso', icon: '🦺', name: 'Overol Alta Visibilidad',  detail: 'Clase 3 · Reflectante' },
      { id: 'geologo',    zone: 'ears',  icon: '🔇', name: 'Protección Auditiva',      detail: 'SNR 38 dB · >100 dB' },
      { id: 'casco',      zone: 'head',  icon: '⛑️', name: 'Casco c/ Barbiquejo',      detail: 'Clase A · Fijación' },
      { id: 'guantes',    zone: 'hands', icon: '🧤', name: 'Guantes Anti-Vibración',   detail: 'Neopreno · ISO 10819' },
      { id: 'bototos',    zone: 'feet',  icon: '🥾', name: 'Bototos de Seguridad',     detail: 'Antideslizante' },
      { id: 'respirador', zone: 'face',  icon: '😷', name: 'Respirador P100',          detail: 'Sílice · polvo fino' },
      { id: 'lentes',     zone: 'face',  icon: '🥽', name: 'Lentes de Seguridad',      detail: 'Anti-impacto · UV' },
    ],
  },
  CELDA: {
    label: 'Celdas de Flotación',
    accent: '#EC4899',
    risk: 'CRÍTICO',
    items: [
      { id: 'overol',     zone: 'torso', icon: '🦺', name: 'Overol Químico',           detail: 'Resistente a ácidos' },
      { id: 'casco',      zone: 'head',  icon: '⛑️', name: 'Casco c/ Pantalla',        detail: 'Visor anti-salpicad.' },
      { id: 'guantes',    zone: 'hands', icon: '🧤', name: 'Guantes Neopreno',         detail: 'Resistentes a ácidos' },
      { id: 'bototos',    zone: 'feet',  icon: '🥾', name: 'Bototos Químicos',         detail: 'Resistentes a ácidos' },
      { id: 'respirador', zone: 'face',  icon: '😷', name: 'Máscara Química Completa', detail: 'Gases ácidos' },
      { id: 'lentes',     zone: 'face',  icon: '🥽', name: 'Lentes Anti-Splash',       detail: 'Sellados · Químicos' },
    ],
  },
  ESPESADOR: {
    label: 'Espesamiento / Relaves',
    accent: '#84CC16',
    risk: 'ALTO',
    items: [
      { id: 'overol',     zone: 'torso', icon: '🦺', name: 'Overol Alta Visibilidad',  detail: 'Clase 2 · Reflectante' },
      { id: 'casco',      zone: 'head',  icon: '⛑️', name: 'Casco de Seguridad',       detail: 'Clase A · Barbiquejo' },
      { id: 'guantes',    zone: 'hands', icon: '🧤', name: 'Guantes de Trabajo',       detail: 'Anti-cortes · abrasión' },
      { id: 'bototos',    zone: 'feet',  icon: '🥾', name: 'Bototos de Seguridad',     detail: 'Sup. húmedas · ADS' },
      { id: 'respirador', zone: 'face',  icon: '😷', name: 'Respirador P100',          detail: 'Polvo relaves · sílice' },
      { id: 'arnes',      zone: 'torso', icon: '🪝',  name: 'Arnés de Seguridad',       detail: 'Trabajo en altura' },
    ],
  },
};

// ─── DETECCIÓN DE TIPO (doble capa) ──────────────────────────────────────────
function detectType(tag, name) {
  if (tag) {
    const t = tag.toUpperCase().replace(/[\s-]/g, '');
    if (/^CH/.test(t))  return 'CHANCADOR';
    if (/^MOL/.test(t)) return 'MOLINO';
    if (/^CL|^CEL/.test(t)) return 'CELDA';
    if (/^ESP|^FL/.test(t)) return 'ESPESADOR';
  }
  if (name) {
    const n = name.toLowerCase();
    if (/chancad|omnicone|cónico|primario|triturad/.test(n)) return 'CHANCADOR';
    if (/molino|sag|bola/.test(n))                           return 'MOLINO';
    if (/celda|flotac/.test(n))                              return 'CELDA';
    if (/espesad|relave|filtro/.test(n))                     return 'ESPESADOR';
  }
  return 'CHANCADOR'; // default seguro
}

// ─── SVG SILUETA ANDRÓGINA HUD ───────────────────────────────────────────────
// viewBox 0 0 90 200 — figura neutral de cuerpo completo estilo neon-wireframe.
// Puntos de anclaje por zona para las líneas de callout.
function NeonFigure({ accent }) {
  const ac = accent;

  return (
    <svg
      viewBox="0 0 90 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Glow filter para elementos activos */}
        <filter id="glow-h" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.8" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-s" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.9" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Gradiente del overol */}
        <linearGradient id="vest-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={YW} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={YW} stopOpacity="0.4"/>
        </linearGradient>
      </defs>

      {/* ══ BASE BODY — silueta andrógina rellena oscura ══════════════════ */}

      {/* Piernas */}
      <path d="M 28 122 L 25 190 L 38 190 L 42 140 L 48 140 L 52 190 L 65 190 L 62 122 Z"
        fill="#0C1E30" stroke={CY} strokeWidth="0.7" opacity="0.85" />

      {/* Bototos */}
      <path d="M 22 185 Q 19 193 26 196 L 40 196 Q 44 193 40 185 Z"
        fill="#0A1520" stroke={ac} strokeWidth="1" filter="url(#glow-s)" />
      <path d="M 50 185 Q 47 193 54 196 L 68 196 Q 72 193 68 185 Z"
        fill="#0A1520" stroke={ac} strokeWidth="1" filter="url(#glow-s)" />
      {/* Punta metálica */}
      <ellipse cx="27" cy="192" rx="5" ry="2.5" fill={ac} opacity="0.35" />
      <ellipse cx="55" cy="192" rx="5" ry="2.5" fill={ac} opacity="0.35" />

      {/* Torso andrógino */}
      <path d="M 22 62 C 18 65 16 100 18 120 L 72 120 C 74 100 72 65 68 62 Z"
        fill="#0D1E30" stroke={CY} strokeWidth="0.7" />

      {/* Brazos */}
      <path d="M 22 65 Q 6 85 8 130" stroke="#0D1E30" strokeWidth="14"
        strokeLinecap="round" fill="none" />
      <path d="M 22 65 Q 6 85 8 130" stroke={CY} strokeWidth="0.7" fill="none" />
      <path d="M 68 65 Q 84 85 82 130" stroke="#0D1E30" strokeWidth="14"
        strokeLinecap="round" fill="none" />
      <path d="M 68 65 Q 84 85 82 130" stroke={CY} strokeWidth="0.7" fill="none" />

      {/* Manos / Guantes */}
      <ellipse cx="8"  cy="133" rx="7" ry="9" fill="#0E2030" stroke={ac} strokeWidth="1" filter="url(#glow-s)" />
      <ellipse cx="82" cy="133" rx="7" ry="9" fill="#0E2030" stroke={ac} strokeWidth="1" filter="url(#glow-s)" />
      {/* Dedos guante */}
      {[0,1,2].map(i => (
        <rect key={i} x={3 + i*3} y={125} width="2.5" height="5" rx="1.2"
          fill="#0E2030" stroke={ac} strokeWidth="0.5" opacity="0.8" />
      ))}
      {[0,1,2].map(i => (
        <rect key={i} x={77 + i*3} y={125} width="2.5" height="5" rx="1.2"
          fill="#0E2030" stroke={ac} strokeWidth="0.5" opacity="0.8" />
      ))}

      {/* Cuello */}
      <rect x="38" y="50" width="14" height="14" rx="5" fill="#0D1E30" stroke={CY} strokeWidth="0.6" />

      {/* Cabeza andrógina */}
      <ellipse cx="45" cy="33" rx="18" ry="20"
        fill="#0D1E30" stroke={CY} strokeWidth="1" filter="url(#glow-s)" />

      {/* ══ EPP OVERLAYS ══════════════════════════════════════════════════ */}

      {/* OVEROL — franjas reflectantes amarillas */}
      <rect x="22" y="82" width="46" height="4" rx="1.5"
        fill={YW} opacity="0.85" filter="url(#glow-s)" />
      <rect x="22" y="108" width="46" height="4" rx="1.5"
        fill={YW} opacity="0.85" filter="url(#glow-s)" />
      {/* Chaleco — bordes laterales */}
      <path d="M 22 62 L 22 82 M 68 62 L 68 82"
        stroke={YW} strokeWidth="1.5" opacity="0.7" />
      {/* Cierre central */}
      <line x1="45" y1="62" x2="45" y2="120"
        stroke={CY} strokeWidth="0.8" opacity="0.4" strokeDasharray="2,2" />

      {/* CASCO — arco protector */}
      <path d="M 26 34 Q 26 10 45 9 Q 64 10 64 34"
        fill="#0A1E38" stroke={CY} strokeWidth="1.4" filter="url(#glow-s)" />
      <rect x="23" y="33" width="44" height="5" rx="2.5"
        fill={CY} opacity="0.6" filter="url(#glow-s)" />
      {/* Ala del casco */}
      <rect x="20" y="37" width="50" height="3" rx="1.5"
        fill={CY} opacity="0.4" />

      {/* LINTERNA FRONTAL — resplandor */}
      <circle cx="45" cy="22" r="5.5"
        fill={YW} opacity="0.95" filter="url(#glow-h)" />
      <circle cx="45" cy="22" r="3"
        fill="#FFFFFF" opacity="0.9" />
      <circle cx="45" cy="22" r="1.2"
        fill={YW} opacity="1" />
      {/* Rayos de luz */}
      <g stroke={YW} strokeWidth="0.8" opacity="0.5" filter="url(#glow-h)">
        <line x1="45" y1="16" x2="45" y2="9" />
        <line x1="40" y1="17" x2="36" y2="11" />
        <line x1="50" y1="17" x2="54" y2="11" />
        <line x1="38" y1="19" x2="32" y2="15" />
        <line x1="52" y1="19" x2="58" y2="15" />
      </g>

      {/* RESPIRADOR DOBLE FILTRO */}
      <rect x="35" y="43" width="20" height="13" rx="5"
        fill="#0A1A2E" stroke={CY} strokeWidth="1" filter="url(#glow-s)" />
      {/* Filtros */}
      <circle cx="39" cy="49" r="4" fill="#071220" stroke={CY} strokeWidth="0.8" />
      <circle cx="51" cy="49" r="4" fill="#071220" stroke={CY} strokeWidth="0.8" />
      <circle cx="39" cy="49" r="2" fill={CY} opacity="0.45" />
      <circle cx="51" cy="49" r="2" fill={CY} opacity="0.45" />
      {/* Puente nasal */}
      <path d="M 43 43 Q 45 40 47 43" stroke={CY} strokeWidth="0.8" fill="none" />

      {/* GEÓLOGO / PROTECTORES AUDITIVOS */}
      <ellipse cx="26" cy="34" rx="5" ry="7"
        fill="#0A1E38" stroke={CY} strokeWidth="1" filter="url(#glow-s)" />
      <ellipse cx="64" cy="34" rx="5" ry="7"
        fill="#0A1E38" stroke={CY} strokeWidth="1" filter="url(#glow-s)" />
      {/* Almohadilla */}
      <ellipse cx="26" cy="34" rx="3" ry="4.5" fill={CY} opacity="0.25" />
      <ellipse cx="64" cy="34" rx="3" ry="4.5" fill={CY} opacity="0.25" />
      {/* Huincha de conexión */}
      <path d="M 26 27 Q 45 20 64 27" stroke={CY} strokeWidth="0.8" fill="none" opacity="0.6" />

      {/* ARNÉS — correas diagonales (visible solo si aplica) */}
      <line x1="33" y1="62" x2="50" y2="95"
        stroke={CY} strokeWidth="0.9" opacity="0.4" strokeDasharray="2,1.5" />
      <line x1="57" y1="62" x2="40" y2="95"
        stroke={CY} strokeWidth="0.9" opacity="0.4" strokeDasharray="2,1.5" />

      {/* ══ PUNTOS DE ANCLAJE — callout dots ══════════════════════════════ */}
      {/* head   */ }<circle cx="65" cy="22" r="2"   fill={ac} filter="url(#glow-s)" />
      {/* face   */ }<circle cx="55" cy="49" r="2"   fill={CY} filter="url(#glow-s)" />
      {/* ears   */ }<circle cx="64" cy="38" r="1.8" fill={CY} filter="url(#glow-s)" />
      {/* torso  */ }<circle cx="68" cy="90" r="2"   fill={YW} filter="url(#glow-s)" />
      {/* hands  */ }<circle cx="82" cy="128" r="2"  fill={ac} filter="url(#glow-s)" />
      {/* feet   */ }<circle cx="65" cy="190" r="2"  fill={ac} filter="url(#glow-s)" />

      {/* ══ GRID LINES TÉCNICAS — HUD decoración ══════════════════════════ */}
      <line x1="0" y1="0"   x2="90" y2="0"   stroke={CY} strokeWidth="0.3" opacity="0.15"/>
      <line x1="0" y1="199" x2="90" y2="199" stroke={CY} strokeWidth="0.3" opacity="0.15"/>
      <line x1="0" y1="0"   x2="0"  y2="200" stroke={CY} strokeWidth="0.3" opacity="0.1"/>
      <line x1="89" y1="0"  x2="89" y2="200" stroke={CY} strokeWidth="0.3" opacity="0.1"/>

    </svg>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function EPPSilhouette({ equipmentTag, equipmentName }) {
  const type   = useMemo(() => detectType(equipmentTag, equipmentName), [equipmentTag, equipmentName]);
  const config = EPP_MATRIX[type] || EPP_MATRIX.CHANCADOR;
  const ac     = config.accent;
  const riskCl = config.risk === 'CRÍTICO' ? '#FF3333' : '#FFB800';

  return (
    <View nativeID="EPP-CONTAINER" style={ss.wrapper}>

      {/* ── HEADER ────────────────────────────────────────────────── */}
      <View style={ss.header}>
        <View style={[ss.accentBar, { backgroundColor: ac }]} />
        <View style={{ flex: 1 }}>
          <Text style={ss.title}>🧰 EPP REQUERIDO</Text>
          <Text style={[ss.subtitle, { color: ac }]}>{config.label}</Text>
        </View>
        <View style={[ss.riskPill, { borderColor: riskCl }]}>
          <Text style={[ss.riskTxt, { color: riskCl }]}>⚠ {config.risk}</Text>
        </View>
      </View>

      {/* ── BODY: FIGURA (izq) + LISTA EPP (der) ────────────────── */}
      <View nativeID="EPP-SECTION" style={ss.body}>

        {/* Columna izquierda — silueta SVG */}
        <View style={[ss.figureCol, { borderColor: ac + '44' }]}>
          <NeonFigure accent={ac} />
          {/* Badge de tipo */}
          <View style={[ss.typeBadge, { backgroundColor: ac + '22', borderColor: ac + '66' }]}>
            <Text style={[ss.typeTxt, { color: ac }]}>{type}</Text>
          </View>
        </View>

        {/* Columna derecha — lista EPP */}
        <View style={ss.listCol}>
          {config.items.map((item, idx) => (
            <View key={item.id} style={ss.itemRow}>
              {/* Línea de callout lateral */}
              <View style={[ss.calloutLine, { backgroundColor: CY }]} />
              {/* Icono */}
              <Text style={ss.itemIcon}>{item.icon}</Text>
              {/* Texto */}
              <View style={{ flex: 1 }}>
                <Text style={ss.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={ss.itemDetail} numberOfLines={1}>{item.detail}</Text>
              </View>
              {/* Dot obligatorio */}
              <View style={[ss.mandDot, { backgroundColor: ac }]} />
            </View>
          ))}
        </View>

      </View>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <View style={ss.footer}>
        <Text style={ss.footerTxt}>
          ● Verificar estado de cada EPP antes de ingresar al área
        </Text>
      </View>

    </View>
  );
}

// ─── STYLESHEET ───────────────────────────────────────────────────────────────
const ss = StyleSheet.create({
  wrapper: {
    marginTop: 8,
    backgroundColor: '#040C18',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1A2D45',
    // max-width 100%, no overflow
    maxWidth: '100%',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#060E1C',
    borderBottomWidth: 1,
    borderBottomColor: '#1A2D45',
    gap: 7,
  },
  accentBar:  { width: 3, height: 26, borderRadius: 2 },
  title:      { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  subtitle:   { fontSize: 8, fontWeight: '600', marginTop: 1 },
  riskPill:   { borderWidth: 1, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  riskTxt:    { fontSize: 7.5, fontWeight: '900', letterSpacing: 0.4 },

  // Body layout: figure | list
  body: {
    flexDirection: 'row',
    height: 210,        // altura fija — no produce scrollbar en el panel
    overflow: 'hidden',
  },

  // Columna izquierda — figura SVG
  figureCol: {
    width: '38%',
    borderRightWidth: 1,
    borderRightColor: '#1A2D45',
    backgroundColor: '#050C18',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    borderRadius: 4,
    borderWidth: 1,
    paddingVertical: 2,
    alignItems: 'center',
  },
  typeTxt: { fontSize: 7, fontWeight: '900', letterSpacing: 0.5 },

  // Columna derecha — lista de items
  listCol: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 5,
    justifyContent: 'space-around',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRadius: 5,
    backgroundColor: '#080F1E',
    borderWidth: 1,
    borderColor: '#122030',
    marginBottom: 2,
  },
  calloutLine: {
    width: 3,
    height: '100%',
    borderRadius: 2,
    opacity: 0.7,
    minHeight: 22,
  },
  itemIcon:   { fontSize: 12, width: 16, textAlign: 'center' },
  itemName:   { color: '#DDEEFF', fontSize: 8.5, fontWeight: '700' },
  itemDetail: { color: '#5A7490', fontSize: 7, marginTop: 0.5 },
  mandDot:    { width: 5, height: 5, borderRadius: 3 },

  // Footer
  footer: {
    backgroundColor: '#030A14',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#1A2D45',
  },
  footerTxt: { color: '#2A4060', fontSize: 7, textAlign: 'center' },
});
