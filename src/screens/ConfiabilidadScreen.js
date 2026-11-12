// =========================================================================
// CONFIABILIDAD SCREEN — PERFIL MANDANTE EXCLUSIVO
// Módulo de Auditoría, Taxonomía de Fallas y KPIs de Confiabilidad
// =========================================================================
import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Platform,
} from 'react-native';
import {
  BarChart2, CheckCircle2, AlertTriangle, Clock, Wrench,
  Zap, Layers, Gauge, ChevronDown, ChevronUp, FileCheck,
  Activity, TrendingDown, TrendingUp, ShieldCheck, Tag,
  XCircle, Cpu, Droplets, Settings2, Radio,
} from 'lucide-react-native';
import { useWorkOrders } from '../context/WorkOrdersContext';
import { useHorometro, PAUTAS } from '../context/HorometroContext';
import { COLORS, SPACING } from '../theme';

// ── Paleta extendida ──────────────────────────────────────────────────────
const C = {
  bg:        '#0F172A',
  surface:   '#1E293B',
  card:      '#162032',
  border:    '#334155',
  amber:     '#F59E0B',
  amberDim:  '#78350F',
  cyan:      '#00E5FF',
  cyanDim:   '#0E4458',
  green:     '#22C55E',
  greenDim:  '#14532D',
  red:       '#EF4444',
  redDim:    '#7F1D1D',
  purple:    '#A855F7',
  purpleDim: '#4C1D95',
  blue:      '#3B82F6',
  text:      '#F8FAFC',
  textSec:   '#94A3B8',
  yellow:    '#FFE600',
};

// ── Opciones de taxonomía ─────────────────────────────────────────────────
const TIPO_IMPACTO_OPTIONS = [
  { key: 'PARADA_NO_PROGRAMADA', label: 'Parada No Programada', short: 'BREAKDOWN', icon: XCircle, color: C.red },
  { key: 'SERVICIO_REDUCIDO',    label: 'Servicio Reducido',    short: 'DERATED',    icon: TrendingDown, color: C.amber },
  { key: 'MANT_PROGRAMADO',      label: 'Mant. Programado',     short: 'PM',         icon: Settings2, color: C.green },
];

const CATEGORIA_FALLA_OPTIONS = [
  { key: 'MECANICA',        label: 'Mecánica',       icon: Wrench,    color: C.amber },
  { key: 'ELECTRICA',       label: 'Eléctrica',      icon: Zap,       color: C.yellow },
  { key: 'INSTRUMENTACION', label: 'Instrumentación',icon: Gauge,     color: C.cyan },
  { key: 'HIDRAULICA',      label: 'Hidráulica',     icon: Droplets,  color: C.blue },
  { key: 'OPERACIONAL',     label: 'Operacional',    icon: Radio,     color: C.purple },
];

// ── KPI Stat card ──────────────────────────────────────────────────────────
function KpiStatCard({ label, value, unit, color, icon: Icon, sub }) {
  return (
    <View style={[hss.kpiStatCard, { borderLeftColor: color }]}>
      <View style={hss.kpiStatHeader}>
        {Icon && <Icon size={12} color={color} strokeWidth={2.5} style={{ marginRight: 5 }} />}
        <Text style={hss.kpiStatLabel}>{label}</Text>
      </View>
      <Text style={[hss.kpiStatValue, { color }]}>{value}</Text>
      <Text style={hss.kpiStatUnit}>{unit}</Text>
      {sub ? <Text style={hss.kpiStatSub}>{sub}</Text> : null}
    </View>
  );
}

