import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from './src/theme';

// Import Icons
import {
  Home, Activity, ShieldCheck,
  BookOpen, BarChart2, Wrench, Map,
} from 'lucide-react-native';


// Import Screens & Landing View
import LandingRoleScreen    from './src/screens/LandingRoleScreen';
import InicioScreen         from './src/screens/InicioScreen';
import DiagnosticoScreen    from './src/screens/DiagnosticoScreen';
import FichasScreen         from './src/screens/FichasScreen';       // preservado para Catálogo Maestro
import EstadoEquipoScreen   from './src/screens/EstadoEquipoScreen'; // reemplaza el tab 'Fichas'
import SeguridadScreen      from './src/screens/SeguridadScreen';
import CapacitacionScreen   from './src/screens/CapacitacionScreen';
import ConfiabilidadScreen  from './src/screens/ConfiabilidadScreen';
import MapaPlantaScreen     from './src/screens/MapaPlantaScreen';

// Import Modals (PROMPT 20 & 3D NAVIGATOR)
import RadioDirectoryModal from './src/components/RadioDirectoryModal';
// PROMPT 51 S.I.T.O.: Replace PlantMapModal with new S.I.T.O. Tactical Map
import SitoTacticalMap from './src/components/SitoTacticalMap';


// PROMPT 50: Import Global WorkOrdersProvider for synchronized real-time state
import { WorkOrdersProvider } from './src/context/WorkOrdersContext';
import { HorometroProvider } from './src/context/HorometroContext';

const Tab = createBottomTabNavigator();

const IndustrialNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.textPrimary,
    border: COLORS.border,
  },
};

function AppNavigation() {
  // PROMPT 21: Selected Role state (null by default for Landing Entrance View)
  const [activeRole, setActiveRole] = useState(null); // null, 'MANDANTE', or 'OPERATIVO'

  // Transversal Modals Visibility States
  const [radioModalVisible, setRadioModalVisible] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);

  // If no role has been selected, present LandingRoleScreen as the DEFAULT FULL-SCREEN ENTRANCE VIEW
  if (!activeRole) {
    return (
      <View style={{ flex: 1, backgroundColor: '#12161A' }}>
        <StatusBar style="light" />
        <LandingRoleScreen onSelectRole={(role) => setActiveRole(role)} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={IndustrialNavTheme}>
      <StatusBar style="light" />

      <Tab.Navigator
        key={activeRole}
        initialRouteName="Inicio"
        screenOptions={({ route }) => ({
          headerShown: false,

          headerStyle: {
            backgroundColor: COLORS.surface,
            borderBottomWidth: 1.5,
            borderBottomColor: COLORS.border,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            fontSize: 15,
            fontWeight: '900',
            letterSpacing: 1,
            color: COLORS.textPrimary,
            textTransform: 'uppercase',
          },
          headerTitleAlign: 'center',
          
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopWidth: 2,
            borderTopColor: COLORS.border,
            height: 75,
            paddingTop: 8,
            paddingBottom: 12,
          },
          tabBarActiveTintColor: COLORS.yellow,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 0.5,
            marginTop: 4,
          },
          
          tabBarIcon: ({ focused, color }) => {
            const iconProps = {
              color,
              size: focused ? 24 : 22,
              strokeWidth: focused ? 2.5 : 2,
            };
            switch (route.name) {
              case 'Inicio':                return <Home {...iconProps} />;
              case 'Confiabilidad':         return <BarChart2 {...iconProps} />;
              case 'Diagnostico':           return <Wrench {...iconProps} />;
              case 'Fichas':                return <Activity {...iconProps} />;
              case 'Seguridad':             return <ShieldCheck {...iconProps} />;
              case 'Capacitacion':          return <BookOpen {...iconProps} />;
              case 'Mapa de la planta':     return <Map {...iconProps} />;
              default:                      return null;
            }
          },
          // Renombrar 'Fichas' → 'Estado del Equipo' en la tab bar
          // El nombre interno 'Fichas' se conserva para compatibilidad de rutas
          tabBarLabel: route.name === 'Fichas' ? 'Estado del Equipo' : route.name,
        })}
      >
        {/* ── MANDANTE pos 1: Confiabilidad ── */}
        {activeRole === 'MANDANTE' && (
          <Tab.Screen name="Confiabilidad">
            {(props) => <ConfiabilidadScreen {...props} activeRole={activeRole} />}
          </Tab.Screen>
        )}

        {/* ── MANDANTE pos 2: Seguridad (also shared) ── */}
        {activeRole === 'MANDANTE' && (
          <Tab.Screen name="Seguridad">
            {(props) => (
              <SeguridadScreen
                {...props}
                activeRole={activeRole}
                onOpenRadioModal={() => setRadioModalVisible(true)}
                onOpenMapModal={() => setMapModalVisible(true)}
              />
            )}
          </Tab.Screen>
        )}

        {/* ── OPERATIVO pos 1: Diagnostico ── */}
        {activeRole === 'OPERATIVO' && (
          <Tab.Screen name="Diagnostico">
            {(props) => (
              <DiagnosticoScreen
                {...props}
                activeRole={activeRole}
                onOpenMapModal={() => setMapModalVisible(true)}
              />
            )}
          </Tab.Screen>
        )}

        {/* ── OPERATIVO pos 2: Capacitacion ── */}
        {activeRole === 'OPERATIVO' && (
          <Tab.Screen name="Capacitacion">
            {(props) => <CapacitacionScreen {...props} activeRole={activeRole} />}
          </Tab.Screen>
        )}

        {/* ── CENTRO (pos 3 ambos perfiles): Inicio ── */}
        <Tab.Screen name="Inicio">
          {(props) => (
            <InicioScreen
              {...props}
              activeRole={activeRole}
              onOpenRoleModal={() => setActiveRole(null)}
              onOpenRadioModal={() => setRadioModalVisible(true)}
              onOpenMapModal={() => setMapModalVisible(true)}
            />
          )}
        </Tab.Screen>

        {/* ── pos 4 ambos perfiles: Estado del Equipo (ruta interna 'Fichas') ── */}
        <Tab.Screen name="Fichas">
          {(props) => (
            <EstadoEquipoScreen
              {...props}
              activeRole={activeRole}
              onOpenMapModal={() => setMapModalVisible(true)}
            />
          )}
        </Tab.Screen>

        {/* ── MANDANTE pos 4 ya cubierta — OPERATIVO pos 5: Seguridad ── */}
        {activeRole === 'OPERATIVO' && (
          <Tab.Screen name="Seguridad">
            {(props) => (
              <SeguridadScreen
                {...props}
                activeRole={activeRole}
                onOpenRadioModal={() => setRadioModalVisible(true)}
                onOpenMapModal={() => setMapModalVisible(true)}
              />
            )}
          </Tab.Screen>
        )}

        {/* ── MANDANTE pos 5 / OPERATIVO pos 6: Mapa de la planta ── */}
        <Tab.Screen name="Mapa de la planta">
          {(props) => <MapaPlantaScreen {...props} activeRole={activeRole} />}
        </Tab.Screen>


      </Tab.Navigator>

      {/* RADIO DIRECTORY MODAL */}
      <RadioDirectoryModal
        visible={radioModalVisible}
        onClose={() => setRadioModalVisible(false)}
        activeRole={activeRole}
      />


    </NavigationContainer>
  );
}

export default function App() {
  return (
    <WorkOrdersProvider>
      <HorometroProvider>
        <AppNavigation />
      </HorometroProvider>
    </WorkOrdersProvider>
  );
}

const styles = StyleSheet.create({
});
