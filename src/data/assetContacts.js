// Mapping of assets to Area Owners and Radio Communication Channels (LOTO/Operations)

export const ASSET_CONTACTS_MAPPING = {
  // Chancador Cónico Omnicone SX 1560
  'ACT-001': {
    macroArea: 'Área Seca',
    subArea: 'Chancado Secundario / Secuestro de Finos',
    jefeTurno: 'Carlos Mendoza (Turno A)',
    canalTurno: 'CANAL 2 (Operaciones Seca)',
    jefeArea: 'Roberto Arancibia',
    canalArea: 'CANAL 3 (Supervisión General)',
  },
  // Bomba Centrífuga de Pulpa LHD-01 / Bomba Centrífuga
  'ACT-004': {
    macroArea: 'Área Húmeda',
    subArea: 'Molienda / Flotación',
    jefeTurno: 'Patricio Silva (Turno A)',
    canalTurno: 'CANAL 4 (Operaciones Húmeda)',
    jefeArea: 'Hernán Gutiérrez',
    canalArea: 'CANAL 5 (Supervisión Molienda)',
  },
  // Symons 3Ft
  'ACT-002': {
    macroArea: 'Área Seca',
    subArea: 'Chancado Terciario / Clasificación',
    jefeTurno: 'Carlos Mendoza (Turno A)',
    canalTurno: 'CANAL 2 (Operaciones Seca)',
    jefeArea: 'Roberto Arancibia',
    canalArea: 'CANAL 3 (Supervisión General)',
  },
  // Filtro Dustex
  'ACT-003': {
    macroArea: 'Área Seca',
    subArea: 'Nave de Harneros y Captación de Polvo',
    jefeTurno: 'Carlos Mendoza (Turno A)',
    canalTurno: 'CANAL 2 (Operaciones Seca)',
    jefeArea: 'Roberto Arancibia',
    canalArea: 'CANAL 3 (Supervisión General)',
  }
};

export const getAssetContact = (equipment) => {
  if (!equipment) {
    return ASSET_CONTACTS_MAPPING['ACT-001'];
  }
  
  // Search by tagCode or name keywords
  const tag = equipment.tagCode || equipment.tag || '';
  const name = (equipment.name || equipment.title || '').toLowerCase();

  if (tag === 'ACT-004' || name.includes('bomba') || name.includes('lhd-01') || name.includes('pulpa')) {
    return ASSET_CONTACTS_MAPPING['ACT-004'];
  }

  if (tag === 'ACT-002' || name.includes('symons')) {
    return ASSET_CONTACTS_MAPPING['ACT-002'];
  }

  if (tag === 'ACT-003' || name.includes('dustex') || name.includes('filtro')) {
    return ASSET_CONTACTS_MAPPING['ACT-003'];
  }

  // Default to Chancador Omnicone
  return ASSET_CONTACTS_MAPPING[tag] || ASSET_CONTACTS_MAPPING['ACT-001'];
};
