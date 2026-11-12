// Complete Plant Node Registry & PROMPT 14 Exact Coordinates Matrix for assets/planta-layout.png

export const PLANT_NODES = [
  // -------------------------------------------------------------------------
  // MACRO-ÁREA 1: ÁREA SECA (Sector Izquierdo / Terracota)
  // -------------------------------------------------------------------------
  {
    id: 'CH-CDN-001',
    tag: 'CH-01',
    altTag: 'ACT-001',
    name: 'Chancador Cónico Omnicone SX 1560',
    macroArea: 'ÁREA SECA',
    subArea: 'Chancado Secundario / Secuestro de Finos',
    channel: 'CANAL 2 (Operaciones Seca)',
    supervisor: 'Carlos Mendoza (Turno A)',
    x: 27.5, // PROMPT 19 Exact Native Icon Anchor { x: 27.5, y: 25.8 }
    y: 25.8,
    epp: '⚠️ Uso obligatorio de protección auditiva | Nivel +15m',
    elevation: 'Nivel +15m',
  },
  {
    id: 'CH-PRI-01',
    tag: 'CH-PRI-01',
    name: 'Chancador Primario Giratorio 60x89',
    macroArea: 'ÁREA SECA',
    subArea: 'Chancado Primario',
    channel: 'CANAL 2 (Operaciones Seca)',
    supervisor: 'Carlos Mendoza (Turno A)',
    x: 20,
    y: 15,
    epp: '⚠️ EPP Obligatorio: Casco, Arnés Anti-Caídas, Protección Auditiva Nivel 3',
    elevation: 'Nivel +22m',
  },
  {
    id: 'COR-01',
    tag: 'COR-01',
    name: 'Correa Transportadora Principal CV-01',
    macroArea: 'ÁREA SECA',
    subArea: 'Alimentación a Molienda',
    channel: 'CANAL 2 (Operaciones Seca)',
    supervisor: 'Carlos Mendoza (Turno A)',
    x: 38,
    y: 24,
    epp: '⚠️ Distancia mínima 1.5m de polines en movimiento',
    elevation: 'Nivel +8m',
  },
  {
    id: 'HAR-VRT-01',
    tag: 'HAR-VRT-01',
    name: 'Harnero Vibratorio Principal 8x20',
    macroArea: 'ÁREA SECA',
    subArea: 'Clasificación de Finos',
    channel: 'CANAL 2 (Operaciones Seca)',
    supervisor: 'Carlos Mendoza (Turno A)',
    x: 35,
    y: 18,
    epp: '⚠️ Protección auditiva obligatoria y guantes antivibración',
    elevation: 'Nivel +10m',
  },
  {
    id: 'CH-PEB-01',
    tag: 'CH-PEB-01',
    name: 'Chancador de Pebble MP1000',
    macroArea: 'ÁREA SECA',
    subArea: 'Retorno de Pebbles',
    channel: 'CANAL 2 (Operaciones Seca)',
    supervisor: 'Carlos Mendoza (Turno A)',
    x: 30,
    y: 12,
    epp: '⚠️ Protección respiratoria para polvo fino y lentes de seguridad',
    elevation: 'Nivel +12m',
  },

  // -------------------------------------------------------------------------
  // MACRO-ÁREA 2: ÁREA HÚMEDA (Sector Central-Derecho Cyan)
  // -------------------------------------------------------------------------
  {
    id: 'MOL-SAG-02',
    tag: 'MOL-01',
    altTag: 'MOL-SAG-02',
    name: 'Molino SAG 28x14 Dual Pinion',
    macroArea: 'ÁREA HÚMEDA',
    subArea: 'Molienda Primaria',
    channel: 'CANAL 4 (Operaciones Húmeda)',
    supervisor: 'Patricio Silva (Turno A)',
    x: 77.2, // PROMPT 18 Exact Native Icon Anchor { x: 77.2, y: 26.5 }
    y: 26.5,
    epp: '⚠️ Obligatorio fonos fono-absorbentes dobles y zapato dieléctrico',
    elevation: 'Nivel +5m',
  },
  {
    id: 'CEL-FLT-01',
    tag: 'CEL-01',
    altTag: 'CL-01',
    name: 'Celdas de Flotación Rougher 300m³',
    macroArea: 'ÁREA HÚMEDA',
    subArea: 'Flotación Colectiva',
    channel: 'CANAL 4 (Operaciones Húmeda)',
    supervisor: 'Patricio Silva (Turno A)',
    x: 75, // PROMPT 14 Exact Coordinate { x: 75, y: 45 }
    y: 45,
    epp: '⚠️ Mascarilla con filtros orgánicos y detector personal de gases',
    elevation: 'Nivel +3m',
  },
  {
    id: 'MOL-BOL-01',
    tag: 'MOL-02',
    altTag: 'MOL-BOL-01',
    name: 'Molino de Bolas 16x24.5 Secundario',
    macroArea: 'ÁREA HÚMEDA',
    subArea: 'Molienda Secundaria',
    channel: 'CANAL 4 (Operaciones Húmeda)',
    supervisor: 'Patricio Silva (Turno A)',
    x: 78,
    y: 30,
    epp: '⚠️ Protección auditiva y mascara contra neblinas de reactivo',
    elevation: 'Nivel +4m',
  },
  {
    id: 'BAT-CYC-01',
    tag: 'TACL-01',
    altTag: 'BAT-CYC-01',
    name: 'Batería de Hidrociclones Cavex 500',
    macroArea: 'ÁREA HÚMEDA',
    subArea: 'Clasificación de Pulpa',
    channel: 'CANAL 4 (Operaciones Húmeda)',
    supervisor: 'Patricio Silva (Turno A)',
    x: 58,
    y: 35,
    epp: '⚠️ Traje impermeable de goma y antiparras anti-salpicaduras',
    elevation: 'Nivel +14m',
  },
  {
    id: 'BOM-LHD-01',
    tag: 'ACT-004',
    altTag: 'BOM-LHD-01',
    name: 'Bomba Centrífuga de Pulpa LHD-01',
    macroArea: 'ÁREA HÚMEDA',
    subArea: 'Impulsión de Pulpa a Espesador',
    channel: 'CANAL 4 (Operaciones Húmeda)',
    supervisor: 'Patricio Silva (Turno A)',
    x: 55,
    y: 55,
    epp: '⚠️ Botas de seguridad de goma nitrile y guantes impermeables',
    elevation: 'Nivel 0m (Piso Planta)',
  },

  // -------------------------------------------------------------------------
  // MACRO-ÁREA 3: PROCESOS / RELAVES (Sector Inferior / Estanques Circulares)
  // -------------------------------------------------------------------------
  {
    id: 'ESP-REL-01',
    tag: 'ESP-01',
    altTag: 'ESP-REL-01',
    name: 'Espesador de Relaves High-Rate 45m',
    macroArea: 'PROCESOS / RELAVES',
    subArea: 'Recuperación de Agua',
    channel: 'CANAL 5 (Supervisión Relaves)',
    supervisor: 'Hernán Gutiérrez',
    x: 48, // PROMPT 14 Exact Coordinate { x: 48, y: 78 }
    y: 78,
    epp: '⚠️ Chaleco salvavidas obligatorio en pasarela central de espesador',
    elevation: 'Nivel +6m',
  },
  {
    id: 'FIL-PRE-01',
    tag: 'FL-PR-01',
    altTag: 'FIL-PRE-01',
    name: 'Filtro Prensa de Alta Presión Diemme',
    macroArea: 'PROCESOS / RELAVES',
    subArea: 'Filtrado de Concentrado',
    channel: 'CANAL 5 (Supervisión Relaves)',
    supervisor: 'Hernán Gutiérrez',
    x: 62, // PROMPT 14 Exact Coordinate { x: 62, y: 88 }
    y: 88,
    epp: '⚠️ Guantes de nitrilo alto calibre e inspección de alta presión',
    elevation: 'Nivel +2m',
  },
  {
    id: 'EST-LIx-01',
    tag: 'EST-LIx-01',
    name: 'Estanque de Lixiviación TK-500',
    macroArea: 'PROCESOS / RELAVES',
    subArea: 'Hidrometallurgia',
    channel: 'CANAL 5 (Supervisión Relaves)',
    supervisor: 'Hernán Gutiérrez',
    x: 70,
    y: 75,
    epp: '⚠️ Detector de HCN portátil y traje Tyvek nivel C',
    elevation: 'Nivel +1m',
  },
];

