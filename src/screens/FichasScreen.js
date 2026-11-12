import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  TextInput, Modal, FlatList,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLOVE_TARGETS } from '../theme';
import AreaContactPill from '../components/AreaContactPill';
import SitoTacticalMap from '../components/SitoTacticalMap';

import {
  Search, ChevronRight, FileText, ArrowLeft, Download,
  ShieldCheck, Scale, Ruler, Droplet, QrCode, AlertTriangle,
  Video, Activity, PlusCircle, HeartPulse, Gauge, AlertCircle,
  CheckCircle2, ChevronDown, ChevronUp, Play, BookOpen,
  Zap, X as XIcon, Check,
} from 'lucide-react-native';

// PROMPT 51: Master asset catalog
import {
  ASSET_CATALOG, getAssetByTag, getAssetsByArea, MICRO_CAPS,
} from '../data/assetCatalog';

// ─── AREA CONFIG ──────────────────────────────────────────────────────────────
const AREA_CONFIG = {
  'ÁREA SECA': { emoji: '🟠', color: '#FF7A00', label: 'Área Seca' },
  'ÁREA HÚMEDA': { emoji: '🔵', color: '#00B8D9', label: 'Área Húmeda' },
  'PROCESOS / RELAVES': { emoji: '🟣', color: '#8B5CF6', label: 'Procesos / Relaves' },
};

// Status color map for dataCritica rows
const STATUS_COLORS = {
  nominal: '#00FF88',
  alerta: '#FF4444',
  precaucion: '#FFB800',
};

