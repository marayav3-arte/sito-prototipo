import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, TextInput, Dimensions } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLOVE_TARGETS } from '../theme';
import { 
  Play, 
  Pause, 
  X, 
  RotateCcw, 
  BookOpen, 
  Clock, 
  FileText, 
  Search, 
  ShieldAlert, 
  Wrench, 
  ShieldCheck 
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const columnWidth = width > 500 ? (width - SPACING.lg * 3) / 2 : width - SPACING.lg * 2;

export default function CapacitacionScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [videoDuration, setVideoDuration] = useState(300); // in seconds

  const capsules = [
    {
      id: 'v1',
      title: 'Procedimiento de Despeje de Cámara Acuñada',
      code: 'CAP-RIESGO-01',
      duration: '4:15 min',
      durationSec: 255,
      category: 'MITIGACIÓN DE RIESGOS MECÁNICOS',
      description: 'Remover el material atascado y rocas atrapadas en la cámara de chancado de forma segura sin liberar tensiones bruscas.',
      instructor: 'Ing. de Seguridad Industrial',
      steps: [
        'Paso 1: Aplicar bloqueo LOTO total en el interruptor principal Q3 y purgar la presión hidráulica.',
        'Paso 2: Instalación de cáncamo y estrobo de acero certificado para sujeción de la roca atrapada.',
        'Paso 3: Operación del sistema de izaje desde zona segura fuera del radio de proyección.',
        'Paso 4: Inspección visual de limpieza de la cámara antes de retirar trabas mecánicas.',
      ],
    },
    {
      id: 'v2',
      title: 'Ajuste Seguro de Holgura de Excéntrica',
      code: 'CAP-RIESGO-02',
      duration: '3:50 min',
      durationSec: 230,
      category: 'MITIGACIÓN DE RIESGOS MECÁNICOS',
      description: 'Procedimiento estándar para calibrar la tolerancia y holgura del conjunto excéntrico evitando puntos de atrapamiento.',
      instructor: 'Especialista Mecánico de Planta',
      steps: [
        'Paso 1: Comprobar la detención total del contraeje e insertar el perno de seguridad mecánico.',
        'Paso 2: Medición de juego axial y radial con galga micrométrica según manual de tolerancia.',
        'Paso 3: Ajuste de lainas y torqueado de pernos de retención a especificación de fábrica.',
        'Paso 4: Retiro de perno de bloqueo y prueba manual de giro sin carga.',
      ],
    },
    {
      id: 'v3',
      title: 'Protocolo de Seguridad para Desconexión Hidráulica',
      code: 'CAP-RIESGO-03',
      duration: '5:00 min',
      durationSec: 300,
      category: 'MITIGACIÓN DE RIESGOS MECÁNICOS',
      description: 'Secuencia estricta para despresurizar líneas hidráulicas de alta presión y prevenir inyección accidental de fluidos.',
      instructor: 'Supervisor HSEC Mantenimiento',
      steps: [
        'Paso 1: Abrir la válvula de despiche V-102 para despresurizar los acumuladores a 0 Bar.',
        'Paso 2: Verificar la lectura del manómetro análogo en la unidad de potencia hidráulica.',
        'Paso 3: Colocación de pantalla de protección facial y guantes de nitrilo resistente.',
        'Paso 4: Desairear la línea y colocar tapones herméticos de seguridad en acoples rápidos.',
      ],
    },
    {
      id: 'v4',
      title: 'Ajuste y Medición de Holgura (CSS) en Chancadores Cónicos',
      code: 'CAP-MEC-01',
      duration: '4:52 min',
      durationSec: 292,
      category: 'PROCEDIMIENTOS DE CAMPO',
      description: 'Técnica de calibración de CSS mediante bola de plomo y ajuste con motor hidráulico.',
      instructor: 'Mantenedor Senior de Chancado',
      steps: [
        'Paso 1: Detener alimentación y activar bloqueo de giro.',
        'Paso 2: Lanzar bola de plomo y medir espesor con calibre.',
        'Paso 3: Accionar motor hidráulico de ajuste en tramos de 1/4 vuelta.',
      ],
    },
    {
      id: 'v5',
      title: 'Inspección de Fatiga en Pernos de Anclaje de Chasis',
      code: 'CAP-MEC-04',
      duration: '4:30 min',
      durationSec: 270,
      category: 'PROCEDIMIENTOS DE CAMPO',
      description: 'Detección oportuna de fisuras en pernos sometidos a alta vibración.',
      instructor: 'Especialista Mecánico de Planta',
      steps: [
        'Paso 1: Limpieza criogénica o cepillado de óxido superficial.',
        'Paso 2: Inspección por líquidos penetrantes buscando fisuras.',
        'Paso 3: Ajustar pernos de anclaje a torque especificado usando llave torque.',
      ],
    }
  ];

  // Filter video capsules based on search input
  const filteredCapsules = capsules.filter(cap =>
    cap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cap.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cap.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cap.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Simulated video playback timer tick
  useEffect(() => {
    let interval;
    if (isPlaying && selectedVideo) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= videoDuration) {
            setIsPlaying(false);
            return 0; // reset
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedVideo, videoDuration]);

  const handleOpenVideo = (video) => {
    setSelectedVideo(video);
    setVideoDuration(video.durationSec);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
    setIsPlaying(false);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = (currentTime / videoDuration) * 100;

  return (
    <View style={styles.container}>
      
      {/* QUICK SEARCH BAR SUPERIOR */}
      <View style={styles.searchHeaderContainer}>
        <View style={styles.searchBarBox}>
          <Search color={COLORS.yellow} size={22} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar procedimiento seguro..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        
        {/* Intro Info Banner */}
        <View style={styles.introCard}>
          <ShieldAlert color={COLORS.yellow} size={32} />
          <View style={styles.introTextContent}>
            <Text style={styles.introTitle}>Cápsulas de Mitigación de Riesgos</Text>
            <Text style={styles.introDesc}>
              Micro-capacitaciones de máximo 5 minutos con reproducción integrada para revisión rápida en terreno antes de la maniobra.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>INSTRUCTIVOS SEGUROS DE MITIGACIÓN (MÁX. 5 MIN)</Text>

        {/* Video Cards Grid / List */}
        <View style={styles.videoGrid}>
          {filteredCapsules.length > 0 ? (
            filteredCapsules.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={styles.gridCard}
                activeOpacity={0.85}
                onPress={() => handleOpenVideo(video)}
              >
                {/* Thumbnail Container */}
                <View style={styles.thumbnailContainer}>
                  <View style={styles.thumbnailPattern} />
                  
                  {/* Category Tag */}
                  <View style={styles.categoryBadgeTag}>
                    <Text style={styles.categoryBadgeText}>{video.category}</Text>
                  </View>

                  {/* Duration Tag */}
                  <View style={styles.durationTag}>
                    <Clock color={COLORS.textPrimary} size={11} style={{ marginRight: 4 }} />
                    <Text style={styles.durationText}>{video.duration}</Text>
                  </View>

                  {/* Large Play Icon Button */}
                  <View style={styles.playOverlay}>
                    <View style={styles.playOverlayButton}>
                      <Play color={COLORS.textDark} size={26} fill={COLORS.textDark} style={{ marginLeft: 3 }} />
                    </View>
                  </View>
                </View>

                {/* Video Meta Information */}
                <View style={styles.cardMeta}>
                  <Text style={styles.videoCode}>{video.code}</Text>
                  <Text style={styles.videoTitle}>{video.title}</Text>
                  <Text style={styles.videoDesc} numberOfLines={2}>{video.description}</Text>
                </View>

                {/* Card Action Footer */}
                <View style={styles.cardFooterBtn}>
                  <Text style={styles.cardFooterText}>REPRODUCIR INSTRUCTIVO</Text>
                  <Play color={COLORS.textDark} size={14} fill={COLORS.textDark} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noResultsBox}>
              <Text style={styles.noResultsText}>No se encontraron procedimientos para la búsqueda ingresada.</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* INTEGRATED VIDEO PLAYER CONTAINER (MODAL) */}
      <Modal
        visible={selectedVideo !== null}
        transparent={true}
        animationType="slide"
      >
        {selectedVideo && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleContent}>
                  <Text style={styles.modalVideoCode}>{selectedVideo.code} • {selectedVideo.duration}</Text>
                  <Text style={styles.modalVideoTitle}>{selectedVideo.title}</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={handleCloseVideo} activeOpacity={0.7}>
                  <X color={COLORS.textPrimary} size={28} />
                </TouchableOpacity>
              </View>

              {/* Native-style Integrated Video Screen Container */}
              <View style={styles.videoScreenContainer}>
                <View style={styles.simulatorBackground}>
                  <View style={styles.scanningWave} />
                  
                  {/* Status Overlay Bar */}
                  <View style={styles.simStatusRow}>
                    <View style={styles.liveIndicator}>
                      <View style={[styles.liveDot, isPlaying && styles.liveDotActive]} />
                      <Text style={styles.liveText}>{isPlaying ? 'REPRODUCIENDO INSTRUCTIVO' : 'PAUSADO'}</Text>
                    </View>
                    <Text style={styles.instructorText}>{selectedVideo.instructor}</Text>
                  </View>
                  
                  {/* Center Play Icon visual */}
                  <Play color={COLORS.yellow} size={64} opacity={isPlaying ? 0.08 : 0.95} fill={isPlaying ? 'transparent' : COLORS.yellow} />
                </View>

                {/* Progress Bar Container */}
                <View style={styles.progressBarWrapper}>
                  <View style={styles.timeLabelRow}>
                    <Text style={styles.timeLabel}>{formatTime(currentTime)}</Text>
                    <Text style={styles.timeLabel}>{selectedVideo.duration}</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressIndicator, { width: `${progressPercent}%` }]} />
                  </View>
                </View>

                {/* Controls Bar */}
                <View style={styles.playerControlsRow}>
                  <TouchableOpacity 
                    style={styles.controlBtn} 
                    onPress={() => setCurrentTime(0)}
                    activeOpacity={0.7}
                  >
                    <RotateCcw color={COLORS.textPrimary} size={22} />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.playPauseBtn} 
                    onPress={() => setIsPlaying(!isPlaying)}
                    activeOpacity={0.85}
                  >
                    {isPlaying ? (
                      <Pause color={COLORS.textDark} size={28} fill={COLORS.textDark} />
                    ) : (
                      <Play color={COLORS.textDark} size={28} fill={COLORS.textDark} style={{ marginLeft: 3 }} />
                    )}
                  </TouchableOpacity>

                  <View style={{ width: 44 }} />
                </View>
              </View>

              {/* Integrated Checklist and Key Steps */}
              <ScrollView style={styles.videoSummaryScroll} contentContainerStyle={styles.videoSummaryContent}>
                <View style={styles.summaryTitleRow}>
                  <FileText color={COLORS.yellow} size={20} />
                  <Text style={styles.summaryTitle}>PASOS CLAVE DE SEGURIDAD</Text>
                </View>
                
                {selectedVideo.steps.map((step, idx) => (
                  <View key={idx} style={styles.stepSummaryRow}>
                    <Text style={styles.stepSummaryText}>{step}</Text>
                  </View>
                ))}
              </ScrollView>

            </View>
          </View>
        )}
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchHeaderContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.yellow,
    borderRadius: GLOVE_TARGETS.borderRadius,
    paddingHorizontal: SPACING.md,
    height: 56,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  introTextContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  introTitle: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.subheader,
    fontSize: 16,
  },
  introDesc: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  sectionHeading: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },

  videoGrid: {
    flexDirection: 'column',
  },
  gridCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: GLOVE_TARGETS.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    height: 150,
    backgroundColor: '#161616',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  thumbnailPattern: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.06,
    backgroundColor: COLORS.yellow,
  },
  categoryBadgeTag: {
    position: 'absolute',
    left: SPACING.md,
    top: SPACING.md,
    backgroundColor: COLORS.yellow,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    zIndex: 10,
  },
  categoryBadgeText: {
    color: COLORS.textDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  durationTag: {
    position: 'absolute',
    right: SPACING.md,
    top: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  durationText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '800',
  },
  playOverlay: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.yellow,
  },
  playOverlayButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.yellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMeta: {
    padding: SPACING.lg,
  },
  videoCode: {
    color: COLORS.yellow,
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    marginBottom: 2,
  },
  videoTitle: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.title,
    fontSize: 18,
    marginBottom: 6,
    lineHeight: 24,
  },
  videoDesc: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.yellow,
    height: GLOVE_TARGETS.buttonHeight,
    paddingHorizontal: SPACING.lg,
  },
  cardFooterText: {
    color: COLORS.textDark,
    ...TYPOGRAPHY.header,
    fontSize: 14,
    marginRight: 8,
  },
  noResultsBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noResultsText: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    textAlign: 'center',
  },

  // Modal / Integrated Player Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 3,
    borderTopColor: COLORS.yellow,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalHeaderTitleContent: {
    flex: 1,
    paddingRight: SPACING.lg,
  },
  modalVideoCode: {
    color: COLORS.yellow,
    ...TYPOGRAPHY.caption,
    fontSize: 11,
  },
  modalVideoTitle: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.title,
    fontSize: 18,
    marginTop: 2,
  },
  closeBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoScreenContainer: {
    backgroundColor: '#000000',
    paddingBottom: SPACING.md,
  },
  simulatorBackground: {
    height: 220,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#050505',
  },
  scanningWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    borderTopWidth: 220,
    borderColor: COLORS.yellow,
  },
  simStatusRow: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSecondary,
    marginRight: 6,
  },
  liveDotActive: {
    backgroundColor: COLORS.red,
  },
  liveText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '800',
  },
  instructorText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  progressBarWrapper: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },
  timeLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timeLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#222222',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: COLORS.yellow,
  },
  playerControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  playPauseBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  videoSummaryScroll: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  videoSummaryContent: {
    paddingBottom: SPACING.xxl,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.xs,
  },
  summaryTitle: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.subheader,
    fontSize: 14,
    marginLeft: SPACING.sm,
    letterSpacing: 0.5,
  },
  stepSummaryRow: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  stepSummaryText: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
