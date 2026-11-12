import React, { createContext, useContext, useState } from 'react';

export const WorkOrdersContext = createContext();

// Helper to calculate exact plant date, time, and Turno A (Día: 08:00 - 20:00, Noche: 20:00 - 08:00)
export const getPlantTimestampAndShift = () => {
  const now = new Date();
  const hours = now.getHours();
  const isDayShift = hours >= 8 && hours < 20;
  const shiftName = isDayShift ? 'Turno A (Día)' : 'Turno A (Noche)';
  const shiftType = isDayShift ? 'DIA' : 'NOCHE';
  
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const day = String(now.getDate()).padStart(2, '0');
  const month = months[now.getMonth()];
  const hh = String(hours).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  
  const formattedDate = `${day}-${month} ${hh}:${mm} hrs | ${shiftName}`;
  return {
    formattedDate,
    shiftType,
    timestamp: now.getTime(),
  };
};

export const INITIAL_WORK_ORDERS = [
  // 1. ACT-001 (NUEVA en Operativo, ACTIVA en Mandante)
  {
    id: 'OT-201',
    alertId: 'ALT-101',
    tag: 'ACT-001',
    equipmentTag: 'ACT-001',
    area: 'Área Seca',
    titulo: 'Chancador Cónico Omnicone SX 1560',
    equipmentName: 'Chancador Cónico Omnicone SX 1560',
    descripcion: 'Sobretemperatura en Aceite (>85°C): Mantenimiento Preventivo 500h, inspección de sellos mecánicos y toma de muestra ISO VG 150.',
    taskDetails: 'Sobretemperatura en Aceite (>85°C): Mantenimiento Preventivo 500h, inspección de sellos mecánicos y toma de muestra ISO VG 150.',
    faultType: 'Sobretemperatura en Aceite (>85°C)',
    emisor: 'Carlos Mendoza (Jefe de Turno A Mandante)',
    mandanteIssuer: 'Carlos Mendoza (Jefe de Turno A Mandante)',
    assetOwner: 'Carlos Mendoza (Jefe de Turno A)',
    generatorRole: 'Carlos Mendoza (Jefe de Turno Mandante / Dueño de Área)',
    ito: 'Ing. Roberto Arancibia M1 (Jefe de Área Seca)',
    assignedIto: 'Ing. Roberto Arancibia M1 (Jefe de Área Seca)',
    itoAssigned: 'Ing. Roberto Arancibia M1',
    contratista: 'Tribología & LUB-Tech Chile',
    contractorCompany: 'Tribología & LUB-Tech Chile',
    specialty: 'Lubricación & Aceites',
    timestamp: 1791563400000,
    formattedDate: '09-Oct 08:30 hrs | Turno A (Día)',
    date: '09-Oct 08:30 hrs | Turno A (Día)',
    turno: 'DIA',
    shiftType: 'DIA',
    estadoMandante: 'ACTIVA',
    estadoOperativo: 'NUEVA',
    mandanteStatus: 'DERIVADO A CONTRATISTA',
    operativoStatus: 'PENDIENTE DE ACEPTACIÓN',
    status: 'PENDIENTE DE ACEPTACIÓN',
    isCritical: true,
    tieneInforme: false,
    reportStatus: 'PENDIENTE',
    reportOption: null,
    otDocument: 'OT_mantenimiento_ACT001.pdf',
    evidencias: ['evidencia_filtro_v102.jpg', 'temp_sensor_85c.png'],
    photos: ['evidencia_filtro_v102.jpg', 'temp_sensor_85c.png'],
    fieldNotes: '',
    progressReport: 'Cuadrilla de lubricación asignada con OT adjunta.',
    technicalNotes: 'Se solicitó inspección de viscosidad ISO VG 150 por muestra tomada.',
    pendingReportFile: null,
    firmaMandante: { firmado: false, validador: '', fechaHora: '' }
  },

  // 2. ACT-004 (NUEVA en Operativo, ACTIVA en Mandante)
  {
    id: 'OT-202',
    alertId: 'ALT-102',
    tag: 'ACT-004',
    equipmentTag: 'ACT-004',
    area: 'Área Húmeda',
    titulo: 'Bomba Centrífuga de Pulpa LHD-01',
    equipmentName: 'Bomba Centrífuga de Pulpa LHD-01',
    descripcion: 'Vibración Anómala en Cojinetes: Chequeo de alineamiento de acoplamiento flexible y torqueado de pernos de anclaje de estator.',
    taskDetails: 'Vibración Anómala en Cojinetes: Chequeo de alineamiento de acoplamiento flexible y torqueado de pernos de anclaje de estator.',
    faultType: 'Vibración Anómala en Cojinetes',
    emisor: 'Pedro Gómez M2 (Supervisor Mecánico Mandante)',
    mandanteIssuer: 'Pedro Gómez M2 (Supervisor Mecánico Mandante)',
    assetOwner: 'Patricio Silva (Turno A)',
    generatorRole: 'Pedro Gómez M2 (Supervisor Mecánico Mandante)',
    ito: 'Pedro Gómez M2 (Supervisor Mecánico Manto)',
    assignedIto: 'Pedro Gómez M2 (Supervisor Mecánico Manto)',
    itoAssigned: 'Ing. Fernando Tapia M2',
    contratista: 'Mantenimiento Integral Mina SA',
    contractorCompany: 'Mantenimiento Integral Mina SA',
    specialty: 'Mantenimiento General & Mecánica',
    timestamp: 1791587700000,
    formattedDate: '09-Oct 21:15 hrs | Turno A (Noche)',
    date: '09-Oct 21:15 hrs | Turno A (Noche)',
    turno: 'NOCHE',
    shiftType: 'NOCHE',
    estadoMandante: 'ACTIVA',
    estadoOperativo: 'NUEVA',
    mandanteStatus: 'DERIVADO A CONTRATISTA',
    operativoStatus: 'PENDIENTE DE ACEPTACIÓN',
    status: 'PENDIENTE DE ACEPTACIÓN',
    isCritical: false,
    tieneInforme: false,
    reportStatus: 'PENDIENTE',
    reportOption: null,
    otDocument: 'OT_mantenimiento_ACT004.pdf',
    evidencias: ['vibracion_cojinete_lhd.jpg'],
    photos: ['vibracion_cojinete_lhd.jpg'],
    fieldNotes: '',
    progressReport: 'Esperando cuadrilla con alineador láser para chequeo de base.',
    technicalNotes: 'Verificar pernos de anclaje de estator.',
    pendingReportFile: null,
    firmaMandante: { firmado: false, validador: '', fechaHora: '' }
  },

  // 3. ACT-003 (EN DESARROLLO en Operativo, ACTIVA / EN PROCESO en Mandante)
  {
    id: 'OT-198',
    alertId: 'ALT-103',
    tag: 'ACT-003',
    equipmentTag: 'ACT-003',
    area: 'Área Seca',
    titulo: 'Filtro de Mangas Dustex F100',
    equipmentName: 'Filtro de Mangas Dustex F100',
    descripcion: 'Reemplazo de solenoides de purga impulsada por aire comprimido en colectores 3 y 4.',
    taskDetails: 'Reemplazo de solenoides de purga impulsada por aire comprimido en colectores 3 y 4.',
    faultType: 'Pérdida de presión en purga neumática de mangas',
    emisor: 'Ing. Roberto Arancibia M1 (Jefe de Área Seca Mandante)',
    mandanteIssuer: 'Ing. Roberto Arancibia M1 (Jefe de Área Seca Mandante)',
    assetOwner: 'Ing. Roberto Arancibia M1',
    generatorRole: 'Ing. Roberto Arancibia M1 (Jefe de Área Seca)',
    ito: 'Roberto Arancibia (ITO Mandante)',
    assignedIto: 'Ing. Roberto Arancibia M1 (Jefe de Área Seca)',
    itoAssigned: 'Roberto Arancibia (ITO Mandante)',
    contratista: 'Electromecánica & Energía SpA',
    contractorCompany: 'Electromecánica & Energía SpA',
    specialty: 'Electricidad & Instrumentación',
    timestamp: 1791568800000,
    formattedDate: '09-Oct 16:00 hrs | Turno A (Día)',
    date: '09-Oct 16:00 hrs | Turno A (Día)',
    turno: 'DIA',
    shiftType: 'DIA',
    estadoMandante: 'ACTIVA',
    estadoOperativo: 'DESARROLLO',
    mandanteStatus: 'EN PROCESO DE MITIGACIÓN',
    operativoStatus: 'EN EJECUCIÓN EN TERRENO',
    status: 'EN EJECUCIÓN EN TERRENO',
    isCritical: false,
    tieneInforme: false,
    reportStatus: 'PENDIENTE',
    reportOption: null,
    otDocument: 'OT_mantenimiento_ACT003.pdf',
    evidencias: ['solenoide_purga_f100.jpg'],
    photos: ['solenoide_purga_f100.jpg'],
    fieldNotes: 'Solenoide col. 3 desinstalado. Se prepara prueba de estanqueidad con aire a 6 Bar.',
    progressReport: 'Cuadrilla eléctrica en terreno realizando montaje de nuevos solenoides.',
    technicalNotes: 'Prueba de estanqueidad a 6 Bar requerida antes de energizar colector.',
    pendingReportFile: null,
    firmaMandante: { firmado: false, validador: '', fechaHora: '' }
  },

  // 4. ACT-005 (HISTORIAL Etapa 1 en Operativo, CERRADA / PENDIENTE en Mandante)
  {
    id: 'OT-184',
    alertId: 'ALT-098',
    tag: 'ACT-005',
    equipmentTag: 'ACT-005',
    area: 'Área Húmeda',
    titulo: 'Molino de Bolas SAG Línea 2',
    equipmentName: 'Molino de Bolas SAG Línea 2',
    descripcion: 'Inspección interior de corazas de revestimiento y torqueo de pernos de fijación.',
    taskDetails: 'Inspección interior de corazas de revestimiento y torqueo de pernos de fijación.',
    faultType: 'Perno de fijación de coraza desalineado',
    emisor: 'Pedro Gómez M2 (Supervisor Mecánico Mandante)',
    mandanteIssuer: 'Pedro Gómez M2 (Supervisor Mecánico Mandante)',
    assetOwner: 'Patricio Silva (Turno A)',
    generatorRole: 'Supervisor Mecánico Mandante (Pedro Gómez M2)',
    ito: 'Ing. Fernando Tapia M2',
    assignedIto: 'Pedro Gómez M2 (Supervisor Mecánico Manto)',
    itoAssigned: 'Ing. Fernando Tapia M2',
    contratista: 'Mantenimiento Integral Mina SA',
    contractorCompany: 'Mantenimiento Integral Mina SA',
    specialty: 'Mantenimiento General & Mecánica',
    timestamp: 1791566000000,
    formattedDate: '09-Oct 11:00 hrs | Turno A (Día)',
    date: '09-Oct 11:00 hrs | Turno A (Día)',
    closedDate: '09-Oct 15:45 hrs | Turno A (Día)',
    turno: 'DIA',
    shiftType: 'DIA',
    estadoMandante: 'CERRADA',
    estadoOperativo: 'HISTORIAL',
    mandanteStatus: 'RESUELTO',
    operativoStatus: 'CIERRE PENDIENTE / INFORME REQUERIDO',
    status: 'CIERRE PENDIENTE / INFORME REQUERIDO',
    isCritical: false,
    tieneInforme: false,
    reportStatus: 'PENDIENTE',
    reportOption: 'PENDIENTE',
    otDocument: 'OT_mantenimiento_ACT005.pdf',
    evidencias: ['molino_sag_terreno.jpg'],
    photos: ['molino_sag_terreno.jpg'],
    fieldNotes: 'Trabajo de ajuste de pernos concluido en terreno. Falta adjuntar informe de perfilometría por escáner 3D.',
    progressReport: 'Intervención en terreno finalizada. Informe técnico pendiente.',
    technicalNotes: 'Perfilometría láser de desgaste pendiente de consolidación.',
    pendingReportFile: null,
    firmaMandante: { firmado: false, validador: '', fechaHora: '' }
  },

  // 5. ACT-002 (HISTORIAL Etapa 2 en Operativo, CERRADA / CONFORME en Mandante)
  {
    id: 'OT-185',
    alertId: 'ALT-099',
    tag: 'ACT-002',
    equipmentTag: 'ACT-002',
    area: 'Área Seca',
    titulo: 'Chancador Cónico Symons 3Ft',
    equipmentName: 'Chancador Cónico Symons 3Ft',
    descripcion: 'Cambio preventivo de fajas trapezoidales de transmisión principal y verificación de tensión nominal.',
    taskDetails: 'Cambio preventivo de fajas trapezoidales de transmisión principal.',
    faultType: 'Desgaste severo en juego de fajas 5V',
    emisor: 'Carlos Mendoza (Jefe de Turno A Mandante)',
    mandanteIssuer: 'Carlos Mendoza (Jefe de Turno A Mandante)',
    assetOwner: 'Carlos Mendoza (Jefe de Turno A)',
    generatorRole: 'Dueño de Área (Carlos Mendoza)',
    ito: 'Ing. Roberto Arancibia M1',
    assignedIto: 'Ing. Roberto Arancibia M1',
    itoAssigned: 'Ing. Roberto Arancibia M1',
    contratista: 'Mantenimiento Integral Mina SA',
    contractorCompany: 'Mantenimiento Integral Mina SA',
    specialty: 'Mantenimiento General & Mecánica',
    timestamp: 1791574200000,
    formattedDate: '09-Oct 14:00 hrs | Turno A (Día)',
    date: '09-Oct 14:00 hrs | Turno A (Día)',
    closedDate: '09-Oct 17:30 hrs | Turno A (Día)',
    turno: 'DIA',
    shiftType: 'DIA',
    estadoMandante: 'CERRADA',
    estadoOperativo: 'HISTORIAL',
    mandanteStatus: 'RESUELTO & CERRADO',
    operativoStatus: 'TAREA FINALIZADA & ESPERANDO REVISIÓN',
    status: 'TAREA FINALIZADA & ESPERANDO REVISIÓN',
    isCritical: false,
    tieneInforme: true,
    reportStatus: 'ENTREGADO',
    reportOption: 'ENTREGADO',
    urlInforme: 'protocolo_tension_conforme.pdf',
    otDocument: 'OT_mantenimiento_ACT002.pdf',
    evidencias: ['fajas_trapezoidales_nuevas.jpg', 'protocolo_tension_conforme.png'],
    photos: ['fajas_trapezoidales_nuevas.jpg', 'protocolo_tension_conforme.png'],
    fieldNotes: 'Fajas tensionadas según especificación de fabricante (12 mm deflexión). Protocolo conforme adjunto.',
    progressReport: 'Reemplazo concluido e informe técnico cargado. En espera de visto bueno de supervisor Mandante.',
    technicalNotes: 'Prueba en vacío por 30 minutos sin patinamiento.',
    pendingReportFile: null,
    firmaMandante: { firmado: false, validador: '', fechaHora: '' },
    tipoImpacto: '🔵 Mantenimiento Programado',
    downtimeHoras: '3.5',
    sistemaFalla: 'Mecánico',
    confiabilidad: null
  },

  // 6. ACT-001 (HISTORIAL Etapa 3 en Operativo, CERRADA & AUDITADA en Mandante)
  {
    id: 'OT-179',
    alertId: 'ALT-095',
    tag: 'ACT-001',
    equipmentTag: 'ACT-001',
    area: 'Área Seca',
    titulo: 'Chancador Cónico Omnicone SX 1560',
    equipmentName: 'Chancador Cónico Omnicone SX 1560',
    descripcion: 'Overhaul de sistema hidráulico de posicionamiento y reemplazo de retenes de eje excéntrico.',
    taskDetails: 'Overhaul de sistema hidráulico de posicionamiento y reemplazo de retenes de eje excéntrico.',
    faultType: 'Fuga de aceite en retenes de excéntrica',
    emisor: 'Carlos Mendoza (Jefe de Turno A Mandante)',
    mandanteIssuer: 'Carlos Mendoza (Jefe de Turno A Mandante)',
    assetOwner: 'Carlos Mendoza (Jefe de Turno A)',
    generatorRole: 'Dueño de Área (Carlos Mendoza)',
    ito: 'Ing. Roberto Arancibia M1',
    assignedIto: 'Ing. Roberto Arancibia M1',
    itoAssigned: 'Ing. Roberto Arancibia M1',
    contratista: 'Tribología & LUB-Tech Chile',
    contractorCompany: 'Tribología & LUB-Tech Chile',
    specialty: 'Lubricación & Mecánica',
    timestamp: 1791480000000,
    formattedDate: '08-Oct 09:00 hrs | Turno A (Día)',
    date: '08-Oct 09:00 hrs | Turno A (Día)',
    closedDate: '08-Oct 18:20 hrs | Turno A (Día)',
    turno: 'DIA',
    shiftType: 'DIA',
    estadoMandante: 'CERRADA',
    estadoOperativo: 'HISTORIAL',
    mandanteStatus: 'RESUELTO & CERRADO',
    operativoStatus: 'TAREA CERRADA',
    status: 'TAREA CERRADA',
    isCritical: false,
    tieneInforme: true,
    reportStatus: 'ENTREGADO',
    reportOption: 'ENTREGADO',
    urlInforme: 'informe_hidraulico_sx1560.pdf',
    otDocument: 'OT_mantenimiento_ACT001_prev.pdf',
    evidencias: ['informe_hidraulico_sx1560.pdf', 'sello_reten_nuevo.jpg'],
    photos: ['informe_hidraulico_sx1560.pdf', 'sello_reten_nuevo.jpg'],
    fieldNotes: 'Prueba hidráulica completada a 210 Bar con cero fugas. Manto calibrado en tolerancia nominal.',
    progressReport: 'Trabajo completamente validado, auditado y sellado en terreno.',
    technicalNotes: 'Prueba hidrostática y certificación de sellos aprobada por ITO.',
    pendingReportFile: null,
    validatorMandante: 'Ing. Roberto Arancibia M1 - Supervisor Mecánico Mandante',
    validationTimestamp: '08-Oct 18:20 hrs | Turno A',
    firmaMandante: { 
      firmado: true, 
      validador: 'Ing. Roberto Arancibia M1 - Supervisor Mecánico Mandante', 
      fechaHora: '08-Oct 18:20 hrs | Turno A' 
    },
    tipoImpacto: '🔴 Parada No Programada (Falla Correctiva)',
    downtimeHoras: '4.0',
    sistemaFalla: 'Lubricación / Hidráulico',
    confiabilidad: {
      tipoImpacto: '🔴 Parada No Programada (Falla Correctiva)',
      downtimeHoras: '4.0',
      sistemaFalla: 'Lubricación / Hidráulico',
      registradoPor: 'Ing. Roberto Arancibia M1 - Supervisor Mecánico Mandante',
      fechaRegistro: '08-Oct 18:20 hrs | Turno A'
    }
  }
];

