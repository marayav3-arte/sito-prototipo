import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { COLORS, SPACING, GLOVE_TARGETS } from '../theme';
import { 
  AlertTriangle, 
  ShieldAlert, 
  PlusCircle, 
  CheckCircle2, 
  UserCheck, 
  Building2, 
  Wrench, 
  Camera, 
  FileText, 
  FileCheck,
  Paperclip,
  AlertCircle,
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Clock, 
  Check, 
  ShieldCheck,
  AlertOctagon,
  Image as ImageIcon,
  Search,
  X as XIcon,
} from 'lucide-react-native';

// PROMPT 50: IMPORT CENTRALIZED WORK ORDERS CONTEXT HOOK
import { useWorkOrders } from '../context/WorkOrdersContext';
// PROMPT 51: IMPORT MASTER ASSET CATALOG
import { searchAssets, getAssetsByArea, MACRO_AREA_TO_AREA } from '../data/assetCatalog';


const CONTRACTOR_COMPANIES = [
  { id: '1', name: 'Electromecánica & Energía SpA', specialty: 'Electricidad & Instrumentación' },
  { id: '2', name: 'Tribología & LUB-Tech Chile', specialty: 'Lubricación & Aceites' },
  { id: '3', name: 'Mantenimiento Integral Mina SA', specialty: 'Mantenimiento General & Mecánica' },
];

const MANDANTE_ITOS_POOL = [
  'Ing. Roberto Arancibia M1 (Jefe de Área Seca)',
  'Pedro Gómez M2 (Supervisor Mecánico Manto)',
  'Carlos Mendoza M1 (Jefe de Turno A)',
  'Hernán Gutiérrez M2 (Supervisor Relaves & Procesos)',
  'Patricio Silva M1 (Dueño Área Húmeda)',
  'Esteban Morales M2 (ITO Electromecánica)',
];

const GENERATOR_ROLES = [
  'Jefe de Turno Mandante',
  'Dueño de Área Mandante',
  'Dueño de Equipo Mandante',
  'Supervisor Mecánico Mandante',
  'Mecánico Especialista Mandante',
];

