import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, GLOVE_TARGETS } from '../theme';
import { ShieldCheck, Wrench, CheckCircle2, ChevronRight, X, Building2, UserCheck, Activity } from 'lucide-react-native';

export default function RoleSelectorModal({ visible, onClose, activeRole, onSelectRole }) {
  const handleSelect = (roleKey) => {
    onSelectRole(roleKey);
    if (onClose) onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          
          {/* HEADER */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.topTagBadge}>
                <Activity color={COLORS.yellow} size={12} style={{ marginRight: 4 }} />
                <Text style={styles.topTagText}>PLANTA LA COIPA • CONTROL DE ACCESO</Text>
              </View>
              <Text style={styles.mainTitleText}>SELECCIÓN DE PERFIL</Text>
              <Text style={styles.subTitleText}>Seleccione su rol operativo para adaptar la interfaz y canales de radio</Text>
            </View>
            {onClose && (
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                <X color={COLORS.textPrimary} size={20} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* OPTION A: MANDANTE / DUEÑOS DE ÁREA */}
            <TouchableOpacity
              style={[
                styles.roleCard,
                activeRole === 'MANDANTE' && styles.roleCardActiveMandante
              ]}
              activeOpacity={0.85}
              onPress={() => handleSelect('MANDANTE')}
            >
              <View style={styles.cardTopHeader}>
                <View style={styles.iconCircleMandante}>
                  <ShieldCheck color={COLORS.yellow} size={26} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.badgeRow}>
                    <View style={styles.mandanteBadge}>
                      <Text style={styles.mandanteBadgeText}>OPCIÓN A • MANDANTE</Text>
                    </View>
                    {activeRole === 'MANDANTE' && (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>ACTIVO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.roleCardTitle}>DUEÑOS DE ÁREA & SUPERVISORES</Text>
                  <Text style={styles.roleCardSub}>Jefes de Turno, Jefes de Área y Supervisores Mandantes</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.featuresHeader}>FUNCIONES HABILITADAS:</Text>
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <CheckCircle2 color="#00FF88" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.featureText}>Centro de Control LOTO (Validaciones Dueño de Área)</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle2 color="#00FF88" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.featureText}>Gestor & Aprobador de Solicitudes de Bloqueo</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle2 color="#00FF88" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.featureText}>Directorio Radio de Contratistas en Terreno</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle2 color="#00FF88" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.featureText}>Navegador Táctico 3D de Planta con Waypoints</Text>
                </View>
              </View>

              <View style={styles.selectBtnMandante}>
                <ShieldCheck color={COLORS.textDark} size={18} style={{ marginRight: 6 }} />
                <Text style={styles.selectBtnTextDark}>[ 🛡️ INGRESAR COMO MANDANTE ]</Text>
                <ChevronRight color={COLORS.textDark} size={18} />
              </View>
            </TouchableOpacity>

            {/* OPTION B: OPERATIVO / CONTRATISTA */}
            <TouchableOpacity
              style={[
                styles.roleCard,
                activeRole === 'OPERATIVO' && styles.roleCardActiveOperativo
              ]}
              activeOpacity={0.85}
              onPress={() => handleSelect('OPERATIVO')}
            >
              <View style={styles.cardTopHeader}>
                <View style={styles.iconCircleOperativo}>
                  <Wrench color="#00F0FF" size={26} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.badgeRow}>
                    <View style={styles.operativoBadge}>
                      <Text style={styles.operativoBadgeText}>OPCIÓN B • OPERATIVO</Text>
                    </View>
                    {activeRole === 'OPERATIVO' && (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>ACTIVO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.roleCardTitle}>CONTRATISTAS & TÉCNICOS</Text>
                  <Text style={styles.roleCardSub}>Técnicos de Mantenimiento, Riggers y Especialistas</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.featuresHeader}>FUNCIONES HABILITADAS:</Text>
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <CheckCircle2 color="#00FF88" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.featureText}>Árbol de Diagnóstico de Emergencia en Terreno</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle2 color="#00FF88" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.featureText}>Micro-Capacitaciones para Mitigación de Riesgos</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle2 color="#00FF88" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.featureText}>Envío de Solicitudes a Radio Dueño de Área</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle2 color="#00FF88" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.featureText}>Directorio Radio Mandante (Jefes de Turno)</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle2 color="#00FF88" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.featureText}>Navegador Táctico 3D de Planta con Waypoints</Text>
                </View>
              </View>

              <View style={styles.selectBtnOperativo}>
                <Wrench color={COLORS.textDark} size={18} style={{ marginRight: 6 }} />
                <Text style={styles.selectBtnTextDark}>[ 👷 INGRESAR COMO OPERATIVO ]</Text>
                <ChevronRight color={COLORS.textDark} size={18} />
              </View>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 13, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 580,
    maxHeight: '90%',
    backgroundColor: '#0A1017',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1E2D3D',
    padding: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1.5,
    borderBottomColor: '#1E2D3D',
    paddingBottom: SPACING.md,
    marginBottom: SPACING.md,
  },
  topTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162331',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#263B50',
  },
  topTagText: {
    color: COLORS.yellow,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  mainTitleText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subTitleText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#162331',
    borderWidth: 1,
    borderColor: '#263B50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    gap: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  roleCard: {
    backgroundColor: '#121C26',
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 1.5,
    borderColor: '#203244',
    padding: SPACING.md,
  },
  roleCardActiveMandante: {
    borderColor: COLORS.yellow,
    backgroundColor: '#162331',
  },
  roleCardActiveOperativo: {
    borderColor: '#00F0FF',
    backgroundColor: '#112535',
  },
  cardTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircleMandante: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 230, 0, 0.12)',
    borderWidth: 1.5,
    borderColor: COLORS.yellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleOperativo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderWidth: 1.5,
    borderColor: '#00F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  mandanteBadge: {
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mandanteBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  operativoBadge: {
    backgroundColor: '#00F0FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  operativoBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  activePill: {
    backgroundColor: '#00FF88',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activePillText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  roleCardTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  roleCardSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E2D3D',
    marginVertical: SPACING.md,
  },
  featuresHeader: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  featureList: {
    gap: 6,
    marginBottom: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  selectBtnMandante: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.yellow,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  selectBtnOperativo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F0FF',
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  selectBtnTextDark: {
    color: COLORS.textDark,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginRight: 4,
  },
});
