import { diasEntre } from './fechas.ts';
import type { Entrega } from './tipos.ts';

export type EstadoEntrega =
  | { tipo: 'entregada' }
  | { tipo: 'vencida' }
  | { tipo: 'hoy' }
  | { tipo: 'manana' }
  | { tipo: 'dias'; dias: number };

const VENTANA_AVISO_MS = 24 * 60 * 60 * 1000;

/** Estado de la entrega en el instante `ahora` (ms), contando días de calendario en Bogotá. */
export function estadoEntrega(entrega: Entrega, ahora: number): EstadoEntrega {
  if (entrega.hecha) return { tipo: 'entregada' };
  const limite = Date.parse(entrega.fecha);
  if (limite < ahora) return { tipo: 'vencida' };
  const dias = diasEntre(ahora, limite);
  if (dias === 0) return { tipo: 'hoy' };
  if (dias === 1) return { tipo: 'manana' };
  return { tipo: 'dias', dias };
}

/** Texto de la etiqueta de estado en la lista. */
export function etiquetaEstado(estado: EstadoEntrega): string {
  switch (estado.tipo) {
    case 'entregada':
      return 'Entregada';
    case 'vencida':
      return 'Vencida';
    case 'hoy':
      return 'Para hoy';
    case 'manana':
      return 'Mañana';
    case 'dias':
      return `en ${estado.dias} días`;
  }
}

/** Pendientes primero y entregadas al final; dentro de cada grupo, por fecha, como en mi-u.html. */
export function ordenarEntregas(entregas: Entrega[]): Entrega[] {
  return [...entregas].sort((a, b) => Number(a.hecha) - Number(b.hecha) || Date.parse(a.fecha) - Date.parse(b.fecha));
}

/** true si toca el aviso del navegador: sin hacer, sin avisar y con 0 < tiempo restante ≤ 24 h, como en mi-u.html. */
export function debeAvisar(entrega: Entrega, ahora: number): boolean {
  const restante = Date.parse(entrega.fecha) - ahora;
  return !entrega.hecha && !entrega.avisada && restante > 0 && restante <= VENTANA_AVISO_MS;
}