// ── Barra de distribución por categoría ────────────────────────────────────
function CategoryBar({ label, color, icon: Icon, horas, total }) {
  const pct = total > 0 ? Math.min(100, (horas / total) * 100) : 0;
  return (
    <View style={hss.catRow}>
      <Icon size={10} color={color} strokeWidth={2} />
      <Text style={[hss.catLabel, { color }]}>{label}</Text>
      <View style={hss.catTrack}>
        <View style={[hss.catFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[hss.catPct, { color }]}>{pct.toFixed(0)}%</Text>
      <Text style={hss.catHoras}>{horas.toFixed(1)}h</Text>
    </View>
  );
}

// ── Bloque principal KPI Horómetro ─────────────────────────────────────────
function HorometroKpiBlock() {
  const { workH, downH, equipStatus, fallas } = useHorometro();

  const isOperating = equipStatus === 'OPERACION';
  const totalH      = workH + downH;

  // Disponibilidad
  const disponibilidad = totalH > 0
    ? Math.min(100, (workH / totalH) * 100).toFixed(2)
    : '100.00';
  const disponibilidadColor =
    parseFloat(disponibilidad) >= 98 ? '#10B981'
    : parseFloat(disponibilidad) >= 92 ? '#F59E0B' : '#EF4444';

  // MTBF — horas efectivas / cantidad de fallas no planificadas
  const unplanned = fallas.filter(f => f.cat !== 'OPERACIONAL').length;
  const mtbf = unplanned > 0 ? (workH / unplanned).toFixed(1) : '—';

  // MTTR — promedio de horas por evento de detención cerrado
  const closedFallas = fallas.filter(f => !f.open && f.horas > 0);
  const mttr = closedFallas.length > 0
    ? (closedFallas.reduce((s, f) => s + f.horas, 0) / closedFallas.length).toFixed(1)
    : fallas.length > 0
      ? (downH / fallas.length).toFixed(1)
      : '—';

  // Distribución de fallas por categoría
  const catMap = {};
  fallas.forEach(f => {
    catMap[f.cat] = (catMap[f.cat] || 0) + (f.horas || (downH / fallas.length));
  });
  const totalDown = Object.values(catMap).reduce((a, b) => a + b, 0) || downH;

  // Próxima pauta preventiva
  const nextPauta      = PAUTAS.find(p => p.horas > workH) ?? PAUTAS[PAUTAS.length - 1];
  const horasRestantes = Math.max(0, nextPauta.horas - workH).toFixed(1);
  const pautaPct       = Math.min(100, ((workH - (nextPauta.horas - 1000)) / 1000) * 100);
  const pautaColor     = pautaPct >= 90 ? '#EF4444' : pautaPct >= 70 ? '#F59E0B' : '#10B981';

  return (
    <View style={hss.block}>

      {/* Cabecera */}
      <View style={hss.blockHeader}>
        <Activity size={14} color={C.cyan} strokeWidth={2.5} />
        <Text style={hss.blockTitle}>SALUD DEL ACTIVO — CH-02</Text>
        <View style={[hss.liveChip, { borderColor: isOperating ? '#10B981' : '#EF4444' }]}>
          <View style={[hss.liveDot, { backgroundColor: isOperating ? '#10B981' : '#EF4444' }]} />
          <Text style={[hss.liveTxt, { color: isOperating ? '#10B981' : '#EF4444' }]}>
            {isOperating ? 'EN OP.' : equipStatus}
          </Text>
        </View>
      </View>
      <Text style={hss.blockSub}>Nordberg Omnicone SX 1560 · Área Seca</Text>

      {/* KPI row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        <KpiStatCard
          label="DISPONIBILIDAD"
          value={`${disponibilidad}%`}
          unit="operacional"
          color={disponibilidadColor}
          icon={Activity}
          sub={`${workH.toFixed(1)} h efectivas`}
        />
        <KpiStatCard
          label="MTBF"
          value={mtbf}
          unit="h / falla"
          color={C.cyan}
          icon={TrendingUp}
          sub={`${unplanned} eventos no planif.`}
        />
        <KpiStatCard
          label="MTTR"
          value={mttr}
          unit="h por evento"
          color={C.amber}
          icon={Clock}
          sub={`${downH.toFixed(1)} h detención total`}
        />
        <KpiStatCard
          label="DETENCIONES"
          value={fallas.length}
          unit="eventos totales"
          color="#A855F7"
          icon={TrendingDown}
          sub={`${closedFallas.length} cerradas`}
        />
      </ScrollView>
      {/* ── BARRAS MACRO: OPERACIÓN Y DETENCIÓN ─────────────────── */}
      <View style={hss.macroBarsContainer}>

        {/* BARRA 1 — TIEMPO TOTAL ACTIVO */}
        <View style={hss.macroBarRow}>
          <View style={hss.macroBarTop}>
            <View style={hss.macroBarLabelRow}>
              <View style={[hss.macroBarDot, { backgroundColor: '#10B981' }]} />
              <Text style={[hss.macroBarLabel, { color: '#10B981' }]}>TIEMPO TOTAL ACTIVO</Text>
            </View>
            <View style={hss.macroBarValueRow}>
              <Text style={[hss.macroBarValue, { color: '#10B981' }]}>
                {workH.toFixed(1)} h
              </Text>
              <Text style={[hss.macroBarPct, { color: '#10B981' }]}>
                {((workH / (workH + downH)) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
          <View style={hss.macroTrack}>
            <View style={[hss.macroFill, {
              width: `${Math.min(100, (workH / (workH + downH)) * 100)}%`,
              backgroundColor: '#10B981',
              shadowColor: '#10B981',
              shadowOpacity: 0.5,
              shadowRadius: 6,
            }]} />
          </View>
          <Text style={hss.macroMeta}>Horas operativas desde comisionamiento · Acumulado horómetro</Text>
        </View>

        {/* BARRA 2 — TIEMPO TOTAL PARADO */}
        <View style={[hss.macroBarRow, { marginTop: 10 }]}>
          <View style={hss.macroBarTop}>
            <View style={hss.macroBarLabelRow}>
              <View style={[hss.macroBarDot, { backgroundColor: '#FACC15' }]} />
              <Text style={[hss.macroBarLabel, { color: '#FACC15' }]}>TIEMPO TOTAL PARADO</Text>
            </View>
            <View style={hss.macroBarValueRow}>
              <Text style={[hss.macroBarValue, { color: '#FACC15' }]}>
                {downH.toFixed(1)} h
              </Text>
              <Text style={[hss.macroBarPct, { color: '#F97316' }]}>
                {((downH / (workH + downH)) * 100).toFixed(2)}%
              </Text>
            </View>
          </View>
          <View style={hss.macroTrack}>
            <View style={[hss.macroFill, {
              width: `${Math.min(100, (downH / (workH + downH)) * 100)}%`,
              backgroundColor: '#FACC15',
              shadowColor: '#FACC15',
              shadowOpacity: 0.6,
              shadowRadius: 6,
            }]} />
          </View>
          <Text style={hss.macroMeta}>Detenciones no planificadas + paradas programadas acumuladas</Text>
        </View>
      </View>

      {/* Divisor hacia el desglose */}
      <View style={hss.dividerRow}>
        <View style={hss.dividerLine} />
        <Text style={hss.dividerLabel}>DESGLOSE DE DETENCIONES</Text>
        <View style={hss.dividerLine} />
      </View>

      {/* Distribución de paradas por categoría */}
      <Text style={hss.subSectionTitle}>DISTRIBUCIÓN DE PARADAS</Text>

      <View style={hss.catContainer}>
        {CATEGORIA_FALLA_OPTIONS.map(opt => {
          const key = opt.key === 'INSTRUMENTACION' ? 'LUBRICACION' : opt.key;
          return (
            <CategoryBar
              key={opt.key}
              label={opt.label}
              color={opt.color}
              icon={opt.icon}
              horas={catMap[key] ?? catMap[opt.key] ?? 0}
              total={totalDown}
            />
          );
        })}
      </View>

      {/* Próxima pauta preventiva */}
      <View style={hss.pautaCard}>
        <View style={hss.pautaHeader}>
          <Settings2 size={11} color={pautaColor} strokeWidth={2} />
          <Text style={[hss.pautaTitle, { color: pautaColor }]}>PRÓXIMA PAUTA PREVENTIVA</Text>
        </View>
        <Text style={hss.pautaName}>{nextPauta.label}</Text>
        <View style={hss.pautaRow}>
          <Text style={hss.pautaAt}>A las {nextPauta.horas.toLocaleString()} h</Text>
          <Text style={[hss.pautaRestante, { color: pautaColor }]}>
            {horasRestantes} h restantes
          </Text>
        </View>
        {/* Barra de progreso hasta pauta */}
        <View style={hss.pautaTrack}>
          <View style={[hss.pautaFill, { width: `${pautaPct}%`, backgroundColor: pautaColor }]} />
          <View style={hss.pautaTarget} />
        </View>
        <Text style={hss.pautaHint}>
          Horómetro actual: {workH.toFixed(1)} h efectivas
        </Text>
      </View>

    </View>
  );
}


// ─────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTES
// ─────────────────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, color, label, sub }) {
  return (
    <View style={ss.sectionHeader}>
      <View style={[ss.sectionIconBg, { backgroundColor: color + '22' }]}>
        <Icon size={18} color={color} strokeWidth={2.5} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[ss.sectionLabel, { color }]}>{label}</Text>
        {sub ? <Text style={ss.sectionSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

function KpiCard({ label, value, unit, icon: Icon, color, trend }) {
  return (
    <View style={[ss.kpiCard, { borderColor: color + '55' }]}>
      <View style={[ss.kpiIconBg, { backgroundColor: color + '22' }]}>
        <Icon size={20} color={color} strokeWidth={2} />
      </View>
      <Text style={[ss.kpiValue, { color }]}>{value}</Text>
      <Text style={ss.kpiUnit}>{unit}</Text>
      <Text style={ss.kpiLabel}>{label}</Text>
      {trend !== undefined && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 3 }}>
          {trend >= 0
            ? <TrendingUp size={12} color={C.green} />
            : <TrendingDown size={12} color={C.red} />}
          <Text style={{ fontSize: 10, color: trend >= 0 ? C.green : C.red }}>
            {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Selector de opción única ──────────────────────────────────────────────
function OptionSelector({ options, value, onChange }) {
  return (
    <View style={ss.selectorRow}>
      {options.map((opt) => {
        const Icon = opt.icon;
        const selected = value === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[ss.selectorChip, selected && { borderColor: opt.color, backgroundColor: opt.color + '22' }]}
            onPress={() => onChange(opt.key)}
            activeOpacity={0.75}
          >
            <Icon size={13} color={selected ? opt.color : C.textSec} strokeWidth={2} />
            <Text style={[ss.selectorChipText, selected && { color: opt.color }]}>
              {opt.short || opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Tarjeta de OT pendiente de auditoría ─────────────────────────────────
function OtAuditCard({ ot, onApprove }) {
  const [expanded, setExpanded] = useState(false);
  const [tipoImpacto,   setTipoImpacto]   = useState(ot.tipoImpacto || '');
  const [categoriaFalla, setCategoriaFalla] = useState(ot.sistemaFalla || '');
  const [downtime,      setDowntime]       = useState(ot.downtimeHoras ? String(ot.downtimeHoras) : '');
  const [validador,     setValidador]      = useState('');

  const canApprove = tipoImpacto && categoriaFalla && parseFloat(downtime) >= 0;
  const statusColor = C.amber;

  function handleApprove() {
    if (!canApprove) {
      Alert.alert('Campos requeridos', 'Completa Tipo de Impacto, Categoría de Falla y Downtime antes de cerrar la OT.');
      return;
    }
    Alert.alert(
      '✅ Confirmar Cierre de Auditoría',
      `OT ${ot.tag || ot.id}\n\nImpacto: ${tipoImpacto}\nFalla: ${categoriaFalla}\nDowntime: ${downtime}h\n\n¿Confirmar firma y cierre definitivo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'FIRMAR Y CERRAR',
          onPress: () =>
            onApprove(ot.id, validador || 'Auditor Mandante', {
              tipoImpacto,
              sistemaFalla: categoriaFalla,
              downtimeHoras: parseFloat(downtime),
              componenteCausaRaiz: ot.tag || ot.titulo,
            }),
        },
      ]
    );
  }

  return (
    <View style={ss.otCard}>
      {/* Header de la tarjeta */}
      <TouchableOpacity
        style={ss.otCardHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.85}
      >
        <View style={[ss.otStatusDot, { backgroundColor: statusColor }]} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={ss.otTag}>{ot.tag || ot.id}</Text>
            <View style={[ss.otBadge, { backgroundColor: C.amber + '22', borderColor: C.amber }]}>
              <Text style={[ss.otBadgeText, { color: C.amber }]}>⏳ ESPERANDO REVISIÓN</Text>
            </View>
          </View>
          <Text style={ss.otTitulo} numberOfLines={1}>{ot.titulo || ot.descripcion}</Text>
          <Text style={ss.otMeta}>
            {ot.area} · {ot.contratista || 'Contratista'} · {ot.turno ? `Turno ${ot.turno}` : ''}
          </Text>
        </View>
        {expanded
          ? <ChevronUp size={18} color={C.textSec} />
          : <ChevronDown size={18} color={C.textSec} />}
      </TouchableOpacity>

      {/* Panel expandido */}
      {expanded && (
        <View style={ss.otExpanded}>
          {/* Diagnóstico ejecutado */}
          <View style={ss.otSection}>
            <Text style={ss.otSectionTitle}>📋 DIAGNÓSTICO EJECUTADO</Text>
            <Text style={ss.otBodyText}>
              {ot.descripcion || 'Sin descripción de diagnóstico registrada.'}
            </Text>
            {ot.fieldNotes ? (
              <View style={ss.notesBox}>
                <Text style={ss.notesLabel}>NOTAS DE TERRENO</Text>
                <Text style={ss.notesText}>{ot.fieldNotes}</Text>
              </View>
            ) : null}
          </View>

          {/* Evidencias */}
          {ot.evidencias?.length > 0 && (
            <View style={ss.otSection}>
              <Text style={ss.otSectionTitle}>📸 EVIDENCIAS FOTOGRÁFICAS ({ot.evidencias.length})</Text>
              <View style={ss.evidenciasRow}>
                {ot.evidencias.map((ev, i) => (
                  <View key={i} style={ss.evidenciaChip}>
                    <FileCheck size={12} color={C.cyan} strokeWidth={2} />
                    <Text style={ss.evidenciaText}>{ev}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Divider */}
          <View style={ss.divider} />

          {/* ── SECCIÓN B: Taxonomía ── */}
          <Text style={ss.taxonomiaTitulo}>📊 REGISTRO TÁCTICO DE CONFIABILIDAD</Text>

          {/* Tipo de impacto */}
          <Text style={ss.fieldLabel}>① TIPO DE IMPACTO</Text>
          <OptionSelector
            options={TIPO_IMPACTO_OPTIONS}
            value={tipoImpacto}
            onChange={setTipoImpacto}
          />

          {/* Categoría de falla */}
          <Text style={[ss.fieldLabel, { marginTop: 14 }]}>② CATEGORÍA DE FALLA</Text>
          <OptionSelector
            options={CATEGORIA_FALLA_OPTIONS}
            value={categoriaFalla}
            onChange={setCategoriaFalla}
          />

          {/* Componente TAG */}
          <Text style={[ss.fieldLabel, { marginTop: 14 }]}>③ COMPONENTE / CAUSA RAÍZ</Text>
          <View style={ss.tagRow}>
            <Tag size={14} color={C.cyan} strokeWidth={2} />
            <Text style={ss.tagValue}>{ot.tag || ot.id} — {ot.titulo}</Text>
          </View>

          {/* Downtime */}
          <Text style={[ss.fieldLabel, { marginTop: 14 }]}>④ DOWNTIME REAL (horas)</Text>
          <TextInput
            style={ss.downtimeInput}
            value={downtime}
            onChangeText={setDowntime}
            keyboardType="decimal-pad"
            placeholder="e.g. 3.5"
            placeholderTextColor={C.textSec}
            maxLength={6}
          />

          {/* Validador */}
          <Text style={[ss.fieldLabel, { marginTop: 14 }]}>⑤ AUDITOR / VALIDADOR</Text>
          <TextInput
            style={ss.inputText}
            value={validador}
            onChangeText={setValidador}
            placeholder="Nombre del auditor mandante…"
            placeholderTextColor={C.textSec}
          />

          {/* Botón de cierre */}
          <TouchableOpacity
            style={[ss.approveBtn, !canApprove && ss.approveBtnDisabled]}
            onPress={handleApprove}
            activeOpacity={0.8}
          >
            <ShieldCheck size={16} color={canApprove ? C.bg : C.textSec} strokeWidth={2.5} />
            <Text style={[ss.approveBtnText, !canApprove && { color: C.textSec }]}>
              FIRMAR Y CERRAR OT
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ── Tarjeta OT ya auditada (historial) ───────────────────────────────────
function OtClosedCard({ ot }) {
  const [exp, setExp] = useState(false);
  return (
    <View style={ss.otCardClosed}>
      <TouchableOpacity style={ss.otCardHeader} onPress={() => setExp(!exp)} activeOpacity={0.85}>
        <View style={[ss.otStatusDot, { backgroundColor: C.green }]} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={ss.otTag}>{ot.tag || ot.id}</Text>
            <View style={[ss.otBadge, { backgroundColor: C.green + '22', borderColor: C.green }]}>
              <Text style={[ss.otBadgeText, { color: C.green }]}>✅ AUDITADA</Text>
            </View>
          </View>
          <Text style={ss.otTitulo} numberOfLines={1}>{ot.titulo || ot.descripcion}</Text>
          <Text style={ss.otMeta}>{ot.validationTimestamp} · {ot.validatorMandante}</Text>
        </View>
        {exp ? <ChevronUp size={18} color={C.textSec} /> : <ChevronDown size={18} color={C.textSec} />}
      </TouchableOpacity>
      {exp && (
        <View style={ss.otExpanded}>
          <View style={ss.closedDataRow}>
            <View style={ss.closedDataChip}>
              <Text style={ss.closedDataLabel}>IMPACTO</Text>
              <Text style={ss.closedDataVal}>{ot.tipoImpacto || ot.confiabilidad?.tipoImpacto || '—'}</Text>
            </View>
            <View style={ss.closedDataChip}>
              <Text style={ss.closedDataLabel}>FALLA</Text>
              <Text style={ss.closedDataVal}>{ot.sistemaFalla || ot.confiabilidad?.sistemaFalla || '—'}</Text>
            </View>
            <View style={ss.closedDataChip}>
              <Text style={ss.closedDataLabel}>DOWNTIME</Text>
              <Text style={ss.closedDataVal}>{ot.downtimeHoras ?? ot.confiabilidad?.downtimeHoras ?? '—'}h</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PANTALLA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────
export default function ConfiabilidadScreen({ activeRole }) {
  const { workOrders, approveWorkOrderAudit } = useWorkOrders();

  // OTs pendientes de auditoría mandante (informe entregado, sin firma)
  const pendingAudit = useMemo(() =>
    workOrders.filter(w =>
      w.tieneInforme === true &&
      w.firmaMandante?.firmado !== true &&
      w.estadoMandante !== 'CERRADA'
    ), [workOrders]);

  // OTs ya cerradas y auditadas
  const auditadas = useMemo(() =>
    workOrders.filter(w =>
      w.firmaMandante?.firmado === true ||
      (w.estadoMandante === 'CERRADA' && w.tieneInforme)
    ), [workOrders]);

  // ── KPIs calculados ────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const withDowntime = workOrders.filter(w =>
      (w.downtimeHoras != null || w.confiabilidad?.downtimeHoras != null) &&
      w.firmaMandante?.firmado === true
    );
    const totalDT = withDowntime.reduce((s, w) => s + (w.downtimeHoras || w.confiabilidad?.downtimeHoras || 0), 0);
    const mttr    = withDowntime.length ? (totalDT / withDowntime.length).toFixed(1) : '—';

    const breakdowns = workOrders.filter(w =>
      (w.tipoImpacto === 'PARADA_NO_PROGRAMADA' || w.confiabilidad?.tipoImpacto === 'PARADA_NO_PROGRAMADA')
    ).length;

    const totalClosed    = auditadas.length;
    const totalWorkOrders = workOrders.length;
    const adherencia = totalWorkOrders
      ? Math.round((totalClosed / totalWorkOrders) * 100)
      : 0;

    return { mttr, breakdowns, adherencia, totalClosed, pending: pendingAudit.length };
  }, [workOrders, auditadas, pendingAudit]);

  if (activeRole !== 'MANDANTE') {
    return (
      <View style={[ss.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ShieldCheck size={48} color={C.textSec} strokeWidth={1.5} />
        <Text style={{ color: C.textSec, marginTop: 16, fontSize: 14 }}>
          Módulo exclusivo para Perfil Mandante.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={ss.screen} contentContainerStyle={ss.scroll} showsVerticalScrollIndicator={false}>

      {/* ── CABECERA ──────────────────────────────────────────── */}
      <View style={ss.headerBanner}>
        <BarChart2 size={22} color={C.cyan} strokeWidth={2.5} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={ss.headerTitle}>MÓDULO CONFIABILIDAD</Text>
          <Text style={ss.headerSub}>Auditoría · Taxonomía · KPIs de Planta</Text>
        </View>
        <View style={[ss.roleBadge, { borderColor: C.cyan }]}>
          <Text style={[ss.roleBadgeText, { color: C.cyan }]}>🛡️ MANDANTE</Text>
        </View>
      </View>

      {/* ── BLOQUE SALUD ACTIVO: KPIs HORÓMETRO (tiempo real) ──── */}
      <HorometroKpiBlock />

      {/* ── SECCIÓN C: KPIs RÁPIDOS ───────────────────────────── */}

      <SectionHeader
        icon={Activity}
        color={C.cyan}
        label="PANEL DE INDICADORES"
        sub="Métricas calculadas en tiempo real"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={ss.kpiRow}>
        <KpiCard label="MTTR Promedio" value={kpis.mttr} unit="horas" icon={Clock} color={C.amber} />
        <KpiCard label="Breakdowns" value={kpis.breakdowns} unit="eventos" icon={TrendingDown} color={C.red} />
        <KpiCard label="OTs Auditadas" value={kpis.totalClosed} unit="total" icon={CheckCircle2} color={C.green} />
        <KpiCard label="Pendientes" value={kpis.pending} unit="en revisión" icon={AlertTriangle} color={C.amber} />
        <KpiCard label="Adherencia" value={`${kpis.adherencia}%`} unit="cierre" icon={Layers} color={C.purple} />
      </ScrollView>

      {/* ── SECCIÓN A: OTs PENDIENTES DE AUDITORÍA ────────────── */}
      <View style={ss.sectionSpacer} />
      <SectionHeader
        icon={AlertTriangle}
        color={C.amber}
        label="OTs EN ESPERA DE REVISIÓN MANDANTE"
        sub={`${pendingAudit.length} alertas con informe entregado — requieren cierre y firma`}
      />

      {pendingAudit.length === 0 ? (
        <View style={ss.emptyState}>
          <CheckCircle2 size={32} color={C.green} strokeWidth={1.5} />
          <Text style={ss.emptyStateText}>Sin OTs pendientes de auditoría. ✅</Text>
        </View>
      ) : (
        pendingAudit.map(ot => (
          <OtAuditCard
            key={ot.id}
            ot={ot}
            onApprove={approveWorkOrderAudit}
          />
        ))
      )}

      {/* ── HISTORIAL AUDITADO ─────────────────────────────────── */}
      {auditadas.length > 0 && (
        <>
          <View style={ss.sectionSpacer} />
          <SectionHeader
            icon={CheckCircle2}
            color={C.green}
            label="HISTORIAL DE OTs CERRADAS"
            sub={`${auditadas.length} órdenes auditadas y firmadas`}
          />
          {auditadas.map(ot => (
            <OtClosedCard key={ot.id} ot={ot} />
          ))}
        </>
      )}

      {/* ── LEYENDA TAXONOMÍA ─────────────────────────────────── */}
      <View style={ss.sectionSpacer} />
      <SectionHeader
        icon={Cpu}
        color={C.purple}
        label="TAXONOMÍA DE CONFIABILIDAD"
        sub="Referencia de clasificación ISO 14224"
      />
      <View style={ss.legendGrid}>
        {CATEGORIA_FALLA_OPTIONS.map(opt => {
          const Icon = opt.icon;
          const count = workOrders.filter(w =>
            w.sistemaFalla === opt.key || w.confiabilidad?.sistemaFalla === opt.key
          ).length;
          return (
            <View key={opt.key} style={[ss.legendChip, { borderColor: opt.color + '55' }]}>
              <Icon size={14} color={opt.color} strokeWidth={2} />
              <Text style={[ss.legendLabel, { color: opt.color }]}>{opt.label}</Text>
              <Text style={ss.legendCount}>{count} OTs</Text>
            </View>
          );
        })}
      </View>

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────────────────────────────────
const ss = StyleSheet.create({
  screen:           { flex: 1, backgroundColor: C.bg },
  scroll:           { paddingHorizontal: 14, paddingTop: 12 },

  // Header
  headerBanner:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.cyanDim + 'AA', borderWidth: 1, borderColor: C.cyan + '55', borderRadius: 12, padding: 14, marginBottom: 18 },
  headerTitle:      { color: C.text, fontSize: 14, fontWeight: '900', letterSpacing: 1.5 },
  headerSub:        { color: C.textSec, fontSize: 11, marginTop: 2 },
  roleBadge:        { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  roleBadgeText:    { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  // Section header
  sectionHeader:    { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  sectionIconBg:    { borderRadius: 8, padding: 8 },
  sectionLabel:     { fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  sectionSub:       { color: C.textSec, fontSize: 10, marginTop: 2 },
  sectionSpacer:    { height: 24 },

  // KPI
  kpiRow:           { flexDirection: 'row', marginBottom: 4, marginHorizontal: -4 },
  kpiCard:          { backgroundColor: C.surface, borderWidth: 1, borderRadius: 12, padding: 14, marginHorizontal: 4, alignItems: 'center', minWidth: 100 },
  kpiIconBg:        { borderRadius: 8, padding: 8, marginBottom: 8 },
  kpiValue:         { fontSize: 22, fontWeight: '900' },
  kpiUnit:          { color: C.textSec, fontSize: 10, marginTop: 2 },
  kpiLabel:         { color: C.text, fontSize: 10, fontWeight: '700', marginTop: 6, textAlign: 'center' },

  // OT cards
  otCard:           { backgroundColor: C.card, borderWidth: 1, borderColor: C.amber + '44', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  otCardClosed:     { backgroundColor: C.card, borderWidth: 1, borderColor: C.green + '44', borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
  otCardHeader:     { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  otStatusDot:      { width: 10, height: 10, borderRadius: 5 },
  otTag:            { color: C.text, fontSize: 13, fontWeight: '900', letterSpacing: 0.5, fontFamily: 'monospace' },
  otBadge:          { borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  otBadgeText:      { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  otTitulo:         { color: C.text, fontSize: 12, fontWeight: '600', marginTop: 3 },
  otMeta:           { color: C.textSec, fontSize: 10, marginTop: 2 },
  otExpanded:       { borderTopWidth: 1, borderTopColor: C.border, padding: 14 },
  otSection:        { marginBottom: 14 },
  otSectionTitle:   { color: C.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
  otBodyText:       { color: C.text, fontSize: 12, lineHeight: 18 },

  // Notes
  notesBox:         { backgroundColor: C.surface, borderRadius: 8, padding: 10, marginTop: 8, borderLeftWidth: 3, borderLeftColor: C.amber },
  notesLabel:       { color: C.amber, fontSize: 9, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  notesText:        { color: C.textSec, fontSize: 11, lineHeight: 16 },

  // Evidencias
  evidenciasRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  evidenciaChip:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.cyanDim, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  evidenciaText:    { color: C.cyan, fontSize: 10, fontWeight: '600' },

  // Divider
  divider:          { height: 1, backgroundColor: C.border, marginVertical: 16 },

  // Taxonomía
  taxonomiaTitulo:  { color: C.purple, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 14 },
  fieldLabel:       { color: C.textSec, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 6 },

  // Selectors
  selectorRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectorChip:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  selectorChipText: { color: C.textSec, fontSize: 10, fontWeight: '700' },

  // TAG row
  tagRow:           { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.surface, borderRadius: 8, padding: 10, borderWidth: 1, borderColor: C.border },
  tagValue:         { color: C.cyan, fontSize: 12, fontFamily: 'monospace', fontWeight: '700' },

  // Inputs
  downtimeInput:    { backgroundColor: C.surface, borderWidth: 1, borderColor: C.amber + '66', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: C.text, fontSize: 16, fontWeight: '800', width: 120 },
  inputText:        { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: C.text, fontSize: 12 },

  // Approve button
  approveBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.green, borderRadius: 10, paddingVertical: 14, marginTop: 18 },
  approveBtnDisabled:{ backgroundColor: C.border },
  approveBtnText:   { color: C.bg, fontSize: 13, fontWeight: '900', letterSpacing: 1 },

  // Closed data
  closedDataRow:    { flexDirection: 'row', gap: 10 },
  closedDataChip:   { flex: 1, backgroundColor: C.surface, borderRadius: 8, padding: 10 },
  closedDataLabel:  { color: C.textSec, fontSize: 9, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  closedDataVal:    { color: C.text, fontSize: 12, fontWeight: '700' },

  // Legend
  legendGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  legendChip:       { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: C.surface },
  legendLabel:      { fontSize: 11, fontWeight: '700' },
  legendCount:      { color: C.textSec, fontSize: 10 },

  // Empty state
  emptyState:       { alignItems: 'center', paddingVertical: 32, gap: 12 },
  emptyStateText:   { color: C.textSec, fontSize: 13 },
});

// ─── ESTILOS BLOQUE HORÓMETRO KPI ────────────────────────────────────────────
const hss = StyleSheet.create({

  // Contenedor principal
  block: {
    marginHorizontal: 12,
    marginBottom: 4,
    backgroundColor: '#0A1628',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    overflow: 'hidden',
  },

  // Cabecera del bloque
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  blockTitle: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  blockSub: {
    color: '#334155',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
    paddingHorizontal: 14,
    paddingBottom: 10,
    fontFamily: 'monospace',
  },

  // Chip LIVE
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  liveTxt: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  // KPI stat card
  kpiStatCard: {
    width: 130,
    backgroundColor: '#04090F',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderLeftWidth: 3,
    padding: 10,
    marginLeft: 10,
    marginVertical: 2,
    gap: 2,
  },
  kpiStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  kpiStatLabel: {
    color: '#475569',
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  kpiStatValue: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'monospace',
    lineHeight: 26,
  },
  kpiStatUnit: {
    color: '#475569',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  kpiStatSub: {
    color: '#334155',
    fontSize: 7.5,
    fontWeight: '600',
    marginTop: 4,
    fontFamily: 'monospace',
  },

  // Distribución por categoría
  subSectionTitle: {
    color: '#334155',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    paddingHorizontal: 14,
    paddingBottom: 6,
    textTransform: 'uppercase',
  },
  catContainer: {
    paddingHorizontal: 12,
    gap: 6,
    marginBottom: 12,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catLabel: {
    width: 84,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
    flexShrink: 0,
  },
  catTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#0F1E30',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  catFill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 2,
  },
  catPct: {
    width: 30,
    fontSize: 8,
    fontWeight: '900',
    fontFamily: 'monospace',
    textAlign: 'right',
    flexShrink: 0,
  },
  catHoras: {
    width: 34,
    color: '#334155',
    fontSize: 7.5,
    fontWeight: '600',
    fontFamily: 'monospace',
    textAlign: 'right',
    flexShrink: 0,
  },

  // Pauta preventiva
  pautaCard: {
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#04090F',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    padding: 10,
    gap: 5,
  },
  pautaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  pautaTitle: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  pautaName: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  pautaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pautaAt: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  pautaRestante: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  pautaTrack: {
    height: 8,
    backgroundColor: '#0F1E30',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    position: 'relative',
  },
  pautaFill: {
    height: '100%',
    borderRadius: 4,
  },
  pautaTarget: {
    position: 'absolute',
    right: 0,
    top: -2,
    bottom: -2,
    width: 2,
    backgroundColor: '#FACC15',
    opacity: 0.5,
  },
  pautaHint: {
    color: '#1E3A5F',
    fontSize: 7.5,
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: 0.3,
  },

  // ── Barras Macro: Operación / Detención ───────────────────────────────────
  macroBarsContainer: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 10,
    gap: 2,
  },
  macroBarRow: {
    backgroundColor: '#040D1C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 7,
  },
  macroBarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  macroBarLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  macroBarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  macroBarLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  macroBarValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  macroBarValue: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  macroBarPct: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  // Pista doble de altura (14px vs 6px de CategoryBar)
  macroTrack: {
    height: 14,
    backgroundColor: '#0A1628',
    borderRadius: 7,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  macroFill: {
    height: '100%',
    borderRadius: 7,
  },
  macroMeta: {
    color: '#1E3A5F',
    fontSize: 7.5,
    fontWeight: '600',
    letterSpacing: 0.2,
    fontStyle: 'italic',
  },

  // ── Divisor entre barras macro y desglose ────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E3A5F',
  },
  dividerLabel: {
    color: '#334155',
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    flexShrink: 0,
  },
});

