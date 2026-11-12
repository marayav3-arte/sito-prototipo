import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, GLOVE_TARGETS } from '../theme';
import { 
  ShieldCheck, 
  Wrench, 
  CheckCircle2, 
  ChevronRight, 
  Activity, 
  Radio, 
  Lock, 
  Video, 
  Navigation,
  Building2,
  HardHat,
  Cpu
} from 'lucide-react-native';
import IdentityVerificationView from '../components/IdentityVerificationView';

export default function LandingRoleScreen({ onSelectRole }) {
  // PROMPT 22: State to hold selected role pending identity verification
  const [pendingRole, setPendingRole] = useState(null); // null, 'MANDANTE', or 'OPERATIVO'

  // If a role button has been pressed, display the Identity Verification View with dynamic color accents!
  if (pendingRole) {
    return (
      <IdentityVerificationView
        pendingRole={pendingRole}
        onBack={() => setPendingRole(null)}
        onConfirmIdentity={(role, userData) => {
          setPendingRole(null);
          onSelectRole(role, userData);
        }}
      />
    );
  }

  return (
    <View style={styles.outerContainer}>
      
      {/* TECHNICAL INDUSTRIAL GRID MESH TEXTURE PATTERN IN CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .industrial-mesh-bg {
          background-color: #12161A;
          background-image: 
            radial-gradient(rgba(42, 50, 61, 0.8) 1.5px, transparent 1.5px),
            linear-gradient(to right, rgba(30, 45, 61, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(30, 45, 61, 0.15) 1px, transparent 1px);
          background-size: 24px 24px, 48px 48px, 48px 48px;
          background-position: 0 0, 0 0, 0 0;
        }
        .glow-mandante-hover:hover {
          border-color: #FFD700 !important;
          box-shadow: 0 0 25px rgba(255, 215, 0, 0.25) !important;
          transform: translateY(-2px);
          transition: all 0.25s ease-in-out;
        }
        .glow-operativo-hover:hover {
          border-color: #00E5FF !important;
          box-shadow: 0 0 25px rgba(0, 229, 255, 0.25) !important;
          transform: translateY(-2px);
          transition: all 0.25s ease-in-out;
        }
      ` }} />

      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        
        {/* TOP INDUSTRIAL WELCOME HEADER */}
        <View style={styles.topHeaderSection}>
          <View style={styles.badgeRow}>
            <View style={styles.plantBadge}>
              <Cpu color={COLORS.yellow} size={13} style={{ marginRight: 6 }} />
              <Text style={styles.plantBadgeText}>PLANTA LA COIPA • CONTROL DE ACCESO Y OPERACIONES</Text>
            </View>
            <View style={styles.statusBadge}>
              <Activity color="#00FF88" size={12} style={{ marginRight: 4 }} />
              <Text style={styles.statusBadgeText}>SISTEMA EN LÍNEA</Text>
            </View>
          </View>

          <Text style={styles.mainTitleText}>SELECCIÓN DE PERFIL DE INGRESO</Text>
          <Text style={styles.subTitleText}>
            Seleccione su rol operativo para adaptar las herramientas de terreno y canales de radio de faena.
          </Text>
        </View>

        {/* SPACIOUS PROFILE CARDS CONTAINER (2 LARGE COLUMNS / CARDS) */}
        <View style={styles.cardsGridContainer}>
          
          {/* OPTION A: MANDANTE / DUEÑOS DE ÁREA */}
          <TouchableOpacity
            style={[styles.spaciousRoleCard, styles.mandanteCardBorder, { className: 'glow-mandante-hover' }]}
            activeOpacity={0.88}
            onPress={() => setPendingRole('MANDANTE')}
          >
            {/* CARD TOP BAR & BADGE */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.mandanteOptionBadge}>
                <Text style={styles.mandanteOptionBadgeText}>OPCIÓN A • MANDANTE</Text>
              </View>
              <Text style={styles.mandanteChannelTag}>CANALES 2, 3, 4, 5</Text>
            </View>

            {/* CARD TITLE & ICON */}
            <View style={styles.cardTitleRow}>
              <View style={styles.mandanteIconHalo}>
                <ShieldCheck color="#FFD700" size={32} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.cardTitleMainMandante}>DUEÑOS DE ÁREA & SUPERVISORES</Text>
                <Text style={styles.cardSubtitleMandante}>Jefes de Turno, Jefes de Área y Supervisores de Planta Mandantes</Text>
              </View>
            </View>

            <View style={styles.cardDividerMandante} />

            {/* ENABLED FEATURES LIST */}
            <Text style={styles.featuresSectionLabel}>HERRAMIENTAS & FUNCIONES HABILITADAS:</Text>
            <View style={styles.featureListGap}>
              <View style={styles.featureItemRow}>
                <CheckCircle2 color="#00FF88" size={16} style={{ marginRight: 8 }} />
                <Text style={styles.featureItemText}>Centro de Control LOTO (Validación & Firma Dueño de Área)</Text>
              </View>
              <View style={styles.featureItemRow}>
                <CheckCircle2 color="#00FF88" size={16} style={{ marginRight: 8 }} />
                <Text style={styles.featureItemText}>Gestor & Aprobador de Solicitudes de Bloqueo de Terreno</Text>
              </View>
              <View style={styles.featureItemRow}>
                <CheckCircle2 color="#00FF88" size={16} style={{ marginRight: 8 }} />
                <Text style={styles.featureItemText}>Directorio de Radio de Contratistas en Terreno (Canales 5, 7, 8)</Text>
              </View>
              <View style={styles.featureItemRow}>
                <CheckCircle2 color="#00FF88" size={16} style={{ marginRight: 8 }} />
                <Text style={styles.featureItemText}>Navegador Táctico 3D de Planta con Waypoints en Vivo</Text>
              </View>
            </View>

            {/* ACTION BUTTON */}
            <View style={styles.giantActionBtnMandante}>
              <ShieldCheck color="#000000" size={22} style={{ marginRight: 8 }} />
              <Text style={styles.giantActionBtnTextDark}>[ 🛡️ INGRESAR COMO MANDANTE ]</Text>
              <ChevronRight color="#000000" size={22} />
            </View>
          </TouchableOpacity>

          {/* OPTION B: OPERATIVO / CONTRATISTA */}
          <TouchableOpacity
            style={[styles.spaciousRoleCard, styles.operativoCardBorder, { className: 'glow-operativo-hover' }]}
            activeOpacity={0.88}
            onPress={() => setPendingRole('OPERATIVO')}
          >
            {/* CARD TOP BAR & BADGE */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.operativoOptionBadge}>
                <Text style={styles.operativoOptionBadgeText}>OPCIÓN B • OPERATIVO</Text>
              </View>
              <Text style={styles.operativoChannelTag}>CANALES 5, 7, 8</Text>
            </View>

            {/* CARD TITLE & ICON */}
            <View style={styles.cardTitleRow}>
              <View style={styles.operativoIconHalo}>
                <Wrench color="#00E5FF" size={32} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.cardTitleMainOperativo}>TÉCNICOS & CONTRATISTAS</Text>
                <Text style={styles.cardSubtitleOperativo}>Técnicos de Mantenimiento, Riggers y Especialistas de Faena</Text>
              </View>
            </View>

            <View style={styles.cardDividerOperativo} />

            {/* ENABLED FEATURES LIST */}
            <Text style={styles.featuresSectionLabel}>HERRAMIENTAS & FUNCIONES HABILITADAS:</Text>
            <View style={styles.featureListGap}>
              <View style={styles.featureItemRow}>
                <CheckCircle2 color="#00FF88" size={16} style={{ marginRight: 8 }} />
                <Text style={styles.featureItemText}>Árbol de Diagnóstico de Emergencia en Terreno (0 Bar Interlock)</Text>
              </View>
              <View style={styles.featureItemRow}>
                <CheckCircle2 color="#00FF88" size={16} style={{ marginRight: 8 }} />
                <Text style={styles.featureItemText}>Biblioteca de Micro-Capacitaciones para Mitigación de Riesgos</Text>
              </View>
              <View style={styles.featureItemRow}>
                <CheckCircle2 color="#00FF88" size={16} style={{ marginRight: 8 }} />
                <Text style={styles.featureItemText}>Envío de Solicitudes a Radio Dueño de Área (VHF/UHF)</Text>
              </View>
              <View style={styles.featureItemRow}>
                <CheckCircle2 color="#00FF88" size={16} style={{ marginRight: 8 }} />
                <Text style={styles.featureItemText}>Directorio Radio Mandante (Jefes de Turno A/B)</Text>
              </View>
              <View style={styles.featureItemRow}>
                <CheckCircle2 color="#00FF88" size={16} style={{ marginRight: 8 }} />
                <Text style={styles.featureItemText}>Navegador Táctico 3D de Planta con Waypoints en Vivo</Text>
              </View>
            </View>

            {/* ACTION BUTTON */}
            <View style={styles.giantActionBtnOperativo}>
              <Wrench color="#000000" size={22} style={{ marginRight: 8 }} />
              <Text style={styles.giantActionBtnTextDark}>[ 👷 INGRESAR COMO OPERATIVO ]</Text>
              <ChevronRight color="#000000" size={22} />
            </View>
          </TouchableOpacity>

        </View>

        {/* FOOTER METADATA NOTICE */}
        <View style={styles.footerNoticeRow}>
          <Text style={styles.footerNoticeText}>
            ⚙️ Planta La Coipa • Sistema Operativo de Faenas Aisladas • React Native Industrial Core v2.4
          </Text>
        </View>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
    minHeight: '100%',
    className: 'industrial-mesh-bg',
  },
  scrollContentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },

  topHeaderSection: {
    width: '100%',
    marginBottom: SPACING.xxl,
    alignItems: 'center',
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: SPACING.sm,
  },
  plantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#182433',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#2A3E56',
  },
  plantBadgeText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#00FF88',
  },
  statusBadgeText: {
    color: '#00FF88',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  mainTitleText: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  subTitleText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: '100%',
    lineHeight: 20,
  },

  cardsGridContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
  },
  spaciousRoleCard: {
    flex: 1,
    minWidth: 320,
    width: '100%',
    backgroundColor: '#121822',
    borderRadius: 14,
    borderWidth: 2,
    padding: 32,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  mandanteCardBorder: {
    borderColor: '#3D3510',
  },
  operativoCardBorder: {
    borderColor: '#103945',
  },

  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mandanteOptionBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mandanteOptionBadgeText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  mandanteChannelTag: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '800',
  },
  operativoOptionBadge: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  operativoOptionBadgeText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  operativoChannelTag: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '800',
  },

  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mandanteIconHalo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  operativoIconHalo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    borderWidth: 2,
    borderColor: '#00E5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleMainMandante: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardSubtitleMandante: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  cardTitleMainOperativo: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardSubtitleOperativo: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },

  cardDividerMandante: {
    height: 1.5,
    backgroundColor: '#262A15',
    marginVertical: SPACING.md,
  },
  cardDividerOperativo: {
    height: 1.5,
    backgroundColor: '#152C36',
    marginVertical: SPACING.md,
  },

  featuresSectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  featureListGap: {
    gap: 10,
    marginBottom: SPACING.xl,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureItemText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },

  giantActionBtnMandante: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 10,
    minHeight: GLOVE_TARGETS.buttonHeight + 6,
  },
  giantActionBtnOperativo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00E5FF',
    paddingVertical: 16,
    borderRadius: 10,
    minHeight: GLOVE_TARGETS.buttonHeight + 6,
  },
  giantActionBtnTextDark: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  footerNoticeRow: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerNoticeText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
  },
});