export default function MandanteAlertsMacroblock({ navigation }) {
  const [activeTab, setActiveTab] = useState('ACTIVAS'); // 'ACTIVAS', 'CERRADAS', or 'GENERAR'

  // PROMPT 42: SHIFT FILTER STATE ('DIA', 'NOCHE', or 'TODOS')
  const [shiftFilter, setShiftFilter] = useState('TODOS');

  // PROMPT 42: TIMESTAMP & SHIFT GENERATOR HELPER
  const getCurrentTimestampAndShift = () => {
    const now = new Date();
    const hours = now.getHours();
    const isDayShift = hours >= 8 && hours < 20;
    const shiftName = isDayShift ? 'Turno A (Día)' : 'Turno A (Noche)';
    const shiftType = isDayShift ? 'DIA' : 'NOCHE';
    
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const day = String(now.getDate()).padStart(2, '0');
    const month = months[now.getMonth()];
    const hh = String(hours).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    
    const formattedDate = `${day}-${month} ${hh}:${mm} hrs | ${shiftName}`;
    return {
      formattedDate,
      shiftType,
      timestamp: now.getTime(),
    };
  };

  // PROMPT 35: Accordion expansion state for active alerts layout
  const [expandedAlertId, setExpandedAlertId] = useState(null);

  const toggleAlertExpand = (alertId) => {
    setExpandedAlertId(prev => prev === alertId ? null : alertId);
  };

  // PROMPT 36: Accordion expansion state for closed alerts layout
  const [expandedClosedAlertId, setExpandedClosedAlertId] = useState(null);

  const toggleClosedAlertExpand = (alertId) => {
    setExpandedClosedAlertId(prev => prev === alertId ? null : alertId);
  };

  // PROMPT 37: Tab switch reset function to auto-collapse all expanded cards
  const handleTabSwitch = (targetTab) => {
    setActiveTab(targetTab);
    setExpandedAlertId(null);
    setExpandedClosedAlertId(null);
  };

  // PROMPT 50: CENTRALIZED WORK ORDERS CONTEXT HOOK
  const {
    workOrders,
    createWorkOrderAlert,
    closeAlertDirectlyFromMandante,
    approveWorkOrderAudit,
    addPhotoToWorkOrder,
    updateWorkOrderNotes,
    updateConfiabilidad,
  } = useWorkOrders();

  // Active Alerts List from shared state (estadoMandante === 'ACTIVA')
  const alertsList = workOrders.filter(item => item.estadoMandante === 'ACTIVA');

  // Closed Alerts List from shared state (estadoMandante === 'CERRADA')
  const closedAlertsList = workOrders.filter(item => item.estadoMandante === 'CERRADA');

  // CONFIABILIDAD: Local selector state maps per closed alert id
  // These mirror the global state for optimistic UI updates before final sign-off
  const [tipoImpactoMap, setTipoImpactoMap] = useState({});
  const [downtimeMap, setDowntimeMap] = useState({});
  const [sistemaFallaMap, setSistemaFallaMap] = useState({});

  // Helpers to read current value (local override takes priority over persisted)
  const getTipoImpacto = (alert) => tipoImpactoMap[alert.id] !== undefined ? tipoImpactoMap[alert.id] : (alert.tipoImpacto || '');
  const getDowntime = (alert) => downtimeMap[alert.id] !== undefined ? downtimeMap[alert.id] : (alert.downtimeHoras || '');
  const getSistemaFalla = (alert) => sistemaFallaMap[alert.id] !== undefined ? sistemaFallaMap[alert.id] : (alert.sistemaFalla || '');

  // Map for tracking active alert report selection before closure
  const [activeReportStatusMap, setActiveReportStatusMap] = useState({});

  // Form State for "GENERAR ALERTA"
  const [newArea, setNewArea] = useState('Área Seca');
  const [newTag, setNewTag] = useState('ACT-001');
  const [newEqName, setNewEqName] = useState('Chancador Cónico Omnicone SX 1560');

  // PROMPT 51: Asset Picker state for full master catalog search
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [assetSearchQuery, setAssetSearchQuery] = useState('');

  const [newFaultType, setNewFaultType] = useState('');
  const [newCompany, setNewCompany] = useState(CONTRACTOR_COMPANIES[1].name);
  const [newIto, setNewIto] = useState(MANDANTE_ITOS_POOL[0]);
  const [newNotes, setNewNotes] = useState('');
  const [newPhotos, setNewPhotos] = useState([]);
  const [newOtDocument, setNewOtDocument] = useState(''); // PROMPT 38: Required OT attachment state
  const [formSuccessMessage, setFormSuccessMessage] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');

  // Handle attaching required OT document
  const handleAttachOtDocument = () => {
    const docName = `OT_mantenimiento_${newTag || 'ACT001'}.pdf`;
    setNewOtDocument(docName);
    setFormErrorMessage('');
  };

  // Handle adding simulated photo to an existing active alert
  const handleAddPhotoToAlert = (alertId) => {
    const photoName = `evidencia_terreno_${Date.now().toString().slice(-4)}.jpg`;
    addPhotoToWorkOrder(alertId, photoName);
  };

  // PROMPT 39: Map for tracking close alert validation errors when reportStatus is not selected
  const [closeAlertErrorMap, setCloseAlertErrorMap] = useState({});

  // Handle updating text or status field in active alert
  const handleUpdateAlertText = (alertId, field, text) => {
    if (field === 'reportStatus') {
      setActiveReportStatusMap(prev => ({ ...prev, [alertId]: text }));
      setCloseAlertErrorMap(prev => ({ ...prev, [alertId]: '' }));
    } else {
      updateWorkOrderNotes(alertId, text);
    }
  };

  // PROMPT 39, 42 & 50: Move an active alert to closedAlertsList on signature & closure
  const handleCloseAlert = (alertId) => {
    const alertToClose = alertsList.find(item => item.id === alertId || item.alertId === alertId);
    if (!alertToClose) return;

    const chosenStatus = activeReportStatusMap[alertId] || alertToClose.reportStatus;
    if (!chosenStatus) {
      setCloseAlertErrorMap(prev => ({
        ...prev,
        [alertId]: '⚠️ SELECCIÓN OBLIGATORIA: Marque [ 📄 INFORME ENTREGADO ] o [ ⏳ INFORME PENDIENTE ] antes de firmar.'
      }));
      return;
    }

    closeAlertDirectlyFromMandante(alertId, chosenStatus);
  };

  // Handle submitting new alert form (PROMPT 38, 42 & 50: Synchronizes with Operativo in real time)
  const handleCreateAlertSubmit = () => {
    if (!newFaultType.trim()) {
      setFormErrorMessage('⚠️ Ingrese la descripción de la anomalía o falla.');
      return;
    }

    if (!newOtDocument) {
      setFormErrorMessage('⚠️ Debe adjuntar la Órden de Trabajo (OT) antes de derivar la alerta.');
      return;
    }

    const newEntry = createWorkOrderAlert({
      area: newArea,
      tag: newTag,
      equipmentName: newEqName,
      faultType: newFaultType.trim(),
      contractorCompany: newCompany,
      assignedIto: newIto,
      notes: newNotes,
      photos: newPhotos,
      otDocument: newOtDocument,
    });

    setFormErrorMessage('');
    setFormSuccessMessage(`✅ Alerta ${newEntry.alertId || newEntry.id} con OT (${newOtDocument}) generada y derivada exitosamente.`);
    
    // Reset form
    setNewFaultType('');
    setNewNotes('');
    setNewPhotos([]);
    setNewOtDocument('');

    setTimeout(() => {
      setFormSuccessMessage('');
      handleTabSwitch('ACTIVAS'); // Switch to Active Alerts list and reset accordions
    }, 1200);
  };

  const handleAddFormPhoto = () => {
    const samplePhoto = `evidencia_camara_${Date.now().toString().slice(-4)}.jpg`;
    setNewPhotos([...newPhotos, samplePhoto]);
  };

  // PROMPT 42: FILTER AND CHRONOLOGICAL SORTING FOR ACTIVE ALERTS
  const filteredActiveAlerts = alertsList
    .filter(alert => {
      if (shiftFilter === 'DIA') return alert.shiftType === 'DIA';
      if (shiftFilter === 'NOCHE') return alert.shiftType === 'NOCHE';
      return true;
    })
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  // PROMPT 42: FILTER AND CHRONOLOGICAL SORTING FOR CLOSED ALERTS
  const filteredClosedAlerts = closedAlertsList
    .filter(alert => {
      if (shiftFilter === 'DIA') return alert.shiftType === 'DIA';
      if (shiftFilter === 'NOCHE') return alert.shiftType === 'NOCHE';
      return true;
    })
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return (
    <View style={styles.macroContainer}>
      
      {/* MACROBLOCK HEADER WITH TITLE & ROLE BADGE */}
      <View style={styles.macroHeaderRow}>
        <View style={styles.headerTitleCol}>
          <View style={styles.roleBadgeMandante}>
            <ShieldAlert color="#000000" size={14} style={{ marginRight: 4 }} />
            <Text style={styles.roleBadgeMandanteText}>EXCLUSIVO PERFIL MANDANTE</Text>
          </View>
          <Text style={styles.macroTitleText}>GESTIÓN DE ALERTAS & DERIVACIONES</Text>
        </View>

        <View style={styles.activeCountBadge}>
          <Text style={styles.activeCountBadgeText}>{alertsList.length} ACTIVAS</Text>
        </View>
      </View>

      {/* PROMPT 37: 3-TAB INTERNAL NAVIGATION BAR WITH AUTO-COLLAPSE ON TAB SWITCH */}
      <View style={styles.tabBarRow}>
        
        {/* PESTAÑA 1 (IZQUIERDA): ALERTAS ACTIVAS */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            styles.tabButtonAlertActiveBorder,
            activeTab === 'ACTIVAS' && styles.tabButtonActiveRed
          ]}
          activeOpacity={0.85}
          onPress={() => handleTabSwitch('ACTIVAS')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AlertTriangle color={activeTab === 'ACTIVAS' ? '#000000' : '#FF3333'} size={14} style={{ marginRight: 4 }} />
            <Text style={[styles.tabButtonText, activeTab === 'ACTIVAS' && styles.tabButtonTextDark]} numberOfLines={1}>
              [ ⚠️ ACTIVAS ({alertsList.length}) ]
            </Text>
          </View>
        </TouchableOpacity>

        {/* PESTAÑA 2 (CENTRO): ALERTAS CERRADAS */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'CERRADAS' && styles.tabButtonActiveGreen
          ]}
          activeOpacity={0.85}
          onPress={() => handleTabSwitch('CERRADAS')}
        >
          <CheckCircle2 color={activeTab === 'CERRADAS' ? '#000000' : '#00FF88'} size={14} style={{ marginRight: 4 }} />
          <Text style={[styles.tabButtonText, activeTab === 'CERRADAS' && styles.tabButtonTextDark]} numberOfLines={1}>
            [ 🟢 CERRADAS ({closedAlertsList.length}) ]
          </Text>
        </TouchableOpacity>

        {/* PESTAÑA 3 (DERECHA): GENERAR NUEVA ALERTA */}
        <TouchableOpacity
          style={[
            styles.tabButtonGenerateSolid,
            activeTab === 'GENERAR' && styles.tabButtonGenerateSolidActive
          ]}
          activeOpacity={0.85}
          onPress={() => handleTabSwitch('GENERAR')}
        >
          <PlusCircle color="#000000" size={14} style={{ marginRight: 4 }} />
          <Text style={styles.tabButtonGenerateText} numberOfLines={1}>
            [ ➕ GENERAR NUEVA ALERTA ]
          </Text>
        </TouchableOpacity>

      </View>

      {/* PROMPT 42: SHIFT FILTER BAR FOR TURNO A (DÍA / NOCHE / JORNADA COMPLETA) */}
      {(activeTab === 'ACTIVAS' || activeTab === 'CERRADAS') && (
        <View style={styles.shiftFilterContainer}>
          <Text style={styles.shiftFilterLabel}>FILTRO DE HISTÓRICO DIARIO (TURNO A):</Text>
          <View style={styles.shiftFilterRow}>
            <TouchableOpacity
              style={[
                styles.shiftFilterBtn,
                shiftFilter === 'DIA' && styles.shiftFilterBtnActiveDay
              ]}
              activeOpacity={0.85}
              onPress={() => setShiftFilter('DIA')}
            >
              <Text style={[styles.shiftFilterBtnText, shiftFilter === 'DIA' && styles.shiftFilterBtnTextDark]}>
                [ ☀️ TURNO DÍA ]
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.shiftFilterBtn,
                shiftFilter === 'NOCHE' && styles.shiftFilterBtnActiveNight
              ]}
              activeOpacity={0.85}
              onPress={() => setShiftFilter('NOCHE')}
            >
              <Text style={[styles.shiftFilterBtnText, shiftFilter === 'NOCHE' && styles.shiftFilterBtnTextDark]}>
                [ 🌙 TURNO NOCHE ]
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.shiftFilterBtn,
                shiftFilter === 'TODOS' && styles.shiftFilterBtnActiveFull
              ]}
              activeOpacity={0.85}
              onPress={() => setShiftFilter('TODOS')}
            >
              <Text style={[styles.shiftFilterBtnText, shiftFilter === 'TODOS' && styles.shiftFilterBtnTextDark]}>
                [ 📋 JORNADA COMPLETA ]
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* TAB 1 CONTENT: ALERTAS ACTIVAS (PROMPT 35 & 42: LAYOUT HORIZONTAL, ACCORDION & SHIFT FILTER) */}
      {activeTab === 'ACTIVAS' && (
        <View style={styles.tabContentContainer}>
          
          {filteredActiveAlerts.length === 0 ? (
            <View style={styles.emptyAlertsCard}>
              <CheckCircle2 color="#00FF88" size={36} />
              <Text style={styles.emptyAlertsTitle}>NO HAY ALERTAS REGISTRADAS EN ESTA JORNADA</Text>
              <Text style={styles.emptyAlertsSub}>No hay anomalías activas para el sub-turno seleccionado.</Text>
            </View>
          ) : (
            <View style={styles.alertsHorizontalGrid}>
              {filteredActiveAlerts.map((alert) => {
                const isExpanded = expandedAlertId === alert.id;
                return (
                  <View 
                    key={alert.id} 
                    style={[
                      styles.alertCardBase,
                      isExpanded ? styles.alertCardExpandedFull : styles.alertCardCompactCol,
                      alert.isCritical && styles.alertCardCriticalBorder
                    ]}
                  >
                    
                    {/* ACCORDION HEADER (ALWAYS VISIBLE & CLICKABLE FOR TOGGLE) */}
                    <TouchableOpacity
                      style={styles.accordionHeaderBtn}
                      activeOpacity={0.85}
                      onPress={() => toggleAlertExpand(alert.id)}
                    >
                      {/* TOP ROW BADGES */}
                      <View style={styles.cardBadgesRow}>
                        {/* AREA BADGE */}
                        <View style={styles.areaBadge}>
                          <Building2 color="#FFD700" size={12} style={{ marginRight: 4 }} />
                          <Text style={styles.areaBadgeText}>[ 🏢 {alert.area} ]</Text>
                        </View>

                        {/* PROMPT 41: ACTIVE ALERTS BADGE WITH RED CONTAINER, WHITE TEXT, AND 'DERIVADO A: <CONTRACTOR_UPPERCASE>' */}
                        <View style={styles.statusBadgeRedContractor}>
                          <Clock color="#FFFFFF" size={11} style={{ marginRight: 4 }} />
                          <Text style={styles.statusBadgeRedContractorText} numberOfLines={1}>
                            DERIVADO A: {alert.contractorCompany ? alert.contractorCompany.split('(')[0].trim().toUpperCase() : 'CONTRATISTA ASIGNADO'}
                          </Text>
                        </View>
                      </View>

                      {/* FAULT TITLE & TAG */}
                      <Text style={styles.alertFaultTitle}>⚠️ {alert.faultType}</Text>
                      <Text style={styles.alertEquipmentTag}>
                        TAG: <Text style={{ color: '#FFD700', fontWeight: '900' }}>{alert.equipmentTag}</Text> — {alert.equipmentName}
                      </Text>

                      {/* PROMPT 42: AUTOMATED TIMESTAMP & SHIFT BADGE */}
                      <View style={styles.timestampSubRow}>
                        <Clock color="#8CAAD0" size={11} style={{ marginRight: 4 }} />
                        <Text style={styles.timestampSubText}>🕒 {alert.date}</Text>
                      </View>

                      {/* EXPAND/COLLAPSE INDICATOR BADGE */}
                      <View style={[styles.expandToggleBadge, isExpanded && styles.expandToggleBadgeActive]}>
                        {isExpanded ? (
                          <>
                            <ChevronUp color="#000000" size={14} style={{ marginRight: 4 }} />
                            <Text style={styles.expandToggleBadgeTextActive}>[ 🔺 CONTRAER DETALLE ]</Text>
                          </>
                        ) : (
                          <>
                            <ChevronDown color="#00E5FF" size={14} style={{ marginRight: 4 }} />
                            <Text style={styles.expandToggleBadgeText}>[ 🔻 EXPANDIR DETALLE ]</Text>
                          </>
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* DETAILED ACCORDION BODY (RENDERED WHEN EXPANDED) */}
                    {isExpanded && (
                      <View style={styles.accordionBodyContainer}>
                        <Text style={styles.alertMetaText}>👤 Responsable de Activo: {alert.assetOwner}</Text>

                        <View style={styles.cardDivider} />

                        {/* QUIEN GENERÓ LA ALERTA */}
                        <View style={styles.structuredFieldRow}>
                          <Text style={styles.fieldLabel}>EMISOR MANDANTE DE LA ALERTA:</Text>
                          <Text style={styles.fieldValueBold}>{alert.generatorRole}</Text>
                        </View>

                        {/* DERIVACIÓN & ESPECIALIDAD (EMPRESA CONTRATISTA) */}
                        <View style={styles.structuredFieldRow}>
                          <Text style={styles.fieldLabel}>EMPRESA CONTRATISTA DERIVADA:</Text>
                          <View style={styles.contractorBox}>
                            <Wrench color="#00E5FF" size={14} style={{ marginRight: 6 }} />
                            <Text style={styles.contractorBoxText}>{alert.contractorCompany}</Text>
                          </View>
                        </View>

                        {/* ITO / SUPERVISOR MANDANTE ASIGNADO */}
                        <View style={styles.structuredFieldRow}>
                          <Text style={styles.fieldLabel}>SUPERVISOR / ITO MANDANTE A CARGO:</Text>
                          <View style={styles.itoBox}>
                            <ShieldCheck color="#FFD700" size={14} style={{ marginRight: 6 }} />
                            <Text style={styles.itoBoxText}>{alert.assignedIto}</Text>
                          </View>
                        </View>

                        {/* SECCIÓN DE SEGUIMIENTO INTERACTIVA */}
                        <View style={styles.trackingSectionBox}>
                          <Text style={styles.trackingHeaderTitle}>📋 SECCIÓN DE SEGUIMIENTO & EVIDENCIA EN TERRENO</Text>

                          {/* FIELD 1: INFORME / ESTADO DE AVANCE */}
                          <Text style={styles.inputLabelSmall}>Informe / Estado de Avance Actual:</Text>
                          <TextInput
                            style={styles.textInputArea}
                            multiline={true}
                            numberOfLines={2}
                            value={alert.progressReport}
                            onChangeText={(val) => handleUpdateAlertText(alert.id, 'progressReport', val)}
                            placeholder="Escriba el avance de la cuadrilla en terreno..."
                            placeholderTextColor="#777777"
                          />

                          {/* FIELD 2: NOTAS TÉCNICAS EN TERRENO */}
                          <Text style={styles.inputLabelSmall}>Notas Técnicas de Campo:</Text>
                          <TextInput
                            style={styles.textInputArea}
                            multiline={true}
                            numberOfLines={2}
                            value={alert.technicalNotes}
                            onChangeText={(val) => handleUpdateAlertText(alert.id, 'technicalNotes', val)}
                            placeholder="Detalle hallazgos técnicos o muestras de laboratorio..."
                            placeholderTextColor="#777777"
                          />

                          {/* FIELD 3: EVIDENCIA FOTOGRÁFICA */}
                          <Text style={styles.inputLabelSmall}>Fotografías de Evidencia Adjuntas:</Text>
                          <View style={styles.photosBadgesRow}>
                            {alert.photos.map((photo, pIdx) => (
                              <View key={pIdx} style={styles.photoTag}>
                                <ImageIcon color="#FFD700" size={12} style={{ marginRight: 4 }} />
                                <Text style={styles.photoTagText}>{photo}</Text>
                              </View>
                            ))}

                            {/* ATTACH PHOTO BUTTON */}
                            <TouchableOpacity
                              style={styles.attachPhotoBtn}
                              activeOpacity={0.8}
                              onPress={() => handleAddPhotoToAlert(alert.id)}
                            >
                              <Camera color="#000000" size={13} style={{ marginRight: 4 }} />
                              <Text style={styles.attachPhotoBtnText}>[ 📷 ADJUNTAR FOTO ]</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* PROMPT 39: INTERLOCK TOGGLE FOR TECHNICAL REPORT DELIVERY STATUS */}
                        <View style={styles.interlockBoxContainer}>
                          <Text style={styles.interlockBoxLabel}>ESTADO DE ENTREGA DE INFORME TÉCNICO (REQUERIDO EN CIERRE):</Text>
                          <View style={styles.interlockToggleRow}>
                            <TouchableOpacity
                              style={[
                                styles.interlockToggleBtn,
                                alert.reportStatus === 'ENTREGADO' ? styles.interlockBtnGreenActive : styles.interlockBtnInactive
                              ]}
                              activeOpacity={0.85}
                              onPress={() => handleUpdateAlertText(alert.id, 'reportStatus', 'ENTREGADO')}
                            >
                              <FileText color={alert.reportStatus === 'ENTREGADO' ? '#000000' : '#00FF88'} size={14} style={{ marginRight: 4 }} />
                              <Text style={[styles.interlockToggleText, alert.reportStatus === 'ENTREGADO' && styles.interlockToggleTextDark]}>
                                [ 📄 INFORME ENTREGADO ]
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[
                                styles.interlockToggleBtn,
                                alert.reportStatus === 'PENDIENTE' ? styles.interlockBtnAmberActive : styles.interlockBtnInactive
                              ]}
                              activeOpacity={0.85}
                              onPress={() => handleUpdateAlertText(alert.id, 'reportStatus', 'PENDIENTE')}
                            >
                              <Clock color={alert.reportStatus === 'PENDIENTE' ? '#000000' : '#FFD700'} size={14} style={{ marginRight: 4 }} />
                              <Text style={[styles.interlockToggleText, alert.reportStatus === 'PENDIENTE' && styles.interlockToggleTextDark]}>
                                [ ⏳ INFORME PENDIENTE ]
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* VALIDATION ERROR BANNER IF USER ATTEMPTS TO CLOSE WITHOUT SELECTING A STATUS */}
                        {closeAlertErrorMap[alert.id] ? (
                          <View style={styles.interlockErrorBanner}>
                            <AlertCircle color="#FFFFFF" size={14} style={{ marginRight: 6 }} />
                            <Text style={styles.interlockErrorText}>{closeAlertErrorMap[alert.id]}</Text>
                          </View>
                        ) : null}

                        {/* ACTION BUTTON: FIRMAR Y CERRAR ALERTA REGISTRADA */}
                        <TouchableOpacity
                          style={[
                            styles.closeAlertBtn,
                            !alert.reportStatus && styles.closeAlertBtnDisabled
                          ]}
                          activeOpacity={0.85}
                          onPress={() => handleCloseAlert(alert.id)}
                        >
                          <CheckCircle2 color="#000000" size={18} style={{ marginRight: 6 }} />
                          <Text style={styles.closeAlertBtnText}>[ 🟢 FIRMAR Y CERRAR ALERTA REGISTRADA ]</Text>
                        </TouchableOpacity>

                      </View>
                    )}

                  </View>
                );
              })}
            </View>
          )}

        </View>
      )}

      {/* TAB 2 CONTENT: GENERAR NUEVA ALERTA (PROMPT 38: CON OT OBLIGATORIA Y EMISOR AUTOMÁTICO) */}
      {activeTab === 'GENERAR' && (
        <View style={styles.tabContentContainer}>
          
          <View style={styles.generateFormCard}>
            <Text style={styles.formTitle}>Formulario de Creación y Derivación de Alerta</Text>
            <Text style={styles.formSub}>
              Emisor Automático: <Text style={{ color: '#FFD700', fontWeight: '900' }}>Carlos Mendoza (Jefe de Turno Mandante / Dueño de Área)</Text>
            </Text>

            {/* FIELD 1: ÁREA DE ORIGEN */}
            <Text style={styles.formFieldLabel}>1. ÁREA DE ORIGEN:</Text>
            <View style={styles.optionButtonsRow}>
              {['Área Seca', 'Área Húmeda'].map((areaOption) => (
                <TouchableOpacity
                  key={areaOption}
                  style={[
                    styles.optionBtn,
                    newArea === areaOption && styles.optionBtnActive
                  ]}
                  onPress={() => setNewArea(areaOption)}
                >
                  <Text style={[styles.optionBtnText, newArea === areaOption && styles.optionBtnTextActive]}>
                    {areaOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* FIELD 2: TAG DEL EQUIPO — PROMPT 51: Full Master Catalog Picker */}
            <Text style={styles.formFieldLabel}>2. SELECCIÓN DE ACTIVO (TAG) — Catálogo Maestro:</Text>

            {/* Trigger button showing selected asset */}
            <TouchableOpacity
              style={styles.assetPickerTrigger}
              activeOpacity={0.85}
              onPress={() => {
                setAssetSearchQuery('');
                setShowAssetPicker(true);
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.assetPickerTriggerTag}>{newTag}</Text>
                <Text style={styles.assetPickerTriggerName} numberOfLines={1}>{newEqName}</Text>
              </View>
              <ChevronDown color="#00E5FF" size={18} />
            </TouchableOpacity>

            {/* ASSET PICKER MODAL */}
            <Modal
              visible={showAssetPicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowAssetPicker(false)}
            >
              <View style={styles.assetPickerOverlay}>
                <View style={styles.assetPickerModal}>
                  {/* Header */}
                  <View style={styles.assetPickerHeader}>
                    <Text style={styles.assetPickerHeaderTitle}>🏭 CATÁLOGO MAESTRO DE ACTIVOS</Text>
                    <TouchableOpacity onPress={() => setShowAssetPicker(false)} activeOpacity={0.8}>
                      <XIcon color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                  </View>

                  {/* Search bar */}
                  <View style={styles.assetPickerSearchBox}>
                    <Search color="#8CAAD0" size={15} style={{ marginRight: 8 }} />
                    <TextInput
                      style={styles.assetPickerSearchInput}
                      value={assetSearchQuery}
                      onChangeText={setAssetSearchQuery}
                      placeholder="Buscar por nombre o TAG..."
                      placeholderTextColor="#555577"
                    />
                  </View>

                  {/* Results list */}
                  <ScrollView style={styles.assetPickerList} keyboardShouldPersistTaps="handled">
                    {Object.entries(getAssetsByArea()).map(([areaName, assets]) => {
                      const filtered = assetSearchQuery.trim()
                        ? assets.filter(a =>
                            a.name.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
                            a.tag.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
                            (a.altTags && a.altTags.some(t => t.toLowerCase().includes(assetSearchQuery.toLowerCase())))
                          )
                        : assets;
                      if (filtered.length === 0) return null;
                      const areaEmoji = areaName === 'ÁREA SECA' ? '🟠' : areaName === 'ÁREA HÚMEDA' ? '🔵' : '🟣';
                      return (
                        <View key={areaName}>
                          <Text style={styles.assetPickerAreaHeader}>
                            {areaEmoji} {areaName}
                          </Text>
                          {filtered.map((asset) => (
                            <TouchableOpacity
                              key={asset.id}
                              style={[
                                styles.assetPickerItem,
                                newTag === asset.tag && styles.assetPickerItemSelected,
                              ]}
                              activeOpacity={0.85}
                              onPress={() => {
                                setNewTag(asset.tag);
                                setNewEqName(asset.name);
                                setNewArea(MACRO_AREA_TO_AREA[asset.macroArea] || 'Área Seca');
                                setShowAssetPicker(false);
                                setAssetSearchQuery('');
                              }}
                            >
                              <View style={[styles.assetPickerItemTagBadge, newTag === asset.tag && { backgroundColor: '#00E5FF' }]}>
                                <Text style={[styles.assetPickerItemTag, newTag === asset.tag && { color: '#000000' }]}>{asset.tag}</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.assetPickerItemName} numberOfLines={1}>{asset.name}</Text>
                                <Text style={styles.assetPickerItemSub} numberOfLines={1}>{asset.subArea} | {asset.elevation}</Text>
                              </View>
                              {newTag === asset.tag && (
                                <Check color="#00FF88" size={16} />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            </Modal>


            {/* FIELD 3: TIPO DE FALLA / DESCRIPCIÓN */}
            <Text style={styles.formFieldLabel}>3. DESCRIPCIÓN DE LA ANOMALÍA / FALLA:</Text>
            <View style={styles.inputBoxOuter}>
              <TextInput
                style={styles.textInputSingle}
                value={newFaultType}
                onChangeText={(val) => {
                  setNewFaultType(val);
                  if (val.trim()) setFormErrorMessage('');
                }}
                placeholder="Ej. Fuga severa de grasa en distribuidor / Ruido en cojinete"
                placeholderTextColor="#777777"
              />
            </View>

            {/* FIELD 4: DERIVACIÓN A EMPRESA CONTRATISTA */}
            <Text style={styles.formFieldLabel}>4. DERIVACIÓN Y EMPRESA CONTRATISTA ASIGNADA:</Text>
            <View style={styles.selectBoxContainer}>
              {CONTRACTOR_COMPANIES.map((company) => (
                <TouchableOpacity
                  key={company.id}
                  style={[
                    styles.selectBoxItem,
                    newCompany === company.name && styles.selectBoxItemActive
                  ]}
                  onPress={() => setNewCompany(company.name)}
                >
                  <Wrench color={newCompany === company.name ? '#000000' : '#00E5FF'} size={14} style={{ marginRight: 6 }} />
                  <Text style={[styles.selectBoxText, newCompany === company.name && styles.selectBoxTextActive]}>
                    {company.name} — ({company.specialty})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* FIELD 5: SUPERVISOR / ITO MANDANTE A CARGO */}
            <Text style={styles.formFieldLabel}>5. ITO / SUPERVISOR MANDANTE A CARGO:</Text>
            <View style={styles.selectBoxContainer}>
              {MANDANTE_ITOS_POOL.map((ito) => (
                <TouchableOpacity
                  key={ito}
                  style={[
                    styles.selectBoxItem,
                    newIto === ito && styles.selectBoxItemActive
                  ]}
                  onPress={() => setNewIto(ito)}
                >
                  <ShieldCheck color={newIto === ito ? '#000000' : '#FFD700'} size={14} style={{ marginRight: 6 }} />
                  <Text style={[styles.selectBoxText, newIto === ito && styles.selectBoxTextActive]}>
                    {ito}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* FIELD 6: NOTAS TÉCNICAS & FOTOGRAFÍAS INICIALES */}
            <Text style={styles.formFieldLabel}>6. NOTAS TÉCNICAS & FOTOGRAFÍAS INICIALES:</Text>
            <View style={styles.inputBoxOuter}>
              <TextInput
                style={styles.textInputArea}
                multiline={true}
                numberOfLines={3}
                value={newNotes}
                onChangeText={setNewNotes}
                placeholder="Observaciones adicionales en terreno..."
                placeholderTextColor="#777777"
              />
            </View>

            {/* ATTACH INITIAL PHOTO BUTTON */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <TouchableOpacity
                style={styles.attachPhotoBtnLarge}
                activeOpacity={0.8}
                onPress={handleAddFormPhoto}
              >
                <Camera color="#000000" size={16} style={{ marginRight: 6 }} />
                <Text style={styles.attachPhotoBtnLargeText}>[ 📷 ADJUNTAR EVIDENCIA FOTOGRÁFICA ]</Text>
              </TouchableOpacity>

              <Text style={{ color: COLORS.textSecondary, fontSize: 11 }}>
                {newPhotos.length} foto(s) adjunta(s)
              </Text>
            </View>

            {/* FIELD 7: PROMPT 38 - CARGA OBLIGATORIA DE ÓRDEN DE TRABAJO (OT) */}
            <Text style={styles.formFieldLabel}>7. CARGA OBLIGATORIA DE ÓRDEN DE TRABAJO (OT):</Text>
            <View style={{ gap: 8 }}>
              <TouchableOpacity
                style={[
                  styles.attachOtBtnRequired,
                  newOtDocument ? styles.attachOtBtnSuccess : styles.attachOtBtnWarning
                ]}
                activeOpacity={0.85}
                onPress={handleAttachOtDocument}
              >
                <Paperclip color="#000000" size={18} style={{ marginRight: 6 }} />
                <Text style={styles.attachOtBtnText}>
                  {newOtDocument ? '[ ✅ OT ADJUNTA Y VALIDADA ]' : '[ 📎 ADJUNTAR ÓRDEN DE TRABAJO (OT) - REQUERIDO ]'}
                </Text>
              </TouchableOpacity>

              {/* OT STATUS BADGE */}
              {newOtDocument ? (
                <View style={styles.otStatusBadgeGreen}>
                  <FileCheck color="#00FF88" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.otStatusBadgeGreenText}>Documento adjunto: {newOtDocument}</Text>
                </View>
              ) : (
                <View style={styles.otStatusBadgeRed}>
                  <AlertCircle color="#FF3333" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.otStatusBadgeRedText}>* Requisito obligatorio: Debe cargar la OT antes de publicar en planta.</Text>
                </View>
              )}
            </View>

            {/* VALIDATION MESSAGES */}
            {formErrorMessage ? (
              <View style={styles.errorBanner}>
                <AlertCircle color="#FFFFFF" size={18} style={{ marginRight: 6 }} />
                <Text style={styles.errorBannerText}>{formErrorMessage}</Text>
              </View>
            ) : null}

            {formSuccessMessage ? (
              <View style={styles.successBanner}>
                <CheckCircle2 color="#000000" size={18} style={{ marginRight: 6 }} />
                <Text style={styles.successBannerText}>{formSuccessMessage}</Text>
              </View>
            ) : null}

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={[
                styles.submitFormBtn,
                !newOtDocument && styles.submitFormBtnDisabled
              ]}
              activeOpacity={0.85}
              onPress={handleCreateAlertSubmit}
            >
              <ShieldAlert color="#000000" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.submitFormBtnText}>[ 🚀 PUBLICAR Y DERIVAR ALERTA EN PLANTA ]</Text>
            </TouchableOpacity>

          </View>

        </View>
      )}

      {/* TAB 3 CONTENT: ALERTAS CERRADAS (PROMPT 36 & 42: LAYOUT HORIZONTAL, ACCORDION & SHIFT FILTER) */}
      {activeTab === 'CERRADAS' && (
        <View style={styles.tabContentContainer}>
          
          {filteredClosedAlerts.length === 0 ? (
            <View style={styles.emptyAlertsCard}>
              <FileText color="#00FF88" size={36} />
              <Text style={styles.emptyAlertsTitle}>NO HAY ALERTAS CERRADAS EN ESTA JORNADA</Text>
              <Text style={styles.emptyAlertsSub}>No se registran alertas resueltas para el sub-turno seleccionado.</Text>
            </View>
          ) : (
            <View style={styles.alertsHorizontalGrid}>
              {filteredClosedAlerts.map((alert) => {
                const isExpanded = expandedClosedAlertId === alert.id;
                return (
                  <View 
                    key={alert.id} 
                    style={[
                      styles.alertCardBase,
                      isExpanded ? styles.alertCardExpandedFullGreen : styles.alertCardCompactCol,
                      styles.alertCardGreenBorder
                    ]}
                  >
                    
                    {/* ACCORDION HEADER (ALWAYS VISIBLE & CLICKABLE FOR TOGGLE) */}
                    <TouchableOpacity
                      style={styles.accordionHeaderBtn}
                      activeOpacity={0.85}
                      onPress={() => toggleClosedAlertExpand(alert.id)}
                    >
                      {/* TOP ROW BADGES */}
                      <View style={styles.cardBadgesRow}>
                        {/* AREA BADGE */}
                        <View style={styles.areaBadgeGreen}>
                          <Building2 color="#00FF88" size={12} style={{ marginRight: 4 }} />
                          <Text style={styles.areaBadgeGreenText}>[ 🏢 {alert.area} ]</Text>
                        </View>

                        {/* PROMPT 41 & 43: COEXISTENCE OF CLOSING STATES IN CLOSED ALERTS */}
                        {alert.reportStatus === 'ENTREGADO' ? (
                          <View style={styles.statusBadgeGreen}>
                            <CheckCircle2 color="#000000" size={11} style={{ marginRight: 4 }} />
                            <Text style={styles.statusBadgeGreenText}>[ 🟢 RESUELTO & CERRADO ]</Text>
                          </View>
                        ) : (
                          <View style={styles.closedStatusBadgesCol}>
                            <View style={styles.statusBadgeGreenShort}>
                              <CheckCircle2 color="#000000" size={11} style={{ marginRight: 4 }} />
                              <Text style={styles.statusBadgeGreenText}>[ 🟢 RESUELTO ]</Text>
                            </View>
                            <View style={styles.statusBadgeAmberSub}>
                              <Clock color="#000000" size={11} style={{ marginRight: 4 }} />
                              <Text style={styles.statusBadgeAmberText}>[ ⏳ INFORME PENDIENTE ]</Text>
                            </View>
                          </View>
                        )}
                      </View>

                      {/* FAULT TITLE & TAG */}
                      <Text style={styles.alertFaultTitleGreen}>✓ {alert.faultType}</Text>
                      <Text style={styles.alertEquipmentTag}>
                        TAG: <Text style={{ color: '#00FF88', fontWeight: '900' }}>{alert.equipmentTag}</Text> — {alert.equipmentName}
                      </Text>

                      {/* PROMPT 42: AUTOMATED TIMESTAMP & SHIFT BADGE */}
                      <View style={styles.timestampSubRow}>
                        <Clock color="#8CAAD0" size={11} style={{ marginRight: 4 }} />
                        <Text style={styles.timestampSubText}>🕒 {alert.closedDate || alert.date}</Text>
                      </View>

                      {/* EXPAND/COLLAPSE INDICATOR BADGE */}
                      <View style={[styles.expandToggleBadgeGreen, isExpanded && styles.expandToggleBadgeGreenActive]}>
                        {isExpanded ? (
                          <>
                            <ChevronUp color="#000000" size={14} style={{ marginRight: 4 }} />
                            <Text style={styles.expandToggleBadgeTextActive}>[ 🔺 CONTRAER DETALLE ]</Text>
                          </>
                        ) : (
                          <>
                            <ChevronDown color="#00FF88" size={14} style={{ marginRight: 4 }} />
                            <Text style={styles.expandToggleBadgeGreenText}>[ 🔻 EXPANDIR DETALLE ]</Text>
                          </>
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* DETAILED ACCORDION BODY (RENDERED WHEN EXPANDED) */}
                    {isExpanded && (
                      <View style={styles.accordionBodyContainer}>
                        <Text style={styles.alertMetaText}>
                          👤 Responsable: {alert.assetOwner} • 📅 Cierre: {alert.closedDate || alert.date}
                        </Text>

                        <View style={styles.cardDivider} />

                        {/* QUIEN GENERÓ LA ALERTA */}
                        <View style={styles.structuredFieldRow}>
                          <Text style={styles.fieldLabel}>EMISOR MANDANTE DE LA ALERTA:</Text>
                          <Text style={styles.fieldValueBold}>{alert.generatorRole}</Text>
                        </View>

                        {/* DERIVACIÓN & ESPECIALIDAD (EMPRESA CONTRATISTA) */}
                        <View style={styles.structuredFieldRow}>
                          <Text style={styles.fieldLabel}>EMPRESA CONTRATISTA DERIVADA:</Text>
                          <View style={styles.contractorBox}>
                            <Wrench color="#00E5FF" size={14} style={{ marginRight: 6 }} />
                            <Text style={styles.contractorBoxText}>{alert.contractorCompany}</Text>
                          </View>
                        </View>

                        {/* ITO / SUPERVISOR MANDANTE ASIGNADO */}
                        <View style={styles.structuredFieldRow}>
                          <Text style={styles.fieldLabel}>SUPERVISOR / ITO MANDANTE DE REVISIÓN:</Text>
                          <View style={styles.itoBox}>
                            <ShieldCheck color="#FFD700" size={14} style={{ marginRight: 6 }} />
                            <Text style={styles.itoBoxText}>{alert.assignedIto}</Text>
                          </View>
                        </View>

                        {/* SECCIÓN DE INFORMES Y EVIDENCIAS DE CIERRE */}
                        <View style={styles.trackingSectionBoxGreen}>
                          <Text style={styles.trackingHeaderTitleGreen}>📋 INFORME Y EVIDENCIA TÉCNICA DE CIERRE</Text>

                          <Text style={styles.inputLabelSmall}>Informe Final de Avance / Reparación:</Text>
                          <Text style={styles.closedReportText}>"{alert.progressReport}"</Text>

                          <Text style={styles.inputLabelSmall}>Notas Técnicas Registradas:</Text>
                          <Text style={styles.closedReportText}>"{alert.technicalNotes}"</Text>

                          <Text style={styles.inputLabelSmall}>Fotografías de Evidencia en Registro:</Text>
                          <View style={styles.photosBadgesRow}>
                            {alert.photos.map((photo, pIdx) => (
                              <View key={pIdx} style={styles.photoTagGreen}>
                                <ImageIcon color="#00FF88" size={12} style={{ marginRight: 4 }} />
                                <Text style={styles.photoTagGreenText}>{photo}</Text>
                              </View>
                            ))}
                          </View>
                        </View>

                        {/* PROMPT 39: CONDITIONAL ACTION BUTTONS FOR TRACEABILITY IN CLOSED ALERTS */}
                        <View style={styles.closedActionsRow}>
                          {/* BUTTON 1: CONDITIONAL MAINTENANCE REPORT BUTTON */}
                          {alert.reportStatus === 'ENTREGADO' ? (
                            <TouchableOpacity
                              style={styles.techReportBtnHalf}
                              activeOpacity={0.85}
                              onPress={() => navigation.navigate('Fichas', { selectedEquipment: alert.equipmentName })}
                            >
                              <FileText color="#000000" size={14} style={{ marginRight: 4 }} />
                              <Text style={styles.techReportBtnHalfText} numberOfLines={1}>
                                [ 📄 IR AL INFORME DE MANTENIMIENTO ]
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              style={styles.techReportBtnHalfWarning}
                              activeOpacity={1}
                              disabled={true}
                            >
                              <Clock color="#AAAAAA" size={14} style={{ marginRight: 4 }} />
                              <Text style={styles.techReportBtnHalfWarningText} numberOfLines={1}>
                                [ ⏳ INFORME PENDIENTE DE CARGA ]
                              </Text>
                            </TouchableOpacity>
                          )}

                          {/* BUTTON 2: VER ÓRDEN DE TRABAJO OT - ALWAYS AVAILABLE */}
                          <TouchableOpacity
                            style={styles.viewOtBtnHalf}
                            activeOpacity={0.85}
                            onPress={() => navigation.navigate('Fichas', { selectedEquipment: alert.equipmentName })}
                          >
                            <FileCheck color="#000000" size={14} style={{ marginRight: 4 }} />
                            <Text style={styles.viewOtBtnHalfText} numberOfLines={1}>
                              [ 📋 VER ÓRDEN DE TRABAJO OT ]
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {/* PROMPT 50 - TAXONOMÍA: REGISTRO TÁCTICO DE CONFIABILIDAD */}
                        {/* Shown only when informe is delivered and audit not yet signed */}
                        {alert.reportStatus === 'ENTREGADO' && !(alert.firmaMandante?.firmado || alert.validatorMandante) && (
                          <View style={styles.confiabilidadBlock}>
                            <View style={styles.confiabilidadHeaderRow}>
                              <ShieldCheck color="#00E5FF" size={15} style={{ marginRight: 6 }} />
                              <Text style={styles.confiabilidadHeaderText}>
                                📊 REGISTRO TÁCTICO DE CONFIABILIDAD (Cierre Auditor)
                              </Text>
                            </View>
                            <Text style={styles.confiabilidadSubtext}>
                              Complete los 3 campos antes de firmar y cerrar la auditoría.
                            </Text>

                            {/* CAMPO A: TIPO DE IMPACTO */}
                            <Text style={styles.confiabilidadFieldLabel}>A) TIPO DE IMPACTO:</Text>
                            <View style={styles.confiabilidadSelectorRow}>
                              {[
                                '🔴 Parada No Programada (Falla Correctiva)',
                                '🟡 Intervención en Servicio (Sin Parada)',
                                '🔵 Mantenimiento Programado',
                              ].map((tipo) => {
                                const isSelected = getTipoImpacto(alert) === tipo;
                                return (
                                  <TouchableOpacity
                                    key={tipo}
                                    style={[
                                      styles.confiabilidadChip,
                                      isSelected && styles.confiabilidadChipSelected,
                                    ]}
                                    activeOpacity={0.85}
                                    onPress={() => setTipoImpactoMap(prev => ({ ...prev, [alert.id]: tipo }))}
                                  >
                                    <Text style={[
                                      styles.confiabilidadChipText,
                                      isSelected && styles.confiabilidadChipTextSelected,
                                    ]}>
                                      {tipo}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>

                            {/* CAMPO B: DOWNTIME */}
                            <Text style={styles.confiabilidadFieldLabel}>B) DURACIÓN REAL DE DETENCIÓN (Downtime en horas):</Text>
                            <TextInput
                              style={styles.confiabilidadInput}
                              keyboardType="numeric"
                              value={getDowntime(alert)}
                              onChangeText={(val) => setDowntimeMap(prev => ({ ...prev, [alert.id]: val }))}
                              placeholder="ej: 2.5"
                              placeholderTextColor="#555577"
                            />

                            {/* CAMPO C: SISTEMA / COMPONENTE */}
                            <Text style={styles.confiabilidadFieldLabel}>C) SISTEMA / COMPONENTE DE FALLA:</Text>
                            <View style={styles.confiabilidadSelectorRow}>
                              {['Mecánico', 'Eléctrico', 'Lubricación / Hidráulico', 'Instrumentación / Control', 'Estructural / Desgaste'].map((sistema) => {
                                const isSelected = getSistemaFalla(alert) === sistema;
                                return (
                                  <TouchableOpacity
                                    key={sistema}
                                    style={[
                                      styles.confiabilidadChip,
                                      isSelected && styles.confiabilidadChipSelected,
                                    ]}
                                    activeOpacity={0.85}
                                    onPress={() => setSistemaFallaMap(prev => ({ ...prev, [alert.id]: sistema }))}
                                  >
                                    <Text style={[
                                      styles.confiabilidadChipText,
                                      isSelected && styles.confiabilidadChipTextSelected,
                                    ]}>
                                      [ {sistema} ]
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          </View>
                        )}

                        {/* CONFIABILIDAD RESUMEN: mostrar cuando ya fue firmada */}
                        {(alert.firmaMandante?.firmado || alert.validatorMandante) && alert.confiabilidad && (
                          <View style={styles.confiabilidadResumenBox}>
                            <Text style={styles.confiabilidadResumenTitle}>📊 REGISTRO DE CONFIABILIDAD ARCHIVADO</Text>
                            <Text style={styles.confiabilidadResumenRow}>
                              🔹 Tipo de Impacto: <Text style={styles.confiabilidadResumenValue}>{alert.confiabilidad.tipoImpacto || alert.tipoImpacto}</Text>
                            </Text>
                            <Text style={styles.confiabilidadResumenRow}>
                              ⏱ Downtime: <Text style={styles.confiabilidadResumenValue}>{alert.confiabilidad.downtimeHoras || alert.downtimeHoras} hrs</Text>
                            </Text>
                            <Text style={styles.confiabilidadResumenRow}>
                              ⚙️ Sistema Falla: <Text style={styles.confiabilidadResumenValue}>{alert.confiabilidad.sistemaFalla || alert.sistemaFalla}</Text>
                            </Text>
                          </View>
                        )}

                        {/* PROMPT 50: FLUJO E - APROBACIÓN FINAL AUDITORÍA MANDANTE */}
                        <View style={{ marginTop: 10, width: '100%' }}>
                          {(alert.firmaMandante?.firmado || alert.validatorMandante) ? (
                            <View style={styles.auditMandanteConfirmedBox}>
                              <ShieldCheck color="#00FF88" size={16} style={{ marginRight: 8 }} />
                              <View style={{ flex: 1 }}>
                                <Text style={styles.auditMandanteConfirmedText}>
                                  AUDITORÍA VALIDADA: {alert.firmaMandante?.validador || alert.validatorMandante}
                                </Text>
                                <Text style={styles.auditMandanteTimestampText}>
                                  📅 Sello: {alert.firmaMandante?.fechaHora || alert.validationTimestamp || alert.closedDate}
                                </Text>
                              </View>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={styles.signAuditMandanteBtn}
                              activeOpacity={0.85}
                              onPress={() => {
                                const confiabilidadData = {
                                  tipoImpacto: getTipoImpacto(alert),
                                  downtimeHoras: getDowntime(alert),
                                  sistemaFalla: getSistemaFalla(alert),
                                };
                                approveWorkOrderAudit(
                                  alert.id,
                                  alert.assignedIto || 'Ing. Roberto Arancibia M1 (Supervisor Mandante)',
                                  confiabilidadData
                                );
                              }}
                            >
                              <ShieldCheck color="#000000" size={14} style={{ marginRight: 6 }} />
                              <Text style={styles.signAuditMandanteBtnText}>
                                [ 🖋️ FIRMAR Y VALIDAR AUDITORÍA MANDANTE ]
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>

                      </View>
                    )}

                  </View>
                );
              })}
            </View>
          )}

        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  macroContainer: {
    backgroundColor: '#121822',
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 2,
    borderColor: '#3D3510',
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    width: '100%',
  },
  macroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitleCol: {
    flex: 1,
    paddingRight: 8,
  },
  roleBadgeMandante: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  roleBadgeMandanteText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  macroTitleText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  activeCountBadge: {
    backgroundColor: 'rgba(255, 51, 51, 0.2)',
    borderWidth: 1.5,
    borderColor: '#FF3333',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  activeCountBadgeText: {
    color: '#FF3333',
    fontSize: 11,
    fontWeight: '900',
  },

  tabBarRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.lg,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#182433',
    borderWidth: 1.5,
    borderColor: '#263C52',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  tabButtonActiveRed: {
    backgroundColor: '#FF3333',
    borderColor: '#FF3333',
  },
  tabButtonAlertActiveBorder: {
    borderColor: '#FF3333',
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 51, 51, 0.15)',
  },
  tabButtonActiveYellow: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  tabButtonActiveGreen: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  // PROMPT 32: SOLID VIVID AMBER/ORANGE HIGHLIGHT FOR GENERAR NUEVA ALERTA
  tabButtonGenerateSolid: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB300',
    borderWidth: 2,
    borderColor: '#E65100',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    shadowColor: '#FFB300',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButtonGenerateSolidActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  tabButtonGenerateText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  tabButtonText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '900',
  },
  tabButtonTextDark: {
    color: '#000000',
  },

  tabContentContainer: {
    gap: SPACING.md,
  },

  emptyAlertsCard: {
    backgroundColor: '#182433',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#263C52',
    padding: SPACING.xl,
    alignItems: 'center',
    gap: 8,
  },
  emptyAlertsTitle: {
    color: '#00FF88',
    fontSize: 14,
    fontWeight: '900',
  },
  emptyAlertsSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },

  // PROMPT 35: HORIZONTAL 2-COLUMN GRID & ACCORDION EXPANSION STYLES
  alertsHorizontalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  alertCardBase: {
    backgroundColor: '#182433',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#263C52',
    padding: SPACING.md,
  },
  alertCardCompactCol: {
    flex: 1,
    minWidth: 260,
  },
  alertCardExpandedFull: {
    width: '100%',
    borderColor: '#FF3333',
    backgroundColor: '#16202C',
  },
  alertCardExpandedFullGreen: {
    width: '100%',
    borderColor: '#00FF88',
    backgroundColor: '#0C1C16',
  },
  accordionHeaderBtn: {
    gap: 4,
  },
  expandToggleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#00E5FF',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  expandToggleBadgeActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  expandToggleBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 1,
    borderColor: '#00FF88',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  expandToggleBadgeGreenActive: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  expandToggleBadgeText: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '900',
  },
  expandToggleBadgeGreenText: {
    color: '#00FF88',
    fontSize: 10,
    fontWeight: '900',
  },
  expandToggleBadgeTextActive: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  accordionBodyContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#263C52',
    gap: 6,
  },

  /* PROMPT 36: DUAL ACTIONS ROW FOR CLOSED ALERTS */
  closedActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  techReportBtnHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FF88',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  techReportBtnHalfText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  viewOtBtnHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00E5FF',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  viewOtBtnHalfText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  // PROMPT 42: SHIFT FILTER BAR & TIMESTAMP SUBTEXT STYLES
  shiftFilterContainer: {
    backgroundColor: '#0F1722',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#263C52',
    padding: 10,
    marginTop: 6,
    marginBottom: 10,
    gap: 6,
  },
  shiftFilterLabel: {
    color: '#8CAAD0',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  shiftFilterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  shiftFilterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#162331',
    borderWidth: 1.5,
    borderColor: '#2A3F55',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    minHeight: 38,
  },
  shiftFilterBtnActiveDay: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  shiftFilterBtnActiveNight: {
    backgroundColor: '#9C27B0',
    borderColor: '#E91E63',
  },
  shiftFilterBtnActiveFull: {
    backgroundColor: '#00E5FF',
    borderColor: '#00E5FF',
  },
  shiftFilterBtnText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '900',
  },
  shiftFilterBtnTextDark: {
    color: '#000000',
    fontWeight: '900',
  },
  timestampSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  timestampSubText: {
    color: '#8CAAD0',
    fontSize: 11,
    fontWeight: '700',
  },

  alertCard: {
    backgroundColor: '#182433',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#263C52',
    padding: SPACING.lg,
    gap: 6,
  },
  alertCardCriticalBorder: {
    borderColor: '#FF3333',
  },
  alertCardGreenBorder: {
    borderColor: '#00FF88',
  },
  cardBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  areaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  areaBadgeText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '900',
  },
  areaBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    borderWidth: 1,
    borderColor: '#00FF88',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  areaBadgeGreenText: {
    color: '#00FF88',
    fontSize: 10,
    fontWeight: '900',
  },
  statusBadgeRed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3333',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeRedText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  // PROMPT 41: ACTIVE ALERTS RED CONTAINER BADGE FOR DERIVADO A: <CONTRACTOR_UPPERCASE>
  statusBadgeRedContractor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3333',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    maxWidth: '65%',
  },
  statusBadgeRedContractorText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  statusBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00FF88',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeGreenText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  // PROMPT 41: STACKED BADGES COLUMN FOR CLOSED ALERTS WITH PENDING REPORT
  closedStatusBadgesCol: {
    alignItems: 'flex-end',
    gap: 3,
  },
  statusBadgeGreenShort: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00FF88',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeAmberSub: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  // PROMPT 40: AMBER/ORANGE BADGE FOR CLOSED ALERTS WITH PENDING REPORT
  statusBadgeAmber: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeAmberText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  // PROMPT 40: HIGHLIGHTED CONTRACTOR COMPANY BADGE ON ACTIVE ALERTS COMPACT CARD
  contractorBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A202D',
    borderWidth: 1,
    borderColor: '#00E5FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    maxWidth: '55%',
  },
  contractorBadgeHeaderText: {
    color: '#00E5FF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  alertFaultTitle: {
    color: '#FF3333',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  alertFaultTitleGreen: {
    color: '#00FF88',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  alertEquipmentTag: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  alertMetaText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#263C52',
    marginVertical: 4,
  },
  structuredFieldRow: {
    gap: 2,
    marginBottom: 4,
  },
  fieldLabel: {
    color: '#8CAAD0',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  fieldValueBold: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  contractorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E1A26',
    borderWidth: 1,
    borderColor: '#1C374D',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 2,
  },
  contractorBoxText: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '800',
  },
  itoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E1A26',
    borderWidth: 1,
    borderColor: '#3D3510',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 2,
  },
  itoBoxText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '800',
  },

  trackingSectionBox: {
    backgroundColor: '#0E1722',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#22384E',
    padding: SPACING.md,
    marginTop: 6,
    gap: 6,
  },
  trackingSectionBoxGreen: {
    backgroundColor: '#0A1C16',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#154534',
    padding: SPACING.md,
    marginTop: 6,
    gap: 6,
  },
  trackingHeaderTitle: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  trackingHeaderTitleGreen: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  closedReportText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputLabelSmall: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
  },
  textInputArea: {
    backgroundColor: '#162331',
    borderWidth: 1,
    borderColor: '#2A3F55',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: COLORS.textPrimary,
    fontSize: 12,
  },
  photosBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  photoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2D3D',
    borderWidth: 1,
    borderColor: '#2A3F55',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  photoTagText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '700',
  },
  photoTagGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2D22',
    borderWidth: 1,
    borderColor: '#17523C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  photoTagGreenText: {
    color: '#00FF88',
    fontSize: 10,
    fontWeight: '700',
  },
  attachPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  attachPhotoBtnText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },

  closeAlertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FF88',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 6,
  },
  closeAlertBtnDisabled: {
    backgroundColor: '#3D4D5C',
    opacity: 0.75,
  },
  closeAlertBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // PROMPT 39: INTERLOCK TOGGLE & ERROR BANNER STYLES
  interlockBoxContainer: {
    backgroundColor: '#0F1824',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#263C52',
    padding: 10,
    marginTop: 8,
    gap: 6,
  },
  interlockBoxLabel: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  interlockToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  interlockToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  interlockBtnInactive: {
    backgroundColor: '#162331',
    borderColor: '#2A3F55',
  },
  interlockBtnGreenActive: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  interlockBtnAmberActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  interlockToggleText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '900',
  },
  interlockToggleTextDark: {
    color: '#000000',
    fontWeight: '900',
  },
  interlockErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CC0000',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 6,
  },
  interlockErrorText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  techReportBtnHalfWarning: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A323D',
    borderWidth: 1,
    borderColor: '#444444',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  techReportBtnHalfWarningText: {
    color: '#AAAAAA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  techReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FF88',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 6,
  },
  techReportBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // GENERATE FORM STYLES
  generateFormCard: {
    backgroundColor: '#182433',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#263C52',
    padding: SPACING.lg,
    gap: 10,
  },
  formTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  formSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  formFieldLabel: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  optionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionBtn: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#0F1722',
    borderWidth: 1.5,
    borderColor: '#263C52',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  optionBtnSmall: {
    backgroundColor: '#0F1722',
    borderWidth: 1.5,
    borderColor: '#263C52',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  optionBtnActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  optionBtnText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '800',
  },
  optionBtnTextSmall: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '800',
  },
  optionBtnTextActive: {
    color: '#000000',
    fontWeight: '900',
  },
  selectBoxContainer: {
    gap: 6,
  },
  selectBoxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1722',
    borderWidth: 1.5,
    borderColor: '#263C52',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  selectBoxItemActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  selectBoxText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  selectBoxTextActive: {
    color: '#000000',
    fontWeight: '900',
  },
  inputBoxOuter: {
    backgroundColor: '#0F1722',
    borderWidth: 1.5,
    borderColor: '#263C52',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textInputSingle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    paddingVertical: 6,
  },
  attachPhotoBtnLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  attachPhotoBtnLargeText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00FF88',
    padding: 10,
    borderRadius: 6,
    marginTop: 4,
  },
  successBannerText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
  },
  submitFormBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3333',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 6,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  submitFormBtnDisabled: {
    opacity: 0.75,
    backgroundColor: '#FFB300',
  },
  submitFormBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // PROMPT 38: OT REQUIRED ATTACHMENT & ERROR BANNER STYLES
  attachOtBtnRequired: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  attachOtBtnWarning: {
    backgroundColor: '#FFD700',
    borderColor: '#FF8F00',
  },
  attachOtBtnSuccess: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  attachOtBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  otStatusBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A2519',
    borderWidth: 1,
    borderColor: '#00FF88',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  otStatusBadgeGreenText: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '800',
  },
  otStatusBadgeRed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A0C0C',
    borderWidth: 1,
    borderColor: '#FF3333',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  otStatusBadgeRedText: {
    color: '#FF3333',
    fontSize: 11,
    fontWeight: '800',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3333',
    padding: 10,
    borderRadius: 6,
    marginTop: 4,
  },
  errorBannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  signAuditMandanteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00E5FF',
    borderRadius: GLOVE_TARGETS.borderRadius,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 6,
    minHeight: 44,
  },
  signAuditMandanteBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  auditMandanteConfirmedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#062016',
    borderWidth: 1.5,
    borderColor: '#00FF88',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  auditMandanteConfirmedText: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '900',
  },
  auditMandanteTimestampText: {
    color: '#8CAAD0',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  // ─── CONFIABILIDAD BLOCK ───────────────────────────────────────────────────
  confiabilidadBlock: {
    backgroundColor: '#0B1529',
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    width: '100%',
  },
  confiabilidadHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  confiabilidadHeaderText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
    flex: 1,
  },
  confiabilidadSubtext: {
    color: '#8CAAD0',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 10,
  },
  confiabilidadFieldLabel: {
    color: '#C0D0E8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: 8,
    marginBottom: 5,
  },
  confiabilidadSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  confiabilidadChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2A3D55',
    backgroundColor: '#111E33',
    marginBottom: 4,
  },
  confiabilidadChipSelected: {
    backgroundColor: '#00E5FF',
    borderColor: '#00E5FF',
  },
  confiabilidadChipText: {
    color: '#8CAAD0',
    fontSize: 10,
    fontWeight: '700',
  },
  confiabilidadChipTextSelected: {
    color: '#000000',
    fontWeight: '900',
  },
  confiabilidadInput: {
    backgroundColor: '#0D1A2C',
    borderWidth: 1,
    borderColor: '#2A3D55',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    minHeight: 38,
  },

  // ─── CONFIABILIDAD RESUMEN (después de firmado) ───────────────────────────
  confiabilidadResumenBox: {
    backgroundColor: '#061526',
    borderWidth: 1,
    borderColor: '#00E5FF',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    width: '100%',
  },
  confiabilidadResumenTitle: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  confiabilidadResumenRow: {
    color: '#8CAAD0',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 3,
  },
  confiabilidadResumenValue: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // ─── ASSET PICKER MODAL (PROMPT 51) ───────────────────────────
  assetPickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1628',
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 4,
    minHeight: 52,
  },
  assetPickerTriggerTag: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  assetPickerTriggerName: {
    color: '#C0D0E8',
    fontSize: 12,
    fontWeight: '600',
  },
  assetPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  assetPickerModal: {
    backgroundColor: '#0B1529',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    width: '100%',
    maxWidth: 560,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  assetPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00274D',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00E5FF',
  },
  assetPickerHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    flex: 1,
    marginRight: 8,
  },
  assetPickerSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1A2C',
    borderBottomWidth: 1,
    borderBottomColor: '#1A2D45',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  assetPickerSearchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    paddingVertical: 4,
  },
  assetPickerList: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  assetPickerAreaHeader: {
    color: '#8CAAD0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2D45',
    marginTop: 4,
    marginBottom: 2,
  },
  assetPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 7,
    marginBottom: 2,
    gap: 10,
  },
  assetPickerItemSelected: {
    backgroundColor: '#061526',
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  assetPickerItemTagBadge: {
    backgroundColor: '#1A2D45',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    minWidth: 68,
    alignItems: 'center',
  },
  assetPickerItemTag: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  assetPickerItemName: {
    color: '#E0E8F5',
    fontSize: 12,
    fontWeight: '700',
  },
  assetPickerItemSub: {
    color: '#6A84A0',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
});

