// Filtro por estado y búsqueda de la lista de entregas.
import { estadoEntrega } from './entregas.ts';
import type { Entrega, Materia } from './tipos.ts';

export const FILTROS = ['todas', 'pendientes', 'vencidas', 'entregadas'] as const;

export type FiltroEntregas = (typeof FILTROS)[number];

/**
 * Los tres filtros, aparte de "todas", reparten las entregas sin solaparse: pendientes son las que no
 * están hechas ni vencidas (para hoy, mañana o en N días).
 */
export function cumpleFiltro(entrega: Entrega, filtro: FiltroEntregas, ahora: number): boolean {
  if (filtro === 'todas') return true;
  const { tipo } = estadoEntrega(entrega, ahora);
  if (filtro === 'entregadas') return tipo === 'entregada';
  if (filtro === 'vencidas') return tipo === 'vencida';
  return tipo !== 'entregada' && tipo !== 'vencida';
}

/** Texto para comparar: sin tildes ni otras marcas (también "ñ" queda como "n"), en minúsculas y sin espacios de más. */
export function normalizarBusqueda(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es').replace(/\s+/g, ' ').trim();
}

/** true si la descripción o el nombre de la materia contienen la búsqueda; una búsqueda vacía coincide con todo. */
export function coincideBusqueda(entrega: Entrega, nombreMateria: string, busqueda: string): boolean {
  const buscada = normalizarBusqueda(busqueda);
  return (
    buscada === '' ||
    normalizarBusqueda(entrega.texto).includes(buscada) ||
    normalizarBusqueda(nombreMateria).includes(buscada)
  );
}

function coincidentes(entregas: Entrega[], materias: Materia[], busqueda: string): Entrega[] {
  const nombres = new Map(materias.map((m) => [m.id, m.nombre]));
  return entregas.filter((e) => coincideBusqueda(e, nombres.get(e.materia) ?? '', busqueda));
}

/** Entregas que cumplen a la vez el filtro y la búsqueda. */
export function filtrarEntregas(
  entregas: Entrega[],
  materias: Materia[],
  { filtro, busqueda }: { filtro: FiltroEntregas; busqueda: string },
  ahora: number,
): Entrega[] {
  return coincidentes(entregas, materias, busqueda).filter((e) => cumpleFiltro(e, filtro, ahora));
}

/** Cuántas entregas muestra cada filtro con la búsqueda actual. */
export function contarPorFiltro(
  entregas: Entrega[],
  materias: Materia[],
  busqueda: string,
  ahora: number,
): Record<FiltroEntregas, number> {
  const lista = coincidentes(entregas, materias, busqueda);
  return Object.fromEntries(FILTROS.map((f) => [f, lista.filter((e) => cumpleFiltro(e, f, ahora)).length])) as Record<
    FiltroEntregas,
    number
  >;
}
