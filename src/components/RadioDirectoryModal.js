import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, GLOVE_TARGETS } from '../theme';
import { Radio, ShieldCheck, Wrench, X } from 'lucide-react-native';
import { MANDANTE_CONTACTS, CONTRATISTA_CONTACTS } from '../data/contactsData';

export default function RadioDirectoryModal({ visible, onClose, activeRole }) {
  // Tab state: default to MANDANTE contacts if OPERATIVO active role, or CONTRATISTA contacts if MANDANTE active role
  const [activeTab, setActiveTab] = useState(activeRole === 'MANDANTE' ? 'CONTRATISTA' : 'MANDANTE');

  const contactsList = activeTab === 'MANDANTE' ? MANDANTE_CONTACTS : CONTRATISTA_CONTACTS;

  return (
    <Modal
      animationType="fade"
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
                <Radio color={COLORS.yellow} size={13} style={{ marginRight: 6 }} />
                <Text style={styles.topTagText}>DIRECTORIO CRUZADO DE RADIO • SINTONÍA DE FAENA</Text>
              </View>
              <Text style={styles.titleText}>CANALES DE RADIO DE TURNO</Text>
              <Text style={styles.subText}>Comunicación directa por frecuencia VHF/UHF (Sin telefonía móvil)</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <X color={COLORS.textPrimary} size={20} />
            </TouchableOpacity>
          </View>

          {/* TAB BAR SELECTOR */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'MANDANTE' && styles.tabBtnActiveMandante]}
              activeOpacity={0.8}
              onPress={() => setActiveTab('MANDANTE')}
            >
              <ShieldCheck color={activeTab === 'MANDANTE' ? COLORS.textDark : COLORS.yellow} size={16} style={{ marginRight: 6 }} />
              <Text style={[styles.tabBtnText, activeTab === 'MANDANTE' && styles.tabBtnTextDark]}>
                [ 🛡️ MANDANTE ]
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'CONTRATISTA' && styles.tabBtnActiveOperativo]}
              activeOpacity={0.8}
              onPress={() => setActiveTab('CONTRATISTA')}
            >
              <Wrench color={activeTab === 'CONTRATISTA' ? COLORS.textDark : '#00E5FF'} size={16} style={{ marginRight: 6 }} />
              <Text style={[styles.tabBtnText, activeTab === 'CONTRATISTA' && styles.tabBtnTextDark]}>
                [ 👷 CONTRATISTA ]
              </Text>
            </TouchableOpacity>
          </View>

          {/* CONTACTS LIST (PROMPT 23: CLEAN CARDS WITHOUT TRANSMIT BUTTONS OR EN SINTONIA BADGES) */}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {contactsList.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                
                <View style={styles.cardHeader}>
                  <View style={styles.areaBadge}>
                    <Text style={styles.areaBadgeText}>{contact.area}</Text>
                  </View>
                </View>

                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactRole}>{contact.role}</Text>

                {/* HIGHLIGHTED RADIO CHANNEL BOX */}
                <View style={[
                  styles.radioFreqBox,
                  activeTab === 'MANDANTE' ? styles.radioFreqBoxMandante : styles.radioFreqBoxOperativo
                ]}>
                  <Radio color={activeTab === 'MANDANTE' ? COLORS.yellow : '#00E5FF'} size={16} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.radioChannelTitle,
                      activeTab === 'MANDANTE' ? { color: COLORS.yellow } : { color: '#00E5FF' }
                    ]}>
                      {contact.radio}
                    </Text>
                    <Text style={styles.freqSubText}>Frecuencia: {contact.frequency} • Cobertura: {contact.coverage}</Text>
                  </View>
                </View>

              </View>
            ))}
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
  titleText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subText: {
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
  tabContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121C26',
    borderWidth: 1.5,
    borderColor: '#203244',
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabBtnActiveMandante: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.yellow,
  },
  tabBtnActiveOperativo: {
    backgroundColor: '#00E5FF',
    borderColor: '#00E5FF',
  },
  tabBtnText: {
    color: COLORS.textPrimary,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  tabBtnTextDark: {
    color: COLORS.textDark,
  },
  scrollContent: {
    gap: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  contactCard: {
    backgroundColor: '#121C26',
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 1.5,
    borderColor: '#203244',
    padding: SPACING.md,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  areaBadge: {
    backgroundColor: '#1C2E40',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2B455E',
  },
  areaBadgeText: {
    color: '#90C0F0',
    fontSize: 10,
    fontWeight: '800',
  },
  contactName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  contactRole: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  radioFreqBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    marginTop: 4,
  },
  radioFreqBoxMandante: {
    backgroundColor: '#192837',
    borderColor: '#2D455E',
  },
  radioFreqBoxOperativo: {
    backgroundColor: '#112636',
    borderColor: '#184D5E',
  },
  radioChannelTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  freqSubText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
});
