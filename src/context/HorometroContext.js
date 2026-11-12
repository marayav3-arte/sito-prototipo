/**
 * HorometroContext.js — Estado Global del Horómetro CH-02
 * ─────────────────────────────────────────────────────────────────────────────
 * Contexto React compartido entre EstadoEquipoScreen (productor de estado)
 * y ConfiabilidadScreen (consumidor de métricas KPI).
 *
 * Expone:
 *   workH       — horas de trabajo efectivo acumuladas
 *   downH       — horas de detención acumuladas
 *   equipStatus — 'OPERACION' | 'PARADA' | 'FALLA'
 *   fallas      — array de eventos de falla registrados [{id, cat, horas}]
 *   setWorkH / setDownH / setEquipStatus / addFalla
 */

import React, {
  createContext, useContext, useState, useEffect, useRef, useCallback,
} from 'react';

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
export const BASE_WORK_H = 14832.4;
export const BASE_DOWN_H = 127.6;

// Próximas pautas preventivas (horas horómetro de trabajo)
export const PAUTAS = [
  { label: 'Pauta Menor (aceite + filtros)',    horas: 15000 },
  { label: 'Pauta Intermedia (cojinetes)',       horas: 16000 },
  { label: 'Pauta Mayor (manto + cóncavo)',      horas: 20000 },
];

// Fallas históricas simuladas para seed (28 eventos en ~127.6 h de detención)
const SEED_FALLAS = [
  { id: 'F001', cat: 'MECANICA',    horas: 6.5,  desc: 'Rotura sello contraeje' },
  { id: 'F002', cat: 'HIDRAULICA',  horas: 4.2,  desc: 'Fuga línea cavidad' },
  { id: 'F003', cat: 'LUBRICACION', horas: 3.1,  desc: 'Sensor temp. drenaje' },
  { id: 'F004', cat: 'ELECTRICA',   horas: 8.0,  desc: 'Disparo motor principal' },
  { id: 'F005', cat: 'MECANICA',    horas: 11.2, desc: 'Desgaste manto cóncavo' },
  { id: 'F006', cat: 'OPERACIONAL', horas: 2.8,  desc: 'Atasco cámara trituración' },
  { id: 'F007', cat: 'HIDRAULICA',  horas: 5.6,  desc: 'Falla bomba hidráulica' },
  { id: 'F008', cat: 'ELECTRICA',   horas: 3.9,  desc: 'Protección sobrecarga' },
  { id: 'F009', cat: 'MECANICA',    horas: 7.4,  desc: 'Vibración anormal excéntrica' },
  { id: 'F010', cat: 'LUBRICACION', horas: 4.8,  desc: 'Presión aceite baja' },
  { id: 'F011', cat: 'OPERACIONAL', horas: 1.9,  desc: 'Mineral fuera de rango' },
  { id: 'F012', cat: 'MECANICA',    horas: 9.8,  desc: 'Fractura resorte taza' },
  { id: 'F013', cat: 'HIDRAULICA',  horas: 3.3,  desc: 'Ajuste APM descalibrado' },
  { id: 'F014', cat: 'ELECTRICA',   horas: 5.1,  desc: 'Cortocircuito bobina' },
  { id: 'F015', cat: 'MECANICA',    horas: 8.7,  desc: 'Desgaste piñón corona' },
  { id: 'F016', cat: 'LUBRICACION', horas: 2.4,  desc: 'Contaminación aceite' },
  { id: 'F017', cat: 'OPERACIONAL', horas: 1.5,  desc: 'Parada operador' },
  { id: 'F018', cat: 'ELECTRICA',   horas: 4.6,  desc: 'Fallo PLC módulo E/S' },
  { id: 'F019', cat: 'MECANICA',    horas: 6.2,  desc: 'Holgura taza de trituración' },
  { id: 'F020', cat: 'HIDRAULICA',  horas: 7.1,  desc: 'Presión fijación baja' },
  { id: 'F021', cat: 'LUBRICACION', horas: 3.6,  desc: 'Bomba aceite defectuosa' },
  { id: 'F022', cat: 'MECANICA',    horas: 5.3,  desc: 'Desalineación contraeje' },
];

// ─── CONTEXTO ────────────────────────────────────────────────────────────────
const HorometroContext = createContext(null);

// ─── PROVIDER ────────────────────────────────────────────────────────────────
export function HorometroProvider({ children }) {
  const [workH,       setWorkH]       = useState(BASE_WORK_H);
  const [downH,       setDownH]       = useState(BASE_DOWN_H);
  const [equipStatus, setEquipStatus] = useState('OPERACION');
  const [fallas,      setFallas]      = useState(SEED_FALLAS);

  const workRef  = useRef(BASE_WORK_H);
  const downRef  = useRef(BASE_DOWN_H);
  const statusRef = useRef('OPERACION');

  // Sincronizar ref cuando cambia status desde fuera
  useEffect(() => {
    statusRef.current = equipStatus;
  }, [equipStatus]);

  // Tick global: avanza el contador correcto cada 6 segundos reales
  useEffect(() => {
    const interval = setInterval(() => {
      if (statusRef.current === 'OPERACION') {
        workRef.current = +(workRef.current + 0.1).toFixed(1);
        setWorkH(workRef.current);
      } else {
        downRef.current = +(downRef.current + 0.1).toFixed(1);
        setDownH(downRef.current);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Registrar falla manualmente (llamado cuando equipStatus cambia a FALLA)
  const addFalla = useCallback((categoria, descripcion) => {
    setFallas(prev => [
      ...prev,
      {
        id:   `F${String(prev.length + 1).padStart(3, '0')}`,
        cat:  categoria,
        horas: 0,
        desc: descripcion,
        open: true,
      },
    ]);
  }, []);

  const value = {
    workH,
    downH,
    equipStatus,
    fallas,
    setWorkH,
    setDownH,
    setEquipStatus,
    addFalla,
  };

  return (
    <HorometroContext.Provider value={value}>
      {children}
    </HorometroContext.Provider>
  );
}

// ─── HOOK ────────────────────────────────────────────────────────────────────
export function useHorometro() {
  const ctx = useContext(HorometroContext);
  if (!ctx) throw new Error('useHorometro must be used inside HorometroProvider');
  return ctx;
}
