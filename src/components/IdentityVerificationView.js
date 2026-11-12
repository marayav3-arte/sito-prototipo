import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, GLOVE_TARGETS } from '../theme';
import { 
  ShieldCheck, 
  Wrench, 
  QrCode, 
  KeyRound, 
  ArrowLeft, 
  Scan, 
  UserCheck, 
  Lock, 
  CheckCircle2, 
  Zap, 
  Sparkles,
  Building2,
  Cpu
} from 'lucide-react-native';

export default function IdentityVerificationView({ pendingRole, onBack, onConfirmIdentity }) {
  const isMandante = pendingRole === 'MANDANTE';
  const themeColor = isMandante ? '#FFD700' : '#00E5FF';
  const themeDarkText = '#000000';

  const [activeTab, setActiveTab] = useState('QR'); // 'QR' or 'MANUAL'
  const [scanning, setScanning] = useState(false);

  // Manual Form States with Auto-fill simulation
  const [rut, setRut] = useState('');
  const [pin, setPin] = useState('');
  const [detectedName, setDetectedName] = useState('');

  // Auto-fill triggered on selecting MANUAL tab or focusing
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'MANUAL') {
      autoFillCredentials();
    }
  };

  const autoFillCredentials = () => {
    setRut('15.842.910-K');
    setPin('••••••••');
    setDetectedName(
      isMandante 
        ? 'Carlos Mendoza (Jefe de Turno A • Mandante)' 
        : 'Omar Silva (Mantenedor Mecánico Líder • Contratista)'
    );
  };

  // Simulated QR Scanning laser trigger (1 second laser animation before login)
  const handleTriggerQRScan = () => {
    if (scanning) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onConfirmIdentity(pendingRole, {
        rut: '15.842.910-K',
        name: isMandante ? 'Carlos Mendoza (Jefe de Turno A)' : 'Omar Silva (Mantenedor Mecánico Líder)',
        role: pendingRole,
        verifiedVia: 'Credencial QR Empresa'
      });
    }, 1100);
  };

  const handleManualLogin = () => {
    onConfirmIdentity(pendingRole, {
      rut: rut || '15.842.910-K',
      name: detectedName || (isMandante ? 'Carlos Mendoza (Jefe de Turno A)' : 'Omar Silva (Mantenedor Mecánico Líder)'),
      role: pendingRole,
      verifiedVia: 'Ingreso Manual RUT / PIN'
    });
  };

  return (
    <View style={styles.outerContainer}>
      
      {/* INDUSTRIAL MESH PATTERN & DYNAMIC NEON GLOW CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .identity-mesh-bg {
          background-color: #12161A;
          background-image: 
            radial-gradient(rgba(42, 50, 61, 0.8) 1.5px, transparent 1.5px),
            linear-gradient(to right, rgba(30, 45, 61, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(30, 45, 61, 0.15) 1px, transparent 1px);
          background-size: 24px 24px, 48px 48px, 48px 48px;
        }
        @keyframes laserScan {
          0% { top: 5%; opacity: 0.9; }
          50% { top: 90%; opacity: 1; }
          100% { top: 5%; opacity: 0.9; }
        }
        .laser-line-anim {
          animation: laserScan 0.9s ease-in-out infinite;
        }
      ` }} />

      <View style={styles.centerWrapper}>
        
        {/* TOP BACK BUTTON */}
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={onBack}>
          <ArrowLeft color={COLORS.textPrimary} size={18} style={{ marginRight: 6 }} />
          <Text style={styles.backBtnText}>VOLVER / CAMBIAR ROL</Text>
        </TouchableOpacity>

        {/* MAIN AUTH CARD WITH DYNAMIC ROLE COLOR ACCENTS */}
        <View style={[styles.authCard, { borderColor: themeColor }]}>
          
          {/* CARD HEADER */}
          <View style={styles.cardHeader}>
            <View style={styles.roleHeaderBadgeRow}>
              <View style={[styles.roleBadge, { backgroundColor: themeColor }]}>
                {isMandante ? (
                  <ShieldCheck color="#000000" size={14} style={{ marginRight: 4 }} />
                ) : (
                  <Wrench color="#000000" size={14} style={{ marginRight: 4 }} />
                )}
                <Text style={styles.roleBadgeText}>PERFIL {pendingRole}</Text>
              </View>
              <Text style={styles.plantTagText}>PLANTA LA COIPA</Text>
            </View>

            <Text style={styles.cardTitleText}>CONFIRMACIÓN DE IDENTIDAD</Text>
            <Text style={styles.cardSubText}>
              Verifique sus credenciales para habilitar las frecuencias de radio y autorizaciones de terreno.
            </Text>
          </View>

          {/* ACCESS ALTERNATIVES TABS */}
          <View style={styles.tabBarRow}>
            
            {/* TAB 1: ACCESO RÁPIDO QR */}
            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === 'QR' && { backgroundColor: themeColor, borderColor: themeColor }
              ]}
              activeOpacity={0.85}
              onPress={() => setActiveTab('QR')}
            >
              <QrCode color={activeTab === 'QR' ? '#000000' : themeColor} size={16} style={{ marginRight: 6 }} />
              <Text style={[styles.tabText, activeTab === 'QR' && { color: '#000000' }]}>
                [ 1. ESCANEO QR ]
              </Text>
            </TouchableOpacity>

            {/* TAB 2: INGRESO MANUAL */}
            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === 'MANUAL' && { backgroundColor: themeColor, borderColor: themeColor }
              ]}
              activeOpacity={0.85}
              onPress={() => handleTabChange('MANUAL')}
            >
              <KeyRound color={activeTab === 'MANUAL' ? '#000000' : themeColor} size={16} style={{ marginRight: 6 }} />
              <Text style={[styles.tabText, activeTab === 'MANUAL' && { color: '#000000' }]}>
                [ 2. INGRESO MANUAL ]
              </Text>
            </TouchableOpacity>

          </View>

          {/* TAB 1 CONTENT: INDUSTRIAL QR CAMERA SCANNER */}
          {activeTab === 'QR' && (
            <View style={styles.tabBodyContainer}>
              
              {/* CLICKABLE SCANNER WINDOW */}
              <TouchableOpacity
                style={[styles.scannerWindow, { borderColor: themeColor }]}
                activeOpacity={0.9}
                onPress={handleTriggerQRScan}
              >
                {/* CORNER BRACKETS */}
                <View style={[styles.cornerTL, { borderColor: themeColor }]} />
                <View style={[styles.cornerTR, { borderColor: themeColor }]} />
                <View style={[styles.cornerBL, { borderColor: themeColor }]} />
                <View style={[styles.cornerBR, { borderColor: themeColor }]} />

                {/* LASER LINE WHEN SCANNING */}
                {scanning && (
                  <View 
                    style={[
                      styles.laserLine, 
                      { backgroundColor: themeColor, shadowColor: themeColor },
                      { className: 'laser-line-anim' }
                    ]} 
                  />
                )}

                <QrCode color={themeColor} size={100} strokeWidth={1.2} style={{ opacity: scanning ? 0.9 : 0.4 }} />

                {scanning ? (
                  <View style={styles.scanningIndicatorBox}>
                    <ActivityIndicator size="small" color={themeColor} style={{ marginRight: 6 }} />
                    <Text style={[styles.scanningText, { color: themeColor }]}>VALIDANDO CREDENCIAL EN LÍNEA...</Text>
                  </View>
                ) : (
                  <Text style={styles.scanInstructionText}>
                    👉 Toca la ventana para simular escaneo de credencial QR asignada
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.giantConfirmBtn, { backgroundColor: themeColor }]}
                activeOpacity={0.85}
                onPress={handleTriggerQRScan}
              >
                <Zap color="#000000" size={20} style={{ marginRight: 6 }} />
                <Text style={styles.giantConfirmBtnText}>
                  {scanning ? 'ESCANEAR Y AUTENTICAR...' : '[ ⚡ ACCEDER VÍA ESCANEO QR ]'}
                </Text>
              </TouchableOpacity>

            </View>
          )}

          {/* TAB 2 CONTENT: MANUAL RUT & PIN FORM (AUTO-FILLED PROTOTYPE) */}
          {activeTab === 'MANUAL' && (
            <View style={styles.tabBodyContainer}>
              
              {/* DETECTED USER NAME BANNER */}
              <View style={[styles.detectedUserBanner, { borderColor: themeColor }]}>
                <UserCheck color={themeColor} size={20} style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.detectedLabel}>USUARIO DE TURNO RECONOCIDO:</Text>
                  <Text style={styles.detectedNameText}>{detectedName}</Text>
                </View>
              </View>

              {/* INPUT 1: RUT OPERATIVO */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>RUT OPERATIVO / CREDENCIAL:</Text>
                <View style={styles.inputFieldBox}>
                  <TextInput
                    style={styles.textInput}
                    value={rut}
                    onChangeText={setRut}
                    onFocus={autoFillCredentials}
                    placeholder="Ej. 15.842.910-K"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
              </View>

              {/* INPUT 2: CLAVE / PIN DE TURNO */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CLAVE / PIN DE TURNO:</Text>
                <View style={styles.inputFieldBox}>
                  <TextInput
                    style={styles.textInput}
                    value={pin}
                    onChangeText={setPin}
                    onFocus={autoFillCredentials}
                    secureTextEntry={true}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.giantConfirmBtn, { backgroundColor: themeColor }]}
                activeOpacity={0.85}
                onPress={handleManualLogin}
              >
                <Lock color="#000000" size={20} style={{ marginRight: 6 }} />
                <Text style={styles.giantConfirmBtnText}>[ 🔓 INICIAR SESIÓN DE TURNO ]</Text>
              </TouchableOpacity>

            </View>
          )}

        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
    minHeight: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    className: 'identity-mesh-bg',
  },
  centerWrapper: {
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#162230',
    borderWidth: 1,
    borderColor: '#263C53',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  backBtnText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  authCard: {
    width: '100%',
    backgroundColor: '#121924',
    borderRadius: 14,
    borderWidth: 2,
    padding: SPACING.xl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 10,
  },
  cardHeader: {
    marginBottom: SPACING.lg,
  },
  roleHeaderBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  roleBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  plantTagText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },
  cardTitleText: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  cardSubText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },

  tabBarRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#182433',
    borderWidth: 1.5,
    borderColor: '#283C50',
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '900',
  },

  tabBodyContainer: {
    gap: SPACING.md,
  },
  scannerWindow: {
    width: '100%',
    height: 210,
    backgroundColor: '#0B1017',
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: SPACING.md,
  },
  cornerTL: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  laserLine: {
    position: 'absolute',
    left: '5%',
    width: '90%',
    height: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    zIndex: 20,
  },
  scanInstructionText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '700',
  },
  scanningIndicatorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  scanningText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  detectedUserBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#182736',
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 10,
  },
  detectedLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '800',
  },
  detectedNameText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 1,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  inputFieldBox: {
    backgroundColor: '#0D141F',
    borderWidth: 1.5,
    borderColor: '#263A4F',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textInput: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },

  giantConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 6,
    minHeight: GLOVE_TARGETS.buttonHeight,
  },
  giantConfirmBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
