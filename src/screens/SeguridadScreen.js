import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLOVE_TARGETS } from '../theme';
import AreaContactPill from '../components/AreaContactPill';
import { ShieldAlert, CheckCircle2, Lock, Unlock, AlertTriangle, AlertOctagon, HelpCircle, Radio, UserCheck, ShieldCheck, Navigation } from 'lucide-react-native';

export default function SeguridadScreen({ activeRole = 'OPERATIVO', onOpenMapModal }) {
  // Lockout Checklist items
  const [checklist, setChecklist] = useState([
    { id: '1', text: 'EPP Completo (Casco, Guantes, Lentes, Zapatos Metatarsales)', checked: false },
    { id: '2', text: 'Desenergización Eléctrica en Sala Eléctrica (Q3 Bloqueado)', checked: false },
    { id: '3', text: 'Purga de Presión Hidráulica en Acumuladores (V-102 Abierta)', checked: false },
    { id: '4', text: 'Instalación de Pinza LOTO y Candado Personal con Tarjeta', checked: false },
    { id: '5', text: 'Verificación de Ausencia de Tensión (Prueba de Arranque)', checked: false },
    { id: '6', text: 'Instalación de Traba Mecánica / Perno de Seguridad en Volante', checked: false },
  ]);

  // Logical Interlock Statuses (Simulated)
  const [interlocks, setInterlocks] = useState({
    electricIsolator: true, // true: Locked (Safe), false: Energized (Danger)
    hydraulicValve: true,   // true: Drained (Safe), false: Pressurized (Danger)
    mechanicalPin: false,   // false: Disengaged (Danger), true: Engaged (Safe)
  });

  // Step 2: Area Owner LOTO Validation State
  const [areaApproved, setAreaApproved] = useState(false);

  const toggleCheck = (id) => {
    setChecklist(prev =>
      prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  const toggleInterlock = (key) => {
    setInterlocks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const allChecked = checklist.every(item => item.checked);
  const interlocksSafe = interlocks.electricIsolator && interlocks.hydraulicValve && interlocks.mechanicalPin;
  const areaSafe = allChecked && interlocksSafe;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* OMNIPRESENT ACTIVE ASSET TAG BANNER WITH COMPACT CONTACT PILL & MAP BUTTON */}
      <View style={styles.assetTagBanner}>
        <View style={styles.fluorescentBadge}>
          <Text style={styles.fluorescentBadgeText}>TAG: ACT-001</Text>
        </View>
        <Text style={styles.assetNameBanner} numberOfLines={1}>Chancador Omnicone SX 1560 - Planta La Coipa</Text>
        
        {/* PROMPT 26: COMPACT PILL BUTTON IMMEDIATELY TO THE LEFT OF MAP BUTTON */}
        <AreaContactPill equipment={{ tagCode: 'ACT-001' }} activeRole={activeRole} />

      </View>


      {/* Dynamic Main Safety Header */}
      <View style={[
        styles.safetyBanner, 
        areaSafe ? styles.bannerSafe : styles.bannerDanger
      ]}>
        <View style={styles.bannerIconContainer}>
          {areaSafe ? (
            <CheckCircle2 color={COLORS.textDark} size={36} strokeWidth={2.5} />
          ) : (
            <AlertOctagon color={COLORS.textDark} size={36} strokeWidth={2.5} />
          )}
        </View>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerSubtitle}>ESTADO DE ENERGÍA DE TRABAJO</Text>
          <Text style={styles.bannerTitle}>
            {areaSafe ? 'ZONA SEGURA - ENERGÍA CERO' : 'DETENCIÓN NO COMPLETADA'}
          </Text>
          <Text style={styles.bannerDetails}>
            {areaSafe 
              ? 'Todos los interbloqueos lógicos están seguros y el protocolo LOTO se ha completado.' 
              : 'Precaución: Faltan pasos de bloqueo personal o interbloqueos mecánicos.'}
          </Text>
        </View>
      </View>

      {/* HIGH VISIBILITY ALERTS (Yellow & Red background cards) */}
      <Text style={styles.sectionHeading}>ALERTAS ACTIVAS EN PLANTA</Text>

      {/* Danger Alert (Red) */}
      <View style={styles.redAlertCard}>
        <View style={styles.alertHeaderRow}>
          <AlertOctagon color={COLORS.textPrimary} size={24} />
          <Text style={styles.alertCardTitle}>¡PELIGRO DE ATRAPAMIENTO!</Text>
        </View>
        <Text style={styles.alertCardBody}>
          Chancador Cónico 1 se encuentra con compuertas abiertas por inspección. Mantenga distancia mínima de 3 metros de partes giratorias en contraeje.
        </Text>
      </View>

      {/* Warning Alert (Yellow) */}
      <View style={styles.yellowAlertCard}>
        <View style={styles.alertHeaderRow}>
          <AlertTriangle color={COLORS.textDark} size={24} />
          <Text style={styles.yellowAlertTitle}>PRECAUCIÓN: BAJA PRESIÓN DE ACEITE</Text>
        </View>
        <Text style={styles.yellowAlertBody}>
          Monitorear temperatura del Chancador Cónico 2. Presión hidráulica oscilando en límite inferior (85 Bar). Posible colmatación de filtro de retorno.
        </Text>
      </View>

      {/* LOTO TRIPARTITO - PASO 2: DUEÑO DE ÁREA MANDANTE */}
      <View style={[styles.panelCard, { borderColor: areaApproved ? COLORS.green : COLORS.yellow, borderWidth: 2 }]}>
        <View style={styles.checklistHeaderRow}>
          <UserCheck color={areaApproved ? COLORS.green : COLORS.yellow} size={22} />
          <Text style={[styles.panelHeading, { color: areaApproved ? COLORS.green : COLORS.yellow }]}>
            LOTO TRIPARTITO - PASO 2: DUEÑO DE ÁREA
          </Text>
        </View>
        <Text style={styles.panelSub}>
          Autorización obligatoria del Jefe de Turno Mandante antes de instalar bloqueo personal en la zona.
        </Text>

        <View style={styles.lotoOwnerBox}>
          <Text style={styles.lotoOwnerRole}>AUTORIDAD MANDANTE ASIGNADA:</Text>
          <Text style={styles.lotoOwnerName}>Carlos Mendoza (Turno A) — CANAL 2</Text>
          <Text style={styles.lotoOwnerStatusText}>
            Estado de Permiso: {areaApproved ? '✅ PERMISO DE ENTRADA OTORGADO VÍA RADIO' : '⏳ EN ESPERA DE CONFIRMACIÓN POR CANAL 2'}
          </Text>

          <TouchableOpacity
            style={[styles.lotoAuthBtn, areaApproved && styles.lotoAuthBtnDone]}
            activeOpacity={0.8}
            onPress={() => setAreaApproved(!areaApproved)}
          >
            {areaApproved ? (
              <>
                <ShieldCheck color={COLORS.textDark} size={20} style={{ marginRight: 8 }} />
                <Text style={styles.lotoAuthBtnText}>[ PERMISO DE ENTRADA VALIDADO Y CONFIRMADO ]</Text>
              </>
            ) : (
              <>
                <Radio color={COLORS.textDark} size={20} style={{ marginRight: 8 }} />
                <Text style={styles.lotoAuthBtnText}>[ 📻 CONFIRMAR VALIDACIÓN RADIO CON CARLOS MENDOZA ]</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* LOGICAL INTERLOCK PANEL */}
      <View style={styles.panelCard}>
        <Text style={styles.panelHeading}>INTERBLOQUEOS LÓGICOS DE SEGURIDAD</Text>
        <Text style={styles.panelSub}>Estado de los sensores de campo en tiempo real. Toque el interruptor para forzar bloqueo en simulación.</Text>

        {/* Interlock 1 */}
        <View style={styles.interlockRow}>
          <View style={styles.interlockTextContent}>
            <View style={styles.interlockNameRow}>
              <View style={[styles.interlockDot, interlocks.electricIsolator ? styles.dotSafe : styles.dotDanger]} />
              <Text style={styles.interlockName}>Aislador Eléctrico Q3 (Sala Control)</Text>
            </View>
            <Text style={styles.interlockStateLabel}>
              {interlocks.electricIsolator ? 'BLOQUEADO - ENERGÍA CERO' : 'CONECTADO - CON ENERGÍA'}
            </Text>
          </View>
          <Switch
            value={interlocks.electricIsolator}
            onValueChange={() => toggleInterlock('electricIsolator')}
            trackColor={{ false: '#444', true: COLORS.green }}
            thumbColor={COLORS.textPrimary}
          />
        </View>

        {/* Interlock 2 */}
        <View style={styles.interlockRow}>
          <View style={styles.interlockTextContent}>
            <View style={styles.interlockNameRow}>
              <View style={[styles.interlockDot, interlocks.hydraulicValve ? styles.dotSafe : styles.dotDanger]} />
              <Text style={styles.interlockName}>Válvula de Despiche Hidráulico V-102</Text>
            </View>
            <Text style={styles.interlockStateLabel}>
              {interlocks.hydraulicValve ? 'ABIERTA - DESPRESURIZADO' : 'CERRADA - CON PRESIÓN'}
            </Text>
          </View>
          <Switch
            value={interlocks.hydraulicValve}
            onValueChange={() => toggleInterlock('hydraulicValve')}
            trackColor={{ false: '#444', true: COLORS.green }}
            thumbColor={COLORS.textPrimary}
          />
        </View>

        {/* Interlock 3 */}
        <View style={[styles.interlockRow, { borderBottomWidth: 0 }]}>
          <View style={styles.interlockTextContent}>
            <View style={styles.interlockNameRow}>
              <View style={[styles.interlockDot, interlocks.mechanicalPin ? styles.dotSafe : styles.dotDanger]} />
              <Text style={styles.interlockName}>Perno de Bloqueo Mecánico Eje</Text>
            </View>
            <Text style={styles.interlockStateLabel}>
              {interlocks.mechanicalPin ? 'INSERTADO - TRABADO' : 'RETIRADO - SUELTO'}
            </Text>
          </View>
          <Switch
            value={interlocks.mechanicalPin}
            onValueChange={() => toggleInterlock('mechanicalPin')}
            trackColor={{ false: '#444', true: COLORS.green }}
            thumbColor={COLORS.textPrimary}
          />
        </View>
      </View>

      {/* LOTO CHECKLIST */}
      <View style={styles.panelCard}>
        <View style={styles.checklistHeaderRow}>
          <Lock color={COLORS.yellow} size={20} />
          <Text style={styles.panelHeading}>CHECKLIST DE BLOQUEO (LOTO)</Text>
        </View>
        <Text style={styles.panelSub}>
          Es obligatorio completar cada paso de seguridad mecánica antes de iniciar tareas de mantenimiento.
        </Text>

        {checklist.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.checkItem, item.checked && styles.checkItemActive]}
            activeOpacity={0.8}
            onPress={() => toggleCheck(item.id)}
          >
            <View style={[styles.checkbox, item.checked && styles.checkboxActive]}>
              {item.checked && <CheckCircle2 color={COLORS.textDark} size={20} strokeWidth={3} />}
            </View>
            <Text style={[styles.checkText, item.checked && styles.checkTextActive]}>
              {item.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
  safetyBanner: {
    flexDirection: 'row',
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 2,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  bannerDanger: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
  },
  bannerSafe: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  bannerIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  bannerContent: {
    flex: 1,
  },
  bannerSubtitle: {
    color: COLORS.textDark,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: COLORS.textDark,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
    marginBottom: 4,
  },
  bannerDetails: {
    color: COLORS.textDark,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  sectionHeading: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  redAlertCard: {
    backgroundColor: COLORS.red,
    borderRadius: GLOVE_TARGETS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#7A1C17',
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  alertCardTitle: {
    color: COLORS.textPrimary,
    fontWeight: '900',
    fontSize: 15,
    marginLeft: SPACING.sm,
    letterSpacing: 0.5,
  },
  alertCardBody: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.body,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
  },
  yellowAlertCard: {
    backgroundColor: COLORS.yellow,
    borderRadius: GLOVE_TARGETS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: '#A19100',
  },
  yellowAlertTitle: {
    color: COLORS.textDark,
    fontWeight: '900',
    fontSize: 15,
    marginLeft: SPACING.sm,
    letterSpacing: 0.5,
  },
  yellowAlertBody: {
    color: COLORS.textDark,
    ...TYPOGRAPHY.body,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  panelCard: {
    backgroundColor: COLORS.surface,
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  checklistHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  panelHeading: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.subheader,
    fontSize: 15,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  panelSub: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    fontSize: 12,
    marginBottom: SPACING.lg,
  },
  interlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  interlockTextContent: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  interlockNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interlockDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  dotSafe: {
    backgroundColor: COLORS.green,
  },
  dotDanger: {
    backgroundColor: COLORS.red,
  },
  interlockName: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.subheader,
    fontSize: 14,
  },
  interlockStateLabel: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    fontSize: 12,
    marginLeft: 18,
    marginTop: 2,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: GLOVE_TARGETS.borderRadius,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  checkItemActive: {
    borderColor: COLORS.yellow,
    backgroundColor: 'rgba(255, 230, 0, 0.03)',
  },
  checkbox: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    borderRadius: 6,
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    borderColor: COLORS.yellow,
    backgroundColor: COLORS.yellow,
  },
  checkText: {
    flex: 1,
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    fontSize: 13,
  },
  checkTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  lotoOwnerBox: {
    backgroundColor: '#16222F',
    borderRadius: GLOVE_TARGETS.borderRadius,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#2D445D',
  },
  lotoOwnerRole: {
    color: '#8CAAD0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  lotoOwnerName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
    marginBottom: 4,
  },
  lotoOwnerStatusText: {
    color: COLORS.yellow,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  lotoAuthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.yellow,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  lotoAuthBtnDone: {
    backgroundColor: COLORS.green,
  },
  lotoAuthBtnText: {
    color: COLORS.textDark,
    fontWeight: '900',
    fontSize: 12,
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
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
    marginRight: 6,
  },
  mapBtnHeader: {
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  mapBtnHeaderText: {
    color: COLORS.textDark,
    fontSize: 10,
    fontWeight: '900',
  },
});