export function WorkOrdersProvider({ children }) {
  const [workOrders, setWorkOrders] = useState(INITIAL_WORK_ORDERS);

  // FLUJO A: Creación (Mandante -> Operativo)
  const createWorkOrderAlert = ({
    area,
    tag,
    equipmentName,
    faultType,
    contractorCompany,
    assignedIto,
    notes,
    photos,
    otDocument
  }) => {
    const { formattedDate, shiftType, timestamp } = getPlantTimestampAndShift();
    const randomNum = Math.floor(200 + Math.random() * 800);
    const newId = `OT-${randomNum}`;
    const newAlertId = `ALT-${randomNum}`;

    const newWorkOrder = {
      id: newId,
      alertId: newAlertId,
      tag: tag || 'ACT-001',
      equipmentTag: tag || 'ACT-001',
      area: area || 'Área Seca',
      titulo: equipmentName || 'Equipo Industrial Planta',
      equipmentName: equipmentName || 'Equipo Industrial Planta',
      descripcion: faultType.trim(),
      taskDetails: faultType.trim(),
      faultType: faultType.trim(),
      emisor: 'Carlos Mendoza (Jefe de Turno Mandante / Dueño de Área)',
      mandanteIssuer: 'Carlos Mendoza (Jefe de Turno Mandante / Dueño de Área)',
      assetOwner: 'Carlos Mendoza (Jefe de Turno Mandante)',
      generatorRole: 'Carlos Mendoza (Jefe de Turno Mandante / Dueño de Área)',
      ito: assignedIto || 'Ing. Roberto Arancibia M1 (Jefe de Área Seca)',
      assignedIto: assignedIto || 'Ing. Roberto Arancibia M1 (Jefe de Área Seca)',
      itoAssigned: (assignedIto || 'Ing. Roberto Arancibia M1').split('(')[0].trim(),
      contratista: contractorCompany || 'Tribología & LUB-Tech Chile',
      contractorCompany: contractorCompany || 'Tribología & LUB-Tech Chile',
      specialty: 'Mantenimiento General',
      timestamp: timestamp,
      formattedDate: formattedDate,
      date: formattedDate,
      turno: shiftType,
      shiftType: shiftType,
      estadoMandante: 'ACTIVA',
      estadoOperativo: 'NUEVA',
      mandanteStatus: 'DERIVADO A CONTRATISTA',
      operativoStatus: 'PENDIENTE DE ACEPTACIÓN',
      status: 'PENDIENTE DE ACEPTACIÓN',
      isCritical: true,
      tieneInforme: false,
      reportStatus: 'PENDIENTE',
      reportOption: null,
      otDocument: otDocument || `OT_mantenimiento_${tag || 'ACT001'}.pdf`,
      evidencias: photos && photos.length > 0 ? photos : ['evidencia_inicial_hallazgo.jpg'],
      photos: photos && photos.length > 0 ? photos : ['evidencia_inicial_hallazgo.jpg'],
      fieldNotes: '',
      progressReport: `Alerta derivada con OT adjunta (${otDocument || 'OT.pdf'}).`,
      technicalNotes: notes && notes.trim() ? notes.trim() : 'Sin notas adicionales.',
      pendingReportFile: null,
      firmaMandante: { firmado: false, validador: '', fechaHora: '' }
    };

    setWorkOrders(prev => [newWorkOrder, ...prev]);
    return newWorkOrder;
  };

  // FLUJO B: Aceptación e Inicio (Operativo -> Mandante)
  const acceptWorkOrder = (id) => {
    const { formattedDate, shiftType, timestamp } = getPlantTimestampAndShift();
    setWorkOrders(prev => prev.map(item => {
      if (item.id === id || item.alertId === id) {
        return {
          ...item,
          estadoOperativo: 'DESARROLLO',
          operativoStatus: 'EN EJECUCIÓN EN TERRENO',
          status: 'EN EJECUCIÓN EN TERRENO',
          mandanteStatus: 'EN PROCESO DE MITIGACIÓN',
          progressReport: 'OT aceptada en terreno por cuadrilla contratista. En ejecución activa.',
          startDate: formattedDate,
          timestamp: timestamp,
          turno: shiftType,
          shiftType: shiftType,
        };
      }
      return item;
    }));
  };

  // FLUJO C: Finalización y Cierre de Tarea (Operativo -> Mandante)
  const finishWorkOrder = (id, { reportOption, fieldNotes, photos }) => {
    const { formattedDate, shiftType, timestamp } = getPlantTimestampAndShift();
    const isDelivered = reportOption === 'ENTREGADO';

    setWorkOrders(prev => prev.map(item => {
      if (item.id === id || item.alertId === id) {
        return {
          ...item,
          estadoOperativo: 'HISTORIAL',
          estadoMandante: 'CERRADA',
          closedDate: formattedDate,
          timestamp: timestamp,
          turno: shiftType,
          shiftType: shiftType,
          tieneInforme: isDelivered,
          reportStatus: isDelivered ? 'ENTREGADO' : 'PENDIENTE',
          reportOption: reportOption,
          operativoStatus: isDelivered 
            ? 'TAREA FINALIZADA & ESPERANDO REVISIÓN' 
            : 'CIERRE PENDIENTE / INFORME REQUERIDO',
          mandanteStatus: isDelivered ? 'RESUELTO & CERRADO' : 'RESUELTO',
          status: isDelivered 
            ? 'TAREA FINALIZADA & ESPERANDO REVISIÓN' 
            : 'CIERRE PENDIENTE / INFORME REQUERIDO',
          fieldNotes: fieldNotes || item.fieldNotes,
          photos: photos || item.photos,
          evidencias: photos || item.evidencias,
          pendingReportFile: null,
        };
      }
      return item;
    }));
  };

  // FLUJO D: Regularización Diferida (Operativo -> Mandante)
  const regularizeWorkOrderReport = (id, reportFile) => {
    setWorkOrders(prev => prev.map(item => {
      if (item.id === id || item.alertId === id) {
        const fileToUse = reportFile || item.pendingReportFile || `informe_mantenimiento_${item.id.toLowerCase()}_regularizado.pdf`;
        return {
          ...item,
          tieneInforme: true,
          reportStatus: 'ENTREGADO',
          reportOption: 'ENTREGADO',
          urlInforme: fileToUse,
          pendingReportFile: null,
          operativoStatus: 'TAREA FINALIZADA & ESPERANDO REVISIÓN',
          mandanteStatus: 'RESUELTO & CERRADO',
          status: 'TAREA FINALIZADA & ESPERANDO REVISIÓN',
          photos: [...item.photos.filter(p => p !== fileToUse), fileToUse],
          evidencias: [...item.evidencias.filter(p => p !== fileToUse), fileToUse],
          progressReport: 'Informe técnico regularizado y recepcionado. En espera de auditoría Mandante.'
        };
      }
      return item;
    }));
  };

  // Pre-adjuntar archivo en Etapa 1 antes de solicitar revisión
  const setPendingReportFile = (id, fileName) => {
    setWorkOrders(prev => prev.map(item => {
      if (item.id === id || item.alertId === id) {
        return {
          ...item,
          pendingReportFile: fileName,
        };
      }
      return item;
    }));
  };

  // FLUJO E: Aprobación Final Auditoría (Mandante -> Operativo)
  // Acepta los datos de confiabilidad para guardarlos junto con la firma
  const approveWorkOrderAudit = (id, validatorName, confiabilidadData) => {
    const { formattedDate } = getPlantTimestampAndShift();
    const validator = validatorName || 'Ing. Roberto Arancibia M1 - Supervisor Mecánico Mandante';
    const stampDate = formattedDate;

    setWorkOrders(prev => prev.map(item => {
      if (item.id === id || item.alertId === id) {
        const confiabilidadFinal = confiabilidadData
          ? {
              ...confiabilidadData,
              registradoPor: validator,
              fechaRegistro: stampDate,
            }
          : item.confiabilidad;
        return {
          ...item,
          operativoStatus: 'TAREA CERRADA',
          mandanteStatus: 'RESUELTO & CERRADO',
          status: 'TAREA CERRADA',
          validatorMandante: validator,
          validationTimestamp: stampDate,
          firmaMandante: {
            firmado: true,
            validador: validator,
            fechaHora: stampDate,
          },
          confiabilidad: confiabilidadFinal,
          tipoImpacto: confiabilidadData?.tipoImpacto || item.tipoImpacto,
          downtimeHoras: confiabilidadData?.downtimeHoras || item.downtimeHoras,
          sistemaFalla: confiabilidadData?.sistemaFalla || item.sistemaFalla,
        };
      }
      return item;
    }));
  };

  // CONFIABILIDAD: Actualización parcial de campos de confiabilidad en una OT/Alerta
  const updateConfiabilidad = (id, fields) => {
    setWorkOrders(prev => prev.map(item => {
      if (item.id === id || item.alertId === id) {
        return { ...item, ...fields };
      }
      return item;
    }));
  };

  // Cierre directo desde Mandante (en caso de firmar una alerta activa directamente)
  const closeAlertDirectlyFromMandante = (id, reportStatus) => {
    const { formattedDate, timestamp } = getPlantTimestampAndShift();
    const isDelivered = reportStatus === 'ENTREGADO';

    setWorkOrders(prev => prev.map(item => {
      if (item.id === id || item.alertId === id) {
        return {
          ...item,
          estadoMandante: 'CERRADA',
          estadoOperativo: 'HISTORIAL',
          closedDate: formattedDate,
          timestamp: timestamp,
          tieneInforme: isDelivered,
          reportStatus: reportStatus,
          reportOption: reportStatus,
          mandanteStatus: isDelivered ? 'RESUELTO & CERRADO' : 'RESUELTO',
          operativoStatus: isDelivered ? 'TAREA FINALIZADA & ESPERANDO REVISIÓN' : 'CIERRE PENDIENTE / INFORME REQUERIDO',
          status: isDelivered ? 'RESUELTO & CERRADO' : 'RESUELTO',
        };
      }
      return item;
    }));
  };

  // Helpers para actualización de notas y fotos
  const updateWorkOrderNotes = (id, text) => {
    setWorkOrders(prev => prev.map(item => {
      if (item.id === id || item.alertId === id) {
        return { ...item, fieldNotes: text, technicalNotes: text };
      }
      return item;
    }));
  };

  const addPhotoToWorkOrder = (id, photoName) => {
    setWorkOrders(prev => prev.map(item => {
      if (item.id === id || item.alertId === id) {
        return {
          ...item,
          photos: [...item.photos, photoName],
          evidencias: [...item.evidencias, photoName],
        };
      }
      return item;
    }));
  };

  return (
    <WorkOrdersContext.Provider
      value={{
        workOrders,
        createWorkOrderAlert,
        acceptWorkOrder,
        finishWorkOrder,
        regularizeWorkOrderReport,
        setPendingReportFile,
        approveWorkOrderAudit,
        closeAlertDirectlyFromMandante,
        updateWorkOrderNotes,
        addPhotoToWorkOrder,
        updateConfiabilidad,
      }}
    >
      {children}
    </WorkOrdersContext.Provider>
  );
}

export function useWorkOrders() {
  const context = useContext(WorkOrdersContext);
  if (!context) {
    throw new Error('useWorkOrders must be used within a WorkOrdersProvider');
  }
  return context;
}
