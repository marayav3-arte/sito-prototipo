// ============================================================
// ASSET CATALOG — Fuente Única de Verdad para toda la App
// Derivado del Mapa 3D (plantNodes.js) + datos tácticos
// ============================================================

export const ASSET_CATALOG = [
  // ─── ÁREA SECA ──────────────────────────────────────────────
  {
    id: 'CH-CDN-001',
    tag: 'ACT-001',
    altTags: ['CH-01', 'CH-CDN-001'],
    name: 'Chancador Cónico Omnicone SX 1560',
    macroArea: 'ÁREA SECA',
    subArea: 'Chancado Secundario / Secuestro de Finos',
    elevation: 'Nivel +15m',
    epp: '⚠️ Uso obligatorio de protección auditiva | Nivel +15m',
    supervisor: 'Carlos Mendoza (Turno A)',

    dataCritica: [
      { param: 'Torque Crítico Ensamble', value: '1450 Nm', status: 'nominal' },
      { param: 'Holgura / Tolerancia CSS', value: '12.5 mm', status: 'nominal' },
      { param: 'Sistema de Lubricación', value: 'ISO VG 150', status: 'nominal' },
      { param: 'Temperatura de Alarma', value: '> 75 °C', status: 'alerta' },
      { param: 'Presión de Trabajo', value: '120 – 150 Bar', status: 'nominal' },
      { param: 'Horómetro', value: '4.850 hrs (Próx. cambio forros)', status: 'precaucion' },
      { param: 'Vibración', value: 'NORMAL (< 3.5 mm/s)', status: 'nominal' },
      { param: 'Torque de Anclaje', value: '580 Nm', status: 'nominal' },
      { param: 'Interlock Temperatura', value: 'Paro automático > 85 °C', status: 'alerta' },
      { param: 'Interlock Presión', value: 'Paro automático < 100 Bar', status: 'alerta' },
    ],

    infografias: [
      {
        id: 'infog-01',
        title: 'Lubricación Diaria — Buje Principal',
        pasos: [
          'Verificar nivel de aceite en visor lateral (entre marcas MIN / MAX).',
          'Confirmar caudal de bomba de lubricación: 4 – 6 L/min.',
          'Tomar muestra de aceite para análisis ISO 150 (frasco 100 ml).',
          'Limpiar con paño el visor y tapón de llenado.',
          'Registrar en bitácora con horómetro actual.',
        ],
        frecuencia: 'Diario (Turno A)',
        icon: '🛢️',
      },
      {
        id: 'infog-02',
        title: 'Medición de Holgura CSS (12.5 mm)',
        pasos: [
          'Aplicar Bloqueo LOTO total en interruptor Q3.',
          'Insertar galga laminada calibrada 12.5 mm en abertura inferior.',
          'Medir en 3 puntos: 0°, 120° y 240° del cono.',
          'Registrar variaciones > 0.5 mm como anomalía.',
          'Retirar galga y retirar bloqueo según protocolo.',
        ],
        frecuencia: 'Semanal (50h)',
        icon: '📏',
      },
      {
        id: 'infog-03',
        title: 'Torque Crítico (1450 Nm)',
        pasos: [
          'Detener equipo y aplicar LOTO Q3 + purga hidráulica.',
          'Limpiar roscas de pernos de retención con thinner.',
          'Aplicar lubricante de torque Never-Seez en hilos.',
          'Ajustar con llave hidráulica al 50% (725 Nm) en cruz.',
          'Completar torque al 100% (1450 Nm) en secuencia cruzada.',
          'Marcar pernos con pintura de verificación.',
        ],
        frecuencia: 'Trimestral (1000h)',
        icon: '🔩',
      },
    ],

    microCapacitacion: ['v4', 'v2', 'v1', 'v3'],

    faultLinks: {
      'overheat': { capsulaId: 'v3', guiaId: 'infog-01', guiaTitle: 'Lubricación Diaria + Protocolo LOTO' },
      'm1': { capsulaId: 'v2', guiaId: 'infog-02', guiaTitle: 'Medición de Holgura CSS' },
      'm2': { capsulaId: 'v2', guiaId: 'infog-02', guiaTitle: 'Ajuste de Holgura de Excéntrica' },
      'l1': { capsulaId: 'v4', guiaId: 'infog-01', guiaTitle: 'Lubricación Diaria Buje Principal' },
      'h1': { capsulaId: 'v3', guiaId: 'infog-03', guiaTitle: 'Protocolo Hidráulico + Torque Crítico' },
    },
  },

  {
    id: 'CH-PRI-01',
    tag: 'CH-PRI-01',
    altTags: ['CH-PRI-01'],
    name: 'Chancador Primario Giratorio 60x89',
    macroArea: 'ÁREA SECA',
    subArea: 'Chancado Primario',
    elevation: 'Nivel +22m',
    epp: '⚠️ Casco, Arnés Anti-Caídas, Protección Auditiva Nivel 3',
    supervisor: 'Carlos Mendoza (Turno A)',

    dataCritica: [
      { param: 'Capacidad Nominal', value: '4.500 TPH', status: 'nominal' },
      { param: 'Gap de Descarga CSS', value: '150 – 180 mm', status: 'nominal' },
      { param: 'Temperatura Motor', value: '< 80 °C', status: 'nominal' },
      { param: 'Lubricación Spider', value: 'Grasa Mobilux EP 2', status: 'nominal' },
      { param: 'Interlock Cámara', value: 'Paro si nivel > 85% cámara', status: 'alerta' },
    ],

    infografias: [
      {
        id: 'infog-pri-01',
        title: 'Inspección Pre-Turno Chancador Primario',
        pasos: [
          'Verificar nivel de grasa en spider desde plataforma Nivel +22m.',
          'Revisar correa de transmisión: tensión y desgaste de flanco.',
          'Inspeccionar puntos de desgaste de revestimiento de cámara.',
          'Confirmar presión de lubricación central ≥ 2 Bar.',
          'Verificar sistema de aspersión de agua (anti-polvo) activo.',
        ],
        frecuencia: 'Cada Turno',
        icon: '🏗️',
      },
    ],

    microCapacitacion: ['v1', 'v5'],
    faultLinks: {
      'overheat': { capsulaId: 'v3', guiaId: 'infog-pri-01', guiaTitle: 'Inspección Pre-Turno Primario' },
    },
  },

  {
    id: 'COR-01',
    tag: 'COR-01',
    altTags: ['COR-01', 'CV-01'],
    name: 'Correa Transportadora Principal CV-01',
    macroArea: 'ÁREA SECA',
    subArea: 'Alimentación a Molienda',
    elevation: 'Nivel +8m',
    epp: '⚠️ Distancia mínima 1.5m de polines en movimiento',
    supervisor: 'Carlos Mendoza (Turno A)',

    dataCritica: [
      { param: 'Velocidad Nominal', value: '2.5 m/s', status: 'nominal' },
      { param: 'Tensión de Correa', value: '180 kN', status: 'nominal' },
      { param: 'Temperatura Rodillo Motriz', value: '< 60 °C', status: 'nominal' },
      { param: 'Ancho de Correa', value: '1.800 mm', status: 'nominal' },
      { param: 'Capacidad Tonelaje', value: '2.800 TPH', status: 'nominal' },
    ],

    infografias: [
      {
        id: 'infog-cor-01',
        title: 'Inspección Polines y Tensión CV-01',
        pasos: [
          'Recorrer pasillo inferior revisando polines sin ruido.',
          'Verificar centrado de correa con deflector lateral.',
          'Medir temperatura de rodillo motriz con termómetro laser.',
          'Inspeccionar empalme vulcanizado: fisuras o separación.',
          'Registrar condición de raspadores y limpiadores de retorno.',
        ],
        frecuencia: 'Semanal',
        icon: '🔄',
      },
    ],

    microCapacitacion: ['v6'],
    faultLinks: {},
  },

  {
    id: 'HAR-VRT-01',
    tag: 'HAR-VRT-01',
    altTags: ['HAR-VRT-01'],
    name: 'Harnero Vibratorio Principal 8x20',
    macroArea: 'ÁREA SECA',
    subArea: 'Clasificación de Finos',
    elevation: 'Nivel +10m',
    epp: '⚠️ Protección auditiva obligatoria y guantes antivibración',
    supervisor: 'Carlos Mendoza (Turno A)',

    dataCritica: [
      { param: 'Amplitud de Vibración', value: '8 – 12 mm pico-pico', status: 'nominal' },
      { param: 'Frecuencia', value: '16 Hz (960 RPM)', status: 'nominal' },
      { param: 'Mallas', value: '20mm / 12mm / 6mm (3 deck)', status: 'nominal' },
      { param: 'Tensión de Resortes', value: 'Inspección Visual', status: 'nominal' },
    ],

    infografias: [
      {
        id: 'infog-har-01',
        title: 'Tensado y Cambio de Malla en Harnero',
        pasos: [
          'Detener y aplicar LOTO al vibrador.',
          'Aflojar pernos de tensión laterales (M20 / 400 Nm).',
          'Retirar malla gastada con palanca de nylon (no metálica).',
          'Instalar malla nueva verificando tensión uniforme.',
          'Re-torquear en secuencia cruzada a 400 Nm.',
        ],
        frecuencia: 'Mensual o por desgaste',
        icon: '⬛',
      },
    ],

    microCapacitacion: ['v6'],
    faultLinks: {},
  },

  {
    id: 'CH-CON-002',
    tag: 'ACT-002',
    altTags: ['ACT-002', 'CH-SYM-001'],
    name: 'Chancador Cónico Symons 3Ft',
    macroArea: 'ÁREA SECA',
    subArea: 'Chancado Terciario',
    elevation: 'Nivel +12m',
    epp: '⚠️ Protección respiratoria polvo fino y lentes de seguridad',
    supervisor: 'Carlos Mendoza (Turno A)',

    dataCritica: [
      { param: 'CSS Nominal', value: '10 – 16 mm', status: 'nominal' },
      { param: 'Velocidad del Manto', value: '435 RPM', status: 'nominal' },
      { param: 'Potencia Motor', value: '185 kW', status: 'nominal' },
      { param: 'Temperatura de Aceite', value: '< 65 °C', status: 'nominal' },
      { param: 'Interlock Aceite', value: 'Paro si T° > 70°C o presión < 1.5 Bar', status: 'alerta' },
    ],

    infografias: [
      {
        id: 'infog-sym-01',
        title: 'Ajuste de CSS Symons 3Ft',
        pasos: [
          'Detener y asegurar LOTO en tablero TG-14.',
          'Aflojar corona de ajuste con herramienta especial Symons.',
          'Medir CSS con esfera de plomo en 4 puntos radiales.',
          'Ajustar corona hasta CSS objetivo ± 1 mm.',
          'Re-asegurar contra-tuerca de bloqueo (120 Nm).',
        ],
        frecuencia: 'Quincenal',
        icon: '⚙️',
      },
    ],

    microCapacitacion: ['v2', 'v4'],
    faultLinks: {
      'overheat': { capsulaId: 'v3', guiaId: 'infog-sym-01', guiaTitle: 'Ajuste de CSS + LOTO Symons' },
    },
  },

  {
    id: 'FIL-DUS-003',
    tag: 'ACT-003',
    altTags: ['ACT-003', 'FIL-DUS-F100'],
    name: 'Filtro de Mangas Dustex F100',
    macroArea: 'ÁREA SECA',
    subArea: 'Control de Emisiones',
    elevation: 'Nivel +18m',
    epp: '⚠️ Mascarilla N95 y lentes herméticos obligatorios',
    supervisor: 'Carlos Mendoza (Turno A)',

    dataCritica: [
      { param: 'Caída de Presión Nominal', value: '1.200 – 1.800 Pa', status: 'nominal' },
      { param: 'N° de Mangas', value: '480 unidades (8 compartimientos)', status: 'nominal' },
      { param: 'Presión Pulso de Limpieza', value: '6 Bar', status: 'nominal' },
      { param: 'Temperatura Max. Gases', value: '< 120 °C', status: 'alerta' },
    ],

    infografias: [
      {
        id: 'infog-dus-01',
        title: 'Reemplazo de Mangas Dustex F100',
        pasos: [
          'Aislar compartimiento a reparar (válvula damper).',
          'Dejar enfriar compartimiento a < 40 °C.',
          'Retirar mangas gastadas jalando desde el venturi.',
          'Instalar manga nueva verificando asiento en cell plate.',
          'Verificar con linterna que no hayan pliegues o roturas.',
        ],
        frecuencia: 'Anual o por alarma de caída de presión',
        icon: '🌫️',
      },
    ],

    microCapacitacion: ['v7'],
    faultLinks: {},
  },

  // ─── ÁREA HÚMEDA ─────────────────────────────────────────────
  {
    id: 'BOM-LHD-01',
    tag: 'ACT-004',
    altTags: ['ACT-004', 'BOM-LHD-01'],
    name: 'Bomba Centrífuga de Pulpa LHD-01',
    macroArea: 'ÁREA HÚMEDA',
    subArea: 'Impulsión de Pulpa a Espesador',
    elevation: 'Nivel 0m (Piso Planta)',
    epp: '⚠️ Botas de goma nitrile y guantes impermeables',
    supervisor: 'Patricio Silva (Turno A)',

    dataCritica: [
      { param: 'Caudal Nominal', value: '1.200 m³/h', status: 'nominal' },
      { param: 'Presión de Descarga', value: '3.8 Bar', status: 'nominal' },
      { param: 'Sello Mecánico — Agua', value: '0.5 Bar', status: 'precaucion' },
      { param: 'Temperatura de Rodamientos', value: '< 75 °C', status: 'nominal' },
      { param: 'Vibración Eje', value: '< 4.5 mm/s RMS', status: 'nominal' },
      { param: 'Desgaste de Impulsor', value: 'Medición semestral (±5%)', status: 'precaucion' },
      { param: 'Interlock Sello', value: 'Paro si presión sello < 0.3 Bar', status: 'alerta' },
    ],

    infografias: [
      {
        id: 'infog-lhd-01',
        title: 'Verificación del Sello Mecánico LHD-01',
        pasos: [
          'Verificar presión de agua de sello en manómetro local (0.4 – 0.6 Bar).',
          'Chequear temperatura de rodamientos con termómetro laser.',
          'Revisar drene de flushing: debe fluir limpio (sin partículas negras).',
          'Aplicar grasa EP2 en niples de lubricación (2 disparos manual).',
          'Registrar vibración con vibrómetro portátil.',
        ],
        frecuencia: 'Semanal',
        icon: '💧',
      },
      {
        id: 'infog-lhd-02',
        title: 'Cambio de Sello Mecánico LHD-01',
        pasos: [
          'Bloquear LOTO en TG-08 y aislar válvulas de succión y descarga.',
          'Vaciar carcasa por tapón de drenaje DN40.',
          'Retirar acoplamiento flexible y desmontar tapa posterior.',
          'Extraer sello gastado con extractor específico (no golpear).',
          'Instalar sello nuevo con grasa de montaje en O-rings.',
          'Ajustar pre-carga de resorte según ficha de fabricante.',
          'Probar con agua antes de reiniciar con pulpa.',
        ],
        frecuencia: 'Por fuga detectada o cada 6.000 hrs',
        icon: '🔧',
      },
    ],

    microCapacitacion: ['v8', 'v3', 'v5'],

    faultLinks: {
      'sello': { capsulaId: 'v8', guiaId: 'infog-lhd-02', guiaTitle: 'Cambio de Sello Mecánico LHD-01' },
      'vibracion': { capsulaId: 'v5', guiaId: 'infog-lhd-01', guiaTitle: 'Verificación de Sello y Rodamientos' },
    },
  },

  {
    id: 'MOL-SAG-02',
    tag: 'ACT-005',
    altTags: ['ACT-005', 'MOL-SAG-02', 'MOL-01'],
    name: 'Molino SAG 28x14 Dual Pinion (Línea 2)',
    macroArea: 'ÁREA HÚMEDA',
    subArea: 'Molienda Primaria',
    elevation: 'Nivel +5m',
    epp: '⚠️ Fonos dobles fono-absorbentes y zapato dieléctrico obligatorio',
    supervisor: 'Patricio Silva (Turno A)',

    dataCritica: [
      { param: 'Velocidad Crítica', value: '10.8 RPM (74% Vc)', status: 'nominal' },
      { param: 'Carga de Bolas', value: '22 – 26% del volumen interno', status: 'nominal' },
      { param: 'Potencia Motor Dual', value: '2 × 8.500 kW = 17.000 kW', status: 'nominal' },
      { param: 'Presión Cojinete Sellos', value: '> 80 Bar (alta presión)', status: 'alerta' },
      { param: 'Temperatura Trunión', value: '< 65 °C', status: 'nominal' },
      { param: 'Interlock Vibración', value: 'Paro si vibración > 8 mm/s', status: 'alerta' },
    ],

    infografias: [
      {
        id: 'infog-sag-01',
        title: 'Lubricación de Trunión SAG',
        pasos: [
          'Verificar nivel y temperatura del tanque de aceite (< 45 °C).',
          'Confirmar caudal en flujómetro: ≥ 120 L/min por trunión.',
          'Revisar filtros de retorno (indicador visual verde = OK).',
          'Medir temperatura de trunión con sensor de contacto.',
          'Revisar purgas de aire en líneas de alta presión.',
        ],
        frecuencia: 'Diario (cada turno)',
        icon: '⚙️',
      },
    ],

    microCapacitacion: ['v9', 'v3'],
    faultLinks: {
      'vibracion': { capsulaId: 'v9', guiaId: 'infog-sag-01', guiaTitle: 'Lubricación de Trunión SAG' },
    },
  },

  {
    id: 'CEL-FLT-01',
    tag: 'CEL-01',
    altTags: ['CEL-01', 'CEL-FLT-01', 'CL-01'],
    name: 'Celdas de Flotación Rougher 300m³',
    macroArea: 'ÁREA HÚMEDA',
    subArea: 'Flotación Colectiva',
    elevation: 'Nivel +3m',
    epp: '⚠️ Mascarilla con filtros orgánicos y detector personal de gases',
    supervisor: 'Patricio Silva (Turno A)',

    dataCritica: [
      { param: 'Nivel de Celda', value: '65 – 75% (control automático)', status: 'nominal' },
      { param: 'Tasa de Aireación', value: '0.8 – 1.2 m³/m²·min', status: 'nominal' },
      { param: 'pH de Operación', value: '10.5 – 11.0', status: 'nominal' },
      { param: 'RPM Impulsor', value: '135 – 145 RPM', status: 'nominal' },
    ],

    infografias: [
      {
        id: 'infog-cel-01',
        title: 'Ajuste de Dardos y Espuma Rougher',
        pasos: [
          'Verificar nivel de espuma en visores laterales de celda.',
          'Ajustar apertura de dardos de descarga (giro manual 1/4 vuelta).',
          'Medir pH con electrodo portátil en caja de entrada.',
          'Confirmar flujo de reactivo colector en bomba dosificadora.',
          'Registrar recuperación visual de espuma en bitácora.',
        ],
        frecuencia: 'Cada 2 horas de turno',
        icon: '🫧',
      },
    ],

    microCapacitacion: ['v7'],
    faultLinks: {},
  },

  {
    id: 'BAT-CYC-01',
    tag: 'TACL-01',
    altTags: ['TACL-01', 'BAT-CYC-01'],
    name: 'Batería de Hidrociclones Cavex 500',
    macroArea: 'ÁREA HÚMEDA',
    subArea: 'Clasificación de Pulpa',
    elevation: 'Nivel +14m',
    epp: '⚠️ Traje impermeable de goma y antiparras anti-salpicaduras',
    supervisor: 'Patricio Silva (Turno A)',

    dataCritica: [
      { param: 'N° de Ciclones Activos', value: '10 de 12', status: 'precaucion' },
      { param: 'Presión de Alimentación', value: '80 – 120 kPa', status: 'nominal' },
      { param: 'Granulometría Overflow', value: 'P80 = 212 µm', status: 'nominal' },
      { param: 'Ángulo de Underflow', value: '20° (cono estándar)', status: 'nominal' },
    ],

    infografias: [
      {
        id: 'infog-cyc-01',
        title: 'Cambio de Vortex Finder y Apex — Cavex 500',
        pasos: [
          'Aislar ciclón con válvula de alimentación (cierre manual).',
          'Aflojar abrazadera de presión tipo Victaulic en junta inferior.',
          'Retirar cono apex y vortex finder desgastados.',
          'Instalar repuestos nuevos libres de partículas.',
          'Re-ajustar abrazadera y verificar sello sin fugas.',
        ],
        frecuencia: 'Mensual o según granulometría',
        icon: '🌀',
      },
    ],

    microCapacitacion: ['v6'],
    faultLinks: {},
  },

  // ─── PROCESOS / RELAVES ───────────────────────────────────────
  {
    id: 'ESP-REL-01',
    tag: 'ESP-01',
    altTags: ['ESP-01', 'ESP-REL-01'],
    name: 'Espesador de Relaves High-Rate 45m',
    macroArea: 'PROCESOS / RELAVES',
    subArea: 'Recuperación de Agua',
    elevation: 'Nivel +6m',
    epp: '⚠️ Chaleco salvavidas obligatorio en pasarela central',
    supervisor: 'Hernán Gutiérrez',

    dataCritica: [
      { param: 'Torque de Rastras', value: '< 50% del torque máximo', status: 'nominal' },
      { param: 'Densidad de Descarga', value: '1.600 – 1.750 g/L', status: 'nominal' },
      { param: 'Flujo de Floculante', value: '25 – 40 g/T', status: 'nominal' },
      { param: 'Nivel de Cama de Lodos', value: '< 2.5 m desde fondo', status: 'precaucion' },
    ],

    infografias: [
      {
        id: 'infog-esp-01',
        title: 'Inspección de Rastras y Mecanismo Central',
        pasos: [
          'Verificar nivel de aceite en caja reductora central desde pasarela.',
          'Medir torque actual en panel HMI (debe ser < 50%).',
          'Inspeccionar visualmente brazos de rastra desde borde espesador.',
          'Revisar dosificación de floculante en estanque de dilución.',
          'Registrar densidad underflow con densímetro portátil.',
        ],
        frecuencia: 'Semanal',
        icon: '🔵',
      },
    ],

    microCapacitacion: ['v7'],
    faultLinks: {},
  },

  {
    id: 'FIL-PRE-01',
    tag: 'FL-PR-01',
    altTags: ['FL-PR-01', 'FIL-PRE-01'],
    name: 'Filtro Prensa de Alta Presión Diemme',
    macroArea: 'PROCESOS / RELAVES',
    subArea: 'Filtrado de Concentrado',
    elevation: 'Nivel +2m',
    epp: '⚠️ Guantes de nitrilo alto calibre e inspección de alta presión',
    supervisor: 'Hernán Gutiérrez',

    dataCritica: [
      { param: 'Presión de Filtración', value: '15 Bar', status: 'alerta' },
      { param: 'Humedad de Torta', value: '< 9% H₂O', status: 'nominal' },
      { param: 'N° de Placas', value: '120 placas (60 activas)', status: 'nominal' },
      { param: 'Tiempo de Ciclo', value: '45 – 60 minutos/ciclo', status: 'nominal' },
    ],

    infografias: [
      {
        id: 'infog-fil-01',
        title: 'Cambio de Telas Filtrantes Diemme',
        pasos: [
          'Detener ciclo y aliviar presión de sistema a 0 Bar.',
          'Extender plato de apertura y desplazar las placas manualmente.',
          'Retirar tela gastada cortando amarres de sellado inferior.',
          'Instalar tela nueva verificando centrado en orificio de alimentación.',
          'Inspeccionar O-ring de sellado de placa antes de cerrar.',
        ],
        frecuencia: 'Semestral o por humedad fuera de rango',
        icon: '🟦',
      },
    ],

    microCapacitacion: ['v7', 'v3'],
    faultLinks: {},
  },
];