// PROMPT 19 - RE-ADJUSTED CH-01 ORIGIN (27.5, 25.8) DENSE VECTOR MATRIX (Percentage Coordinates %)
export const POLYLINE_ROUTES_MAP = {
  // PROMPT 19 ROUTE: Chancador CH-01 (27.5, 25.8) -> Molino MOL-01 (77.2, 26.5)
  'CH-01_MOL-01': "27.5,25.8 23.0,29.0 20.0,33.0 18.5,37.0 18.5,41.0 21.0,43.5 25.0,44.0 29.0,42.5 33.0,39.5 36.0,35.0 39.0,31.0 42.0,28.0 45.5,26.5 50.0,28.5 55.0,29.5 60.0,29.5 65.0,29.5 70.0,28.5 74.0,27.5 77.2,26.5",
  'ACT-001_MOL-01': "27.5,25.8 23.0,29.0 20.0,33.0 18.5,37.0 18.5,41.0 21.0,43.5 25.0,44.0 29.0,42.5 33.0,39.5 36.0,35.0 39.0,31.0 42.0,28.0 45.5,26.5 50.0,28.5 55.0,29.5 60.0,29.5 65.0,29.5 70.0,28.5 74.0,27.5 77.2,26.5",
  'ACT-001_MOL-SAG-02': "27.5,25.8 23.0,29.0 20.0,33.0 18.5,37.0 18.5,41.0 21.0,43.5 25.0,44.0 29.0,42.5 33.0,39.5 36.0,35.0 39.0,31.0 42.0,28.0 45.5,26.5 50.0,28.5 55.0,29.5 60.0,29.5 65.0,29.5 70.0,28.5 74.0,27.5 77.2,26.5",
  'CH-CDN-001_MOL-SAG-02': "27.5,25.8 23.0,29.0 20.0,33.0 18.5,37.0 18.5,41.0 21.0,43.5 25.0,44.0 29.0,42.5 33.0,39.5 36.0,35.0 39.0,31.0 42.0,28.0 45.5,26.5 50.0,28.5 55.0,29.5 60.0,29.5 65.0,29.5 70.0,28.5 74.0,27.5 77.2,26.5",

  // DESTINO == 'CEL-01' (Celdas Flotación)
  'CH-01_CEL-01': "27.5,25.8 45,22 60,32 75,45",
  'ACT-001_CEL-01': "27.5,25.8 45,22 60,32 75,45",
  'ACT-001_CL-01': "27.5,25.8 45,22 60,32 75,45",
  'ACT-001_CEL-FLT-01': "27.5,25.8 45,22 60,32 75,45",
  'CH-CDN-001_CEL-FLT-01': "27.5,25.8 45,22 60,32 75,45",

  // DESTINO == 'ESP-01' (Espesadores)
  'CH-01_ESP-01': "27.5,25.8 30,45 38,62 48,78",
  'ACT-001_ESP-01': "27.5,25.8 30,45 38,62 48,78",
  'ACT-001_ESP-REL-01': "27.5,25.8 30,45 38,62 48,78",
  'CH-CDN-001_ESP-REL-01': "27.5,25.8 30,45 38,62 48,78",

  // DESTINO == 'FL-PR-01' (Filtro Prensa)
  'CH-01_FL-PR-01': "27.5,25.8 35,48 48,70 62,88",
  'ACT-001_FL-PR-01': "27.5,25.8 35,48 48,70 62,88",
  'ACT-001_FIL-PRE-01': "27.5,25.8 35,48 48,70 62,88",
  'CH-CDN-001_FIL-PRE-01': "27.5,25.8 35,48 48,70 62,88",
};

