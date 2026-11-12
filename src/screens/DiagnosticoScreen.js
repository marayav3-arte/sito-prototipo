import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Modal, Switch } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLOVE_TARGETS } from '../theme';
import AreaContactPill from '../components/AreaContactPill';
import SitoTacticalMap from '../components/SitoTacticalMap';

import { 
  ArrowLeft, 
  ChevronRight, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Thermometer, 
  Droplets, 
  Ruler, 
  Wind, 
  CheckSquare, 
  Square,
  FileText,
  ShieldAlert,
  Snowflake,
  Octagon,
  Lightbulb,
} from 'lucide-react-native';
// PROMPT 51: Asset catalog for Diagnóstico → Fichas chaining
import { getAssetByTag } from '../data/assetCatalog';


export default function DiagnosticoScreen({ navigation, activeRole = 'OPERATIVO' }) {
  const [step, setStep] = useState(1); // 1: Select Category, 2: Select Symptom, 3: View Solution / Overheat Flow
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSymptom, setSelectedSymptom] = useState(null);

  // Overheat sequential workflow state
  const [isOverheatFlow, setIsOverheatFlow] = useState(false);
  const [step1OilFlowChecked, setStep1OilFlowChecked] = useState(false);
  const [step2DrainSlopeValue, setStep2DrainSlopeValue] = useState('');
  const [step2DrainSlopeChecked, setStep2DrainSlopeChecked] = useState(false);
  const [step3BreatherChecked, setStep3BreatherChecked] = useState(false);
  const [fieldNotes, setFieldNotes] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // MANDATORY SAFETY INTERLOCK STATES
  // 1. Hydraulic Depressurization Switch
  const [hydraulicDepressurized, setHydraulicDepressurized] = useState(false);
  const [showHydraulicBlockAlert, setShowHydraulicBlockAlert] = useState(false);

  // 2. Cryogenic Alert Popup State
  const [showCryoAlertModal, setShowCryoAlertModal] = useState(false);
  const [cryoAlertDismissed, setCryoAlertDismissed] = useState(false);

  // Plant Map Modal state
  const [showMapModal, setShowMapModal] = useState(false);

  const categories = [
    { id: 'lubricacion', name: 'SISTEMA DE LUBRICACIÓN', icon: 'oil', desc: 'Depósitos, temperatura, caudal, bombas de aceite, drenaje' },
    { id: 'hidraulica', name: 'SISTEMA HIDRÁULICO', icon: 'droplet', desc: 'Bomba, válvulas, mangueras, pistones' },
    { id: 'mecanico', name: 'TRANSMISIÓN Y MECÁNICA', icon: 'settings', desc: 'Engranajes, rodamientos, acoples, buje de excéntrica, ejes' },
    { id: 'electrico', name: 'SISTEMA ELÉCTRICO', icon: 'zap', desc: 'Motor, sensores, cables, PLC, contactores' },
  ];

  const symptoms = {
    lubricacion: [
      { id: 'overheat', title: 'EL CHANCADOR SE SOBRECALIENTA (>85°C)', code: 'SYM-CRIT-01', isCritical: true },
      { id: 'l1', title: 'PRESIÓN DE GRASA BAJA EN DISTRIBUIDOR', code: 'SYM-LUB-01' },
      { id: 'l2', title: 'CONTAMINACIÓN CON POLVO O PARTICULAS', code: 'SYM-LUB-02' },
      { id: 'l3', title: 'FILTRO TAPADO / ALARMA DE BYPASS', code: 'SYM-LUB-03' },
    ],
    hidraulica: [
      { id: 'overheat', title: 'EL CHANCADOR SE SOBRECALIENTA (>85°C)', code: 'SYM-CRIT-01', isCritical: true },
      { id: 'h1', title: 'PRESIÓN INESTABLE / BAJA', code: 'SYM-HYD-01' },
      { id: 'h2', title: 'SOBRETEMPERATURA EN ACEITE (>85°C)', code: 'SYM-HYD-02' },
      { id: 'h3', title: 'CAVITACIÓN / RUIDO EN BOMBA', code: 'SYM-HYD-03' },
    ],
    mecanico: [
      { id: 'overheat', title: 'EL CHANCADOR SE SOBRECALIENTA (>85°C)', code: 'SYM-CRIT-01', isCritical: true },
      { id: 'm1', title: 'VIBRACIÓN ANORMAL EN COJINETES / BUJE', code: 'SYM-MEC-01' },
      { id: 'm2', title: 'REEMPLAZO O DESGASTE DE BUJE EXCÉNTRICA', code: 'SYM-MEC-02', isBuje: true },
      { id: 'm3', title: 'TRABAMIENTO / DIFICULTAD DE GIRO', code: 'SYM-MEC-03' },
    ],
    electrico: [
      { id: 'e1', title: 'DISPARO DE RELÉ TÉRMICO', code: 'SYM-ELE-01' },
      { id: 'e2', title: 'FALLA DE COMUNICACIÓN PLC (BUS)', code: 'SYM-ELE-02' },
      { id: 'e3', title: 'LECTURA ERRÁTICA DE SENSOR DE FLUJO', code: 'SYM-ELE-03' },
    ],
  };

  const solutions = {
    h1: {
      symptom: 'PRESIÓN INESTABLE / BAJA',
      code: 'ERR-HYD-01A',
      cause: 'Fuga interna en válvula limitadora de presión o desgaste severo en engranajes de la bomba principal.',
      steps: [
        '1. BLOQUEAR EQUIPO: Aplicar candado LOTO en interruptor Q3.',
        '2. VERIFICAR RETORNO: Inspeccionar si hay flujo en la línea de bypass del tanque.',
        '3. AJUSTAR VÁLVULA: Limpiar y re-calibrar la válvula piloto a 180 Bar.',
        '4. CAMBIAR SELLO: Si la presión no sube, desmontar la tapa y cambiar sellos del pistón.',
      ],
      safetyAlert: '¡PELIGRO! Presión residual de hasta 200 Bar. Purgar acumuladores antes de soltar uniones.',
      technicalLink: 'Chancador Cónico Omnicone SX 1560 - Planta La Coipa',
      // PROMPT 51: Chaining fields
      faultTag: 'ACT-001',
      faultId: 'h1',
      chainingGuia: 'Protocolo Hidráulico + Torque Crítico',
    },
    default: {
      symptom: 'FALLA COMPUESTA DETECTADA',
      code: 'ERR-GEN-999',
      cause: 'Falla inducida por operación fuera de rango o parámetros nominales superados.',
      steps: [
        '1. DETENER EQUIPO: Asegurar interbloqueos en consola.',
        '2. INSPECCIÓN VISUAL: Buscar fugas, humo u olores extraños.',
        '3. REVISAR HISTORIAL: Ver últimos registros en ficha técnica.',
        '4. REPORTAR: Notificar a Supervisor de Planta.',
      ],
      safetyAlert: 'Usar implementos EPP estándar y respetar distancias de seguridad.',
      technicalLink: 'Chancador Cónico Omnicone SX 1560 - Planta La Coipa',
      // PROMPT 51: Chaining fields
      faultTag: 'ACT-001',
      faultId: null,
      chainingGuia: null,
    }
  };


  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setStep(2);
  };

  const handleSelectSymptom = (sym) => {
    setSelectedSymptom(sym);
    if (sym.isBuje) {
      setShowCryoAlertModal(true);
    }
    if (sym.id === 'overheat' || sym.title.includes('SOBRETEMPERATURA') || sym.title.includes('SOBRECALIENTA')) {
      setIsOverheatFlow(true);
    } else {
      setIsOverheatFlow(false);
    }
    setStep(3);
  };

  const startOverheatDirectly = () => {
    setSelectedCategory(categories[0]);
    setSelectedSymptom(symptoms.lubricacion[0]);
    setIsOverheatFlow(true);
    setStep(3);
  };

  const resetDiagnostic = () => {
    setSelectedCategory(null);
    setSelectedSymptom(null);
    setIsOverheatFlow(false);
    setStep1OilFlowChecked(false);
    setStep2DrainSlopeValue('');
    setStep2DrainSlopeChecked(false);
    setStep3BreatherChecked(false);
    setFieldNotes('');
    setHydraulicDepressurized(false);
    setShowHydraulicBlockAlert(false);
    setShowCryoAlertModal(false);
    setCryoAlertDismissed(false);
    setShowCompletionModal(false);
    setStep(1);
  };

  const goBack = () => {
    if (step === 3) {
      setSelectedSymptom(null);
      setIsOverheatFlow(false);
      setStep(2);
    } else if (step === 2) {
      setSelectedCategory(null);
      setStep(1);
    }
  };

  const getActiveSolution = () => {
    if (!selectedSymptom) return solutions.default;
    return solutions[selectedSymptom.id] || solutions.default;
  };

  // Text handler for field notes with keyword "buje" detection
  const handleNotesTextChange = (text) => {
    setFieldNotes(text);
    if (text.toLowerCase().includes('buje') && !cryoAlertDismissed) {
      setShowCryoAlertModal(true);
    }
  };

  // Handler for pressing [ CONTINUAR DIAGNÓSTICO ] / [ GUARDAR REPORTE ]
  const handleContinuePress = () => {
    // 1. Mandatory Hydraulic Depressurization Check
    if (!hydraulicDepressurized) {
      setShowHydraulicBlockAlert(true);
      return; // Block execution
    }

    // Clear alert if valid
    setShowHydraulicBlockAlert(false);
    setShowCompletionModal(true);
  };

  const isOverheatComplete = step1OilFlowChecked && step2DrainSlopeChecked && step3BreatherChecked;

  return (
    <View style={styles.container}>
      {/* Navigation breadcrumbs / Back button */}
      {step > 1 && (
        <View style={styles.navigationHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={goBack} activeOpacity={0.7}>
            <ArrowLeft color={COLORS.yellow} size={24} />
            <Text style={styles.backBtnText}>ATRÁS</Text>
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>
            {isOverheatFlow ? 'INSPECCIÓN CRÍTICA EN TERRENO' : `PASO ${step} DE 3`}
          </Text>
        </View>
      )}

      {/* Main interactive tree */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {step === 1 && (
          <View>
            {/* OMNIPRESENT ACTIVE ASSET TAG BANNER WITH COMPACT CONTACT PILL & MAP BUTTON */}
            <View style={styles.assetTagBanner}>
              <View style={styles.fluorescentBadge}>
                <Text style={styles.fluorescentBadgeText}>TAG: ACT-001</Text>
              </View>
              <Text style={styles.assetNameBanner} numberOfLines={1}>Chancador Omnicone SX 1560</Text>
              
              {/* PROMPT 26: COMPACT PILL BUTTON IMMEDIATELY TO THE LEFT OF MAP BUTTON */}
              <AreaContactPill equipment={{ tagCode: 'ACT-001' }} activeRole={activeRole} />

              <TouchableOpacity
                style={styles.mapBtnHeader}
                activeOpacity={0.8}
                onPress={() => setShowMapModal(true)}
              >
                <Text style={styles.mapBtnHeaderText}>[ 🗺️ Mapa ]</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.introContainer}>
              <Activity color={COLORS.yellow} size={32} />
              <Text style={styles.screenTitle}>Árbol de Diagnóstico</Text>
              <Text style={styles.screenDesc}>
                Seleccione el subsistema afectado. Diseñado con botones de tamaño extendido para uso táctil rápido en terreno con guantes.
              </Text>
            </View>

            {/* Direct Shortcut to Critical Symptom: El Chancador se sobrecalienta */}
            <TouchableOpacity
              style={styles.criticalShortcutBtn}
              activeOpacity={0.85}
              onPress={startOverheatDirectly}
            >
              <View style={styles.criticalBadgeRow}>
                <Thermometer color={COLORS.textDark} size={24} />
                <Text style={styles.criticalBadgeText}>SÍNTOMA CRÍTICO FRECUENTE</Text>
              </View>
              <Text style={styles.criticalTitle}>EL CHANCADOR SE SOBRECALIENTA</Text>
              <Text style={styles.criticalDesc}>
                Iniciar protocolo secuencial rígido de inspección en terreno (Flujo, Pendiente y Respiradero).
              </Text>
              <View style={styles.criticalStartBtn}>
                <Text style={styles.criticalStartText}>INICIAR VALIDACIÓN EN TERRENO</Text>
                <ChevronRight color={COLORS.textDark} size={22} />
              </View>
            </TouchableOpacity>

            <Text style={styles.sectionDividerText}>O SELECCIONE POR SUBSISTEMA:</Text>

            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.gloveButton}
                activeOpacity={0.8}
                onPress={() => handleSelectCategory(cat)}
              >
                <View style={styles.gloveButtonContent}>
                  <Text style={styles.gloveButtonTitle}>{cat.name}</Text>
                  <Text style={styles.gloveButtonDesc}>{cat.desc}</Text>
                </View>
                <ChevronRight color={COLORS.yellow} size={28} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 2 && (
          <View>
            <View style={styles.introContainer}>
              <Text style={styles.selectionPath}>SISTEMA: {selectedCategory.name}</Text>
              <Text style={styles.screenTitle}>Seleccione el Síntoma</Text>
              <Text style={styles.screenDesc}>
                Identifique el síntoma visible o medido en el equipo.
              </Text>
            </View>

            {symptoms[selectedCategory.id].map((sym) => (
              <TouchableOpacity
                key={sym.id}
                style={[
                  styles.gloveButton, 
                  styles.symptomBtn,
                  sym.isCritical && styles.criticalSymptomBtn
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectSymptom(sym)}
              >
                <View style={styles.gloveButtonContent}>
                  <Text style={[styles.symptomCode, sym.isCritical && { color: COLORS.red }]}>{sym.code}</Text>
                  <Text style={[styles.gloveButtonTitle, sym.isCritical && { color: COLORS.yellow, fontWeight: '900' }]}>
                    {sym.title}
                  </Text>
                </View>
                <ChevronRight color={sym.isCritical ? COLORS.yellow : COLORS.orange} size={28} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 3 && (
          isOverheatFlow ? (
            /* =========================================================================
               STRICT SEQUENTIAL WORKFLOW: EL CHANCADOR SE SOBRECALIENTA
               ========================================================================= */
            <View>
              {/* Header */}
              <View style={styles.overheatHeaderCard}>
                <View style={styles.overheatHeaderRow}>
                  <AlertTriangle color={COLORS.textDark} size={28} />
                  <View style={styles.overheatHeaderTitles}>
                    <Text style={styles.overheatTag}>PROTOCOLO SECUENCIAL OBLIGATORIO</Text>
                    <Text style={styles.overheatMainTitle}>El Chancador se sobrecalienta</Text>
                  </View>
                </View>
                <Text style={styles.overheatNotice}>
                  Valide minuciosamente en terreno cada componente en el orden exacto establecido a continuación antes de continuar el diagnóstico.
                </Text>
              </View>

              {/* ---------------------------------------------------------------------
                 STEP 1: FLUJO DE ACEITE
                 --------------------------------------------------------------------- */}
              <View style={[
                styles.sequentialStepCard,
                step1OilFlowChecked && styles.sequentialStepCardActive
              ]}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>1</Text>
                  <Text style={styles.stepTitleText}>Flujo de Aceite</Text>
                </View>

                <TouchableOpacity
                  style={styles.checkboxTouchable}
                  activeOpacity={0.8}
                  onPress={() => setStep1OilFlowChecked(!step1OilFlowChecked)}
                >
                  {step1OilFlowChecked ? (
                    <CheckSquare color={COLORS.yellow} size={30} strokeWidth={2.5} />
                  ) : (
                    <Square color={COLORS.textSecondary} size={30} strokeWidth={2} />
                  )}
                  <View style={styles.checkboxTextContainer}>
                    <Text style={[styles.checkboxLabel, step1OilFlowChecked && styles.checkboxLabelActive]}>
                      Confirmar si el caudal de la bomba es correcto según la Tabla 10-1 del manual de fabricante.
                    </Text>
                    <Text style={styles.checkSubtext}>
                      {step1OilFlowChecked ? '✓ Caudal medido y verificado' : 'Tocar para confirmar medición en medidor de flujo'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Visible Technical Note */}
                <View style={styles.techNoteBox}>
                  <Info color={COLORS.yellow} size={20} style={{ marginTop: 2, marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.techNoteTitle}>NOTA TÉCNICA DE FABRICANTE:</Text>
                    <Text style={styles.techNoteText}>
                      "Una bomba gastada no entregará los GPM requeridos"
                    </Text>
                  </View>
                </View>
              </View>

              {/* ---------------------------------------------------------------------
                 STEP 2: PENDIENTE DE DRENAJE
                 --------------------------------------------------------------------- */}
              <View style={[
                styles.sequentialStepCard,
                step2DrainSlopeChecked && styles.sequentialStepCardActive
              ]}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>2</Text>
                  <Text style={styles.stepTitleText}>Pendiente de Drenaje</Text>
                </View>

                <Text style={styles.stepRequirementText}>
                  Verificación de cumplimiento con el mínimo de <Text style={{ color: COLORS.yellow, fontWeight: '900' }}>25 mm por cada 305 mm</Text> de cañería.
                </Text>

                {/* Data Input for Slope */}
                <View style={styles.dataInputContainer}>
                  <Text style={styles.inputFieldLabel}>Medición o Confirmación en Terreno (mm / 305mm):</Text>
                  <TextInput
                    style={styles.numericInput}
                    placeholder="Ej. 28 mm / 305 mm"
                    placeholderTextColor={COLORS.textSecondary}
                    value={step2DrainSlopeValue}
                    onChangeText={(val) => {
                      setStep2DrainSlopeValue(val);
                      if (val.trim().length > 0) {
                        setStep2DrainSlopeChecked(true);
                      }
                    }}
                  />
                </View>

                <TouchableOpacity
                  style={styles.checkboxTouchable}
                  activeOpacity={0.8}
                  onPress={() => setStep2DrainSlopeChecked(!step2DrainSlopeChecked)}
                >
                  {step2DrainSlopeChecked ? (
                    <CheckSquare color={COLORS.yellow} size={30} strokeWidth={2.5} />
                  ) : (
                    <Square color={COLORS.textSecondary} size={30} strokeWidth={2} />
                  )}
                  <View style={styles.checkboxTextContainer}>
                    <Text style={[styles.checkboxLabel, step2DrainSlopeChecked && styles.checkboxLabelActive]}>
                      Confirmar que cumple con el mínimo de 25 mm por cada 305 mm de cañería.
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Visible Technical Note */}
                <View style={styles.techNoteBox}>
                  <Info color={COLORS.yellow} size={20} style={{ marginTop: 2, marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.techNoteTitle}>NOTA TÉCNICA DE FABRICANTE:</Text>
                    <Text style={styles.techNoteText}>
                      "Garantiza que el aceite retorne libremente al estanque para enfriarse"
                    </Text>
                  </View>
                </View>
              </View>

              {/* ---------------------------------------------------------------------
                 STEP 3: RESPIRADERO
                 --------------------------------------------------------------------- */}
              <View style={[
                styles.sequentialStepCard,
                step3BreatherChecked && styles.sequentialStepCardActive
              ]}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>3</Text>
                  <Text style={styles.stepTitleText}>Respiradero</Text>
                </View>

                <TouchableOpacity
                  style={styles.checkboxTouchable}
                  activeOpacity={0.8}
                  onPress={() => setStep3BreatherChecked(!step3BreatherChecked)}
                >
                  {step3BreatherChecked ? (
                    <CheckSquare color={COLORS.yellow} size={30} strokeWidth={2.5} />
                  ) : (
                    <Square color={COLORS.textSecondary} size={30} strokeWidth={2} />
                  )}
                  <View style={styles.checkboxTextContainer}>
                    <Text style={[styles.checkboxLabel, step3BreatherChecked && styles.checkboxLabelActive]}>
                      Confirmar que el respiradero de la caja deflectora está 100% limpio y libre de polvo para evitar contrapresión.
                    </Text>
                    <Text style={styles.checkSubtext}>
                      {step3BreatherChecked ? '✓ Inspeccionado y limpio' : 'Tocar para confirmar limpieza física'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* ---------------------------------------------------------------------
                 RULE 1: INTERBLOQUEO OBLIGATORIO DE PRESIÓN HIDRÁULICA (SWITCH)
                 --------------------------------------------------------------------- */}
              <View style={[
                styles.hydraulicSwitchBox,
                hydraulicDepressurized ? styles.hydraulicSwitchBoxSafe : styles.hydraulicSwitchBoxDanger
              ]}>
                <View style={styles.hydraulicSwitchHeader}>
                  <Switch
                    value={hydraulicDepressurized}
                    onValueChange={(val) => {
                      setHydraulicDepressurized(val);
                      if (val) {
                        setShowHydraulicBlockAlert(false);
                      }
                    }}
                    trackColor={{ false: '#555555', true: COLORS.green }}
                    thumbColor={COLORS.textPrimary}
                    style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
                  />
                  <Text style={[styles.hydraulicSwitchLabel, hydraulicDepressurized && { color: COLORS.green }]}>
                    [ {hydraulicDepressurized ? '✓' : ' '} ] Confirmo despresurización total del sistema hidráulico (0 Bar / 0 PSI)
                  </Text>
                </View>
                <Text style={styles.hydraulicSwitchSubtext}>
                  * Interbloqueo digital obligatorio para habilitar el botón [ CONTINUAR DIAGNÓSTICO ].
                </Text>
              </View>

              {/* BRIGHT RED ALERT BLOCKADE (Triggers if switch is off when pressing continue) */}
              {showHydraulicBlockAlert && (
                <View style={styles.hydraulicRedAlertBlock}>
                  <Octagon color={COLORS.textPrimary} size={36} style={{ marginBottom: 8 }} />
                  <Text style={styles.hydraulicRedAlertTitle}>🛑 BLOQUEO DE SEGURIDAD ACTIVADO</Text>
                  <Text style={styles.hydraulicRedAlertText}>
                    🛑 BLOQUEO DE SEGURIDAD: No se puede registrar la inspección. Desconectar mangueras bajo una presión de 103 Bars (1.500 PSI) puede causar un efecto de latigazo letal.
                  </Text>
                </View>
              )}

              {/* ---------------------------------------------------------------------
                 FIELD NOTES / ADDITIONAL FINDINGS (Keyword 'buje' triggers cryo popup)
                 --------------------------------------------------------------------- */}
              <View style={styles.notesCard}>
                <View style={styles.notesHeaderRow}>
                  <FileText color={COLORS.yellow} size={22} />
                  <Text style={styles.notesCardTitle}>Notas de Terreno / Hallazgos adicionales</Text>
                </View>
                <Text style={styles.notesHelpText}>
                  (Si detecta o escribe "buje", el sistema desplegará automáticamente la alerta criogénica).
                </Text>
                <TextInput
                  style={styles.notesTextInput}
                  multiline={true}
                  numberOfLines={4}
                  placeholder="Escriba aquí observaciones (ej. inspección de buje, temperatura de aceite, ruidos)..."
                  placeholderTextColor="#777777"
                  value={fieldNotes}
                  onChangeText={handleNotesTextChange}
                />
              </View>

              {/* ---------------------------------------------------------------------
                 GIANT BOTTOM BUTTON: [ CONTINUAR DIAGNÓSTICO ]
                 --------------------------------------------------------------------- */}
              <TouchableOpacity
                style={[
                  styles.continueDiagnosticBtn,
                  !hydraulicDepressurized && styles.continueDiagnosticBtnDisabled
                ]}
                activeOpacity={0.85}
                onPress={handleContinuePress}
              >
                <Text style={styles.continueDiagnosticBtnText}>[ CONTINUAR DIAGNÓSTICO ]</Text>
                <ChevronRight color={COLORS.textDark} size={28} strokeWidth={3} />
              </TouchableOpacity>

              {/* Reset / Restart Diagnostic Option */}
              <TouchableOpacity
                style={styles.resetButton}
                activeOpacity={0.8}
                onPress={resetDiagnostic}
              >
                <Text style={styles.resetButtonText}>CANCELAR / REINICIAR DIAGNÓSTICO</Text>
              </TouchableOpacity>

              {/* Completion Summary Modal */}
              <Modal
                visible={showCompletionModal}
                transparent={true}
                animationType="fade"
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.successCircle}>
                      <CheckCircle color={COLORS.textDark} size={48} strokeWidth={2.5} />
                    </View>
                    <Text style={styles.modalTitle}>VALIDACIÓN Y REPORTE REGISTRADO</Text>
                    <Text style={styles.modalSub}>
                      Interbloqueo de presión validado. Se han verificado los 3 componentes críticos de sobrecalentamiento.
                    </Text>

                    <View style={styles.summarySummaryBox}>
                      <Text style={styles.summaryBoxRow}>✓ Despresurización Hidráulica (0 Bar): REGISTRADO</Text>
                      <Text style={styles.summaryBoxRow}>✓ 1. Flujo de Aceite (Tabla 10-1): {step1OilFlowChecked ? 'OK' : 'PENDIENTE'}</Text>
                      <Text style={styles.summaryBoxRow}>✓ 2. Pendiente Drenaje (mín 25mm/305mm): {step2DrainSlopeValue || 'VERIFICADO'}</Text>
                      <Text style={styles.summaryBoxRow}>✓ 3. Respiradero Deflector: {step3BreatherChecked ? 'LIMPIO (OK)' : 'PENDIENTE'}</Text>
                      {fieldNotes.trim().length > 0 && (
                        <Text style={styles.summaryNotesRow}>Notas: "{fieldNotes}"</Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.modalCloseBtn}
                      onPress={() => {
                        setShowCompletionModal(false);
                        navigation.navigate('Fichas', { selectedEquipment: 'Chancador Cónico Omnicone SX 1560 - Planta La Coipa' });
                      }}
                    >
                      <Text style={styles.modalCloseBtnText}>IR A FICHA TÉCNICA DE ACTIVO</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalSecondaryBtn}
                      onPress={() => setShowCompletionModal(false)}
                    >
                      <Text style={styles.modalSecondaryBtnText}>VOLVER A TERRENO</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

            </View>
          ) : (
            /* Standard Solution View for other symptoms */
            (() => {
              const sol = getActiveSolution();
              return (
                <View>
                  <View style={styles.introContainer}>
                    <Text style={styles.selectionPath}>
                      {selectedCategory.name} • {selectedSymptom.title}
                    </Text>
                    <Text style={[styles.screenTitle, { color: COLORS.yellow }]}>Plan de Acción Recomendado</Text>
                  </View>

                  {/* Cause Analysis */}
                  <View style={styles.solutionCard}>
                    <View style={styles.cardHeaderRow}>
                      <Info color={COLORS.yellow} size={20} />
                      <Text style={styles.cardSectionTitle}>ANÁLISIS DE CAUSA RAÍZ</Text>
                    </View>
                    <Text style={styles.causeText}>{sol.cause}</Text>
                  </View>

                  {/* Safety Alert (High Visibility) */}
                  <View style={styles.alertDangerCard}>
                    <AlertTriangle color={COLORS.textDark} size={24} />
                    <View style={styles.alertDangerContent}>
                      <Text style={styles.alertDangerTitle}>ALERTA DE SEGURIDAD CRÍTICA</Text>
                      <Text style={styles.alertDangerText}>{sol.safetyAlert}</Text>
                    </View>
                  </View>

                  {/* Step by Step Action List */}
                  <View style={styles.solutionCard}>
                    <View style={styles.cardHeaderRow}>
                      <CheckCircle color={COLORS.green} size={20} />
                      <Text style={styles.cardSectionTitle}>PROCEDIMIENTO CORRECTIVO</Text>
                    </View>
                    {sol.steps.map((stepText, idx) => (
                      <View key={idx} style={styles.stepRow}>
                        <Text style={styles.stepText}>{stepText}</Text>
                      </View>
                    ))}
                  </View>

                  {/* PROMPT 51: ENCADENAMIENTO DIAGNÓSTICO → CAPACITACIÓN PUNTUAL */}
                  {(() => {
                    const asset = sol.faultTag ? getAssetByTag(sol.faultTag) : null;
                    const faultLink = asset && sol.faultId ? asset.faultLinks?.[sol.faultId] : null;
                    const symFaultLink = asset && selectedSymptom ? asset.faultLinks?.[selectedSymptom.id] : null;
                    const link = faultLink || symFaultLink;
                    if (!asset) return null;
                    return (
                      <TouchableOpacity
                        style={styles.chainingBanner}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('Fichas', {
                          selectedTag: asset.tag,
                          activeSubTab: link ? (link.capsulaId ? 'training' : 'infografias') : 'infografias',
                          highlightInfog: link?.guiaId || null,
                        })}
                      >
                        <Lightbulb color="#000000" size={18} style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.chainingBannerTitle}>
                            [ 💡 VER PAUTA Y CAPACITACIÓN RECOMENDADA ]
                          </Text>
                          {link && (
                            <Text style={styles.chainingBannerSub}>
                              {link.guiaTitle} · TAG: {asset.tag}
                            </Text>
                          )}
                        </View>
                        <ChevronRight color="#000000" size={18} />
                      </TouchableOpacity>
                    );
                  })()}

                  {/* Links to Tech Specs */}
                  <TouchableOpacity 
                    style={styles.techLinkButton}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('Fichas', { selectedEquipment: sol.technicalLink })}
                  >
                    <Text style={styles.techLinkButtonText}>VER FICHA TÉCNICA DE EQUIPO</Text>
                    <ChevronRight color={COLORS.textDark} size={24} />
                  </TouchableOpacity>

                  {/* Reset Diagnostic */}
                  <TouchableOpacity 
                    style={styles.resetButton}
                    activeOpacity={0.8}
                    onPress={resetDiagnostic}
                  >
                    <Text style={styles.resetButtonText}>NUEVO DIAGNÓSTICO</Text>
                  </TouchableOpacity>
                </View>
              );
            })()
          )
        )}

      </ScrollView>

      {/* =========================================================================
         RULE 2: FULL SCREEN DYNAMIC CRYOGENIC SAFETY POPUP (ORANGE BACKGROUND)
         ========================================================================= */}
      <Modal
        visible={showCryoAlertModal}
        transparent={false}
        animationType="slide"
      >
        <View style={styles.cryoModalContainer}>
          <ScrollView contentContainerStyle={styles.cryoScrollContent}>
            
            <View style={styles.cryoIconCircle}>
              <Snowflake color={COLORS.textDark} size={64} strokeWidth={2.5} />
            </View>

            <Text style={styles.cryoTitleHeader}>❄️ ALERTA DE SEGURIDAD</Text>
            <Text style={styles.cryoSubHeader}>MANIPULACIÓN Y MONTAJE DE BUJE</Text>

            <View style={styles.cryoMessageCard}>
              <Text style={styles.cryoMessageText}>
                ❄️ ALERTA DE SEGURIDAD: Para la manipulación e instalación del buje se requiere hielo seco (-78°C). Confirme que posee guantes aislados criogénicos antes de continuar.
              </Text>
            </View>

            <View style={styles.cryoRequirementList}>
              <Text style={styles.cryoListTitle}>EPP Y REQUISITOS OBLIGATORIOS:</Text>
              <Text style={styles.cryoListItem}>• Guantes Criogénicos de Capa Térmica Ultra-Baja (-78°C).</Text>
              <Text style={styles.cryoListItem}>• Protector Facial Completo de Policarbonato.</Text>
              <Text style={styles.cryoListItem}>• Pinzas de Extracción Térmica sin Contacto Directo.</Text>
            </View>

            {/* Dismiss Button: "Entendido y Equipado" */}
            <TouchableOpacity
              style={styles.cryoDismissBtn}
              activeOpacity={0.85}
              onPress={() => {
                setShowCryoAlertModal(false);
                setCryoAlertDismissed(true);
              }}
            >
              <CheckCircle color={COLORS.textDark} size={28} style={{ marginRight: 8 }} />
              <Text style={styles.cryoDismissBtnText}>Entendido y Equipado</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </Modal>

      {/* S.I.T.O. TACTICAL MAP MODAL — PROMPT 51 DEFINITIVE */}
      <SitoTacticalMap
        visible={showMapModal}
        onClose={() => setShowMapModal(false)}
        initialEquipmentTag="CH-02"
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    height: 60,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingRight: SPACING.lg,
  },
  backBtnText: {
    color: COLORS.yellow,
    ...TYPOGRAPHY.subheader,
    marginLeft: SPACING.xs,
  },
  stepIndicator: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.caption,
    fontSize: 10,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  introContainer: {
    marginBottom: SPACING.xl,
  },
  screenTitle: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.title,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  screenDesc: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    fontSize: 14,
  },
  sectionDividerText: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  selectionPath: {
    color: COLORS.yellow,
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  criticalShortcutBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.yellow,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  criticalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  criticalBadgeText: {
    color: COLORS.textDark,
    fontWeight: '900',
    fontSize: 11,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  criticalTitle: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.title,
    fontSize: 20,
    marginBottom: 4,
  },
  criticalDesc: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    fontSize: 13,
    marginBottom: SPACING.md,
  },
  criticalStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.yellow,
    height: GLOVE_TARGETS.buttonHeight,
    borderRadius: GLOVE_TARGETS.borderRadius,
    paddingHorizontal: SPACING.lg,
  },
  criticalStartText: {
    color: COLORS.textDark,
    ...TYPOGRAPHY.header,
    fontSize: 14,
  },

  gloveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
    minHeight: GLOVE_TARGETS.buttonHeight + 10,
  },
  symptomBtn: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.orange,
  },
  criticalSymptomBtn: {
    borderLeftWidth: 6,
    borderLeftColor: COLORS.red,
    borderColor: COLORS.yellow,
    backgroundColor: '#1E1B10',
  },
  gloveButtonContent: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  gloveButtonTitle: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.subheader,
    fontSize: 16,
  },
  gloveButtonDesc: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    fontSize: 12,
    marginTop: 4,
  },
  symptomCode: {
    color: COLORS.orange,
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    marginBottom: 2,
  },

  overheatHeaderCard: {
    backgroundColor: COLORS.orange,
    borderRadius: GLOVE_TARGETS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.yellow,
  },
  overheatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  overheatHeaderTitles: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  overheatTag: {
    color: COLORS.textDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  overheatMainTitle: {
    color: COLORS.textDark,
    ...TYPOGRAPHY.title,
    fontSize: 20,
    marginTop: 2,
  },
  overheatNotice: {
    color: COLORS.textDark,
    ...TYPOGRAPHY.body,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },

  sequentialStepCard: {
    backgroundColor: COLORS.surface,
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sequentialStepCardActive: {
    borderColor: COLORS.yellow,
    backgroundColor: '#1A1D12',
  },
  stepNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepNumberText: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.yellow,
    color: COLORS.textDark,
    fontWeight: '900',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 32,
    marginRight: SPACING.sm,
  },
  stepTitleText: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.header,
    fontSize: 18,
  },
  stepRequirementText: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    fontSize: 14,
    marginBottom: SPACING.md,
  },

  checkboxTouchable: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background,
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    minHeight: 64,
  },
  checkboxTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  checkboxLabel: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.subheader,
    fontSize: 15,
    lineHeight: 20,
  },
  checkboxLabelActive: {
    color: COLORS.yellow,
  },
  checkSubtext: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },

  dataInputContainer: {
    marginBottom: SPACING.md,
  },
  inputFieldLabel: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    marginBottom: 6,
  },
  numericInput: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: GLOVE_TARGETS.borderRadius,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: SPACING.md,
    height: 56,
  },

  techNoteBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 230, 0, 0.08)',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.yellow,
    borderRadius: 6,
    padding: SPACING.md,
    marginTop: SPACING.xs,
  },
  techNoteTitle: {
    color: COLORS.yellow,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  techNoteText: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.body,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },

  /* =========================================================================
     MANDATORY HYDRAULIC SWITCH INTERLOCK STYLES
     ========================================================================= */
  hydraulicSwitchBox: {
    backgroundColor: COLORS.surface,
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 2,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  hydraulicSwitchBoxDanger: {
    borderColor: COLORS.red,
  },
  hydraulicSwitchBoxSafe: {
    borderColor: COLORS.green,
    backgroundColor: '#122216',
  },
  hydraulicSwitchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hydraulicSwitchLabel: {
    flex: 1,
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 15,
    marginLeft: SPACING.md,
    lineHeight: 20,
  },
  hydraulicSwitchSubtext: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },

  /* BRIGHT RED ALERT BLOCKADE STYLES */
  hydraulicRedAlertBlock: {
    backgroundColor: COLORS.red,
    borderRadius: GLOVE_TARGETS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  hydraulicRedAlertTitle: {
    color: COLORS.textPrimary,
    fontWeight: '900',
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  hydraulicRedAlertText: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },

  // Notes Field
  notesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  notesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notesCardTitle: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.header,
    fontSize: 16,
    marginLeft: SPACING.sm,
  },
  notesHelpText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: SPACING.md,
  },
  notesTextInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: GLOVE_TARGETS.borderRadius,
    color: COLORS.textPrimary,
    fontSize: 15,
    padding: SPACING.md,
    minHeight: 110,
    textAlignVertical: 'top',
  },

  // Giant Bottom Button: [ CONTINUAR DIAGNÓSTICO ]
  continueDiagnosticBtn: {
    flexDirection: 'row',
    height: GLOVE_TARGETS.buttonHeight + 10,
    backgroundColor: COLORS.yellow,
    borderRadius: GLOVE_TARGETS.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  continueDiagnosticBtnDisabled: {
    backgroundColor: '#3A3828',
    opacity: 0.85,
  },
  continueDiagnosticBtnText: {
    color: COLORS.textDark,
    ...TYPOGRAPHY.title,
    fontSize: 18,
    marginRight: SPACING.xs,
  },

  solutionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.xs,
  },
  cardSectionTitle: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.subheader,
    fontSize: 14,
    marginLeft: SPACING.sm,
    letterSpacing: 0.5,
  },
  causeText: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    fontSize: 14,
  },
  alertDangerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.red,
    borderRadius: GLOVE_TARGETS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  alertDangerContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  alertDangerTitle: {
    color: COLORS.textDark,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  alertDangerText: {
    color: COLORS.textDark,
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    fontSize: 14,
    marginTop: 2,
  },
  stepRow: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  stepText: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.body,
    fontSize: 14,
  },
  techLinkButton: {
    flexDirection: 'row',
    height: GLOVE_TARGETS.buttonHeight,
    backgroundColor: COLORS.yellow,
    borderRadius: GLOVE_TARGETS.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  techLinkButtonText: {
    color: COLORS.textDark,
    ...TYPOGRAPHY.header,
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  resetButton: {
    height: GLOVE_TARGETS.buttonHeight,
    borderWidth: GLOVE_TARGETS.borderWidth,
    borderColor: COLORS.textSecondary,
    borderRadius: GLOVE_TARGETS.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  resetButtonText: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.subheader,
    fontSize: 13,
  },

  // ── PROMPT 51: Diagnóstico → Capacitación chaining banner ─────
  chainingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE000',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: '#FFE000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  chainingBannerTitle: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  chainingBannerSub: {
    color: '#333300',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.yellow,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.title,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSub: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  summarySummaryBox: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  summaryBoxRow: {
    color: COLORS.green,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  summaryNotesRow: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 4,
  },
  modalCloseBtn: {
    width: '100%',
    height: GLOVE_TARGETS.buttonHeight,
    backgroundColor: COLORS.yellow,
    borderRadius: GLOVE_TARGETS.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalCloseBtnText: {
    color: COLORS.textDark,
    ...TYPOGRAPHY.header,
    fontSize: 14,
  },
  modalSecondaryBtn: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSecondaryBtnText: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.subheader,
    fontSize: 13,
  },

  /* =========================================================================
     FULL SCREEN CRYOGENIC POPUP STYLES (ORANGE BACKGROUND)
     ========================================================================= */
  cryoModalContainer: {
    flex: 1,
    backgroundColor: COLORS.orange,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  cryoScrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  cryoIconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 4,
    borderColor: COLORS.textDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  cryoTitleHeader: {
    color: COLORS.textDark,
    fontWeight: '900',
    fontSize: 28,
    textAlign: 'center',
    letterSpacing: 1,
  },
  cryoSubHeader: {
    color: COLORS.textDark,
    fontWeight: '800',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.xl,
    letterSpacing: 0.5,
  },
  cryoMessageCard: {
    backgroundColor: '#000000',
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 3,
    borderColor: COLORS.yellow,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    width: '100%',
  },
  cryoMessageText: {
    color: COLORS.yellow,
    fontWeight: '900',
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
  cryoRequirementList: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: GLOVE_TARGETS.borderRadius,
    padding: SPACING.lg,
    width: '100%',
    marginBottom: SPACING.xxl,
  },
  cryoListTitle: {
    color: COLORS.textDark,
    fontWeight: '900',
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  cryoListItem: {
    color: COLORS.textDark,
    fontWeight: '800',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },
  cryoDismissBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.yellow,
    width: '100%',
    height: GLOVE_TARGETS.buttonHeight + 10,
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.textDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  cryoDismissBtnText: {
    color: COLORS.textDark,
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  assetTagBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16222F',
    borderWidth: 1,
    borderColor: '#2D445D',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    marginBottom: SPACING.md,
  },
  fluorescentBadge: {
    backgroundColor: '#FFE600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  fluorescentBadgeText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 12,
  },
  assetNameBanner: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  mapBtnHeader: {
    backgroundColor: '#1E2D3D',
    borderWidth: 1,
    borderColor: '#364F6B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  mapBtnHeaderText: {
    color: COLORS.yellow,
    fontWeight: '900',
    fontSize: 11,
  },
});
