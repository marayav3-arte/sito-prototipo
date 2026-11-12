/**
 * EstadoEquipoScreen.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Módulo "Estado del Equipo" — reemplaza la pestaña "Fichas" en la navegación.
 * Mantiene la ruta/nombre interno 'Fichas' para compatibilidad con navegación
 * cruzada (Diagnóstico → Fichas, etc.). El label visible es "Estado del Equipo".
 *
 * Estructura de 2 pestañas superiores:
 *   Tab 1 (default) → "Estado Actual"   → Tabla interactiva Chancador Nordberg
 *   Tab 2           → "Catálogo Maestro" → FichasScreen original intacto
 *
 * Paleta: bg #050D1A · cards #1A2230 · Cyan #00F0FF · Verde neón #10B981
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Activity, BookOpen, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react-native';
import { COLORS } from '../theme';

// Ilustración SVG interactiva del Chancador Nordberg Omnicone SX
import EquipmentIcon from '../components/EquipmentIcon';

// Horómetro general de operación y detenciones
import HorometroBlock from '../components/HorometroBlock';

// Estado global compartido del horómetro
import { useHorometro } from '../context/HorometroContext';

// Preservamos el FichasScreen original intacto como "Catálogo Maestro"
import FichasScreen from './FichasScreen';

// ─── DATOS TÉCNICOS CHANCADOR OMNICONE SX NORDBERG ───────────────────────────
// Fuente: Manual técnico Nordberg Omnicone SX 1560 / Crushing & Screening
const CHANCADOR_SPEC = [
  {
    eje: 'LUBRICACIÓN',
    variable: 'Temp. Aceite Drenaje',
    unidad: '°C',
    ideal: '38 – 54',
    min: 38,
    max: 54,
    historico: '46°C',
    fundamento: 'Una temperatura baja aumenta la viscosidad del aceite, afectando la lubricación de los bujes de bronce. Superando los 54°C el aceite se degrada aceleradamente y reduce la película protectora, arriesgando agarrotamiento de los cojinetes.',
    impacto: 'Fallo de bujes → parada no planificada y daño severo a la excéntrica.',
  },
  {
    eje: 'LUBRICACIÓN',
    variable: 'Grado de Aceite',
    unidad: 'ISO',
    ideal: 'ISO VG 150 (E.P.)',
    min: null,
    max: null,
    historico: 'ISO VG 150',
    tipo: 'texto',
    fundamento: 'Formulado con aditivos E.P. (Extreme Pressure) para resistir altísimas cargas de impacto durante la trituración. Utilizar viscosidad menor (ej. ISO VG 100) rompe la película de lubricación entre piñón y corona, provocando desgaste severo en los engranajes.',
    impacto: 'Desgaste acelerado de piñón y corona → reemplazo de transmisión completa.',
  },
  {
    eje: 'LUBRICACIÓN',
    variable: 'Presión de Operación',
    unidad: 'bar',
    ideal: '1.7 – 2.4',
    min: 1.7,
    max: 2.4,
    historico: '2.1 bar',
    fundamento: 'Asegura flujo continuo de aceite hacia el cojinete de paso y la excéntrica. Presión < 1.7 bar indica fuga interna o bomba defectuosa (riesgo de fricción metal–metal); presión > 2.4 bar señala obstrucción en la línea de retorno.',
    impacto: 'Baja presión → interlock de parada por lubricación insuficiente (< 0.6 bar).',
  },
  {
    eje: 'HIDRÁULICA',
    variable: 'Presión Cavidad',
    unidad: 'bar',
    ideal: '105 – 115',
    min: 105,
    max: 115,
    historico: '109 bar',
    fundamento: 'Mantiene la taza fija durante la trituración de roca dura. Una presión insuficiente permite el "cabeceo" de la taza y descalibración del APM (Ajuste de Posición del Manto), alterando la granulometría de salida.',
    impacto: 'Cabeceo de taza → producto fuera de especificación y daño a la rosca de ajuste.',
  },
  {
    eje: 'HIDRÁULICA',
    variable: 'Presión Fijación Taza',
    unidad: 'bar',
    ideal: 'Máx. 172',
    min: 0,
    max: 172,
    historico: '168 bar',
    fundamento: 'Bloquea la rosca de ajuste para evitar que la taza gire o se desajuste por las vibraciones del chancado. Exceder 172 bar daña los sellos hidráulicos y puede fracturar el anillo de sujeción.',
    impacto: 'Taza desajustada en operación → daño catastrófico a cuerpo y carcasa.',
  },
  {
    eje: 'TRANSMISIÓN',
    variable: 'Juego Axial Contraeje',
    unidad: 'mm',
    ideal: '1.0 – 1.5',
    min: 1.0,
    max: 1.5,
    historico: '1.2 mm',
    fundamento: 'Garantiza el engrane correcto entre piñón y corona (backlash). Un juego < 1.0 mm causa sobrecalentamiento y rotura de dientes por interferencia; > 1.5 mm provoca impactos bruscos y desgaste prematuro de flancos.',
    impacto: 'Fuera de rango → rotura de piñón o corona con parada forzada de 8–24 h.',
  },
  {
    eje: 'TRANSMISIÓN',
    variable: 'Velocidad Contraeje',
    unidad: 'RPM',
    ideal: '650 – 909',
    min: 650,
    max: 909,
    historico: '780 RPM',
    fundamento: 'Define la frecuencia de impactos del manto sobre la roca. RPM fuera de rango altera la granulometría de salida, puede sobrecargar el motor principal o generar resonancias mecánicas en el bastidor.',
    impacto: 'RPM excesivas → sobrecarga motor y posible disparo de protección eléctrica.',
  },
  {
    eje: 'ELECTRICIDAD',
    variable: 'Umbral Disparo Temp. Alta',
    unidad: '°C',
    ideal: '≤ 71',
    min: 0,
    max: 71,
    historico: '68°C',
    fundamento: 'Interlock de seguridad crítica integrado al PLC. Al superar 71°C el sistema detiene la alimentación de mineral en < 3 s para prevenir el colapso del sistema de lubricación y el daño catastrófico de los cojinetes.',
    impacto: 'Sin este interlock → fusión de bujes y daño irreparable a excéntrica (weeks de reparación).',
  },
  {
    eje: 'ELECTRICIDAD',
    variable: 'Umbral Disparo Presión Baja',
    unidad: 'bar',
    ideal: '≥ 0.6',
    min: 0.6,
    max: 999,
    historico: '0.7 bar',
    fundamento: 'Interlock de presión mínima de lubricación. Si la presión cae por debajo de 0.6 bar el PLC activa la parada de emergencia antes de que ocurra fricción metal–metal entre la excéntrica y los cojinetes de bronce.',
    impacto: 'Fallo de este interlock → operación sin película lubricante → colapso de cojinetes en minutos.',
  },
];

// ─── COLORES POR EJE TEMÁTICO ─────────────────────────────────────────────────
const EJE_COLORS = {
  'LUBRICACIÓN':  '#F97316',   // naranja
  'HIDRÁULICA':   '#3B82F6',   // azul
  'TRANSMISIÓN':  '#A855F7',   // violeta
  'ELECTRICIDAD': '#EAB308',   // amarillo
};

// ─── VALIDACIÓN DE RANGO ──────────────────────────────────────────────────────
function validate(row, inputStr) {
  if (!inputStr || inputStr.trim() === '') return 'VACÍO';
  if (row.tipo === 'texto') {
    // Compara ignorando mayúsculas
    const input = inputStr.toLowerCase().replace(/\s/g, '');
    const ideal = row.ideal.toLowerCase().replace(/\s/g, '');
    return input.includes('vg150') || input.includes('150') ? 'OK' : 'FUERA';
  }
  const val = parseFloat(inputStr.replace(',', '.'));
  if (isNaN(val)) return 'INVÁLIDO';
  if (row.max === 999) return val >= row.min ? 'OK' : 'FUERA';   // mínimo absoluto
  if (row.min === 0 && row.max === row.max) {
    return val <= row.max ? 'OK' : 'FUERA';
  }
  return val >= row.min && val <= row.max ? 'OK' : 'FUERA';
}

// ─── BADGE DE ESTADO ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    OK:       { bg: '#0D2E1A', border: '#10B981', text: '#10B981', label: '✓ OK',          icon: CheckCircle2 },
    FUERA:    { bg: '#2D0A0A', border: '#EF4444', text: '#EF4444', label: '✗ FUERA',        icon: XCircle },
    INVÁLIDO: { bg: '#2D1A00', border: '#F97316', text: '#F97316', label: '⚠ INVÁLIDO',    icon: AlertTriangle },
    VACÍO:    { bg: '#111827', border: '#374151', text: '#6B7280', label: '— SIN DATO',     icon: null },
  }[status] || { bg: '#111827', border: '#374151', text: '#6B7280', label: '—', icon: null };

  return (
    <View style={[ss.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[ss.badgeTxt, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

// ─── FILA DE TABLA CON FUNDAMENTO TÉCNICO ────────────────────────────────────
function TableRow({ row, ejeColor, isFirst, inputs, onInputChange }) {
  const [expanded, setExpanded] = useState(false);
  const inputVal = inputs[row.variable] ?? '';
  const status   = validate(row, inputVal);

  return (
    <View style={[ss.tableRowWrapper, isFirst && ss.tableRowWrapperFirst]}>

      {/* ── FILA PRINCIPAL ─────────────────────────────────────── */}
      <View style={ss.tableRow}>

        {/* Col 1: Eje temático */}
        <View style={[ss.colEje, { borderLeftColor: ejeColor }]}>
          <Text style={[ss.ejeLabel, { color: ejeColor }]} numberOfLines={2}>{row.eje}</Text>
        </View>

        {/* Col 2: Variable */}
        <View style={ss.colVar}>
          <Text style={ss.varLabel} numberOfLines={2}>{row.variable}</Text>
          <Text style={ss.varUnit}>[{row.unidad}]</Text>
        </View>

        {/* Col INFO: badge texto "Fundamento" desplegable */}
        <View style={ss.colInfo}>
          {row.fundamento ? (
            <TouchableOpacity
              style={[ss.infoBtn, expanded && ss.infoBtnActive]}
              onPress={() => setExpanded(prev => !prev)}
              activeOpacity={0.75}
            >
              <Text style={[ss.infoBtnTxt, expanded && ss.infoBtnTxtActive]}>
                {expanded ? '▲ Cerrar' : 'Fundamento'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Col 3: Valor ideal */}
        <View style={ss.colIdeal}>
          <Text style={ss.idealVal}>{row.ideal}</Text>
        </View>

        {/* Col 4: Histórico */}
        <View style={ss.colHistorico}>
          <Text style={ss.historicoVal}>{row.historico}</Text>
        </View>

        {/* Col 5: Input operador */}
        <View style={ss.colInput}>
          <TextInput
            style={[
              ss.inputField,
              status === 'OK'    && ss.inputOk,
              status === 'FUERA' && ss.inputFuera,
            ]}
            value={inputVal}
            onChangeText={(v) => onInputChange(row.variable, v)}
            placeholder="—"
            placeholderTextColor="#3A5070"
            keyboardType={row.tipo === 'texto' ? 'default' : 'decimal-pad'}
          />
        </View>

        {/* Col 6: Estatus badge */}
        <View style={ss.colStatus}>
          <StatusBadge status={status} />
        </View>
      </View>

      {/* ── PANEL FUNDAMENTO TÉCNICO (accordion) ───────────────── */}
      {expanded && row.fundamento ? (
        <View style={[ss.fundamentoPanel, { borderLeftColor: ejeColor }]}>
          {/* Header */}
          <View style={ss.fundamentoHeader}>
            <View style={[ss.fundamentoDot, { backgroundColor: ejeColor }]} />
            <Text style={[ss.fundamentoTitle, { color: ejeColor }]}>FUNDAMENTO TÉCNICO</Text>
          </View>

          {/* Texto explicativo */}
          <Text style={ss.fundamentoText}>{row.fundamento}</Text>

          {/* Impacto operativo */}
          {row.impacto ? (
            <View style={ss.impactoRow}>
              <Text style={ss.impactoLabel}>⚡ IMPACTO:</Text>
              <Text style={ss.impactoText}>{row.impacto}</Text>
            </View>
          ) : null}

          {/* Referencia manual */}
          <Text style={ss.fundamentoRef}>
            Ref: Manual Técnico Nordberg Omnicone SX 1560 · {row.eje}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// ─── PESTAÑA 1: ESTADO ACTUAL ─────────────────────────────────────────────────
function EstadoActualTab() {
  const [inputs, setInputs] = useState({});
  // selectedEje: eje activo para resaltar capa SVG (null = todos visibles)
  const [selectedEje, setSelectedEje] = useState(null);
  // Estado operativo del equipo — desde contexto global compartido con Confiabilidad
  const { equipStatus, setEquipStatus } = useHorometro();

  const handleInputChange = useCallback((variable, val) => {
    setInputs(prev => ({ ...prev, [variable]: val }));
  }, []);

  const handleClear = () => setInputs({});

  // Toggle: mismo eje → deselecciona
  const handleEjePress = useCallback((eje) => {
    setSelectedEje(prev => prev === eje ? null : eje);
  }, []);

  // Summary stats
  const statuses = CHANCADOR_SPEC.map(r => validate(r, inputs[r.variable] ?? ''));
  const countOK    = statuses.filter(s => s === 'OK').length;
  const countFuera = statuses.filter(s => s === 'FUERA').length;
  const countVacio = statuses.filter(s => s === 'VACÍO').length;

  // Group rows by eje
  const ejes = [...new Set(CHANCADOR_SPEC.map(r => r.eje))];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── CABECERA DEL EQUIPO ──────────────────────────── */}
      <View style={ss.equipHeader}>
        <View style={ss.equipHeaderLeft}>
          <Text style={ss.equipTag}>CH-02 · ACT-001</Text>
          <Text style={ss.equipName}>Chancador Cónico Omnicone SX 1560</Text>
          <Text style={ss.equipMeta}>Nordberg / Área Seca · Planta Concentradora · Mairt-02</Text>
        </View>
        {/* Pill interactiva: toggle estado para demo */}
        <TouchableOpacity
          style={ss.equipStatusPill}
          onPress={() => setEquipStatus(s =>
            s === 'OPERACION' ? 'PARADA' : s === 'PARADA' ? 'FALLA' : 'OPERACION'
          )}
          activeOpacity={0.8}
        >
          <Activity
            color={equipStatus === 'OPERACION' ? '#10B981' : equipStatus === 'FALLA' ? '#EF4444' : '#FFB800'}
            size={14}
          />
          <Text style={[ss.equipStatusTxt, {
            color: equipStatus === 'OPERACION' ? '#10B981' : equipStatus === 'FALLA' ? '#EF4444' : '#FFB800',
          }]}>
            {equipStatus === 'OPERACION' ? 'EN OPERACIÓN' : equipStatus === 'FALLA' ? 'FALLA' : 'PARADA'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── SUMMARY PILLS ──────────────────────────────────── */}
      <View style={ss.summaryRow}>
        <View style={[ss.summaryPill, { backgroundColor: '#0D2E1A', borderColor: '#10B981' }]}>
          <Text style={[ss.summaryNum, { color: '#10B981' }]}>{countOK}</Text>
          <Text style={ss.summaryLbl}>OK</Text>
        </View>
        <View style={[ss.summaryPill, { backgroundColor: '#2D0A0A', borderColor: '#EF4444' }]}>
          <Text style={[ss.summaryNum, { color: '#EF4444' }]}>{countFuera}</Text>
          <Text style={ss.summaryLbl}>FUERA</Text>
        </View>
        <View style={[ss.summaryPill, { backgroundColor: '#0A1628', borderColor: '#374151' }]}>
          <Text style={[ss.summaryNum, { color: '#6B7280' }]}>{countVacio}</Text>
          <Text style={ss.summaryLbl}>SIN DATO</Text>
        </View>
        <TouchableOpacity style={ss.clearBtn} onPress={handleClear} activeOpacity={0.8}>
          <Text style={ss.clearBtnTxt}>↺ LIMPIAR</Text>
        </TouchableOpacity>
        {selectedEje && (
          <TouchableOpacity
            style={[ss.clearBtn, { borderColor: EJE_COLORS[selectedEje] + 'AA' }]}
            onPress={() => setSelectedEje(null)}
            activeOpacity={0.8}
          >
            <Text style={[ss.clearBtnTxt, { color: EJE_COLORS[selectedEje] }]}>
              ✕ {selectedEje}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── BODY ROW: SIDEBAR (izq) + TABLE (der) ──────────── */}
      <View style={ss.bodyRow}>

        {/* LEFT SIDEBAR: EquipmentIcon + Metadata */}
        <View style={ss.sidebarCol}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            <EquipmentIcon
              activeLayer={selectedEje}
              style={ss.equipIconContainer}
            />
            <Text style={ss.sidebarHint}>
              {selectedEje
                ? `Toca el mismo eje para\nrestaurar todas las capas`
                : `Toca un eje en la tabla\npara resaltar su capa`}
            </Text>

            {/* HORÓMETRO: se ubica debajo del diagrama técnico */}
            <HorometroBlock status={equipStatus} />

          </ScrollView>
        </View>

        {/* RIGHT: Table */}
        <View style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>

            {/* Column headers */}
            <View style={ss.colHeader}>
              <Text style={[ss.colHeaderTxt, { width: 72 }]}>EJE</Text>
              <Text style={[ss.colHeaderTxt, { flex: 1 }]}>VARIABLE</Text>
              <Text style={[ss.colHeaderTxt, { width: 72, marginRight: 8, color: '#FACC15', textAlign: 'center' }]}>FUNDAMENTO</Text>
              <Text style={[ss.colHeaderTxt, { width: 72 }]}>IDEAL</Text>
              <Text style={[ss.colHeaderTxt, { width: 68 }]}>HIST.</Text>
              <Text style={[ss.colHeaderTxt, { width: 72 }]}>NUEVO ESTADO</Text>
              <Text style={[ss.colHeaderTxt, { width: 76 }]}>ESTATUS</Text>
            </View>


            {/* Rows — tapping an eje group highlights the SVG layer */}
            {ejes.map(eje => {
              const rows = CHANCADOR_SPEC.filter(r => r.eje === eje);
              const ejeColor = EJE_COLORS[eje] || '#00F0FF';
              const isActive = selectedEje === eje;
              return (
                <TouchableOpacity
                  key={eje}
                  activeOpacity={0.85}
                  onPress={() => handleEjePress(eje)}
                >
                  <View style={[
                    ss.ejeGroup,
                    isActive && { borderColor: ejeColor, borderWidth: 1.8, shadowColor: ejeColor, shadowOpacity: 0.4, shadowRadius: 6 },
                  ]}>
                    {rows.map((row, idx) => (
                      <TableRow
                        key={row.variable}
                        row={row}
                        ejeColor={ejeColor}
                        isFirst={idx === 0}
                        inputs={inputs}
                        onInputChange={handleInputChange}
                      />
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Leyenda */}
            <View style={ss.legend}>
              <Text style={ss.legendTitle}>LEYENDA DE VALIDACIÓN:</Text>
              {[
                { color: '#10B981', label: '✓ OK — Dentro del rango manual Nordberg' },
                { color: '#EF4444', label: '✗ FUERA — Requiere revisión de supervisor' },
                { color: '#F97316', label: '⚠ INVÁLIDO — Formato no reconocido' },
                { color: '#6B7280', label: '— SIN DATO — Pendiente de ingreso' },
              ].map(({ color, label }) => (
                <View key={label} style={ss.legendRow}>
                  <View style={[ss.legendDot, { backgroundColor: color }]} />
                  <Text style={ss.legendTxt}>{label}</Text>
                </View>
              ))}
            </View>

          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}


// ─── SCREEN PRINCIPAL ─────────────────────────────────────────────────────────
export default function EstadoEquipoScreen({ route, navigation, activeRole, onOpenMapModal }) {
  // Tab interno: 'estado' | 'catalogo'
  const [activeInternalTab, setActiveInternalTab] = useState('estado');

  const TABS = [
    { id: 'estado',   label: '📊 Estado Actual',   icon: Activity  },
    { id: 'catalogo', label: '📁 Catálogo Maestro', icon: BookOpen  },
  ];

  return (
    <View style={ss.container}>

      {/* ── HEADER PRINCIPAL ───────────────────────────────────── */}
      <View style={ss.screenHeader}>
        <View>
          <Text style={ss.screenTitle}>⚙️ ESTADO DEL EQUIPO</Text>
          <Text style={ss.screenSub}>Monitoreo · Registro · Catálogo Técnico</Text>
        </View>
        <View style={[ss.rolePill, {
          backgroundColor: activeRole === 'MANDANTE' ? '#1A1200' : '#001A1A',
          borderColor:     activeRole === 'MANDANTE' ? '#FFE000' : '#00F0FF',
        }]}>
          <Text style={[ss.rolePillTxt, {
            color: activeRole === 'MANDANTE' ? '#FFE000' : '#00F0FF',
          }]}>
            {activeRole === 'MANDANTE' ? '🛡 MANDANTE' : '👷 OPERATIVO'}
          </Text>
        </View>
      </View>

      {/* ── TABS SUPERIORES ────────────────────────────────────── */}
      <View style={ss.tabBar}>
        {TABS.map(tab => {
          const isActive = activeInternalTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[ss.tabBtn, isActive && ss.tabBtnActive]}
              onPress={() => setActiveInternalTab(tab.id)}
              activeOpacity={0.8}
            >
              <Text style={[ss.tabTxt, isActive && ss.tabTxtActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={ss.tabUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── CONTENIDO ──────────────────────────────────────────── */}
      <View style={{ flex: 1 }}>
        {activeInternalTab === 'estado' ? (
          <EstadoActualTab />
        ) : (
          /* Catálogo Maestro: FichasScreen original sin modificaciones */
          <FichasScreen
            route={route}
            navigation={navigation}
            activeRole={activeRole}
            onOpenMapModal={onOpenMapModal}
          />
        )}
      </View>

    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CY = '#00F0FF';
const GR = '#10B981';
const ss = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050D1A',
  },

  // Header
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2D45',
    backgroundColor: '#060F1C',
  },
  screenTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  screenSub: {
    color: '#6A84A0',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  rolePill: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  rolePillTxt: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Internal tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#06111E',
    borderBottomWidth: 1,
    borderBottomColor: '#1A2D45',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabBtnActive: {},
  tabTxt: {
    color: '#4A6480',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tabTxtActive: {
    color: CY,
    fontWeight: '900',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 2.5,
    backgroundColor: CY,
    borderRadius: 2,
  },

  // ── Estado Actual Tab ────────────────────────────────────────────

  // SIDEBAR + TABLE split layout
  bodyRow: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  sidebarCol: {
    width: 200,
    borderRightWidth: 1,
    borderRightColor: '#1A2D45',
    backgroundColor: '#040C18',
    paddingHorizontal: 8,
    paddingTop: 8,
    overflow: 'hidden',
  },
  equipIconContainer: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  sidebarHint: {
    color: '#2A4060',
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginTop: 6,
    lineHeight: 12,
  },

  equipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#060F1C',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2D45',
    gap: 10,
  },
  equipHeaderLeft: { flex: 1 },
  equipTag: {
    color: CY,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: 'monospace',
    marginBottom: 3,
  },
  equipName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  equipMeta: {
    color: '#6A84A0',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 3,
  },
  equipStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#071C10',
    borderWidth: 1,
    borderColor: GR,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  equipStatusTxt: {
    color: GR,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Summary pills
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2D45',
    backgroundColor: '#050D1A',
  },
  summaryPill: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 52,
  },
  summaryNum: {
    fontSize: 16,
    fontWeight: '900',
  },
  summaryLbl: {
    color: '#6A84A0',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  clearBtn: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: '#2A3D55',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearBtnTxt: {
    color: '#6A84A0',
    fontSize: 10,
    fontWeight: '800',
  },

  // Column header
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#040C18',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2D45',
    gap: 0,
  },
  colHeaderTxt: {
    color: '#4A6480',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  // Eje group
  ejeGroup: {
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1A2D45',
  },

  // Table row wrapper (outer — includes accordion panel)
  tableRowWrapper: {
    backgroundColor: '#0A1628',
    borderTopWidth: 1,
    borderTopColor: '#1A2D45',
  },
  tableRowWrapperFirst: {
    borderTopWidth: 0,
    backgroundColor: '#0C1A30',
  },

  // Table row (inner — data columns only)
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    gap: 0,
  },
  tableRowFirst: {
    borderTopWidth: 0,
    backgroundColor: '#0C1A30',
  },

  // Variable name + ⓘ button inline
  varNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 4,
  },

  // Badge "Fundamento" — botón rectangular con texto, amarillo neón
  infoBtn: {
    borderWidth: 1,
    borderColor: '#3A2800',
    borderRadius: 4,
    backgroundColor: '#0D0900',
    paddingHorizontal: 4,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  infoBtnActive: {
    backgroundColor: '#1C1000',
    borderColor: '#FACC15',
  },
  infoBtnTxt: {
    fontSize: 8,
    fontWeight: '800',
    color: '#7A5800',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  infoBtnTxtActive: {
    color: '#FACC15',
    fontWeight: '900',
  },

  // ── Accordion: Fundamento Técnico panel ──────────────────────────
  fundamentoPanel: {
    marginHorizontal: 8,
    marginBottom: 8,
    backgroundColor: '#040D1C',
    borderRadius: 7,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: '#1A2D45',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  fundamentoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  fundamentoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  fundamentoTitle: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  fundamentoText: {
    color: '#B0C8E0',
    fontSize: 9,
    fontWeight: '500',
    lineHeight: 14,
  },
  impactoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    backgroundColor: '#0A0A00',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#3A2A00',
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 2,
  },
  impactoLabel: {
    color: '#FFB800',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.4,
    flexShrink: 0,
  },
  impactoText: {
    flex: 1,
    color: '#FFD060',
    fontSize: 9,
    fontWeight: '600',
    lineHeight: 13,
  },
  fundamentoRef: {
    color: '#2A4060',
    fontSize: 7.5,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontStyle: 'italic',
    marginTop: 2,
  },

  // Columnas de datos
  colVar: {
    flex: 1,
    gap: 1,
  },
  colInfo: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    marginRight: 8,       // ← separación explícita entre FUNDAMENTO e IDEAL
  },
  colEje: {
    width: 72,
    paddingLeft: 6,
    borderLeftWidth: 3,
  },
  ejeLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  varLabel: {
    color: '#D0E0F5',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
  },
  varUnit: {
    color: '#4A6480',
    fontSize: 8,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  colIdeal: {
    width: 72,
    alignItems: 'center',
  },
  idealVal: {
    color: CY,
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  colHistorico: {
    width: 68,
    alignItems: 'center',
  },
  historicoVal: {
    color: '#8CAAD0',
    fontSize: 9,
    fontWeight: '600',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  colInput: {
    width: 72,
  },
  inputField: {
    backgroundColor: '#06111E',
    borderWidth: 1,
    borderColor: '#2A3D55',
    borderRadius: 6,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
    paddingHorizontal: 7,
    paddingVertical: 5,
    textAlign: 'center',
    height: 34,
  },
  inputOk: {
    borderColor: GR,
    backgroundColor: '#071C10',
  },
  inputFuera: {
    borderColor: '#EF4444',
    backgroundColor: '#1A0505',
  },
  colStatus: {
    width: 76,
    alignItems: 'center',
  },
  badge: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: 'center',
  },
  badgeTxt: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  // Legend
  legend: {
    margin: 14,
    backgroundColor: '#060F1C',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1A2D45',
    gap: 6,
  },
  legendTitle: {
    color: '#4A6480',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendTxt: {
    color: '#6A84A0',
    fontSize: 9,
    flex: 1,
    lineHeight: 13,
  },
});
