/**
 * S.I.T.O. — Sistema de Información Táctico Operacional
 * Componente React: Mapa Base 3D + Enrutamiento Táctico de Personal
 *
 * ARQUITECTURA DE CAPAS:
 *   CAPA 0 — Imagen isométrica 3D (background)
 *   CAPA 1 — SVG overlay (edges, waypoints, asset pins, route path)
 *   CAPA 2 — React controls (sidebar, info panel)
 *
 * REGLA DE ORO: Ninguna ruta cruza edificios. Todas las rutas siguen
 *               el grafo de aristas válidas definido en sitoMapGraph.js.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';

import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Modal,
} from 'react-native';
import { COLORS, SPACING, GLOVE_TARGETS } from '../theme';
import {
  Navigation, X, MapPin, AlertTriangle, CheckCircle2, Clock,
  Footprints, ChevronRight, Info, Radio, ShieldAlert, Activity,
  RefreshCw, Target,
} from 'lucide-react-native';

// S.I.T.O. Graph data + pathfinding
import {
  SITO_GRAPH, SURFACE_STYLES, dijkstra, getNodeById, estimateMinutes,
} from '../data/sitoMapGraph';

// WorkOrders context for live alert badges
import { useWorkOrders } from '../context/WorkOrdersContext';

// EPP Dinámico — silhoueta vectorial con protección por tipo de equipo
import EPPSilhouette from './EPPSilhouette';

// ─── CONSTANTS ─────────────────────────────────────────────────────────────
const PLANT_IMAGE = require('../../assets/planta-layout.png');

const AREA_COLORS = {
  'ÁREA SECA': '#FF7A00',
  'ÁREA HÚMEDA': '#00B8D9',
  'PROCESOS / RELAVES': '#8B5CF6',
};

// Default origin: technician at plant entrance (wp_02 == wp_origin)
const DEFAULT_ORIGIN_ID = 'wp_02';

// ─── PIN GEOMETRY HELPERS ─────────────────────────────────────────────────────
// Render an SVG map-pin (teardrop) shape
function SvgPin({ x, y, fill, stroke, size = 2.2, label, badge, onPress, isSelected }) {
  // labelY: render label directly above pin bubble, zero external bias
  const bubbleCy = y - size;          // centre of pin circle
  const labelY   = bubbleCy - size * 0.9; // just above the bubble — no extra constant
  return (
    <g>
      {/* Glow halo for selected */}
      {isSelected && (
        <circle cx={x} cy={bubbleCy} r={size * 1.8} fill="none" stroke={fill} strokeWidth={0.4} opacity={0.35} className="sito-radar-halo" />
      )}
      {/* Pin body — teardrop: circle + triangle */}
      <circle cx={x} cy={bubbleCy} r={size * 0.8} fill={fill} stroke={stroke || '#000'} strokeWidth={0.3} />
      <polygon
        points={`${x - 0.6},${y - size * 0.2} ${x + 0.6},${y - size * 0.2} ${x},${y}`}
        fill={fill}
        stroke={stroke || '#000'}
        strokeWidth={0.2}
      />
      {/* Badge overlay (alert status) */}
      {badge && (
        <circle cx={x + size * 0.55} cy={bubbleCy - size * 0.6} r={size * 0.5} fill={badge} stroke="#000" strokeWidth={0.2} className={badge === '#FF3333' ? 'sito-badge-blink' : ''} />
      )}
      {/* TAG label — positioned at labelY (no external Y bias) */}
      {label && (
        <>
          {/* Background pill for readability */}
          <rect
            x={x - 5.5}
            y={labelY - 1.6}
            width={11}
            height={2.2}
            rx={0.8}
            fill="rgba(0,0,0,0.72)"
          />
          <text
            x={x}
            y={labelY}
            textAnchor="middle"
            fontSize={1.35}
            fill="#E8F0FF"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {label}
          </text>
        </>
      )}
    </g>
  );
}


// ─── WAYPOINT DOT ─────────────────────────────────────────────────────────────
function SvgWaypoint({ x, y, isOnRoute }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={isOnRoute ? 1.1 : 0.7}
      fill={isOnRoute ? '#10B981' : '#2A3D55'}
      stroke={isOnRoute ? '#00FF88' : '#1A2D45'}
      strokeWidth={0.25}
    />
  );
}