// PROMPT 15 - AUTOMATIC PATH SMOOTHING HELPER (CATMULL-ROM / SPLINE TO SVG BEZIER)
export const smoothWaypointsToBezier = (pointsArray) => {
  if (!pointsArray || pointsArray.length === 0) return '';
  if (pointsArray.length === 1) return `M ${pointsArray[0].x} ${pointsArray[0].y}`;
  if (pointsArray.length === 2) {
    return `M ${pointsArray[0].x} ${pointsArray[0].y} Q ${(pointsArray[0].x + pointsArray[1].x) / 2} ${(pointsArray[0].y + pointsArray[1].y) / 2}, ${pointsArray[1].x} ${pointsArray[1].y}`;
  }

  // Smooth Catmull-Rom spline conversion to SVG Cubic Bezier 'd' path string
  let path = `M ${pointsArray[0].x.toFixed(1)} ${pointsArray[0].y.toFixed(1)}`;
  
  for (let i = 0; i < pointsArray.length - 1; i++) {
    const p0 = pointsArray[i === 0 ? i : i - 1];
    const p1 = pointsArray[i];
    const p2 = pointsArray[i + 1];
    const p3 = pointsArray[i + 2 < pointsArray.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return path;
};

// Calculate walking route distance, time and SVG polyline points / Bézier path string
export const getRouteInfo = (originNode, destNode) => {
  if (!originNode || !destNode) return null;

  // Approximate Euclidean distance
  const dx = (destNode.x - originNode.x) * 4.5;
  const dy = (destNode.y - originNode.y) * 4.5;
  const directDist = Math.sqrt(dx * dx + dy * dy);
  
  const estimatedDistMeters = Math.round(directDist * 1.3 + 15);
  const minutesWalk = Math.max(1, Math.round(estimatedDistMeters / 65));

  // Keys for route lookup
  const routeKey1 = `${originNode.tag}_${destNode.tag}`;
  const routeKey2 = `${originNode.id}_${destNode.id}`;
  const routeKey3 = `${originNode.tag}_${destNode.id}`;
  const routeKey4 = `${originNode.id}_${destNode.tag}`;

  let polylinePoints = POLYLINE_ROUTES_MAP[routeKey1] || 
                       POLYLINE_ROUTES_MAP[routeKey2] || 
                       POLYLINE_ROUTES_MAP[routeKey3] || 
                       POLYLINE_ROUTES_MAP[routeKey4];

  if (!polylinePoints) {
    polylinePoints = `${originNode.x},${originNode.y} ${(originNode.x + destNode.x) / 2},${originNode.y} ${destNode.x},${destNode.y}`;
  }

  // Convert polyline points to SVG path D string for compatibility
  const pointsList = polylinePoints.trim().split(/\s+/);
  const pathD = pointsList.map((pt, i) => {
    const [px, py] = pt.split(',');
    return `${i === 0 ? 'M' : 'L'} ${px} ${py}`;
  }).join(' ');

  return {
    distanceText: `🚶‍♂️ ${estimatedDistMeters} m ~ ${minutesWalk} min`,
    meters: estimatedDistMeters,
    minutes: minutesWalk,
    polylinePoints,
    pathD,
    epp: destNode.epp || '⚠️ Uso de EPP Estándar de Faena',
  };
};

