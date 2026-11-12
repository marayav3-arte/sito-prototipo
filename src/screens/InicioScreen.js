import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLOVE_TARGETS } from '../theme';
import MandanteAlertsMacroblock from '../components/MandanteAlertsMacroblock';
import OperativoOtMacroblock from '../components/OperativoOtMacroblock';
import { 
  QrCode, 
  ShieldCheck, 
  Clock, 
  Hammer, 
  ChevronRight, 
  Wifi, 
  WifiOff, 
  FileCheck, 
  ShieldAlert, 
  Video, 
  Radio,
  Navigation,
  Wrench,
  UserCheck,
  Building2,
  Lock
} from 'lucide-react-native';

export default function InicioScreen({ 
  navigation, 
  activeRole = 'OPERATIVO', 
  onOpenRoleModal, 
  onOpenRadioModal, 
  onOpenMapModal 
}) {
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0: Idle, 1: Scanning, 2: Found

  // Network connectivity status toggle state for isolated mining field simulation
  const [isOnline, setIsOnline] = useState(false);

  const simulateScan = () => {
    setScanModalVisible(true);
    setScanStep(1);
  };

  useEffect(() => {
    let timer1, timer2;
    if (scanStep === 1) {
      timer1 = setTimeout(() => {
        setScanStep(2);
      }, 2500);
    } else if (scanStep === 2) {
      timer2 = setTimeout(() => {
        setScanModalVisible(false);
        setScanStep(0);
        navigation.navigate('Fichas', { selectedEquipment: 'Chancador Cónico Omnicone SX 1560 - Planta La Coipa' });
      }, 1800);
    }
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [scanStep]);

  const recentEquipment = [
    { id: '1', name: 'Chancador Cónico Omnicone SX 1560 - Planta La Coipa', code: 'CH-CON-001', tag: 'ACT-001', location: 'Planta La Coipa', status: 'Operativo' },
    { id: '2', name: 'Filtro de Mangas Dustex F100', code: 'FM-DUST-08', tag: 'ACT-003', location: 'Nave de Harneros', status: 'En Mantenimiento' },
    { id: '3', name: 'Bomba Centrífuga Sulzer 4x3-13', code: 'BC-SUL-304', tag: 'ACT-004', location: 'Estación de Impulsión TK-02', status: 'Intervenido' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Header Info Banner with Role Indicator & Connectivity */}
      <View style={styles.techProfile}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <View style={styles.roleBannerRow}>
            {activeRole === 'MANDANTE' ? (
              <View style={styles.rolePillMandante}>
                <ShieldCheck color={COLORS.textDark} size={12} style={{ marginRight: 4 }} />
                <Text style={styles.rolePillTextDark}>PERFIL: MANDANTE (SUPERVISOR / DUEÑO DE ÁREA)</Text>
              </View>
            ) : (
              <View style={styles.rolePillOperativo}>
                <Wrench color={COLORS.textDark} size={12} style={{ marginRight: 4 }} />
                <Text style={styles.rolePillTextDark}>PERFIL: OPERATIVO (CONTRATISTA / TÉCNICO)</Text>
              </View>
            )}
          </View>
          <Text style={styles.techName}>
            {activeRole === 'MANDANTE' ? 'Carlos Mendoza (Jefe de Turno A)' : 'Ing. Mateo Estéban'}
          </Text>
          <Text style={styles.shiftSubtext}>Turno Diurno • Planta La Coipa • Sector Chancado</Text>
        </View>

        {/* CONNECTIVITY INDICATOR TOGGLE */}
        <TouchableOpacity
          style={[
            styles.connectivityBadge,
            isOnline ? styles.connectivityOnline : styles.connectivityOffline
          ]}
          activeOpacity={0.8}
          onPress={() => setIsOnline(!isOnline)}
        >
          {isOnline ? (
            <Wifi color={COLORS.green} size={14} style={{ marginRight: 4 }} />
          ) : (
            <WifiOff color={COLORS.yellow} size={14} style={{ marginRight: 4 }} />
          )}
          <Text style={[
            styles.connectivityText,
            isOnline ? { color: COLORS.green } : { color: COLORS.yellow }
          ]}>
            {isOnline ? '[ 📶 ONLINE ]' : '[ 📴 MODO TERRENO ]'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* QUICK ACCESS ACTION BUTTONS BANNER */}
      <View style={styles.quickAccessBanner}>
        <TouchableOpacity
          style={styles.actionBannerBtn}
          activeOpacity={0.85}
          onPress={onOpenRoleModal}
        >
          <UserCheck color={COLORS.yellow} size={16} style={{ marginRight: 6 }} />
          <Text style={styles.actionBannerBtnText}>[ 🔄 CAMBIAR ROL ]</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBannerBtn}
          activeOpacity={0.85}
          onPress={onOpenRadioModal}
        >
          <Radio color={COLORS.yellow} size={16} style={{ marginRight: 6 }} />
          <Text style={styles.actionBannerBtnText}>[ 📻 DIRECTORIO RADIO ]</Text>
        </TouchableOpacity>

      </View>


      {/* Main Glove-friendly QR Scanner Call-To-Action (PROMPT 23: Turquoise #00E5FF for Operativo / Yellow #FFD700 for Mandante) */}
      <View style={[
        styles.scannerCard,
        activeRole === 'OPERATIVO' ? styles.scannerCardOperativo : styles.scannerCardMandante
      ]}>
        <Text style={[
          styles.cardHeader,
          activeRole === 'OPERATIVO' ? { color: '#00E5FF' } : { color: COLORS.yellow }
        ]}>
          Identificación de Activos en Terreno
        </Text>
        <Text style={styles.cardSub}>Escanee el código QR o TAG RFID (ej. ACT-001) del equipo para desplegar la ficha técnica estructurada y checklist.</Text>
        
        <TouchableOpacity 
          style={[
            styles.giantButton,
            activeRole === 'OPERATIVO' ? { backgroundColor: '#00E5FF' } : { backgroundColor: COLORS.yellow }
          ]} 
          activeOpacity={0.85}
          onPress={simulateScan}
        >
          <QrCode color={COLORS.textDark} size={36} strokeWidth={2.5} />
          <Text style={styles.giantButtonText}>ESCANEAR QR / TAG</Text>
        </TouchableOpacity>
      </View>

      {/* LOGICAL OPERATIONAL SUMMARY CARDS (TAILORED TO ACTIVE ROLE) */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitleHeader}>
          {activeRole === 'MANDANTE' ? 'PANEL DE CONTROL MANDANTE (DUEÑO DE ÁREA)' : 'PANEL OPERATIVO CONTRATISTA (TERRENO)'}
        </Text>
      </View>

      {/* MANDANTE ROLE SPECIFIC CARDS */}
      {activeRole === 'MANDANTE' ? (
        <>
          {/* PROMPT 30: STRUCTURED ALERTS & DERIVATIONS MACROBLOCK WITH TABS */}
          <MandanteAlertsMacroblock navigation={navigation} />

          {/* CARD 2 MANDANTE: DIRECTORIO RADIO CONTRATISTAS */}
          <TouchableOpacity
            style={styles.operationalCard}
            activeOpacity={0.85}
            onPress={onOpenRadioModal}
          >
            <View style={styles.opCardHeader}>
              <View style={styles.opIconTitleRow}>
                <Radio color={COLORS.yellow} size={22} />
                <Text style={styles.opCardTitle}>DIRECTORIO RADIO CONTRATISTA DE TURNO</Text>
              </View>
              <View style={styles.tagBadgeSmall}>
                <Text style={styles.tagBadgeTextSmall}>FRECUENCIAS ACTIVAS</Text>
              </View>
            </View>

            <Text style={styles.opEquipmentName}>Gerencia & Supervisión Terreno Contratista</Text>
            <Text style={styles.alertDetailText}>
              • Marco Valenzuela (Admin Contrato) -> CANAL 8 (Gerencia Contratista){'\n'}
              • Jorge Alarcón (Sup. Mantención) -> CANAL 5 (Supervisión Terreno){'\n'}
              • Esteban Vega (Mecánico Líder) -> CANAL 5 (Cuadrilla Mecánica)
            </Text>

            <View style={styles.opCardFooter}>
              <Text style={styles.opFooterLink}>ABRIR DIRECTORIO Y TRANSMITIR POR RADIO</Text>
              <ChevronRight color={COLORS.yellow} size={20} />
            </View>
          </TouchableOpacity>
        </>
      ) : (
        /* OPERATIVO / CONTRATISTA ROLE CARDS */
        <>
          {/* PROMPT 34: OPERATIVO WORK ORDERS (OT) MACROBLOCK */}
          <OperativoOtMacroblock navigation={navigation} />

          {/* CARD 1 OPERATIVO: ÚLTIMA INSPECCIÓN */}
          <TouchableOpacity
            style={styles.operationalCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Fichas', { selectedEquipment: 'Chancador Cónico Omnicone SX 1560 - Planta La Coipa' })}
          >
            <View style={styles.opCardHeader}>
              <View style={styles.opIconTitleRow}>
                <FileCheck color={COLORS.yellow} size={22} />
                <Text style={styles.opCardTitle}>ÚLTIMA INSPECCIÓN</Text>
              </View>
              <View style={styles.tagBadgeSmall}>
                <Text style={styles.tagBadgeTextSmall}>TAG: ACT-001</Text>
              </View>
            </View>

            <Text style={styles.opEquipmentName}>Chancador Cónico Omnicone SX 1560 - Planta La Coipa</Text>
            <View style={styles.opMetaRow}>
              <Text style={styles.opMetaText}>📅 Último Registro: 30/09/2026 - 12:45 hrs</Text>
              <Text style={styles.opStatusCompleted}>✓ Completado en Terreno</Text>
            </View>

            <View style={styles.opCardFooter}>
              <Text style={styles.opFooterLink}>VER FICHA TÉCNICA Y REGISTRO COMPLETO</Text>
              <ChevronRight color={COLORS.yellow} size={20} />
            </View>
          </TouchableOpacity>

          {/* CARD 2 OPERATIVO: CAPACITACIÓN RECOMENDADA */}
          <TouchableOpacity
            style={[styles.operationalCard, styles.trainingCardBorder]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Capacitacion')}
          >
            <View style={styles.opCardHeader}>
              <View style={styles.opIconTitleRow}>
                <Video color={COLORS.yellow} size={22} />
                <Text style={styles.opCardTitle}>CAPACITACIÓN RECOMENDADA</Text>
              </View>
              <View style={styles.suggestedBadgeSmall}>
                <Text style={styles.suggestedBadgeTextSmall}>SUGERENCIA DE RIESGO</Text>
              </View>
            </View>

            <Text style={styles.opEquipmentName}>"Procedimiento de Despeje de Cámara Acuñada"</Text>
            <Text style={styles.trainingReasonText}>
              💡 Sugerido automáticamente debido a que el último diagnóstico registró atascamiento y problemas de flujo en chancador.
            </Text>

            <View style={styles.opCardFooter}>
              <Text style={styles.opFooterLink}>REPRODUCIR CÁPSULA TÉCNICA (4:15 MIN)</Text>
              <ChevronRight color={COLORS.yellow} size={20} />
            </View>
          </TouchableOpacity>
        </>
      )}

      {/* Recent Equipment Quick Access List */}
      <View style={styles.sectionHeaderContainer}>
        <Hammer color={COLORS.yellow} size={20} style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>Últimos Equipos Intervenidos en Faena</Text>
      </View>

      {recentEquipment.map((eq) => (
        <TouchableOpacity
          key={eq.id}
          style={styles.equipmentCard}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Fichas', { selectedEquipment: eq.name })}
        >
          <View style={styles.eqDetails}>
            <View style={styles.eqTitleRow}>
              <Text style={styles.eqName} numberOfLines={1}>{eq.name}</Text>
              <View 
                style={[
                  styles.eqStatusTag, 
                  eq.status === 'Operativo' ? styles.statusOperativo : 
                  eq.status === 'En Mantenimiento' ? styles.statusManto : styles.statusIntervenido
                ]}
              >
                <Text style={styles.statusTagText}>{eq.status}</Text>
              </View>
            </View>
            <Text style={styles.eqCode}>{eq.tag} • {eq.code} • {eq.location}</Text>
          </View>
          <ChevronRight color={COLORS.yellow} size={24} />
        </TouchableOpacity>
      ))}

      {/* QR Code Scanner Simulation Modal */}
      <Modal
        visible={scanModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {scanStep === 1 && (
              <View style={styles.scanStateContainer}>
                <Text style={styles.modalTitle}>Iniciando Cámara...</Text>
                <View style={styles.scannerWindow}>
                  <View style={[styles.scanLine]} />
                  <QrCode color={COLORS.yellow} size={120} strokeWidth={1} style={styles.scanQrIcon} />
                </View>
                <ActivityIndicator size="large" color={COLORS.yellow} style={{ marginTop: 24 }} />
                <Text style={styles.modalStatusText}>Buscando código QR / Tag RFID (ej. ACT-001)...</Text>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setScanModalVisible(false);
                    setScanStep(0);
                  }}
                >
                  <Text style={styles.cancelButtonText}>CANCELAR</Text>
                </TouchableOpacity>
              </View>
            )}

            {scanStep === 2 && (
              <View style={styles.scanStateContainer}>
                <View style={styles.foundCircle}>
                  <ShieldCheck color={COLORS.textDark} size={48} strokeWidth={2.5} />
                </View>
                <Text style={[styles.modalTitle, { color: COLORS.green }]}>TAG DETECTADO: ACT-001</Text>
                <Text style={styles.foundLabel}>Chancador Cónico Omnicone SX 1560</Text>
                <Text style={styles.foundEquipment}>Planta La Coipa</Text>
                <Text style={styles.redirectText}>Cargando ficha técnica y seguridad...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  techProfile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  roleBannerRow: {
    marginBottom: 4,
  },
  rolePillMandante: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  rolePillOperativo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F0FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  rolePillTextDark: {
    color: COLORS.textDark,
    fontSize: 9,
    fontWeight: '900',
  },
  techName: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.subheader,
    fontSize: 16,
    marginTop: 1,
  },
  shiftSubtext: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },

  connectivityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  connectivityOnline: {
    backgroundColor: 'rgba(76, 217, 100, 0.12)',
    borderColor: COLORS.green,
  },
  connectivityOffline: {
    backgroundColor: 'rgba(255, 230, 0, 0.12)',
    borderColor: COLORS.yellow,
  },
  connectivityText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // QUICK ACCESS ACTION BANNER
  quickAccessBanner: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  actionBannerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14212E',
    borderWidth: 1.5,
    borderColor: '#263C52',
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionBannerBtnText: {
    color: COLORS.yellow,
    fontSize: 10,
    fontWeight: '900',
  },
  actionBannerBtnMap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.yellow,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionBannerBtnMapText: {
    color: COLORS.textDark,
    fontSize: 10,
    fontWeight: '900',
  },

  scannerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: GLOVE_TARGETS.borderWidth,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    width: '100%',
  },
  scannerCardMandante: {
    borderColor: COLORS.yellow,
  },
  scannerCardOperativo: {
    borderColor: '#00E5FF',
  },
  cardHeader: {
    color: COLORS.yellow,
    ...TYPOGRAPHY.header,
    marginBottom: SPACING.xs,
  },
  cardSub: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    fontSize: 13,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  giantButton: {
    flexDirection: 'row',
    height: GLOVE_TARGETS.buttonHeight + 10,
    backgroundColor: COLORS.yellow,
    borderRadius: GLOVE_TARGETS.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  giantButtonText: {
    color: COLORS.textDark,
    ...TYPOGRAPHY.header,
    marginLeft: SPACING.sm,
    fontSize: 18,
  },

  sectionHeaderRow: {
    marginBottom: SPACING.md,
  },
  sectionTitleHeader: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    letterSpacing: 0.5,
  },

  operationalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  alertCardBorder: {
    borderColor: COLORS.red,
  },
  trainingCardBorder: {
    borderColor: COLORS.yellow,
  },
  opCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  opIconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  opCardTitle: {
    color: COLORS.textPrimary,
    fontWeight: '900',
    fontSize: 13,
    marginLeft: SPACING.sm,
    letterSpacing: 0.5,
  },
  tagBadgeSmall: {
    backgroundColor: 'rgba(255, 230, 0, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.yellow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagBadgeTextSmall: {
    color: COLORS.yellow,
    fontWeight: '800',
    fontSize: 10,
  },
  dangerBadgeSmall: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.red,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dangerBadgeTextSmall: {
    color: COLORS.red,
    fontWeight: '800',
    fontSize: 10,
  },
  suggestedBadgeSmall: {
    backgroundColor: 'rgba(255, 230, 0, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.yellow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  suggestedBadgeTextSmall: {
    color: COLORS.yellow,
    fontWeight: '800',
    fontSize: 10,
  },

  opEquipmentName: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.title,
    fontSize: 17,
    marginTop: 4,
    marginBottom: 4,
    lineHeight: 22,
  },
  opMetaRow: {
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  opMetaText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  opStatusCompleted: {
    color: COLORS.green,
    fontWeight: '800',
    fontSize: 12,
    marginTop: 2,
  },
  alertDetailText: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    fontSize: 13,
    marginTop: 2,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  trainingReasonText: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    fontSize: 12,
    marginTop: 2,
    marginBottom: SPACING.md,
    lineHeight: 17,
  },
  opCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
    marginTop: SPACING.xs,
  },
  opFooterLink: {
    color: COLORS.yellow,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.3,
  },

  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionIcon: {
    marginRight: SPACING.xs,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.header,
    fontSize: 15,
  },
  equipmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  eqDetails: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  eqTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eqName: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.subheader,
    flex: 1,
    marginRight: 6,
    fontSize: 15,
  },
  eqCode: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    fontSize: 12,
  },
  eqStatusTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  statusOperativo: {
    backgroundColor: 'rgba(76, 217, 100, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  statusManto: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.orange,
  },
  statusIntervenido: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.red,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  scanStateContainer: {
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.header,
    fontSize: 20,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  scannerWindow: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderColor: COLORS.yellow,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0F0F0F',
  },
  scanQrIcon: {
    opacity: 0.25,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 4,
    backgroundColor: COLORS.yellow,
    zIndex: 10,
    shadowColor: COLORS.yellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  modalStatusText: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: SPACING.xl,
    height: GLOVE_TARGETS.buttonHeight,
    width: '100%',
    borderWidth: GLOVE_TARGETS.borderWidth,
    borderColor: COLORS.red,
    borderRadius: GLOVE_TARGETS.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.red,
    ...TYPOGRAPHY.subheader,
  },
  foundCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  foundLabel: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.caption,
    fontSize: 12,
  },
  foundEquipment: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.title,
    fontSize: 20,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: SPACING.xl,
  },
  redirectText: {
    color: COLORS.green,
    ...TYPOGRAPHY.body,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