// ─────────────────────────────────────────────────────────────────────────────
export default function FichasScreen({ route, navigation, activeRole = 'OPERATIVO' }) {
  // List-level state
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('ALL'); // 'ALL' | macroArea string
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Detail-level sub-tab: 'datos' | 'infografias' | 'training'
  const [activeSubTab, setActiveSubTab] = useState('datos');

  // QR scan simulation state
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [qrError, setQrError] = useState('');

  // Map modal
  const [showMapModal, setShowMapModal] = useState(false);

  // Anomaly modal (legacy, preserved)
  const [showAnomalyModal, setShowAnomalyModal] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeDesc, setNewNoticeDesc] = useState('');
  const [recentNotices, setRecentNotices] = useState([
    { id: '1', date: '01-Oct 14:20', text: 'Alerta de temperatura elevándose a 68°C', status: 'Pendiente', isPending: true },
    { id: '2', date: '28-Sep 08:00', text: 'Cambio de filtro de retorno realizado', status: 'Cerrado', isPending: false },
  ]);

  // Expandable infographic step state
  const [expandedInfog, setExpandedInfog] = useState(null);

  // ─── Navigation params handling (from Diagnóstico → Fichas chaining) ──────
  useEffect(() => {
    const params = route.params || {};

    // PROMPT 51: Navigate by TAG (from Diagnóstico chaining)
    if (params.selectedTag) {
      const found = getAssetByTag(params.selectedTag);
      if (found) {
        setSelectedAsset(found);
        setActiveSubTab(params.activeSubTab || 'datos');
        if (params.highlightInfog) setExpandedInfog(params.highlightInfog);
        return;
      }
    }

    // Legacy: Navigate by equipment name string
    if (params.selectedEquipment) {
      const q = params.selectedEquipment.toLowerCase();
      const found = ASSET_CATALOG.find(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          q.includes(a.tag.toLowerCase()) ||
          (a.altTags && a.altTags.some((t) => q.includes(t.toLowerCase())))
      );
      if (found) {
        setSelectedAsset(found);
        setActiveSubTab(params.activeSubTab || 'datos');
      }
    }
  }, [route.params?.selectedTag, route.params?.selectedEquipment]);

  // ─── Derived data ──────────────────────────────────────────────────────────
  const filteredAssets = ASSET_CATALOG.filter((a) => {
    const matchArea = areaFilter === 'ALL' || a.macroArea === areaFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q) ||
      a.subArea.toLowerCase().includes(q) ||
      (a.altTags && a.altTags.some((t) => t.toLowerCase().includes(q)));
    return matchArea && matchSearch;
  });

  const assetsByArea = getAssetsByArea();
  const areas = Object.keys(assetsByArea);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectAsset = useCallback((asset) => {
    setSelectedAsset(asset);
    setActiveSubTab('datos');
    setExpandedInfog(null);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedAsset(null);
    navigation.setParams({ selectedTag: undefined, selectedEquipment: undefined });
  }, [navigation]);

  const handleQrScan = () => {
    setQrError('');
    const found = getAssetByTag(qrInput.trim());
    if (found) {
      setSelectedAsset(found);
      setActiveSubTab('datos');
      setShowQrModal(false);
      setQrInput('');
    } else {
      setQrError(`❌ TAG "${qrInput.trim()}" no encontrado en el Catálogo Maestro.`);
    }
  };

  const handleCreateNotice = () => {
    if (!newNoticeTitle.trim()) return;
    const now = new Date();
    const pad = (n) => (n < 10 ? '0' + n : n);
    const formattedDate = `13-Oct ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setRecentNotices([
      { id: Date.now().toString(), date: formattedDate, text: newNoticeTitle.trim(), status: 'Pendiente', isPending: true },
      ...recentNotices,
    ]);
    setNewNoticeTitle('');
    setNewNoticeDesc('');
    setShowAnomalyModal(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {selectedAsset ? (
        /* ══════════════════════════════════════════════════════════
           DETAIL VIEW — 3 Tactical Sub-modules
           ══════════════════════════════════════════════════════════ */
        <View style={{ flex: 1 }}>

          {/* ── HEADER ── */}
          <View style={styles.detailsHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
              <ArrowLeft color={COLORS.yellow} size={22} />
              <Text style={styles.backBtnText}>CATÁLOGO</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
              <TouchableOpacity
                style={styles.mapButtonHeader}
                activeOpacity={0.8}
                onPress={() => setShowMapModal(true)}
              >
                <Text style={styles.mapButtonHeaderText}>[ 🗺️ Ver en Mapa ]</Text>
              </TouchableOpacity>
              <View style={[styles.fluorescentTagBadge, { backgroundColor: AREA_CONFIG[selectedAsset.macroArea]?.color || '#00E5FF' }]}>
                <Text style={styles.fluorescentTagBadgeText}>TAG: {selectedAsset.tag}</Text>
              </View>
            </View>
          </View>

          {/* ── TITLE ── */}
          <View style={styles.titleContainer}>
            <Text style={styles.locationSubtitle}>
              {AREA_CONFIG[selectedAsset.macroArea]?.emoji} {selectedAsset.macroArea} · {selectedAsset.subArea}
            </Text>
            <Text style={styles.detailsTitle}>{selectedAsset.name}</Text>
            <Text style={styles.detailsEpp}>{selectedAsset.epp}</Text>
          </View>

          {/* ── 3 TACTICAL SUB-TABS ── */}
          <View style={styles.tabBar}>
            {[
              { id: 'datos', label: '📊 DATOS CRÍTICOS' },
              { id: 'infografias', label: '📐 INFOGRAFÍAS & PAUTAS' },
              { id: 'training', label: '🎬 MICRO-CAPACITACIÓN' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, activeSubTab === tab.id && styles.tabButtonActive]}
                onPress={() => setActiveSubTab(tab.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeSubTab === tab.id && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── ACTION BUTTONS ── */}
          <View style={styles.giantTopButtonsContainer}>
            <TouchableOpacity
              style={styles.giantDiagBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Diagnostico')}
            >
              <Activity color={COLORS.textDark} size={20} style={{ marginRight: 6 }} />
              <Text style={styles.giantDiagBtnText}>[ INICIAR DIAGNÓSTICO ]</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.giantReportBtn}
              activeOpacity={0.85}
              onPress={() => setShowAnomalyModal(true)}
            >
              <PlusCircle color={COLORS.yellow} size={20} style={{ marginRight: 6 }} />
              <Text style={styles.giantReportBtnText}>[ REPORTAR AVISO ]</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.detailsScrollContent}>

            {/* ══════════════════════════════════════════
                TAB A — 📊 DATOS CRÍTICOS
                ══════════════════════════════════════════ */}
            {activeSubTab === 'datos' && (
              <View>
                <Text style={styles.sectionHeading}>📊 PARÁMETROS NOMINALES Y LÍMITES OPERACIONALES</Text>

                <View style={styles.structuredPanelCard}>
                  {selectedAsset.dataCritica.map((row, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.dataCriticaRow,
                        idx < selectedAsset.dataCritica.length - 1 && styles.dataCriticaRowBorder,
                      ]}
                    >
                      <View style={[styles.dataCriticaStatusDot, { backgroundColor: STATUS_COLORS[row.status] || '#8CAAD0' }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dataCriticaLabel}>{row.param}</Text>
                        <Text style={styles.dataCriticaValue}>{row.value}</Text>
                      </View>
                      <View style={[styles.dataCriticaStatusBadge, { borderColor: STATUS_COLORS[row.status] || '#2A3D55' }]}>
                        <Text style={[styles.dataCriticaStatusText, { color: STATUS_COLORS[row.status] || '#8CAAD0' }]}>
                          {row.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* EPP & Supervisor Card */}
                <View style={styles.eppCard}>
                  <Text style={styles.eppCardTitle}>🦺 EPP OBLIGATORIO</Text>
                  <Text style={styles.eppCardText}>{selectedAsset.epp}</Text>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                    <Text style={styles.eppMeta}>📍 {selectedAsset.elevation}</Text>
                    <Text style={styles.eppMeta}>👷 {selectedAsset.supervisor}</Text>
                  </View>
                </View>

                {/* Recent Notices (if on Omnicone) */}
                {(selectedAsset.tag === 'ACT-001') && (
                  <View>
                    <Text style={styles.sectionHeading}>📋 AVISOS DE CAMPO RECIENTES</Text>
                    {recentNotices.map((notice) => (
                      <View
                        key={notice.id}
                        style={[styles.noticeCard, notice.isPending && styles.noticeCardPending]}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={styles.noticeDate}>{notice.date}</Text>
                          <View style={[styles.noticeBadge, !notice.isPending && { backgroundColor: '#1A3D2A', borderColor: '#00FF88' }]}>
                            <Text style={[styles.noticeBadgeText, !notice.isPending && { color: '#00FF88' }]}>
                              {notice.status}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.noticeText}>{notice.text}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* ══════════════════════════════════════════
                TAB B — 📐 INFOGRAFÍAS & PAUTAS
                ══════════════════════════════════════════ */}
            {activeSubTab === 'infografias' && (
              <View>
                <Text style={styles.sectionHeading}>📐 PROCEDIMIENTOS PASO A PASO</Text>

                {selectedAsset.infografias.length === 0 ? (
                  <View style={styles.emptyStateBox}>
                    <Text style={styles.emptyStateText}>Sin infografías disponibles para este activo.</Text>
                  </View>
                ) : selectedAsset.infografias.map((infog) => {
                  const isExpanded = expandedInfog === infog.id;
                  return (
                    <View key={infog.id} style={styles.infogCard}>
                      <TouchableOpacity
                        style={styles.infogCardHeader}
                        activeOpacity={0.85}
                        onPress={() => setExpandedInfog(isExpanded ? null : infog.id)}
                      >
                        <Text style={styles.infogCardIcon}>{infog.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.infogCardTitle}>{infog.title}</Text>
                          <Text style={styles.infogCardFreq}>⏱ Frecuencia: {infog.frecuencia}</Text>
                        </View>
                        {isExpanded
                          ? <ChevronUp color="#00E5FF" size={18} />
                          : <ChevronDown color="#8CAAD0" size={18} />}
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={styles.infogStepsList}>
                          {infog.pasos.map((paso, idx) => (
                            <View key={idx} style={styles.infogStepRow}>
                              <View style={styles.infogStepNumBadge}>
                                <Text style={styles.infogStepNum}>{idx + 1}</Text>
                              </View>
                              <Text style={styles.infogStepText}>{paso}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* ══════════════════════════════════════════
                TAB C — 🎬 MICRO-CAPACITACIÓN
                ══════════════════════════════════════════ */}
            {activeSubTab === 'training' && (
              <View>
                <Text style={styles.sectionHeading}>🎬 CÁPSULAS RECOMENDADAS PARA ESTE ACTIVO</Text>

                {selectedAsset.microCapacitacion.length === 0 ? (
                  <View style={styles.emptyStateBox}>
                    <Text style={styles.emptyStateText}>Sin cápsulas de capacitación vinculadas.</Text>
                  </View>
                ) : selectedAsset.microCapacitacion.map((capId) => {
                  const cap = MICRO_CAPS[capId];
                  if (!cap) return null;
                  return (
                    <View key={capId} style={styles.capsulaCard}>
                      <View style={styles.capsulaIconCircle}>
                        <Play color="#000000" size={16} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.capsulaCategory}>{cap.category}</Text>
                        <Text style={styles.capsulaTitle}>{cap.title}</Text>
                        <Text style={styles.capsulaDuration}>⏱ {cap.duration} min</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.capsulaLaunchBtn}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('Capacitacion')}
                      >
                        <Text style={styles.capsulaLaunchText}>▶ VER</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}

                <View style={styles.trainingAllBtn}>
                  <TouchableOpacity
                    style={styles.trainingAllBtnInner}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('Capacitacion')}
                  >
                    <BookOpen color="#000000" size={16} style={{ marginRight: 8 }} />
                    <Text style={styles.trainingAllBtnText}>[ 📚 VER BIBLIOTECA COMPLETA DE CAPACITACIÓN ]</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

          </ScrollView>

          {/* ── S.I.T.O. Tactical Map Modal — PROMPT 51 DEFINITIVE ── */}
          <SitoTacticalMap
            visible={showMapModal}
            onClose={() => setShowMapModal(false)}
            initialEquipmentTag={selectedAsset?.tag}
          />


          {/* ── Anomaly Modal (legacy) ── */}
          <Modal visible={showAnomalyModal} transparent animationType="fade" onRequestClose={() => setShowAnomalyModal(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>📋 REPORTAR AVISO / ANOMALÍA</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newNoticeTitle}
                  onChangeText={setNewNoticeTitle}
                  placeholder="Título del aviso..."
                  placeholderTextColor="#555577"
                />
                <TextInput
                  style={[styles.modalInput, { height: 80 }]}
                  value={newNoticeDesc}
                  onChangeText={setNewNoticeDesc}
                  placeholder="Descripción adicional..."
                  placeholderTextColor="#555577"
                  multiline
                />
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowAnomalyModal(false)}>
                    <Text style={styles.modalCancelText}>CANCELAR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateNotice}>
                    <Text style={styles.modalSubmitText}>REGISTRAR AVISO</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>

      ) : (
        /* ══════════════════════════════════════════════════════════
           LIST VIEW — Browse and select an asset
           ══════════════════════════════════════════════════════════ */
        <View style={{ flex: 1 }}>

          {/* ── LIST HEADER ── */}
          <View style={styles.header}>
            <Text style={styles.screenTitle}>📁 FICHAS & CAPACITACIÓN</Text>
            <Text style={styles.screenSubtitle}>Catálogo Maestro — {ASSET_CATALOG.length} activos registrados</Text>
          </View>

          {/* ── SEARCH + QR SCAN ── */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Search color="#8CAAD0" size={16} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar activo o TAG..."
                placeholderTextColor="#555577"
              />
            </View>
            <TouchableOpacity
              style={styles.qrScanBtn}
              activeOpacity={0.85}
              onPress={() => { setQrInput(''); setQrError(''); setShowQrModal(true); }}
            >
              <QrCode color="#000000" size={18} />
              <Text style={styles.qrScanBtnText}>QR</Text>
            </TouchableOpacity>
          </View>

          {/* ── AREA FILTER TABS ── */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.areaFilterScroll} contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}>
            {['ALL', ...areas].map((area) => {
              const cfg = AREA_CONFIG[area];
              const isActive = areaFilter === area;
              return (
                <TouchableOpacity
                  key={area}
                  style={[styles.areaFilterChip, isActive && styles.areaFilterChipActive, isActive && cfg && { borderColor: cfg.color }]}
                  activeOpacity={0.85}
                  onPress={() => setAreaFilter(area)}
                >
                  <Text style={[styles.areaFilterChipText, isActive && { color: cfg?.color || '#00E5FF' }]}>
                    {area === 'ALL' ? '🏭 TODOS' : `${cfg?.emoji || ''} ${cfg?.label || area}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── ASSET LIST ── */}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 24 }}>
            {areas.map((area) => {
              if (areaFilter !== 'ALL' && areaFilter !== area) return null;
              const items = filteredAssets.filter((a) => a.macroArea === area);
              if (items.length === 0) return null;
              const cfg = AREA_CONFIG[area] || {};
              return (
                <View key={area} style={{ marginTop: 16 }}>
                  <Text style={[styles.listAreaHeader, { color: cfg.color || '#FFFFFF' }]}>
                    {cfg.emoji} {area}
                  </Text>
                  {items.map((asset) => (
                    <TouchableOpacity
                      key={asset.id}
                      style={styles.assetListItem}
                      activeOpacity={0.85}
                      onPress={() => handleSelectAsset(asset)}
                    >
                      <View style={[styles.assetListTagBadge, { borderColor: cfg.color || '#00E5FF' }]}>
                        <Text style={[styles.assetListTag, { color: cfg.color || '#00E5FF' }]}>{asset.tag}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.assetListName} numberOfLines={2}>{asset.name}</Text>
                        <Text style={styles.assetListSub} numberOfLines={1}>{asset.subArea} · {asset.elevation}</Text>
                      </View>
                      <ChevronRight color="#2A3D55" size={18} />
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })}

            {filteredAssets.length === 0 && (
              <View style={styles.emptyStateBox}>
                <AlertCircle color="#555577" size={32} />
                <Text style={styles.emptyStateText}>Sin activos para "{searchQuery}"</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* ── QR SCAN MODAL ── */}
      <Modal visible={showQrModal} transparent animationType="fade" onRequestClose={() => setShowQrModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalCard}>
            <View style={styles.qrModalHeader}>
              <QrCode color="#00E5FF" size={22} style={{ marginRight: 8 }} />
              <Text style={styles.qrModalTitle}>ESCANEAR QR / TAG</Text>
              <TouchableOpacity onPress={() => setShowQrModal(false)} activeOpacity={0.8}>
                <XIcon color="#FFFFFF" size={20} />
              </TouchableOpacity>
            </View>
            <View style={styles.qrSimulateBox}>
              <Text style={styles.qrSimulateLabel}>📷 Ingrese el TAG del equipo detectado:</Text>
              <TextInput
                style={styles.qrModalInput}
                value={qrInput}
                onChangeText={(v) => { setQrInput(v); setQrError(''); }}
                placeholder="Ej: ACT-001, ACT-004, TACL-01..."
                placeholderTextColor="#555577"
                autoCapitalize="characters"
              />
              {qrError ? <Text style={styles.qrErrorText}>{qrError}</Text> : null}
              <Text style={styles.qrHintText}>
                TAGs disponibles: ACT-001 · ACT-002 · ACT-003 · ACT-004 · ACT-005 · COR-01 · HAR-VRT-01 · TACL-01 · CEL-01 · ESP-01 · FL-PR-01
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 16 }}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowQrModal(false)}>
                <Text style={styles.modalCancelText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.qrConfirmBtn} onPress={handleQrScan}>
                <Check color="#000000" size={16} style={{ marginRight: 4 }} />
                <Text style={styles.qrConfirmBtnText}>CONFIRMAR TAG</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── LIST VIEW ──────────────────────────────────────────────────
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2D45',
  },
  screenTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  screenSubtitle: {
    color: '#8CAAD0',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1628',
    borderWidth: 1,
    borderColor: '#1A2D45',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 42,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  qrScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00E5FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 42,
    gap: 4,
  },
  qrScanBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
  },
  areaFilterScroll: {
    maxHeight: 46,
    paddingVertical: 6,
  },
  areaFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A3D55',
    backgroundColor: '#0A1628',
  },
  areaFilterChipActive: {
    backgroundColor: '#061526',
    borderWidth: 1.5,
  },
  areaFilterChipText: {
    color: '#8CAAD0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  listAreaHeader: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2D45',
  },
  assetListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1628',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A2D45',
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  assetListTagBadge: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 72,
    alignItems: 'center',
  },
  assetListTag: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  assetListName: {
    color: '#E0E8F5',
    fontSize: 13,
    fontWeight: '700',
  },
  assetListSub: {
    color: '#6A84A0',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },

  // ── DETAIL VIEW ────────────────────────────────────────────────
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2D45',
    backgroundColor: '#060F1C',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backBtnText: {
    color: COLORS.yellow,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  mapButtonHeader: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#2A3D55',
    borderRadius: 6,
  },
  mapButtonHeaderText: {
    color: '#8CAAD0',
    fontSize: 11,
    fontWeight: '700',
  },
  fluorescentTagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  fluorescentTagBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  titleContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#060F1C',
  },
  locationSubtitle: {
    color: '#8CAAD0',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  detailsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  detailsEpp: {
    color: '#FFB800',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#060F1C',
    borderBottomWidth: 1,
    borderBottomColor: '#1A2D45',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2.5,
    borderBottomColor: '#00E5FF',
  },
  tabText: {
    color: '#6A84A0',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#00E5FF',
  },
  giantTopButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#060F1C',
  },
  giantDiagBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00E5FF',
    borderRadius: 8,
    paddingVertical: 10,
    minHeight: 44,
  },
  giantDiagBtnText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  giantReportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A00',
    borderWidth: 1.5,
    borderColor: COLORS.yellow,
    borderRadius: 8,
    paddingVertical: 10,
    minHeight: 44,
  },
  giantReportBtnText: {
    color: COLORS.yellow,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  detailsScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 40,
  },
  sectionHeading: {
    color: '#8CAAD0',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2D45',
  },

  // ── DATOS CRÍTICOS TAB ────────────────────────────────────────
  structuredPanelCard: {
    backgroundColor: '#0A1628',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A2D45',
    overflow: 'hidden',
    marginBottom: 16,
  },
  dataCriticaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  dataCriticaRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#0E1D31',
  },
  dataCriticaStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dataCriticaLabel: {
    color: '#8CAAD0',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dataCriticaValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
  },
  dataCriticaStatusBadge: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dataCriticaStatusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  eppCard: {
    backgroundColor: '#100D00',
    borderWidth: 1.5,
    borderColor: '#FFB800',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  eppCardTitle: {
    color: '#FFB800',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  eppCardText: {
    color: '#E0E8F5',
    fontSize: 11,
    fontWeight: '600',
  },
  eppMeta: {
    color: '#8CAAD0',
    fontSize: 10,
    fontWeight: '600',
  },

  // ── NOTICES (legacy) ──────────────────────────────────────────
  noticeCard: {
    backgroundColor: '#0A1628',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1A2D45',
    padding: 10,
    marginBottom: 8,
  },
  noticeCardPending: {
    borderColor: '#FFB800',
    backgroundColor: '#100D00',
  },
  noticeDate: { color: '#6A84A0', fontSize: 10, fontWeight: '600' },
  noticeBadge: {
    backgroundColor: '#1A0D0D',
    borderWidth: 1,
    borderColor: '#FF4444',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  noticeBadgeText: { color: '#FF4444', fontSize: 9, fontWeight: '900' },
  noticeText: { color: '#C0D0E8', fontSize: 11, fontWeight: '600', marginTop: 4 },

  // ── INFOGRAFÍAS & PAUTAS TAB ──────────────────────────────────
  infogCard: {
    backgroundColor: '#0A1628',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A2D45',
    marginBottom: 10,
    overflow: 'hidden',
  },
  infogCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  infogCardIcon: {
    fontSize: 22,
  },
  infogCardTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  infogCardFreq: {
    color: '#8CAAD0',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  infogStepsList: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#1A2D45',
    backgroundColor: '#061526',
  },
  infogStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 10,
    gap: 10,
  },
  infogStepNumBadge: {
    backgroundColor: '#00E5FF',
    borderRadius: 12,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  infogStepNum: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
  },
  infogStepText: {
    flex: 1,
    color: '#C0D0E8',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },

  // ── MICRO-CAPACITACIÓN TAB ────────────────────────────────────
  capsulaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1628',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A2D45',
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  capsulaIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#00E5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capsulaCategory: {
    color: '#8CAAD0',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  capsulaTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  capsulaDuration: {
    color: '#6A84A0',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  capsulaLaunchBtn: {
    backgroundColor: '#00274D',
    borderWidth: 1,
    borderColor: '#00E5FF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  capsulaLaunchText: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  trainingAllBtn: {
    marginTop: 12,
  },
  trainingAllBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00E5FF',
    borderRadius: 8,
    paddingVertical: 12,
  },
  trainingAllBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // ── EMPTY STATE ───────────────────────────────────────────────
  emptyStateBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateText: {
    color: '#6A84A0',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ── QR MODAL ─────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  qrModalCard: {
    backgroundColor: '#0B1529',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    width: '100%',
    maxWidth: 480,
    overflow: 'hidden',
  },
  qrModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00274D',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00E5FF',
  },
  qrModalTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  qrSimulateBox: {
    padding: 16,
  },
  qrSimulateLabel: {
    color: '#C0D0E8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  qrModalInput: {
    backgroundColor: '#0D1A2C',
    borderWidth: 1,
    borderColor: '#2A3D55',
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  qrErrorText: {
    color: '#FF4444',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  qrHintText: {
    color: '#555577',
    fontSize: 9,
    fontWeight: '500',
    marginTop: 8,
    lineHeight: 14,
  },
  qrConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00E5FF',
    borderRadius: 8,
    paddingVertical: 10,
  },
  qrConfirmBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
  },

  // ── ANOMALY MODAL ─────────────────────────────────────────────
  modalCard: {
    backgroundColor: '#0B1529',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFB800',
    width: '100%',
    maxWidth: 480,
    padding: 18,
  },
  modalTitle: {
    color: '#FFB800',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 14,
    letterSpacing: 0.4,
  },
  modalInput: {
    backgroundColor: '#0D1A2C',
    borderWidth: 1,
    borderColor: '#2A3D55',
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10,
  },
  modalCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A3D55',
    borderRadius: 8,
    paddingVertical: 10,
  },
  modalCancelText: {
    color: '#8CAAD0',
    fontSize: 11,
    fontWeight: '800',
  },
  modalSubmitBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
    borderRadius: 8,
    paddingVertical: 10,
  },
  modalSubmitText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
  },
});