// ─── HELPERS ──────────────────────────────────────────────────

/** Obtener activo por cualquier TAG (tag principal o altTags) */
export function getAssetByTag(tag) {
  if (!tag) return null;
  const t = tag.toUpperCase();
  return ASSET_CATALOG.find(
    (a) =>
      a.tag.toUpperCase() === t ||
      (a.altTags && a.altTags.some((alt) => alt.toUpperCase() === t))
  ) || null;
}

/** Retorna objeto { 'ÁREA SECA': [...], 'ÁREA HÚMEDA': [...], 'PROCESOS / RELAVES': [...] } */
export function getAssetsByArea() {
  const result = {};
  for (const asset of ASSET_CATALOG) {
    if (!result[asset.macroArea]) result[asset.macroArea] = [];
    result[asset.macroArea].push(asset);
  }
  return result;
}

/** Búsqueda libre por nombre, tag, subArea */
export function searchAssets(query) {
  if (!query || !query.trim()) return ASSET_CATALOG;
  const q = query.toLowerCase();
  return ASSET_CATALOG.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.tag.toLowerCase().includes(q) ||
      (a.altTags && a.altTags.some((t) => t.toLowerCase().includes(q))) ||
      a.subArea.toLowerCase().includes(q)
  );
}

/** Mapa de macroArea → área corta usada en WorkOrdersContext */
export const MACRO_AREA_TO_AREA = {
  'ÁREA SECA': 'Área Seca',
  'ÁREA HÚMEDA': 'Área Húmeda',
  'PROCESOS / RELAVES': 'Área Húmeda',
};

