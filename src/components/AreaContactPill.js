import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';
import { Radio } from 'lucide-react-native';
import RadioDirectoryModal from './RadioDirectoryModal';

export default function AreaContactPill({ equipment, activeRole = 'OPERATIVO', style }) {
  const [modalVisible, setModalVisible] = useState(false);

  const isOperativo = activeRole === 'OPERATIVO';
  const themeColor = isOperativo ? '#00E5FF' : '#FFD700';

  return (
    <>
      {/* PROMPT 28: COMPACT PILL BUTTON RENDERS DIRECTLY THE COMPLETE CROSS RADIO DIRECTORY MODAL */}
      <TouchableOpacity
        style={[
          styles.pillButton,
          { backgroundColor: themeColor },
          style
        ]}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <Radio color="#000000" size={13} style={{ marginRight: 4 }} />
        <Text style={styles.pillText}>[ 📻 CONTACTO ]</Text>
      </TouchableOpacity>

      {/* COMPLETE CROSS RADIO DIRECTORY MODAL (PROMPT 28) */}
      <RadioDirectoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        activeRole={activeRole}
      />
    </>
  );
}

const styles = StyleSheet.create({
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 6,
  },
  pillText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
