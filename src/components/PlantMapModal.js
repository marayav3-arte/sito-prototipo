import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { COLORS, SPACING, GLOVE_TARGETS } from '../theme';
import { MapPin, X, Navigation, Radio, ChevronDown, Check, Footprints, ShieldAlert } from 'lucide-react-native';
import { PLANT_NODES, getRouteInfo } from '../data/plantNodes';

export default function PlantMapModal({ visible, onClose, equipment }) {
  // Determine origin node from current active equipment tag or fallback to Chancador Cónico (CH-01 / ACT-001)
  const currentTag = equipment?.tagCode || equipment?.tag || 'CH-01';
  
  // Find matching origin node object
  const originNode = PLANT_NODES.find(n => n.tag === currentTag || n.altTag === currentTag || currentTag.includes(n.id) || n.id === 'CH-CDN-001') || PLANT_NODES[0];

  // Selected Destination Node state
  const [selectedDestNode, setSelectedDestNode] = useState(null);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Available Destination Options (STRICTLY FILTERING OUT ORIGIN EQUIPMENT)
  const availableDestinations = PLANT_NODES.filter(n => n.id !== originNode.id && n.tag !== originNode.tag);

  // Calculate route info if destination is selected
  const routeInfo = selectedDestNode ? getRouteInfo(originNode, selectedDestNode) : null;

  // Clear route handler
  const handleClearRoute = () => {
    setSelectedDestNode(null);
    setShowDestDropdown(false);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlayFullScreen}>
        
        {/* CSS KEYFRAMES ANIMATIONS FOR RADAR PULSE, PIN VIBRATION & WAZE DASH FLOW (PROMPT 16: animation dash 1.5s) */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes radarPulse {
            0% { transform: scale(0.8); opacity: 0.95; }
            50% { transform: scale(2.2); opacity: 0.35; }
            100% { transform: scale(3.2); opacity: 0; }
          }
          @keyframes scaleVibrate {
            0% { transform: scale(1); filter: drop-shadow(0 0 6px #00F0FF); }
            50% { transform: scale(1.25); filter: drop-shadow(0 0 14px #00F0FF); }
            100% { transform: scale(1); filter: drop-shadow(0 0 6px #00F0FF); }
          }
          @keyframes dash {
            from { stroke-dashoffset: 20; }
            to { stroke-dashoffset: 0; }
          }
          .radar-halo-anim {
            animation: radarPulse 1.8s infinite ease-out;
          }
          .pin-vibrate-anim {
            animation: scaleVibrate 1.4s infinite ease-in-out;
          }
          .waze-dash-anim {
            animation: dash 1.5s linear infinite;
          }
        ` }} />

        {/* MAIN SPLIT CONTAINER (LEFT SIDEBAR TACTICAL PANEL + RIGHT MAP CANVAS) */}
        <View style={styles.splitMainContainer}>
          
          {/* -----------------------------------------------------------------
             LEFT SIDEBAR: TACTICAL CONTROL PANEL (GLASSMORPHISM DARK SIDEBAR)
             ----------------------------------------------------------------- */}
          <View style={styles.leftSidebarPanel}>
            
            {/* PANEL HEADER */}
            <View style={styles.sidebarHeader}>
              <Navigation color={COLORS.yellow} size={20} style={{ marginRight: 6 }} />
              <Text style={styles.sidebarHeaderTitle}>NAVEGADOR TÁCTICO 3D</Text>
            </View>

            <ScrollView contentContainerStyle={styles.sidebarScrollContent}>
              
              {/* CARD 1: USTED ESTÁ AQUÍ (ORIGIN) */}
              <View style={styles.sidebarCard}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.limePulseDot} />
                  <Text style={styles.cardHeaderLime}>USTED ESTÁ AQUÍ (ORIGEN)</Text>
                </View>
                <Text style={styles.equipmentTitleText}>{originNode.name}</Text>
                
                <View style={styles.tagBadgeRow}>
                  <View style={styles.limeBadge}>
                    <Text style={styles.limeBadgeText}>TAG: {originNode.tag}</Text>
                  </View>
                  <Text style={styles.macroAreaText}>{originNode.macroArea}</Text>
                </View>

                <View style={styles.radioInfoBox}>
                  <Radio color={COLORS.yellow} size={13} style={{ marginRight: 6 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.radioLabelText}>SUPERVISOR & RADIO ZONA:</Text>
                    <Text style={styles.radioValueText}>{originNode.supervisor} • {originNode.channel}</Text>
                  </View>
                </View>
              </View>

              {/* CARD 2: IR A / DESTINO (WITH STRICT ORIGIN EXCLUSION DROPDOWN) */}
              <View style={styles.sidebarCard}>
                <Text style={styles.cardHeaderYellow}>🧭 SELECCIONAR DESTINO (IR A)</Text>

                {/* Dropdown Selector Button */}
                <TouchableOpacity
                  style={styles.dropdownSelectorBtn}
                  activeOpacity={0.8}
                  onPress={() => setShowDestDropdown(!showDestDropdown)}
                >
                  <Text style={styles.dropdownSelectorBtnText} numberOfLines={1}>
                    {selectedDestNode ? `📍 [ ${selectedDestNode.tag} ] ${selectedDestNode.name}` : '🧭 [ SELECCIONAR DESTINO ]'}
                  </Text>
                  <ChevronDown color={COLORS.yellow} size={18} />
                </TouchableOpacity>

                {/* Dropdown Options List */}
                {showDestDropdown && (
                  <View style={styles.dropdownMenuList}>
                    <ScrollView style={{ maxHeight: 200 }}>
                      {availableDestinations.map((dest) => (
                        <TouchableOpacity
                          key={dest.id}
                          style={styles.dropdownOptionRow}
                          activeOpacity={0.7}
                          onPress={() => {
                            setSelectedDestNode(dest);
                            setShowDestDropdown(false);
                          }}
                        >
                          <View style={styles.optionTagBadge}>
                            <Text style={styles.optionTagText}>{dest.tag}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.optionNameText} numberOfLines={1}>{dest.name}</Text>
                            <Text style={styles.optionSubText}>{dest.macroArea} • {dest.channel}</Text>
                          </View>
                          {selectedDestNode?.id === dest.id && (
                            <Check color={COLORS.yellow} size={16} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Active Destination Details */}
                {selectedDestNode ? (
                  <View style={styles.destActiveBox}>
                    <View style={styles.cyanBadge}>
                      <Text style={styles.cyanBadgeText}>TAG: {selectedDestNode.tag}</Text>
                    </View>
                    <Text style={styles.destActiveName}>{selectedDestNode.name}</Text>
                    <View style={styles.destRadioBox}>
                      <Radio color="#00F0FF" size={13} style={{ marginRight: 6 }} />
                      <Text style={styles.destRadioText} numberOfLines={1}>{selectedDestNode.channel}</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.selectPromptText}>
                    Seleccione un activo del desplegable para trazar la ruta de pasarelas con waypoints neón sobre el mapa 3D.
                  </Text>
                )}
              </View>

              {/* CARD 3: ROUTE GUIDANCE & CANCEL ROUTE */}
              {selectedDestNode && routeInfo && (
                <View style={styles.sidebarRouteInfoCard}>
                  <View style={styles.walkBadgeRow}>
                    <Footprints color={COLORS.textDark} size={18} style={{ marginRight: 6 }} />
                    <Text style={styles.walkBadgeText}>{routeInfo.distanceText}</Text>
                  </View>

                  <View style={styles.eppBox}>
                    <ShieldAlert color={COLORS.yellow} size={14} style={{ marginRight: 6 }} />
                    <Text style={styles.eppText}>{routeInfo.epp}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.cancelRouteBtn}
                    activeOpacity={0.85}
                    onPress={handleClearRoute}
                  >
                    <X color={COLORS.textPrimary} size={16} style={{ marginRight: 4 }} />
                    <Text style={styles.cancelRouteBtnText}>[ ❌ CANCELAR RUTA / LIMPIAR ]</Text>
                  </TouchableOpacity>
                </View>
              )}

            </ScrollView>

            {/* SIDEBAR FOOTER CLOSE BUTTON */}
            <TouchableOpacity
              style={styles.sidebarCloseBtn}
              activeOpacity={0.85}
              onPress={onClose}
            >
              <X color={COLORS.textDark} size={18} style={{ marginRight: 6 }} />
              <Text style={styles.sidebarCloseBtnText}>[ ✖ CERRAR NAVEGADOR ]</Text>
            </TouchableOpacity>

          </View>

          {/* -----------------------------------------------------------------
             RIGHT AREA: PROPORTIONAL 3D MAP CANVAS & SYNCHRONIZED OVERLAYS
             ----------------------------------------------------------------- */}
          <View style={styles.rightMapCanvasArea}>
            
            {/* FLOATING DISCRETE CLOSE BUTTON (TOP-RIGHT) */}
            <TouchableOpacity
              style={styles.floatingTopRightCloseBtn}
              activeOpacity={0.8}
              onPress={onClose}
            >
              <X color={COLORS.textPrimary} size={22} />
            </TouchableOpacity>

            {/* RELATIVE ASPECT CONTAINER WRAPPER (SYNCHRONIZED PINES & SVG OVERLAY) */}
            <View style={styles.relativeAspectContainer}>
              
              {/* BASE 3D ISOMETRIC LAYOUT MAP IMAGE (assets/planta-layout.png) */}
              <Image
                source={require('../../assets/planta-layout.png')}
                style={styles.mapImageContain}
                resizeMode="contain"
              />

              {/* OVERLAY SVG ROUTE POLYLINE (PROMPT 17: EXACT WAYPOINT TRAJECTORY CH-01 -> MOL-01) */}
              {selectedDestNode && routeInfo && (
                <View style={styles.svgOverlayLayer} pointerEvents="none">
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      zIndex: 10,
                      pointerEvents: 'none',
                    }}
                  >
                    {/* Discrete Dark Underlay Polyline for Contrast */}
                    <polyline
                      points={routeInfo.polylinePoints}
                      fill="none"
                      stroke="#000000"
                      strokeWidth="2.2"
                      strokeOpacity="0.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Fluo Neon Green Animated Polyline (PROMPT 19: strokeWidth="1.5", stroke="#00FF88", strokeDasharray="4, 3", fill="none") */}
                    <polyline
                      className="waze-dash-anim"
                      points={routeInfo.polylinePoints}
                      fill="none"
                      stroke="#00FF88"
                      strokeWidth="1.5"
                      strokeDasharray="4, 3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        filter: 'drop-shadow(0px 0px 3px rgba(0,255,136,0.85))',
                      }}
                    />
                  </svg>
                </View>
              )}

              {/* ORIGIN PIN (PROMPT 14 EXACT COORDINATE { x: 28, y: 20 }) */}
              <View style={[styles.pinBeaconAbsolute, { left: `${originNode.x}%`, top: `${originNode.y}%` }]}>
                <View style={[styles.radarRingHalo, { className: 'radar-halo-anim' }]} />
                <View style={styles.originPinBadge}>
                  <MapPin color="#000000" size={14} />
                  <Text style={styles.originPinText}>ORIGEN: {originNode.tag}</Text>
                </View>
              </View>

              {/* DESTINATION PIN (EXACT COORDINATE E.G. MOL-01 {65, 22}, CEL-01 {75, 45}, ESP-01 {48, 78}) */}
              {selectedDestNode && (
                <View style={[styles.pinBeaconAbsolute, { left: `${selectedDestNode.x}%`, top: `${selectedDestNode.y}%` }]}>
                  <View style={[styles.destPinBadge, { className: 'pin-vibrate-anim' }]}>
                    <Navigation color="#000000" size={14} />
                    <Text style={styles.destPinText}>DESTINO: {selectedDestNode.tag}</Text>
                  </View>
                </View>
              )}

            </View>

          </View>

        </View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlayFullScreen: {
    flex: 1,
    backgroundColor: '#000000',
    width: '100%',
    height: '100%',
  },
  splitMainContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#000000',
    width: '100%',
    height: '100%',
  },
  leftSidebarPanel: {
    width: 320,
    backgroundColor: '#0A1017',
    borderRightWidth: 1.5,
    borderRightColor: '#1E2D3D',
    padding: SPACING.md,
    justifyContent: 'space-between',
    zIndex: 100,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2D3D',
    marginBottom: SPACING.sm,
  },
  sidebarHeaderTitle: {
    color: COLORS.yellow,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.8,
  },
  sidebarScrollContent: {
    gap: SPACING.md,
    paddingBottom: SPACING.md,
  },
  sidebarCard: {
    backgroundColor: '#121C27',
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 1.5,
    borderColor: '#223548',
    padding: SPACING.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  limePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF88',
    marginRight: 6,
  },
  cardHeaderLime: {
    color: '#00FF88',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  cardHeaderYellow: {
    color: COLORS.yellow,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  equipmentTitleText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  tagBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    gap: 6,
  },
  limeBadge: {
    backgroundColor: '#00FF88',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  limeBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  macroAreaText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  radioInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#192837',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  radioLabelText: {
    color: '#80B0DF',
    fontSize: 9,
    fontWeight: '800',
  },
  radioValueText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '800',
  },
  dropdownSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1B2A3A',
    borderWidth: 1.5,
    borderColor: COLORS.yellow,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: 8,
  },
  dropdownSelectorBtnText: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 12,
    flex: 1,
    marginRight: 4,
  },
  dropdownMenuList: {
    backgroundColor: '#162331',
    borderWidth: 1,
    borderColor: '#304963',
    borderRadius: 8,
    marginTop: 6,
    overflow: 'hidden',
  },
  dropdownOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#203245',
    gap: 6,
  },
  optionTagBadge: {
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  optionTagText: {
    color: COLORS.textDark,
    fontSize: 9,
    fontWeight: '900',
  },
  optionNameText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '800',
  },
  optionSubText: {
    color: COLORS.textSecondary,
    fontSize: 9,
  },
  destActiveBox: {
    backgroundColor: '#182736',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00F0FF',
    padding: SPACING.sm,
    marginTop: SPACING.sm,
  },
  cyanBadge: {
    backgroundColor: '#00F0FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  cyanBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  destActiveName: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  destRadioBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  destRadioText: {
    color: '#80E0FF',
    fontSize: 10,
    fontWeight: '700',
  },
  selectPromptText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 6,
  },
  sidebarRouteInfoCard: {
    backgroundColor: '#121C26',
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 1.5,
    borderColor: COLORS.yellow,
    padding: SPACING.md,
    gap: 8,
  },
  walkBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  walkBadgeText: {
    color: COLORS.textDark,
    fontSize: 12,
    fontWeight: '900',
  },
  eppBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2836',
    padding: 6,
    borderRadius: 6,
  },
  eppText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
  },
  cancelRouteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.red,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 2,
  },
  cancelRouteBtnText: {
    color: COLORS.textPrimary,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  sidebarCloseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.yellow,
    paddingVertical: 12,
    borderRadius: GLOVE_TARGETS.borderRadius,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  sidebarCloseBtnText: {
    color: COLORS.textDark,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },

  // -------------------------------------------------------------------------
  // RIGHT MAP CANVAS STYLES (PROMPT 14 RELATIVE CONTAINER ANKLE)
  // -------------------------------------------------------------------------
  rightMapCanvasArea: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingTopRightCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(10, 16, 26, 0.85)',
    borderWidth: 1.5,
    borderColor: COLORS.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  relativeAspectContainer: {
    width: '100%',
    height: '100%',
    position: 'relative', // RELATIVE CONTAINER ANKLE FOR PINES AND SVG
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImageContain: {
    width: '100%',
    height: '100%',
    opacity: 0.95,
  },
  svgOverlayLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
    pointerEvents: 'none',
  },
  pinBeaconAbsolute: {
    position: 'absolute',
    transform: [{ translateX: -30 }, { translateY: -35 }],
    alignItems: 'center',
    zIndex: 50,
  },
  radarRingHalo: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 255, 136, 0.5)',
    borderWidth: 2,
    borderColor: '#00FF88',
    top: 4,
  },
  originPinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00FF88', // Fluo Neon Green
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#000000',
    elevation: 8,
  },
  originPinText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 10,
    marginLeft: 4,
  },
  destPinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F0FF', // Cyan
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#000000',
    elevation: 8,
  },
  destPinText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 10,
    marginLeft: 4,
  }
});