// ─── ANIMATED ROUTE PATH ──────────────────────────────────────────────────────
function SvgRoutePath({ pathNodeIds }) {
  const points = pathNodeIds
    .map((id) => getNodeById(id))
    .filter(Boolean)
    .map((n) => `${n.x},${n.y}`)
    .join(' ');

  if (!points) return null;

  return (
    <>
      {/* Dark underlay for contrast */}
      <polyline
        points={points}
        fill="none"
        stroke="#000000"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.6}
      />
      {/* Animated neon route */}
      <polyline
        points={points}
        fill="none"
        stroke="#10B981"
        strokeWidth={0.85}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="3,1.5"
        className="sito-route-animated"
      />
      {/* Bright inner highlight */}
      <polyline
        points={points}
        fill="none"
        stroke="#AAFFCC"
        strokeWidth={0.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.5}
      />
    </>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function SitoTacticalMap({
  visible, onClose, initialEquipmentTag,
  tabMode = false, onNavigateToInicio,
  activeRole = 'MANDANTE',
}) {
  const { workOrders } = useWorkOrders();
  const isContratista = activeRole === 'OPERATIVO';

  // ─── Mode: MANDANTE | CONTRATISTA | EMERGENCIA ────────────────────────────
  const [mapMode, setMapMode] = useState('MANDANTE');

  // State
  const [originId, setOriginId] = useState(DEFAULT_ORIGIN_ID);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [routeResult, setRouteResult] = useState(null);
  const [showAssetPanel, setShowAssetPanel] = useState(false);

  // ── OT activa asignada al técnico (primer match ACTIVA/DESARROLLO) ──────
  const activeOT = useMemo(() =>
    workOrders.find(w =>
      w.estadoMandante === 'ACTIVA' ||
      w.operativoStatus === 'EN EJECUCIÓN EN TERRENO' ||
      w.operativoStatus === 'ACEPTADA'
    ) || null,
  [workOrders]);

  // Asset objetivo de la OT activa
  const otTargetAsset = useMemo(() => {
    if (!activeOT) return null;
    return SITO_GRAPH.assets.find(a =>
      a.tag === activeOT.tag ||
      a.altTag === activeOT.tag ||
      a.id === activeOT.tag
    ) || null;
  }, [activeOT]);

  // Punto de Encuentro de Emergencia (PEE) — nodo perimetral más cercano al origen
  const PEE_NODE_ID = 'wp_02'; // Acceso Acopio Mineral — zona segura perimetral

  // ── WorkOrders badge map: nodeId → badge color ─────────────────────────────
  const badgeMap = useMemo(() => {
    const map = {};
    for (const asset of SITO_GRAPH.assets) {
      // Find matching work orders by tag
      const relatedWos = workOrders.filter(
        (wo) =>
          wo.tag === asset.tag ||
          wo.tag === asset.altTag ||
          wo.equipmentName?.toLowerCase().includes(asset.name.toLowerCase().split(' ')[0])
      );
      if (relatedWos.length === 0) {
        map[asset.nodeId] = '#00FF88'; // Green: no active issues
      } else {
        const hasCritical = relatedWos.some(
          (wo) => wo.estadoMandante === 'ACTIVA' && wo.status !== 'TAREA CERRADA'
        );
        const hasInProgress = relatedWos.some(
          (wo) => wo.operativoStatus === 'EN EJECUCIÓN EN TERRENO' || wo.operativoStatus === 'CIERRE PENDIENTE'
        );
        if (hasCritical) map[asset.nodeId] = '#FF3333';        // Red: critical alert
        else if (hasInProgress) map[asset.nodeId] = '#FFB800'; // Yellow: in progress
        else map[asset.nodeId] = '#00FF88';                    // Green: closed/resolved
      }
    }
    return map;
  }, [workOrders]);

  // ── Selected asset object ──────────────────────────────────────────────────
  const selectedAsset = useMemo(
    () => SITO_GRAPH.assets.find((a) => a.id === selectedAssetId) || null,
    [selectedAssetId]
  );

  // ── Related WOs for selected asset ────────────────────────────────────────
  const relatedWOs = useMemo(() => {
    if (!selectedAsset) return [];
    return workOrders.filter(
      (wo) =>
        wo.tag === selectedAsset.tag ||
        wo.tag === selectedAsset.altTag ||
        wo.equipmentName?.toLowerCase().includes(selectedAsset.name.toLowerCase().split(' ')[0])
    );
  }, [selectedAsset, workOrders]);

  // ── Compute route when destination selected ────────────────────────────────
  const handleSelectAsset = useCallback(
    (asset) => {
      setSelectedAssetId(asset.id);
      setShowAssetPanel(true);
      // Calculate route from origin to asset's node
      const result = dijkstra(originId, asset.nodeId);
      setRouteResult(result);
    },
    [originId]
  );

  const handleClearRoute = () => {
    setSelectedAssetId(null);
    setRouteResult(null);
    setShowAssetPanel(false);
  };

  // ── Route node ids set for highlighting ───────────────────────────────────
  const routeNodeSet = useMemo(
    () => new Set(routeResult?.path || []),
    [routeResult]
  );

  // ── Auto-route effect: trigger on mode change ──────────────────────────────
  useEffect(() => {
    if (mapMode === 'EMERGENCIA') {
      // Auto-route to PEE evacuation point
      const result = dijkstra(originId, PEE_NODE_ID);
      setRouteResult(result);
      setSelectedAssetId(null);
      setShowAssetPanel(false);
    } else if (isContratista && otTargetAsset) {
      // CONTRATISTA: auto-route to OT target on load and when OT changes
      const result = dijkstra(originId, otTargetAsset.nodeId);
      setSelectedAssetId(otTargetAsset.id);
      setRouteResult(result);
      setShowAssetPanel(true);
    } else if (!isContratista) {
      // MANDANTE: clear auto-routes, restore manual selection
      setRouteResult(null);
      setSelectedAssetId(null);
      setShowAssetPanel(false);
    }
  }, [mapMode, originId, isContratista, otTargetAsset]);

  // Route color by mode
  const routeStroke = mapMode === 'EMERGENCIA' ? '#FF4500' : '#00FF88';
  const routeGlowColor = mapMode === 'EMERGENCIA' ? '#FF6B00' : '#00CC55';

  // In tabMode the component mounts directly as a screen — no Modal wrapper needed
  const content = (
    <>
      {/* CSS keyframe animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes sitoRouteDash {
            from { stroke-dashoffset: 20; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes sitoRadarPulse {
            0%   { r: 2.5; opacity: 0.9; }
            50%  { r: 5.5; opacity: 0.3; }
            100% { r: 7.5; opacity: 0; }
          }
          @keyframes sitoBadgeBlink {
            0%   { opacity: 1; }
            50%  { opacity: 0.35; }
            100% { opacity: 1; }
          }
          @keyframes sitoEmergencyPulse {
            0%   { opacity: 1; background-color: #7F0000; }
            50%  { opacity: 0.85; background-color: #FF0000; }
            100% { opacity: 1; background-color: #7F0000; }
          }
          .sito-route-animated {
            animation: sitoRouteDash 1.5s linear infinite;
          }
          .sito-radar-halo {
            animation: sitoRadarPulse 2s ease-out infinite;
          }
          .sito-badge-blink {
            animation: sitoBadgeBlink 1.2s ease-in-out infinite;
          }
          .sito-emergency-banner {
            animation: sitoEmergencyPulse 0.8s ease-in-out infinite;
          }
        `
      }} />

      <View style={[styles.fullScreenOverlay, tabMode && styles.fullScreenOverlayTab]}>
        {/* ═══════════════════════════════════════════════════════════════
            SPLIT LAYOUT: LEFT SIDEBAR + RIGHT MAP CANVAS
            ═══════════════════════════════════════════════════════════════ */}
        <View style={[styles.splitContainer, tabMode && styles.splitContainerTab]}>


          {/* ── LEFT SIDEBAR TACTICAL PANEL ──────────────────────────── */}
          <View style={styles.leftSidebar}>
            {/* Header */}
            <View style={[styles.sidebarHeader, isContratista && styles.sidebarHeaderContratista]}>
              <Navigation color={mapMode === 'EMERGENCIA' ? '#FF4500' : isContratista ? '#00E5FF' : '#FFE000'} size={18} style={{ marginRight: 6 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.sidebarHeaderTitle}>S.I.T.O.</Text>
                <Text style={styles.sidebarHeaderSub}>
                  {isContratista ? '👷 Perfil Contratista — Vista Táctica' : '🛡️ Perfil Mandante — Supervisión Total'}
                </Text>
              </View>

              {/* 🚨 EMERGENCIA fixed button — always visible */}
              <TouchableOpacity
                style={[
                  styles.emergencyHeaderBtn,
                  mapMode === 'EMERGENCIA' && styles.emergencyHeaderBtnActive,
                ]}
                onPress={() => setMapMode(prev => prev === 'EMERGENCIA' ? 'MANDANTE' : 'EMERGENCIA')}
                activeOpacity={0.8}
              >
                <Text style={styles.emergencyHeaderBtnText}>
                  {mapMode === 'EMERGENCIA' ? '✔ SALIR' : '🚨'}
                </Text>
              </TouchableOpacity>

              {!tabMode && (
                <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={styles.closeBtn}>
                  <X color="#FFFFFF" size={18} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 16 }}>

              {/* Origin indicator */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>📍 POSICIÓN DEL TÉCNICO</Text>
                <View style={styles.originBadge}>
                  <Footprints color="#00E5FF" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.originBadgeText}>Acceso Principal — Área Seca (wp_02)</Text>
                </View>
              </View>

              {/* ─────── EMERGENCIA SIDEBAR ─────────────────────────────── */}
              {mapMode === 'EMERGENCIA' && (
                <View style={styles.emergencySidebarPanel}>
                  <Text style={styles.emergencyTitle}>🚨 PROTOCOLO DE EVACUACIÓN</Text>
                  <Text style={styles.emergencySubtitle}>DIRÍGETE AL PUNTO DE ENCUENTRO DE EMERGENCIA (PEE)</Text>
                  <View style={styles.emergencyInfoRow}>
                    <Text style={styles.emergencyInfoLabel}>ZONA SEGURA</Text>
                    <Text style={styles.emergencyInfoVal}>Acceso Principal — Área Seca</Text>
                  </View>
                  <View style={styles.emergencyInfoRow}>
                    <Text style={styles.emergencyInfoLabel}>DISTANCIA</Text>
                    <Text style={styles.emergencyInfoVal}>
                      {routeResult ? `${routeResult.totalDistance}m (~${estimateMinutes(routeResult.totalDistance)} min)` : 'Calculando…'}
                    </Text>
                  </View>
                  <Text style={styles.emergencyInstruction}>
                    Sigue la línea ROJA en el mapa. No te detengas en equipos. Confirma llegada en el PEE.
                  </Text>
                </View>
              )}

              {/* ────── CONTRATISTA: OT ASIGNADA ───────────────────────────── */}
              {isContratista && mapMode !== 'EMERGENCIA' && (
                <View style={styles.otPanel}>
                  <Text style={styles.otPanelTitle}>🔧 ORDEN DE TRABAJO ASIGNADA</Text>
                  {activeOT ? (
                    <>
                      <View style={styles.otPanelRow}>
                        <Text style={styles.otPanelLabel}>CÓDIGO OT</Text>
                        <Text style={styles.otPanelVal}>{activeOT.id || activeOT.alertId}</Text>
                      </View>
                      <View style={styles.otPanelRow}>
                        <Text style={styles.otPanelLabel}>EQUIPO</Text>
                        <Text style={styles.otPanelVal} numberOfLines={2}>{activeOT.titulo || activeOT.equipmentName}</Text>
                      </View>
                      <View style={styles.otPanelRow}>
                        <Text style={styles.otPanelLabel}>TAG</Text>
                        <Text style={[styles.otPanelVal, { color: '#00E5FF', fontFamily: 'monospace' }]}>{activeOT.tag}</Text>
                      </View>
                      <View style={styles.otPanelRow}>
                        <Text style={styles.otPanelLabel}>ÁREA</Text>
                        <Text style={styles.otPanelVal}>{activeOT.area || '—'}</Text>
                      </View>
                      <View style={styles.otPanelRow}>
                        <Text style={styles.otPanelLabel}>PRIORIDAD</Text>
                        <Text style={[styles.otPanelVal, { color: '#FF3333' }]}>{activeOT.prioridad || activeOT.status || '—'}</Text>
                      </View>

                      {/* PTS — Permiso de Trabajo Seguro */}
                      <View style={[styles.otPtsBox]}>
                        <Text style={styles.otPtsLabel}>📝 PERMISO DE TRABAJO SEGURO (PTS)</Text>
                        <Text style={styles.otPtsVal}>{activeOT.permiso || activeOT.pts || 'Verificar con supervisor antes de iniciar'}</Text>
                      </View>

                      {/* EPP */}
                      {(activeOT.epp || activeOT.eppRequerido) && (
                        <View style={styles.otEppBox}>
                          <Text style={styles.otPanelLabel}>🧰 EPP REQUERIDO</Text>
                          <Text style={styles.otEppText}>{activeOT.epp || activeOT.eppRequerido}</Text>
                        </View>
                      )}

                      {/* Ruta calculada */}
                      {routeResult && (
                        <View style={[styles.otPanelRow, { marginTop: 6 }]}>
                          <Text style={styles.otPanelLabel}>🗺 RUTA</Text>
                          <Text style={[styles.otPanelVal, { color: '#00FF88' }]}>
                            {routeResult.totalDistance}m · ~{estimateMinutes(routeResult.totalDistance)} min
                          </Text>
                        </View>
                      )}

                      {/* Botón INICIAR RUTA DIRECTA */}
                      <TouchableOpacity
                        style={styles.iniciarRutaBtn}
                        activeOpacity={0.8}
                        onPress={() => {
                          if (otTargetAsset) {
                            const result = dijkstra(originId, otTargetAsset.nodeId);
                            setSelectedAssetId(otTargetAsset.id);
                            setRouteResult(result);
                          }
                        }}
                      >
                        <Text style={styles.iniciarRutaBtnText}>▶ INICIAR RUTA DIRECTA</Text>
                      </TouchableOpacity>

                       {/* ── EPP DINÁMICO: Silhoueta + Lista por tipo de equipo ── */}
                       {/* EPP usa el ID del activo (CH-02) no el TAG de la OT (ATT-801) */}
                       <EPPSilhouette
                         equipmentTag={otTargetAsset?.id || activeOT.tag}
                         equipmentName={activeOT.titulo || activeOT.equipmentName}
                       />

                    </>
                  ) : (
                    <Text style={styles.otPanelEmpty}>Sin OT activa asignada.
Contacta a tu supervisor.</Text>
                  )}
                </View>
              )}

              {/* ────── MANDANTE: ruta calculada + lista activos + leyenda ────── */}
              {!isContratista && mapMode !== 'EMERGENCIA' && (
                <>
                  {/* Route result */}
                  {routeResult && selectedAsset && (
                    <View style={styles.routeResultBox}>
                      <Text style={styles.routeResultTitle}>🧭 RUTA CALCULADA</Text>
                      <Text style={styles.routeResultDest}>▶ {selectedAsset.name}</Text>
                      <View style={styles.routeStatRow}>
                        <View style={styles.routeStat}>
                          <Text style={styles.routeStatValue}>{routeResult.totalDistance}m</Text>
                          <Text style={styles.routeStatLabel}>Distancia</Text>
                        </View>
                        <View style={styles.routeStat}>
                          <Text style={styles.routeStatValue}>{estimateMinutes(routeResult.totalDistance)} min</Text>
                          <Text style={styles.routeStatLabel}>A pie</Text>
                        </View>
                        <View style={styles.routeStat}>
                          <Text style={styles.routeStatValue}>{routeResult.path.length - 1}</Text>
                          <Text style={styles.routeStatLabel}>Tramos</Text>
                        </View>
                      </View>
                      <Text style={styles.pathStepsTitle}>ITINERARIO:</Text>
                      <ScrollView style={{ maxHeight: 110 }} nestedScrollEnabled>
                        {routeResult.path.map((nodeId, idx) => {
                          const n = getNodeById(nodeId);
                          return (
                            <View key={nodeId} style={styles.pathStepRow}>
                              <View style={[styles.pathStepDot, { backgroundColor: idx === 0 ? '#FFE000' : idx === routeResult.path.length - 1 ? '#10B981' : '#00E5FF' }]} />
                              <Text style={styles.pathStepLabel} numberOfLines={1}>{n?.label || nodeId}</Text>
                            </View>
                          );
                        })}
                      </ScrollView>
                      <TouchableOpacity style={styles.clearRouteBtn} onPress={handleClearRoute} activeOpacity={0.8}>
                        <RefreshCw color="#000" size={13} style={{ marginRight: 4 }} />
                        <Text style={styles.clearRouteBtnText}>LIMPIAR RUTA</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Asset list */}
                  <View style={styles.sectionBlock}>
                    <Text style={styles.sectionLabel}>🏭 ACTIVOS EN PLANTA — Seleccionar destino:</Text>
                    {SITO_GRAPH.assets.map((asset) => {
                      const badge = badgeMap[asset.nodeId] || '#00FF88';
                      const isSelected = selectedAssetId === asset.id;
                      return (
                        <TouchableOpacity
                          key={asset.id}
                          style={[styles.assetListItem, isSelected && styles.assetListItemSelected]}
                          activeOpacity={0.85}
                          onPress={() => handleSelectAsset(asset)}
                        >
                          <View style={[styles.assetStatusDot, { backgroundColor: badge }]} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.assetListTag}>{asset.id}</Text>
                            <Text style={styles.assetListName} numberOfLines={1}>{asset.name}</Text>
                          </View>
                          <View style={[styles.assetAreaBadge, { borderColor: AREA_COLORS[asset.area] || '#00E5FF' }]}>
                            <Text style={[styles.assetAreaText, { color: AREA_COLORS[asset.area] || '#00E5FF' }]}>
                              {asset.area === 'ÁREA SECA' ? 'SECA' : asset.area === 'ÁREA HÚMEDA' ? 'HÚMEDA' : 'RELAVES'}
                            </Text>
                          </View>
                          <ChevronRight color="#2A3D55" size={14} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Legend */}
                  <View style={styles.legendBlock}>
                    <Text style={styles.sectionLabel}>📘 LEYENDA</Text>
                    {[
                      { color: '#FF3333', label: 'Alerta Crítica Activa' },
                      { color: '#FFB800', label: 'OT en Desarrollo / Cierre Pendiente' },
                      { color: '#00FF88', label: 'Operativo / Sin Alertas' },
                      { color: '#10B981', label: 'Ruta Táctica Calculada' },
                      { color: '#00E5FF', label: 'Pasarela / Walkway' },
                      { color: '#FFB800', label: 'Puente / Bridge' },
                      { color: '#A0784A', label: 'Camino de Tierra' },
                    ].map((l) => (
                      <View key={l.label} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                        <Text style={styles.legendLabel}>{l.label}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

            </ScrollView>

            {/* Close button bottom */}
            {/* Close / Back button — navigates to Inicio in tabMode */}
            <TouchableOpacity
              style={styles.sidebarCloseBtn}
              onPress={tabMode && onNavigateToInicio ? onNavigateToInicio : onClose}
              activeOpacity={0.85}
            >
              <X color="#000000" size={14} style={{ marginRight: 6 }} />
              <Text style={styles.sidebarCloseBtnText}>
                {tabMode ? '[ ← VOLVER A INICIO ]' : '[ ✖ CERRAR MAPA S.I.T.O. ]'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── RIGHT MAP CANVAS AREA ─────────────────────────────────── */}
          <View style={styles.mapCanvasArea}>

            {/* 🚨 EMERGENCY BANNER — pulsing, only in EMERGENCIA mode */}
            {mapMode === 'EMERGENCIA' && (
              <View style={styles.emergencyBanner} className="sito-emergency-banner">
                <Text style={styles.emergencyBannerText}>
                  🚨 ALERTA DE PLANTA — EVACUAR HACIA ZONA SEGURA 🚨
                </Text>
              </View>
            )}

            {/* Floating header */}
            <View style={[styles.mapFloatingHeader, mapMode === 'EMERGENCIA' && { borderColor: '#FF4500' }]}>
              <Target color={mapMode === 'EMERGENCIA' ? '#FF4500' : '#00E5FF'} size={14} style={{ marginRight: 6 }} />
              <Text style={styles.mapFloatingHeaderText}>MAPA DE LA PLANTA — S.I.T.O. v1.0</Text>
              {selectedAsset && (
                <View style={styles.mapSelectedBadge}>
                  <Text style={styles.mapSelectedBadgeText}>▶ {selectedAsset.id}: {selectedAsset.name}</Text>
                </View>
              )}
            </View>

            {/* ── PROPORTIONAL ASPECT CONTAINER (16:9) ─────────────── */}
            <View style={styles.aspectContainer}>

              {/* CAPA 0 — Background 3D isometric image */}
              <Image
                source={PLANT_IMAGE}
                style={styles.plantImage}
                resizeMode="contain"
              />

              {/* CAPA 1 — SVG Vector overlay: edges, nodes, route */}
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 10,
                }}
              >
                {/* ── DRAW ALL EDGES (graph skeleton) ─────────────── */}
                {SITO_GRAPH.edges.map((edge, idx) => {
                  const from = getNodeById(edge.from);
                  const to = getNodeById(edge.to);
                  if (!from || !to) return null;
                  const style = SURFACE_STYLES[edge.surface] || SURFACE_STYLES.walkway;
                  const isOnRoute = routeNodeSet.has(edge.from) && routeNodeSet.has(edge.to);
                  // Don't draw individual edge if it's covered by the animated route
                  if (isOnRoute) return null;
                  return (
                    <line
                      key={`edge-${idx}`}
                      x1={from.x} y1={from.y}
                      x2={to.x} y2={to.y}
                      stroke={style.stroke}
                      strokeWidth={style.strokeWidth}
                      strokeDasharray={style.dash}
                      opacity={0.3}
                    />
                  );
                })}

                {/* ── ANIMATED ROUTE PATH — color by mode ─────────────── */}
                {routeResult && routeResult.path.length > 1 && (
                  <SvgRoutePath pathNodeIds={routeResult.path} stroke={routeStroke} glowColor={routeGlowColor} />
                )}

                {/* ── PEE marker in EMERGENCIA ─────────────────────────── */}
                {mapMode === 'EMERGENCIA' && (() => {
                  const peeNode = getNodeById(PEE_NODE_ID);
                  if (!peeNode) return null;
                  return (
                    <>
                      <circle cx={peeNode.x} cy={peeNode.y} r={4} fill="none" stroke="#FF4500" strokeWidth={0.6} className="sito-radar-halo" />
                      <circle cx={peeNode.x} cy={peeNode.y} r={2} fill="#FF4500" stroke="#FFF" strokeWidth={0.3} />
                      <text x={peeNode.x} y={peeNode.y - 3} textAnchor="middle" fontSize={1.4} fill="#FF4500" fontWeight="bold" fontFamily="monospace">
                        🏁 PEE
                      </text>
                    </>
                  );
                })()}

                {/* ── WAYPOINT DOTS ────────────────────────────────── */}
                {SITO_GRAPH.nodes
                  .filter((n) => n.type === 'waypoint')
                  .map((n) => (
                    <SvgWaypoint
                      key={n.id}
                      x={n.x}
                      y={n.y}
                      isOnRoute={routeNodeSet.has(n.id)}
                    />
                  ))}

                {/* ── ASSET PINS — color por TAG + atenuación en modos ── */}
                {SITO_GRAPH.assets.map((asset) => {
                  const px = asset.coords.x;
                  const py = asset.coords.y;
                  const badge = badgeMap[asset.nodeId] || '#00FF88';
                  const isSelected = selectedAssetId === asset.id;
                  const isOtTarget = otTargetAsset?.id === asset.id;
                  // CONTRATISTA: dim all non-OT assets; hide status badges on non-targets
                  const dimmed = isContratista && !isOtTarget;
                  const pinFill = isSelected ? '#FFE000'
                    : dimmed ? '#0A1A28'
                    : (asset.pinColor || AREA_COLORS[asset.area] || '#00E5FF');
                  const pinOpacity = dimmed ? 0.2 : 1;

                  return (
                    <g key={asset.id} opacity={pinOpacity}>
                      <SvgPin
                        x={px}
                        y={py}
                        fill={pinFill}
                        stroke={isSelected ? '#000' : '#000808'}
                        size={isSelected ? 3.0 : isOtTarget && isContratista ? 3.2 : 2.2}
                        label={isContratista && !isOtTarget ? '' : `TAG: [${asset.id}]`}
                        badge={dimmed ? null : badge}
                        isSelected={isSelected}
                      />
                    </g>
                  );
                })}


                {/* ── ORIGIN MARKER (Técnico) ───────────────────────── */}
                {(() => {
                  const originNode = getNodeById(originId);
                  if (!originNode) return null;
                  return (
                    <>
                      <circle cx={originNode.x} cy={originNode.y} r={1.8} fill="#FFFFFF" stroke="#00E5FF" strokeWidth={0.4} className="sito-radar-halo" />
                      <circle cx={originNode.x} cy={originNode.y} r={1.2} fill="#00E5FF" stroke="#FFF" strokeWidth={0.3} />
                      <text x={originNode.x} y={originNode.y - 2.5} textAnchor="middle" fontSize={1.3} fill="#00E5FF" fontWeight="bold" fontFamily="monospace">
                        👷 TÚ
                      </text>
                    </>
                  );
                })()}

                {/* ── Destination end marker (if route active) ──────── */}
                {routeResult && selectedAsset && (() => {
                  const destNode = getNodeById(selectedAsset.nodeId);
                  if (!destNode) return null;
                  return (
                    <>
                      <circle cx={destNode.x} cy={destNode.y} r={3.2} fill="none" stroke="#10B981" strokeWidth={0.5} opacity={0.6} className="sito-radar-halo" />
                      <circle cx={destNode.x} cy={destNode.y} r={1.0} fill="#10B981" stroke="#FFF" strokeWidth={0.3} />
                    </>
                  );
                })()}
              </svg>

              {/* CAPA 2 — Asset detail panel (popup over map) */}
              {showAssetPanel && selectedAsset && (
                <View style={styles.assetDetailPanel}>
                  <View style={styles.assetDetailHeader}>
                    <View style={[styles.assetDetailAreaDot, { backgroundColor: AREA_COLORS[selectedAsset.area] || '#00E5FF' }]} />
                    <Text style={styles.assetDetailTag}>{selectedAsset.id}</Text>
                    <Text style={styles.assetDetailArea}>{selectedAsset.area}</Text>
                    <TouchableOpacity onPress={() => setShowAssetPanel(false)} activeOpacity={0.8}>
                      <X color="#FFFFFF" size={14} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.assetDetailName}>{selectedAsset.name}</Text>

                  {/* Related WOs summary */}
                  {isContratista ? (
                    /* ══ CONTRATISTA: Checklist de Terreno ════════════════ */
                    <>
                      <Text style={styles.assetDetailWoTitle}>🔧 DETALLE DE INTERVENCIÓN</Text>
                      <View style={styles.ctCheckRow}>
                        <View style={styles.ctCheckDot} />
                        <Text style={styles.ctCheckLabel}>Tarea</Text>
                        <Text style={styles.ctCheckVal} numberOfLines={2}>
                          {activeOT
                            ? `${activeOT.titulo || activeOT.equipmentName} (${activeOT.id || activeOT.alertId})`
                            : 'Inspección & Mant. Preventivo'}
                        </Text>
                      </View>
                      <View style={styles.ctCheckRow}>
                        <View style={[styles.ctCheckDot, { backgroundColor: '#10B981' }]} />
                        <Text style={styles.ctCheckLabel}>PTS</Text>
                        <Text style={[styles.ctCheckVal, { color: '#10B981' }]}>
                          {activeOT?.pts || activeOT?.permiso || 'Aprobado / Listo para inicio'}
                        </Text>
                      </View>
                      <View style={styles.ctCheckRow}>
                        <View style={[styles.ctCheckDot, { backgroundColor: '#FF3333' }]} />
                        <Text style={styles.ctCheckLabel}>LOTO</Text>
                        <Text style={[styles.ctCheckVal, { color: '#FF3333' }]}>Requerido · Candado Rojo</Text>
                      </View>
                      <Text style={[styles.assetDetailWoTitle, { marginTop: 5 }]}>⚠ CONDICIONES DEL PUNTO</Text>
                      <View style={styles.ctCheckRow}>
                        <View style={[styles.ctCheckDot, { backgroundColor: '#FFB800' }]} />
                        <Text style={styles.ctCheckLabel}>Peligros</Text>
                        <Text style={[styles.ctCheckVal, { color: '#FFB800' }]} numberOfLines={2}>
                          Trabajo Altura · Ruido {'>'}85dB
                        </Text>
                      </View>
                      <View style={styles.ctCheckRow}>
                        <View style={[styles.ctCheckDot, { backgroundColor: '#00F0FF' }]} />
                        <Text style={styles.ctCheckLabel}>EPP</Text>
                        <Text style={[styles.ctCheckVal, { color: '#00F0FF' }]} numberOfLines={2}>
                          Casco Linterna · Respirador · Guantes
                        </Text>
                      </View>
                    </>
                  ) : relatedWOs.length > 0 ? (
                    /* ══ MANDANTE: Órdenes / Alertas activas ══════════════ */
                    <>
                      <Text style={styles.assetDetailWoTitle}>📋 ÓRDENES / ALERTAS ACTIVAS:</Text>
                      {relatedWOs.slice(0, 3).map((wo) => (
                        <View key={wo.id} style={styles.assetDetailWoRow}>
                          <View style={[styles.assetDetailWoDot, {
                            backgroundColor: wo.estadoMandante === 'ACTIVA' ? '#FF3333' : wo.status === 'TAREA CERRADA' ? '#00FF88' : '#FFB800'
                          }]} />
                          <Text style={styles.assetDetailWoText} numberOfLines={1}>
                            {wo.alertId || wo.id} — {wo.mandanteStatus || wo.estadoMandante}
                          </Text>
                        </View>
                      ))}
                    </>
                  ) : (
                    <Text style={styles.assetDetailNoWo}>✅ Sin Órdenes de Trabajo activas</Text>
                  )}

                  {/* Route summary — visible en ambos perfiles */}
                  {routeResult && (
                    <View style={styles.assetDetailRouteRow}>
                      <Footprints color="#10B981" size={13} style={{ marginRight: 5 }} />
                      <Text style={styles.assetDetailRouteText}>
                        Ruta: {routeResult.totalDistance}m · ~{estimateMinutes(routeResult.totalDistance)} min a pie
                      </Text>
                    </View>
                  )}

                </View>
              )}

            </View>

            {/* Map footer bar */}
            <View style={styles.mapFooter}>
              <Text style={styles.mapFooterText}>
                🟠 Área Seca &nbsp;&nbsp; 🔵 Área Húmeda &nbsp;&nbsp; 🟣 Procesos / Relaves &nbsp;&nbsp;
                ─── Walkway &nbsp; - - - Bridge &nbsp; · · · Dirt Road
              </Text>
              <Text style={styles.mapFooterVersion}>S.I.T.O. v1.0 | Planta Concentradora | © MAINT-OS</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );

  if (tabMode) return content;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
}



// ─── STYLESHEET ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // tabMode: fill the full tab screen area with no centering constraints
  fullScreenOverlayTab: {
    backgroundColor: '#050D1A',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  splitContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    maxWidth: 1400,
    maxHeight: 820,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#00E5FF',
  },
  // tabMode: no max-height cap, no border-radius, fills 100% of screen
  splitContainerTab: {
    flex: 1,
    maxHeight: undefined,
    maxWidth: undefined,
    borderRadius: 0,
    borderWidth: 0,
  },

  // ── LEFT SIDEBAR ──────────────────────────────────────────────
  leftSidebar: {
    width: 280,
    backgroundColor: '#050D1A',
    borderRightWidth: 1,
    borderRightColor: '#1A2D45',
    flexDirection: 'column',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000A16',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#00E5FF',
  },
  // CONTRATISTA variant — cyan accent instead of yellow
  sidebarHeaderContratista: {
    borderBottomColor: '#00E5FF',
    backgroundColor: '#020E1C',
  },

  // ── PTS BOX ──────────────────────────────────────────────
  otPtsBox: {
    backgroundColor: '#071828',
    borderRadius: 6,
    padding: 8,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#00E5FF',
  },
  otPtsLabel: {
    color: '#00E5FF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  otPtsVal: {
    color: '#B0C8E0',
    fontSize: 10,
    lineHeight: 14,
  },

  // ── INICIAR RUTA DIRECTA BUTTON ──────────────────────────
  iniciarRutaBtn: {
    marginTop: 12,
    backgroundColor: '#00CC55',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  iniciarRutaBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },


  sidebarHeaderTitle: {
    color: '#FFE000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sidebarHeaderSub: {
    color: '#8CAAD0',
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  sectionBlock: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
  },
  sectionLabel: {
    color: '#8CAAD0',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 7,
  },
  originBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1E32',
    borderWidth: 1,
    borderColor: '#00E5FF',
    borderRadius: 6,
    padding: 8,
  },
  originBadgeText: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
  },
  routeResultBox: {
    backgroundColor: '#040F1C',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 8,
    margin: 12,
    padding: 10,
  },
  routeResultTitle: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  routeResultDest: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
  },
  routeStatRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  routeStat: {
    flex: 1,
    backgroundColor: '#0A1628',
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
  },
  routeStatValue: {
    color: '#00E5FF',
    fontSize: 14,
    fontWeight: '900',
  },
  routeStatLabel: {
    color: '#6A84A0',
    fontSize: 8,
    fontWeight: '600',
    marginTop: 1,
  },
  pathStepsTitle: {
    color: '#8CAAD0',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  pathStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  pathStepDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  pathStepLabel: {
    color: '#C0D0E8',
    fontSize: 9,
    fontWeight: '600',
    flex: 1,
  },
  clearRouteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingVertical: 7,
    marginTop: 8,
  },
  clearRouteBtnText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  assetListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1628',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#1A2D45',
    padding: 8,
    marginBottom: 5,
    gap: 6,
  },
  assetListItemSelected: {
    borderColor: '#FFE000',
    backgroundColor: '#100D00',
  },
  assetStatusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  assetListTag: {
    color: '#00E5FF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  assetListName: {
    color: '#C0D0E8',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  assetAreaBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  assetAreaText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  legendBlock: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    color: '#8CAAD0',
    fontSize: 9,
    fontWeight: '600',
  },
  sidebarCloseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00E5FF',
    paddingVertical: 12,
    margin: 12,
    borderRadius: 8,
  },
  sidebarCloseBtnText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // ── MAP CANVAS ─────────────────────────────────────────────────
  mapCanvasArea: {
    flex: 1,
    backgroundColor: '#060C16',
    flexDirection: 'column',
  },
  mapFloatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000A16',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2D45',
    gap: 8,
    flexWrap: 'wrap',
  },
  mapFloatingHeaderText: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    flex: 1,
  },
  mapSelectedBadge: {
    backgroundColor: '#FFE000',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  mapSelectedBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  aspectContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  plantImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },

  // ── ASSET DETAIL PANEL (floating popup on map) ─────────────────
  assetDetailPanel: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 240,
    backgroundColor: 'rgba(6,15,28,0.96)',
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    borderRadius: 10,
    padding: 12,
    zIndex: 50,
  },
  assetDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  assetDetailAreaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  assetDetailTag: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    flex: 1,
  },
  assetDetailArea: {
    color: '#6A84A0',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  assetDetailName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 14,
  },
  assetDetailWoTitle: {
    color: '#8CAAD0',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  assetDetailWoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  assetDetailWoDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  assetDetailWoText: {
    color: '#C0D0E8',
    fontSize: 9,
    fontWeight: '600',
    flex: 1,
  },
  assetDetailNoWo: {
    color: '#00FF88',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
  },
  assetDetailRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#061526',
    borderRadius: 6,
    padding: 7,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  assetDetailRouteText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },

  // ── CONTRATISTA: Field checklist rows ──────────────────────────
  ctCheckRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  ctCheckDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00F0FF',
    marginTop: 3,
    flexShrink: 0,
  },
  ctCheckLabel: {
    color: '#6A84A0',
    fontSize: 9,
    fontWeight: '800',
    width: 38,
    flexShrink: 0,
    lineHeight: 14,
  },
  ctCheckVal: {
    flex: 1,
    color: '#D0E0F5',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 14,
  },

  // ── MAP FOOTER ─────────────────────────────────────────────────
  mapFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000A16',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#1A2D45',
    flexWrap: 'wrap',
    gap: 4,
  },
  mapFooterText: {
    color: '#6A84A0',
    fontSize: 8,
    fontWeight: '600',
    flex: 1,
  },
  mapFooterVersion: {
    color: '#2A3D55',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // ── EMERGENCY HEADER BUTTON ────────────────────────────────
  emergencyHeaderBtn: {
    backgroundColor: '#7F0000',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#FF4500',
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 6,
  },
  emergencyHeaderBtnActive: {
    backgroundColor: '#FF4500',
    borderColor: '#FFFFFF',
  },
  emergencyHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },


  // ── EMERGENCY ────────────────────────────────────────────
  emergencyBanner: {
    backgroundColor: '#7F0000',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#FF4500',
  },
  emergencyBannerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  emergencySidebarPanel: {
    margin: 10,
    backgroundColor: '#300000',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#FF4500',
    gap: 8,
  },
  emergencyTitle: {
    color: '#FF4500',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  emergencySubtitle: {
    color: '#FF8C00',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
  },
  emergencyInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  emergencyInfoLabel: {
    color: '#6A84A0',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    minWidth: 70,
  },
  emergencyInfoVal: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  emergencyInstruction: {
    color: '#FF8C00',
    fontSize: 9,
    lineHeight: 13,
    marginTop: 4,
  },

  // ── OT PANEL (reserved for future use) ───────────────────────────────
  otPanel: {
    margin: 10,
    backgroundColor: '#071C30',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#00E5FF55',
    gap: 6,
  },
  otPanelTitle: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  otPanelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  otPanelLabel: {
    color: '#6A84A0',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    minWidth: 65,
  },
  otPanelVal: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  otPanelEmpty: {
    color: '#6A84A0',
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  otEppBox: {
    backgroundColor: '#0E2030',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#FFE600',
  },
  otEppText: {
    color: '#FFE600',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
});
