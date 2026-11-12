import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLOVE_TARGETS } from '../theme';
import { Building2, UserCheck, Radio, RadioReceiver, Send, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { getAssetContact } from '../data/assetContacts';

export default function AreaContactCard({ equipment, style, showTitle = true, defaultCollapsed = true }) {
  const contact = getAssetContact(equipment);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [notified, setNotified] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleRequestPermission = () => {
    setNotified(true);
    setToastMessage(`Notificación enviada a ${contact.jefeTurno} (${contact.canalTurno}). Técnico registrado en zona.`);
    setTimeout(() => {
      setToastMessage('');
    }, 5000);
  };

  return (
    <View style={[styles.cardContainer, style]}>
      {/* Collapsible Header Bar */}
      <TouchableOpacity
        style={styles.headerTouchable}
        activeOpacity={0.8}
        onPress={() => setIsCollapsed(!isCollapsed)}
      >
        <View style={styles.headerLeft}>
          <Radio color={COLORS.yellow} size={20} />
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle}>
              {isCollapsed ? '[ 🔽 Contacto de Área & Mandante ]' : '[ 🔼 Ocultar Contacto ]'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {contact.macroArea} • {contact.canalTurno}
            </Text>
          </View>
        </View>
        <View style={styles.chevronBox}>
          {isCollapsed ? (
            <ChevronDown color={COLORS.yellow} size={22} />
          ) : (
            <ChevronUp color={COLORS.yellow} size={22} />
          )}
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {!isCollapsed && (
        <View style={styles.contentGrid}>
          
          {/* Row 1: Macro-Área & Sub-Área */}
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Building2 color="#7097C2" size={22} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.labelTitle}>UBICACIÓN / PROCESO MANDANTE (🏭)</Text>
              <Text style={styles.valueText}>
                <Text style={styles.highlightText}>{contact.macroArea}</Text> • {contact.subArea}
              </Text>
            </View>
          </View>

          {/* Row 2: Jefe de Turno Mandante & Radio Channel */}
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <UserCheck color={COLORS.yellow} size={22} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.labelTitle}>JEFE DE TURNO MANDANTE (👷‍♂️)</Text>
              <Text style={styles.valueTextBold}>{contact.jefeTurno}</Text>
            </View>
          </View>

          {/* Row 3: Radio Channels + Action Button */}
          <View style={styles.radioRowContainer}>
            <View style={styles.radioBadgesCol}>
              {/* Shift Leader Radio Badge */}
              <View style={styles.radioBadgePrimary}>
                <RadioReceiver color={COLORS.textDark} size={16} />
                <Text style={styles.radioBadgePrimaryText}>[ 📻 {contact.canalTurno} ]</Text>
              </View>

              {/* Area Manager Info & Badge */}
              <View style={styles.radioBadgeSecondary}>
                <Text style={styles.radioSecondaryLabel}>Sup. Area: {contact.jefeArea}</Text>
                <Text style={styles.radioSecondaryBadge}>[ 📻 {contact.canalArea} ]</Text>
              </View>
            </View>

            {/* Quick Action Button: SOLICITAR PERMISO / LIBERACIÓN */}
            <TouchableOpacity
              style={[styles.actionBtn, notified && styles.actionBtnDone]}
              activeOpacity={0.8}
              onPress={handleRequestPermission}
            >
              {notified ? (
                <>
                  <CheckCircle2 color={COLORS.textDark} size={18} style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnTextDone}>[ ENVIADO ]</Text>
                </>
              ) : (
                <>
                  <Send color={COLORS.textDark} size={16} style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnText}>[ 📢 SOLICITAR PERMISO / LIBERACIÓN ]</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Floating Notification Toast */}
          {toastMessage ? (
            <View style={styles.toastBanner}>
              <AlertCircle color={COLORS.textDark} size={18} style={{ marginRight: 8 }} />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          ) : null}

        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#121C26', // Industrial Steel Dark Blue
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 2,
    borderColor: '#2D445D', // Highlighted Steel border
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  headerTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextGroup: {
    marginLeft: 10,
    flex: 1,
  },
  headerTitle: {
    color: COLORS.yellow,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#8CAAD0',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  chevronBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#1C2C3D',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  contentGrid: {
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#25374C',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#182533',
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#263A50',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#0F1720',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  textCol: {
    flex: 1,
  },
  labelTitle: {
    color: '#8CAAD0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  valueText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  valueTextBold: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  highlightText: {
    color: COLORS.yellow,
    fontWeight: '800',
  },
  radioRowContainer: {
    gap: 8,
    marginTop: 4,
  },
  radioBadgesCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  radioBadgePrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  radioBadgePrimaryText: {
    color: COLORS.textDark,
    fontWeight: '900',
    fontSize: 12,
    marginLeft: 6,
  },
  radioBadgeSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#223548',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#36526E',
  },
  radioSecondaryLabel: {
    color: '#B0C9E8',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 6,
  },
  radioSecondaryBadge: {
    color: COLORS.yellow,
    fontSize: 11,
    fontWeight: '900',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.orange,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 4,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  actionBtnDone: {
    backgroundColor: COLORS.green,
  },
  actionBtnText: {
    color: COLORS.textDark,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  actionBtnTextDone: {
    color: COLORS.textDark,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: 6,
  },
  toastText: {
    color: COLORS.textDark,
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  }
});