/** Metadatos de cápsulas de micro-capacitación */
export const MICRO_CAPS = {
  v1: { title: 'Procedimiento de Despeje de Cámara Acuñada', duration: '4:15', category: 'RIESGO MECÁNICO' },
  v2: { title: 'Ajuste Seguro de Holgura de Excéntrica', duration: '3:50', category: 'RIESGO MECÁNICO' },
  v3: { title: 'Protocolo de Desconexión Hidráulica', duration: '5:00', category: 'RIESGO MECÁNICO' },
  v4: { title: 'Ajuste y Medición de Holgura (CSS) en Chancadores', duration: '6:20', category: 'MECÁNICA CHANCADO' },
  v5: { title: 'Verificación de Sello Mecánico y Rodamientos', duration: '4:00', category: 'MECÁNICA BOMBAS' },
  v6: { title: 'Mantenimiento de Correas y Clasificadores', duration: '5:30', category: 'TRANSPORTE DE MATERIAL' },
  v7: { title: 'Seguridad con Relaves y Reactivos Químicos', duration: '6:00', category: 'SEGURIDAD PROCESO' },
  v8: { title: 'Cambio de Sello Mecánico en Bombas de Pulpa', duration: '7:10', category: 'MECÁNICA BOMBAS' },
  v9: { title: 'Lubricación de Truniones en Molinos SAG / Bolas', duration: '5:45', category: 'MECÁNICA MOLIENDA' },
};
