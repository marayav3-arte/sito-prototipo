// =========================================================================
// MAPA DE LA PLANTA SCREEN — Tab-mode wrapper para SitoTacticalMap
// Renderiza el mapa táctico S.I.T.O. como pestaña de pantalla completa.
// Pasa activeRole al mapa para activar el modo MANDANTE o CONTRATISTA.
// =========================================================================
import React from 'react';
import { View, StyleSheet } from 'react-native';
import SitoTacticalMap from '../components/SitoTacticalMap';

export default function MapaPlantaScreen({ navigation, activeRole }) {
  // Navega al tab Inicio sin recargar ningún componente
  const handleNavigateToInicio = () => {
    navigation.navigate('Inicio');
  };

  return (
    <View style={ss.container}>
      <SitoTacticalMap
        visible={true}
        onClose={handleNavigateToInicio}
        onNavigateToInicio={handleNavigateToInicio}
        initialEquipmentTag="CH-01"
        tabMode={true}
        activeRole={activeRole || 'MANDANTE'}
      />
    </View>
  );
}

const ss = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050D1A',
  },
});
