import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, SPACING, GLOVE_TARGETS } from '../theme';
import { useWorkOrders } from '../context/WorkOrdersContext';
import { 
  Wrench, 
  Inbox, 
  Cog, 
  Scroll, 
  CheckCircle2, 
  Building2, 
  UserCheck, 
  Camera, 
  FileText, 
  PlayCircle, 
  Clock, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Tag,
  Paperclip,
  UploadCloud
} from 'lucide-react-native';

export default function OperativoOtMacroblock({ navigation }) {
  const [activeTab, setActiveTab] = useState('NUEVAS'); // 'NUEVAS', 'DESARROLLO', or 'HISTORIAL'

  // PROMPT 46: SHIFT FILTER STATE ('DIA', 'NOCHE', or 'TODOS')
  const [shiftFilter, setShiftFilter] = useState('TODOS');

  // PROMPT 46: AUTOMATED TIMESTAMP & SHIFT GENERATOR HELPER
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

  // PROMPT 45: Accordion expansion state for OT cards in Operativo profile
  const [expandedOtId, setExpandedOtId] = useState(null);

  const toggleOtExpand = (otId) => {
    setExpandedOtId(prev => prev === otId ? null : otId);
  };

  // PROMPT 45: Reset and auto-collapse all expanded OT cards when switching tabs
  const handleTabSwitch = (targetTab) => {
    setActiveTab(targetTab);
    setExpandedOtId(null);
  };

  // PROMPT 50: CENTRALIZED WORK ORDERS CONTEXT HOOK
  const {
    workOrders,
    acceptWorkOrder,
    finishWorkOrder,
    regularizeWorkOrderReport,
    setPendingReportFile,
    updateWorkOrderNotes,
    addPhotoToWorkOrder,
  } = useWorkOrders();

  // Local state for radio selection of report option in 'DESARROLLO' before finishing
  const [reportOptionMap, setReportOptionMap] = useState({});

  // Unified lists mapped from global state
  const newOtList = workOrders.filter(item => item.estadoOperativo === 'NUEVA');
  const inProgressOtList = workOrders.filter(item => item.estadoOperativo === 'DESARROLLO');
  const historyOtList = workOrders.filter(item => item.estadoOperativo === 'HISTORIAL');

  // PROMPT 48: Simulación de carga de informe técnico pendiente (Etapa 1 -> archivo adjunto listo)
  const handleAttachPendingReport = (otId) => {
    const sampleFileName = `informe_mantenimiento_${otId.toLowerCase()}_regularizado.pdf`;
    setPendingReportFile(otId, sampleFileName);
  };

  // PROMPT 48 & 50: Solicitar revisión de informe -> Transición automática de Etapa 1 a Etapa 2 (sincroniza con Mandante)
  const handleRequestReportReview = (otId) => {
    regularizeWorkOrderReport(otId);
  };

  // PROMPT 47: Handler for Interlock report choice selection in 'DESARROLLO'
  const handleSetReportOption = (otId, option) => {
    setReportOptionMap(prev => ({
      ...prev,
      [otId]: option,
    }));
  };

  // Action: Accept OT (Move from Nuevas -> En Desarrollo, Flujo B)
  const handleAcceptOt = (otId) => {
    acceptWorkOrder(otId);
    setExpandedOtId(null);
    setActiveTab('DESARROLLO');
  };

  // PROMPT 47 & 50: Action: Finish OT (Move from En Desarrollo -> Historial with report interlock validation, Flujo C)
  const handleFinishOt = (otId) => {
    const targetOt = inProgressOtList.find(item => item.id === otId);
    if (!targetOt) return;

    const chosenOption = reportOptionMap[otId] || targetOt.reportOption;
    if (!chosenOption) {
      return;
    }

    finishWorkOrder(otId, {
      reportOption: chosenOption,
      fieldNotes: targetOt.fieldNotes,
      photos: targetOt.photos,
    });

    setExpandedOtId(null);
    setActiveTab('HISTORIAL');
  };

  // Action: Add photo evidence to an in-progress OT
  const handleAddPhoto = (otId) => {
    const photoName = `evidencia_ot_${Date.now().toString().slice(-4)}.jpg`;
    addPhotoToWorkOrder(otId, photoName);
  };

  // Action: Update field notes of an in-progress OT
  const handleUpdateNotes = (otId, text) => {
    updateWorkOrderNotes(otId, text);
  };

  // PROMPT 46: CHRONOLOGICAL SORTING & SHIFT FILTERING FOR OT LISTS
  const filteredNewOtList = newOtList
    .filter(ot => {
      if (shiftFilter === 'DIA') return ot.shiftType === 'DIA';
      if (shiftFilter === 'NOCHE') return ot.shiftType === 'NOCHE';
      return true;
    })
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const filteredInProgressOtList = inProgressOtList
    .filter(ot => {
      if (shiftFilter === 'DIA') return ot.shiftType === 'DIA';
      if (shiftFilter === 'NOCHE') return ot.shiftType === 'NOCHE';
      return true;
    })
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const filteredHistoryOtList = historyOtList
    .filter(ot => {
      if (shiftFilter === 'DIA') return ot.shiftType === 'DIA';
      if (shiftFilter === 'NOCHE') return ot.shiftType === 'NOCHE';
      return true;
    })
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return (
    <View style={styles.macroContainer}>
      
      {/* MACROBLOCK HEADER */}
      <View style={styles.macroHeaderRow}>
        <View style={styles.headerTitleCol}>
          <View style={styles.roleBadgeOperativo}>
            <Wrench color="#000000" size={14} style={{ marginRight: 4 }} />
            <Text style={styles.roleBadgeOperativoText}>EXCLUSIVO PERFIL OPERATIVO</Text>
          </View>
          <Text style={styles.macroTitleText}>ORDENES DE TRABAJO OT</Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{newOtList.length + inProgressOtList.length} ACTIVAS</Text>
        </View>
      </View>

      {/* PROMPT 45: 3-TAB NAVIGATION BAR WITH AUTO-COLLAPSE ON TAB SWITCH */}
      <View style={styles.tabBarRow}>
        
        {/* TAB 1: TAREAS NUEVAS */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            styles.tabButtonNewBorder,
            activeTab === 'NUEVAS' && styles.tabButtonActiveBlue
          ]}
          activeOpacity={0.85}
          onPress={() => handleTabSwitch('NUEVAS')}
        >
          <Inbox color={activeTab === 'NUEVAS' ? '#000000' : '#00E5FF'} size={14} style={{ marginRight: 4 }} />
          <Text style={[styles.tabButtonText, activeTab === 'NUEVAS' && styles.tabButtonTextDark]} numberOfLines={1}>
            [ 📥 NUEVAS ({newOtList.length}) ]
          </Text>
        </TouchableOpacity>

        {/* TAB 2: TAREAS EN DESARROLLO */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            styles.tabButtonProgressBorder,
            activeTab === 'DESARROLLO' && styles.tabButtonActiveYellow
          ]}
          activeOpacity={0.85}
          onPress={() => handleTabSwitch('DESARROLLO')}
        >
          <Cog color={activeTab === 'DESARROLLO' ? '#000000' : '#FFD700'} size={14} style={{ marginRight: 4 }} />
          <Text style={[styles.tabButtonText, activeTab === 'DESARROLLO' && styles.tabButtonTextDark]} numberOfLines={1}>
            [ ⚙️ EN DESARROLLO ({inProgressOtList.length}) ]
          </Text>
        </TouchableOpacity>

        {/* TAB 3: HISTORIAL DE TAREAS */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            styles.tabButtonHistoryBorder,
            activeTab === 'HISTORIAL' && styles.tabButtonActiveGreen
          ]}
          activeOpacity={0.85}
          onPress={() => handleTabSwitch('HISTORIAL')}
        >
          <Scroll color={activeTab === 'HISTORIAL' ? '#000000' : '#00FF88'} size={14} style={{ marginRight: 4 }} />
          <Text style={[styles.tabButtonText, activeTab === 'HISTORIAL' && styles.tabButtonTextDark]} numberOfLines={1}>
            [ 📜 HISTORIAL ({historyOtList.length}) ]
          </Text>
        </TouchableOpacity>

      </View>

      {/* PROMPT 46: SHIFT FILTER BAR FOR TURNO A (DÍA / NOCHE / JORNADA COMPLETA) */}
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

      {/* TAB 1: TAREAS NUEVAS CONTENT (PROMPT 45 & 46: 2-COLUMN GRID, ACCORDION & SHIFT FILTER) */}
      {activeTab === 'NUEVAS' && (
        <View style={styles.tabContentContainer}>
          {filteredNewOtList.length === 0 ? (
            <View style={styles.emptyCard}>
              <CheckCircle2 color="#00E5FF" size={36} />
              <Text style={styles.emptyTitle}>NO HAY OT NUEVAS EN ESTA JORNADA</Text>
              <Text style={styles.emptySub}>No se registraron órdenes de trabajo en el turno seleccionado.</Text>
            </View>
          ) : (
            <View style={styles.alertsHorizontalGrid}>
              {filteredNewOtList.map(ot => {
                const isExpanded = expandedOtId === ot.id;
                return (
                  <View 
                    key={ot.id} 
                    style={[
                      styles.otCardBase,
                      isExpanded ? styles.otCardExpandedFull : styles.otCardCompactCol,
                      styles.otCardBlueBorder
                    ]}
                  >
                    
                    {/* ACCORDION HEADER (ALWAYS VISIBLE & CLICKABLE FOR TOGGLE) */}
                    <TouchableOpacity
                      style={styles.accordionHeaderBtn}
                      activeOpacity={0.85}
                      onPress={() => toggleOtExpand(ot.id)}
                    >
                      {/* Header Badges */}
                      <View style={styles.cardBadgesRow}>
                        <View style={styles.areaBadge}>
                          <Tag color="#00E5FF" size={12} style={{ marginRight: 4 }} />
                          <Text style={styles.areaBadgeText}>[ 🏢 {ot.area} ]</Text>
                        </View>
                        
                        <View style={styles.statusBadgeBlue}>
                          <Clock color="#000000" size={12} style={{ marginRight: 4 }} />
                          <Text style={styles.statusBadgeBlueText}>{ot.status}</Text>
                        </View>
                      </View>

                      {/* OT Title & Equipment */}
                      <Text style={styles.otIdText}>{ot.id} • TAG: {ot.equipmentTag}</Text>
                      <Text style={styles.equipmentTitleText}>{ot.equipmentName}</Text>

                      {/* PROMPT 46: AUTOMATED TIMESTAMP & SHIFT SUBTEXT BADGE */}
                      <View style={styles.timestampSubRow}>
                        <Clock color="#8CAAD0" size={11} style={{ marginRight: 4 }} />
                        <Text style={styles.timestampSubText}>🕒 {ot.date}</Text>
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
                        <View style={styles.cardDivider} />

                        {/* Structured Fields (PROMPT 47: EMISOR DE OT + ITO DESIGNADO, CONTRATISTA REMOVED) */}
                        <View style={styles.structuredFieldRow}>
                          <Text style={styles.fieldLabel}>EMISOR DE OT & ITO DESIGNADO:</Text>
                          <View style={styles.emisorItoContainer}>
                            <View style={styles.mandanteBox}>
                              <UserCheck color="#FFD700" size={13} style={{ marginRight: 6 }} />
                              <Text style={styles.mandanteBoxText}>EMISOR: {ot.mandanteIssuer}</Text>
                            </View>
                            <View style={styles.itoBadgeBox}>
                              <ShieldCheck color="#00E5FF" size={13} style={{ marginRight: 6 }} />
                              <Text style={styles.itoBadgeBoxText}>ITO: {ot.itoAssigned || 'Ing. Roberto Arancibia M1'}</Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.structuredFieldRow}>
                          <Text style={styles.fieldLabel}>DETALLES DE LA TAREA / TRABAJO REQUERIDO:</Text>
                          <Text style={styles.taskDetailsText}>{ot.taskDetails}</Text>
                        </View>

                        {/* Action Button: Iniciar Tarea */}
                        <TouchableOpacity
                          style={styles.acceptOtBtn}
                          activeOpacity={0.85}
                          onPress={() => handleAcceptOt(ot.id)}
                        >
                          <PlayCircle color="#000000" size={18} style={{ marginRight: 6 }} />
                          <Text style={styles.acceptOtBtnText}>[ 🚀 INICIAR TAREA / ACEPTAR OT ]</Text>
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

      {/* TAB 2: TAREAS EN DESARROLLO CONTENT (PROMPT 45 & 46: 2-COLUMN GRID, ACCORDION & SHIFT FILTER) */}
      {activeTab === 'DESARROLLO' && (
        <View style={styles.tabContentContainer}>
          {filteredInProgressOtList.length === 0 ? (
            <View style={styles.emptyCard}>
              <CheckCircle2 color="#FFD700" size={36} />
              <Text style={styles.emptyTitle}>NO HAY TAREAS EN DESARROLLO EN ESTA JORNADA</Text>
              <Text style={styles.emptySub}>No se registraron tareas activas en el turno seleccionado.</Text>
            </View>
          ) : (
            <View style={styles.alertsHorizontalGrid}>
              {filteredInProgressOtList.map(ot => {
                const isExpanded = expandedOtId === ot.id;
                const currentReportOption = reportOptionMap[ot.id] !== undefined ? reportOptionMap[ot.id] : ot.reportOption;
                return (
                  <View 
                    key={ot.id} 
                    style={[
                      styles.otCardBase,
                      isExpanded ? styles.otCardExpandedFull : styles.otCardCompactCol,
                      styles.otCardYellowBorder
                    ]}
                  >
                    
                    {/* ACCORDION HEADER (ALWAYS VISIBLE & CLICKABLE FOR TOGGLE) */}
                    <TouchableOpacity
                      style={styles.accordionHeaderBtn}
                      activeOpacity={0.85}
                      onPress={() => toggleOtExpand(ot.id)}
                    >
                      {/* Header Badges */}
                      <View style={styles.cardBadgesRow}>
                        <View style={styles.areaBadgeYellow}>
                          <Tag color="#FFD700" size={12} style={{ marginRight: 4 }} />
                          <Text style={styles.areaBadgeYellowText}>[ 🏢 {ot.area} ]</Text>
                        </View>
                        
                        <View style={styles.statusBadgeYellow}>
                          <Cog color="#000000" size={12} style={{ marginRight: 4 }} />
                          <Text style={styles.statusBadgeYellowText}>{ot.status}</Text>
                        </View>
                      </View>

                      {/* OT Title & Equipment */}
                      <Text style={styles.otIdTextYellow}>{ot.id} • TAG: {ot.equipmentTag}</Text>
                      <Text style={styles.equipmentTitleText}>{ot.equipmentName}</Text>

                      {/* PROMPT 46: AUTOMATED TIMESTAMP & SHIFT SUBTEXT BADGE */}
                      <View style={styles.timestampSubRow}>
                        <Clock color="#8CAAD0" size={11} style={{ marginRight: 4 }} />
                        <Text style={styles.timestampSubText}>🕒 {ot.date}</Text>
                      </View>

                      {/* EXPAND/COLLAPSE INDICATOR BADGE */}
                      <View style={[styles.expandToggleBadgeYellow, isExpanded && styles.expandToggleBadgeActiveYellow]}>
                        {isExpanded ? (
                          <>
                            <ChevronUp color="#000000" size={14} style={{ marginRight: 4 }} />
                            <Text style={styles.expandToggleBadgeTextActive}>[ 🔺 CONTRAER DETALLE ]</Text>
                          </>
                        ) : (
                          <>
                            <ChevronDown color="#FFD700" size={14} style={{ marginRight: 4 }} />
                            <Text style={styles.expandToggleBadgeYellowText}>[ 🔻 EXPANDIR DETALLE ]</Text>
                          </>
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* DETAILED ACCORDION BODY (RENDERED WHEN EXPANDED) */}
                    {isExpanded && (
                      <View style={styles.accordionBodyContainer}>
                        <View style={styles.cardDivider} />

                        {/* Structured Fields (PROMPT 47: EMISOR DE OT + ITO DESIGNADO, CONTRATISTA REMOVED) */}
                        <View style={styles.structuredFieldRow}>
                          <Text style={styles.fieldLabel}>EMISOR DE OT & ITO DESIGNADO:</Text>
                          <View style={styles.emisorItoContainer}>
                            <View style={styles.mandanteBox}>
                              <UserCheck color="#FFD700" size={13} style={{ marginRight: 6 }} />
                              <Text style={styles.mandanteBoxText}>EMISOR: {ot.mandanteIssuer}</Text>
                            </View>
                            <View style={styles.itoBadgeBox}>
                              <ShieldCheck color="#00E5FF" size={13} style={{ marginRight: 6 }} />
                              <Text style={styles.itoBadgeBoxText}>ITO: {ot.itoAssigned || 'Ing. Roberto Arancibia M1'}</Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.structuredFieldRow}>
                          <Text style={styles.fieldLabel}>DESCRIPCIÓN DE LA TAREA:</Text>
                          <Text style={styles.taskDetailsText}>{ot.taskDetails}</Text>
                        </View>

                        {/* TRACKING & EVIDENCES SECTION */}
                        <View style={styles.trackingBox}>
                          <Text style={styles.trackingTitle}>SEGUIMIENTO Y EVIDENCIAS DE TERRENO</Text>
                          
                          <Text style={styles.inputLabel}>NOTAS DE TERRENO / AVANCE DE TRABAJO:</Text>
                          <TextInput
                            style={styles.textInputArea}
                            multiline
                            numberOfLines={3}
                            placeholder="Redacte observaciones técnicas, repuestos montados, mediciones..."
                            placeholderTextColor="#64748B"
                            value={ot.fieldNotes}
                            onChangeText={(text) => handleUpdateNotes(ot.id, text)}
                          />

                          <Text style={styles.inputLabel}>FOTOGRAFÍAS DE EVIDENCIA ADJUNTAS:</Text>
                          <View style={styles.photosRow}>
                            {ot.photos.map((photo, pIdx) => (
                              <View key={pIdx} style={styles.photoTag}>
                                <FileText color="#FFD700" size={11} style={{ marginRight: 4 }} />
                                <Text style={styles.photoTagText}>{photo}</Text>
                              </View>
                            ))}

                            <TouchableOpacity
                              style={styles.attachPhotoBtn}
                              activeOpacity={0.8}
                              onPress={() => handleAddPhoto(ot.id)}
                            >
                              <Camera color="#000000" size={12} style={{ marginRight: 4 }} />
                              <Text style={styles.attachPhotoBtnText}>[ 📷 ADJUNTAR EVIDENCIA ]</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* PROMPT 47: SELECTOR INTERBLOQUEO DE CIERRE CON INFORME */}
                        <View style={styles.interlockContainer}>
                          <Text style={styles.interlockTitle}>REGISTRO OBLIGATORIO DE INFORME TÉCNICO:</Text>
                          <View style={styles.interlockRow}>
                            <TouchableOpacity
                              style={[
                                styles.interlockBtn,
                                currentReportOption === 'ENTREGADO' && styles.interlockBtnDelivered
                              ]}
                              activeOpacity={0.85}
                              onPress={() => handleSetReportOption(ot.id, 'ENTREGADO')}
                            >
                              <FileText color={currentReportOption === 'ENTREGADO' ? '#000000' : '#00FF88'} size={14} style={{ marginRight: 6 }} />
                              <Text style={[styles.interlockBtnText, currentReportOption === 'ENTREGADO' && styles.interlockBtnTextDark]}>
                                [ 📄 SUBIR INFORME DE MANTENCIÓN ]
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[
                                styles.interlockBtn,
                                currentReportOption === 'PENDIENTE' && styles.interlockBtnPending
                              ]}
                              activeOpacity={0.85}
                              onPress={() => handleSetReportOption(ot.id, 'PENDIENTE')}
                            >
                              <Clock color={currentReportOption === 'PENDIENTE' ? '#000000' : '#FFD700'} size={14} style={{ marginRight: 6 }} />
                              <Text style={[styles.interlockBtnText, currentReportOption === 'PENDIENTE' && styles.interlockBtnTextDark]}>
                                [ ⏳ DEJAR INFORME PENDIENTE ]
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Action Button: Finalizar Tarea */}
                        <TouchableOpacity
                          style={[
                            styles.finishOtBtn,
                            !currentReportOption && styles.finishOtBtnDisabled
                          ]}
                          activeOpacity={currentReportOption ? 0.85 : 1}
                          onPress={() => handleFinishOt(ot.id)}
                        >
                          <CheckCircle2 color={currentReportOption ? '#000000' : '#64748B'} size={18} style={{ marginRight: 6 }} />
                          <Text style={[styles.finishOtBtnText, !currentReportOption && styles.finishOtBtnTextDisabled]}>
                            {currentReportOption 
                              ? '[ ✅ FINALIZAR TAREA Y SOLICITAR REVISIÓN ]' 
                              : '[ 🔒 SELECCIONE ESTADO DEL INFORME PARA FINALIZAR ]'}
                          </Text>
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

      {/* TAB 3: HISTORIAL DE TAREAS CONTENT (PROMPT 48: COEXISTENCIA DE LAS 3 ETAPAS DE CIERRE) */}
      {activeTab === 'HISTORIAL' && (
        <View style={styles.tabContentContainer}>
          {filteredHistoryOtList.length === 0 ? (
            <View style={styles.emptyCard}>
              <CheckCircle2 color="#00FF88" size={36} />
              <Text style={styles.emptyTitle}>NO HAY OT EN EL HISTORIAL DE ESTA JORNADA</Text>
              <Text style={styles.emptySub}>No se registraron órdenes de trabajo finalizadas en el turno seleccionado.</Text>
            </View>
          ) : (
            <View style={styles.alertsHorizontalGrid}>
              {filteredHistoryOtList.map(ot => {
                const isExpanded = expandedOtId === ot.id;
                const isStage3 = ot.status === 'TAREA CERRADA' || ot.operativoStatus === 'TAREA CERRADA' || !!ot.firmaMandante?.firmado;
                const isStage2 = !isStage3 && (ot.status === 'TAREA FINALIZADA & ESPERANDO REVISIÓN' || ot.operativoStatus === 'TAREA FINALIZADA & ESPERANDO REVISIÓN');
                const isStage1 = !isStage3 && !isStage2;

                return (
                  <View 
                    key={ot.id} 
                    style={[
                      styles.otCardBase,
                      isExpanded ? styles.otCardExpandedFullGreen : styles.otCardCompactCol,
                      isStage1 && styles.otCardYellowBorder,
                      isStage2 && styles.otCardAmberBorder,
                      isStage3 && styles.otCardGreenBorder
                    ]}
                  >
                    
                    {/* ACCORDION HEADER (ALWAYS VISIBLE & CLICKABLE FOR TOGGLE) */}
                    <TouchableOpacity
                      style={styles.accordionHeaderBtn}
                      activeOpacity={0.85}
                      onPress={() => toggleOtExpand(ot.id)}
                    >
                      {/* Header Badges (PROMPT 48: 3 STAGES BADGES) */}
                      <View style={styles.cardBadgesRow}>
                        {/* Area Badge */}
                        <View style={[
                          isStage1 && styles.areaBadgeYellow,
                          isStage2 && styles.areaBadgeAmber,
                          isStage3 && styles.areaBadgeGreen
                        ]}>
                          <Tag 
                            color={isStage1 ? '#FFD700' : isStage2 ? '#FF9100' : '#00FF88'} 
                            size={12} 
                            style={{ marginRight: 4 }} 
                          />
                          <Text style={[
                            isStage1 && styles.areaBadgeYellowText,
                            isStage2 && styles.areaBadgeAmberText,
                            isStage3 && styles.areaBadgeGreenText
                          ]}>
                            [ 🏢 {ot.area} ]
                          </Text>
                        </View>
                        
                        {/* Status Stage Badge */}
                        {isStage1 && (
                          <View style={styles.statusBadgeYellowWarning}>
                            <Clock color="#000000" size={12} style={{ marginRight: 4 }} />
                            <Text style={styles.statusBadgeYellowWarningText}>
                              [ ⚠️ CIERRE PENDIENTE / INFORME REQUERIDO ]
                            </Text>
                          </View>
                        )}
                        {isStage2 && (
                          <View style={styles.statusBadgeAmberWaiting}>
                            <Clock color="#000000" size={12} style={{ marginRight: 4 }} />
                            <Text style={styles.statusBadgeAmberWaitingText}>
                              [ ⏳ TAREA FINALIZADA & ESPERANDO REVISIÓN ]
                            </Text>
                          </View>
                        )}
                        {isStage3 && (
                          <View style={styles.statusBadgeGreenClosed}>
                            <ShieldCheck color="#000000" size={12} style={{ marginRight: 4 }} />
                            <Text style={styles.statusBadgeGreenClosedText}>
                              [ 🟢 TAREA CERRADA ]
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* OT Title & Equipment */}
                      <Text style={[
                        isStage1 && styles.otIdTextYellow,
                        isStage2 && styles.otIdTextAmber,
                        isStage3 && styles.otIdTextGreen
                      ]}>
                        {ot.id} • TAG: {ot.equipmentTag}
                      </Text>
                      <Text style={styles.equipmentTitleText}>{ot.equipmentName}</Text>

                      {/* PROMPT 46: AUTOMATED TIMESTAMP & SHIFT SUBTEXT BADGE */}
                      <View style={styles.timestampSubRow}>
                        <Clock color="#8CAAD0" size={11} style={{ marginRight: 4 }} />
                        <Text style={styles.timestampSubText}>🕒 {ot.closedDate || ot.date}</Text>
                      </View>

                      {/* EXPAND/COLLAPSE INDICATOR BADGE */}
                      <View style={[
                        isStage1 && styles.expandToggleBadgeYellow,
                        isStage2 && styles.expandToggleBadgeAmber,
                        isStage3 && styles.expandToggleBadgeGreen,
                        isExpanded && (
                          isStage1 
                            ? styles.expandToggleBadgeActiveYellow 
                            : isStage2 
                              ? styles.expandToggleBadgeActiveAmber 
                              : styles.expandToggleBadgeActiveGreen
                        )
                      ]}>
                        {isExpanded ? (
                          <>
                            <ChevronUp color="#000000" size={14} style={{ marginRight: 4 }} />
                            <Text style={styles.expandToggleBadgeTextActive}>[ 🔺 CONTRAER DETALLE ]</Text>
                          </>
                        ) : (
                          <>
                            <ChevronDown 
                              color={isStage1 ? '#FFD700' : isStage2 ? '#FF9100' : '#00FF88'} 
                              size={14} 
                              style={{ marginRight: 4 }} 
                            />
                            <Text style={[
                              isStage1 && styles.expandToggleBadgeYellowText,
                              isStage2 && styles.expandToggleBadgeAmberText,
                              isStage3 && styles.expandToggleBadgeGreenText
                            ]}>
                              [ 🔻 EXPANDIR DETALLE ]
                            </Text>
                          </>
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* DETAILED ACCORDION BODY (RENDERED WHEN EXPANDED) */}
                    {isExpanded && (
                      <View style={styles.accordionBodyContainer}>
                        <View style={styles.cardDivider} />

                        {/* Structured Fields (PROMPT 47: EMISOR DE OT + ITO DESIGNADO, CONTRATISTA REMOVED) */}
                        <View style={styles.structuredFieldRow}>
                          <Text style={styles.fieldLabel}>EMISOR DE OT & ITO DESIGNADO:</Text>
                          <View style={styles.emisorItoContainer}>
                            <View style={styles.mandanteBox}>
                              <UserCheck color="#FFD700" size={13} style={{ marginRight: 6 }} />
                              <Text style={styles.mandanteBoxText}>EMISOR: {ot.mandanteIssuer}</Text>
                            </View>
                            <View style={styles.itoBadgeBox}>
                              <ShieldCheck color="#00E5FF" size={13} style={{ marginRight: 6 }} />
                              <Text style={styles.itoBadgeBoxText}>ITO: {ot.itoAssigned || 'Ing. Roberto Arancibia M1'}</Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.structuredFieldRow}>
                          <Text style={styles.fieldLabel}>TRABAJO EJECUTADO:</Text>
                          <Text style={styles.taskDetailsText}>{ot.taskDetails}</Text>
                        </View>

                        {/* TRACKING SUMMARY */}
                        <View style={styles.trackingBoxGreen}>
                          <Text style={styles.trackingTitleGreen}>INFORME Y PROTOCOLO DE CIERRE EN TERRENO</Text>
                          <Text style={styles.closedNotesText}>"{ot.fieldNotes}"</Text>

                          <View style={styles.photosRow}>
                            {ot.photos.map((photo, pIdx) => (
                              <View key={pIdx} style={styles.photoTagGreen}>
                                <FileText color="#00FF88" size={11} style={{ marginRight: 4 }} />
                                <Text style={styles.photoTagGreenText}>{photo}</Text>
                              </View>
                            ))}
                          </View>
                        </View>

                        {/* PROMPT 48: STAGE-SPECIFIC ACTIONS & AUDIT TRACEABILITY */}
                        
                        {/* 1. ETAPA 1 (CIERRE PENDIENTE): MECANISMO DE REGULARIZACIÓN */}
                        {isStage1 && (
                          <View style={styles.regularizationBox}>
                            <Text style={styles.regularizationTitle}>REGULARIZACIÓN DIFERIDA DE INFORME TÉCNICO (ETAPA 1):</Text>
                            
                            {ot.pendingReportFile ? (
                              <View style={styles.uploadedFileRow}>
                                <FileText color="#FFD700" size={14} style={{ marginRight: 6 }} />
                                <Text style={styles.uploadedFileText}>DOCUMENTO CARGADO: {ot.pendingReportFile}</Text>
                              </View>
                            ) : (
                              <Text style={styles.regularizationSubtext}>
                                La tarea se cerró provisionalmente sin informe adjunto. Cargue el archivo técnico para habilitar la solicitud de revisión con Mandante.
                              </Text>
                            )}

                            {ot.pendingReportFile ? (
                              <TouchableOpacity
                                style={styles.requestReviewBtn}
                                activeOpacity={0.85}
                                onPress={() => handleRequestReportReview(ot.id)}
                              >
                                <UploadCloud color="#000000" size={16} style={{ marginRight: 6 }} />
                                <Text style={styles.requestReviewBtnText}>[ 📤 SOLICITAR REVISIÓN DE INFORME ]</Text>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                style={styles.uploadPendingBtn}
                                activeOpacity={0.85}
                                onPress={() => handleAttachPendingReport(ot.id)}
                              >
                                <Paperclip color="#000000" size={16} style={{ marginRight: 6 }} />
                                <Text style={styles.uploadPendingBtnText}>[ 📎 SUBIR INFORME PENDIENTE ]</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        )}

                        {/* 2. ETAPA 2 (ESPERANDO REVISIÓN POR MANDANTE) */}
                        {isStage2 && (
                          <>
                            <View style={styles.waitingReviewBox}>
                              <Clock color="#FF9100" size={14} style={{ marginRight: 6 }} />
                              <Text style={styles.waitingReviewText}>
                                Informe entregado y recepcionado. En espera de firma y aprobación por la supervisión Mandante.
                              </Text>
                            </View>

                            <TouchableOpacity
                              style={styles.techReportBtn}
                              activeOpacity={0.85}
                              onPress={() => navigation.navigate('Fichas', { selectedEquipment: ot.equipmentName })}
                            >
                              <FileText color="#000000" size={16} style={{ marginRight: 6 }} />
                              <Text style={styles.techReportBtnText}>[ 📄 VER INFORME DE MANTENIMIENTO OT ]</Text>
                              <ChevronRight color="#000000" size={16} style={{ marginLeft: 'auto' }} />
                            </TouchableOpacity>
                          </>
                        )}

                        {/* 3. ETAPA 3 (TAREA CERRADA - ETAPA FINAL CON TRAZABILIDAD MANDANTE) */}
                        {isStage3 && (
                          <>
                            <View style={styles.auditBlockContainer}>
                              <View style={styles.auditHeaderRow}>
                                <ShieldCheck color="#00FF88" size={16} style={{ marginRight: 6 }} />
                                <Text style={styles.auditHeaderTitle}>TRAZABILIDAD Y REGISTRO DE AUDITORÍA MANDANTE</Text>
                              </View>
                              
                              <View style={styles.auditDataRow}>
                                <Text style={styles.auditDataLabel}>APROBADO & VALIDADO POR MANDANTE:</Text>
                                <View style={styles.validatorBadge}>
                                  <UserCheck color="#00FF88" size={13} style={{ marginRight: 6 }} />
                                  <Text style={styles.validatorBadgeText}>
                                    {ot.validatorMandante || ot.firmaMandante?.validador || 'Ing. Roberto Arancibia M1 - Supervisor Mecánico Mandante'}
                                  </Text>
                                </View>
                              </View>

                              <View style={styles.auditDataRow}>
                                <Text style={styles.auditDataLabel}>FECHA Y SELLO DE VALIDACIÓN:</Text>
                                <View style={styles.timestampBadge}>
                                  <Clock color="#00E5FF" size={12} style={{ marginRight: 6 }} />
                                  <Text style={styles.timestampBadgeText}>
                                    {ot.validationTimestamp || ot.firmaMandante?.fechaHora || ot.closedDate || '09-Oct 18:20 hrs | Turno A'}
                                  </Text>
                                </View>
                              </View>
                            </View>

                            <TouchableOpacity
                              style={styles.techReportBtn}
                              activeOpacity={0.85}
                              onPress={() => navigation.navigate('Fichas', { selectedEquipment: ot.equipmentName })}
                            >
                              <FileText color="#000000" size={16} style={{ marginRight: 6 }} />
                              <Text style={styles.techReportBtnText}>[ 📄 VER INFORME DE MANTENIMIENTO OT ]</Text>
                              <ChevronRight color="#000000" size={16} style={{ marginLeft: 'auto' }} />
                            </TouchableOpacity>
                          </>
                        )}

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
    borderColor: '#1C374D',
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
  roleBadgeOperativo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00E5FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  roleBadgeOperativoText: {
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
  countBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  countBadgeText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '900',
  },

  /* TAB BAR STYLES */
  tabBarRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.sm,
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
  tabButtonNewBorder: {
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  tabButtonProgressBorder: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
  },
  tabButtonHistoryBorder: {
    borderColor: '#00FF88',
    backgroundColor: 'rgba(0, 255, 136, 0.08)',
  },
  tabButtonActiveBlue: {
    backgroundColor: '#00E5FF',
    borderColor: '#00E5FF',
  },
  tabButtonActiveYellow: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  tabButtonActiveGreen: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  tabButtonText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '900',
  },
  tabButtonTextDark: {
    color: '#000000',
  },

  /* PROMPT 46: SHIFT FILTER BAR STYLES */
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

  /* TIMESTAMP SUBTEXT STYLES */
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

  tabContentContainer: {
    gap: SPACING.md,
  },

  /* PROMPT 45 & 46: 2-COLUMN HORIZONTAL GRID & ACCORDION STYLES */
  alertsHorizontalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  otCardBase: {
    backgroundColor: '#182433',
    borderRadius: 10,
    borderWidth: 1.5,
    padding: SPACING.md,
  },
  otCardCompactCol: {
    width: '48.8%',
  },
  otCardExpandedFull: {
    width: '100%',
  },
  otCardExpandedFullGreen: {
    width: '100%',
  },

  accordionHeaderBtn: {
    gap: 4,
  },
  accordionBodyContainer: {
    marginTop: 8,
    gap: 6,
  },

  /* EXPAND/COLLAPSE TOGGLE BADGES */
  expandToggleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#00E5FF',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  expandToggleBadgeYellow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FFD700',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  expandToggleBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 1,
    borderColor: '#00FF88',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  expandToggleBadgeActive: {
    backgroundColor: '#00E5FF',
    borderColor: '#00E5FF',
  },
  expandToggleBadgeActiveYellow: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  expandToggleBadgeActiveGreen: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  expandToggleBadgeText: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '900',
  },
  expandToggleBadgeYellowText: {
    color: '#FFD700',
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

  /* EMPTY CARD */
  emptyCard: {
    backgroundColor: '#182433',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#263C52',
    padding: SPACING.xl,
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  emptyTitle: {
    color: '#00E5FF',
    fontSize: 14,
    fontWeight: '900',
  },
  emptySub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },

  /* OT CARDS STYLES */
  otCardBlueBorder: {
    borderColor: '#00E5FF',
  },
  otCardYellowBorder: {
    borderColor: '#FFD700',
  },
  otCardGreenBorder: {
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
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderWidth: 1,
    borderColor: '#00E5FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  areaBadgeText: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '900',
  },
  areaBadgeYellow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  areaBadgeYellowText: {
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
  statusBadgeBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00E5FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeBlueText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  statusBadgeYellow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeYellowText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
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
  otIdText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  otIdTextYellow: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  otIdTextGreen: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  equipmentTitleText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
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
    fontSize: 12,
    fontWeight: '800',
  },
  taskDetailsText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    lineHeight: 16,
  },
  mandanteBox: {
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
  mandanteBoxText: {
    color: '#FFD700',
    fontSize: 12,
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
  trackingBox: {
    backgroundColor: '#0E1722',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#22384E',
    padding: SPACING.md,
    marginTop: 6,
    gap: 6,
  },
  trackingBoxGreen: {
    backgroundColor: '#0A1C16',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#154534',
    padding: SPACING.md,
    marginTop: 6,
    gap: 6,
  },
  trackingTitle: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  trackingTitleGreen: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  closedNotesText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputLabel: {
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
  photosRow: {
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
  acceptOtBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00E5FF',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 6,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  acceptOtBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  finishOtBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FF88',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 6,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  finishOtBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  techReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FF88',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 6,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  techReportBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  /* PROMPT 47: EMISOR & ITO DESIGNADO STYLES */
  emisorItoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  itoBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2231',
    borderWidth: 1,
    borderColor: '#00E5FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  itoBadgeBoxText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '900',
  },
  /* PROMPT 47: REPORT INTERLOCK SELECTOR STYLES */
  interlockContainer: {
    backgroundColor: '#0F1722',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#263C52',
    padding: 10,
    marginTop: 10,
    marginBottom: 6,
    gap: 8,
  },
  interlockTitle: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  interlockRow: {
    flexDirection: 'row',
    gap: 8,
  },
  interlockBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#162331',
    borderWidth: 1.5,
    borderColor: '#2A3F55',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 6,
    minHeight: 44,
  },
  interlockBtnDelivered: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  interlockBtnPending: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  interlockBtnText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '900',
  },
  interlockBtnTextDark: {
    color: '#000000',
    fontWeight: '900',
  },
  /* PROMPT 47: FINISH BUTTON DISABLED */
  finishOtBtnDisabled: {
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  finishOtBtnTextDisabled: {
    color: '#64748B',
  },
  /* PROMPT 47: WARNING BADGE FOR PENDING REPORT IN HISTORIAL */
  statusBadgeYellowWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeYellowWarningText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  /* PROMPT 47: REPORT BUTTON DISABLED IN HISTORIAL */
  techReportBtnDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 6,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  techReportBtnTextDisabled: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  /* PROMPT 48: 3 STAGES & AUDIT TRAIL STYLES */
  areaBadgeAmber: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 145, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#FF9100',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  areaBadgeAmberText: {
    color: '#FF9100',
    fontSize: 10,
    fontWeight: '900',
  },
  statusBadgeAmberWaiting: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9100',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeAmberWaitingText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  statusBadgeGreenClosed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00FF88',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeGreenClosedText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  otIdTextAmber: {
    color: '#FF9100',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  otCardAmberBorder: {
    borderColor: '#FF9100',
  },
  expandToggleBadgeAmber: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 145, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FF9100',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  expandToggleBadgeActiveAmber: {
    backgroundColor: '#FF9100',
    borderColor: '#FF9100',
  },
  expandToggleBadgeAmberText: {
    color: '#FF9100',
    fontSize: 10,
    fontWeight: '900',
  },
  regularizationBox: {
    backgroundColor: '#0F1722',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFD700',
    padding: 10,
    marginTop: 8,
    marginBottom: 4,
    gap: 8,
  },
  regularizationTitle: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  regularizationSubtext: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
  },
  uploadedFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C2936',
    borderWidth: 1,
    borderColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  uploadedFileText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '700',
  },
  uploadPendingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  uploadPendingBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  requestReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00E5FF',
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  requestReviewBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  waitingReviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 145, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FF9100',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 6,
  },
  waitingReviewText: {
    color: '#FFB74D',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  auditBlockContainer: {
    backgroundColor: '#0C201A',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#00FF88',
    padding: 10,
    marginTop: 6,
    marginBottom: 4,
    gap: 8,
  },
  auditHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  auditHeaderTitle: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  auditDataRow: {
    gap: 3,
  },
  auditDataLabel: {
    color: '#8CAAD0',
    fontSize: 10,
    fontWeight: '900',
  },
  validatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13352A',
    borderWidth: 1,
    borderColor: '#00FF88',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  validatorBadgeText: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '900',
  },
  timestampBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2633',
    borderWidth: 1,
    borderColor: '#00E5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  timestampBadgeText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '800',
  },
});
