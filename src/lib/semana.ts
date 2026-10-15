// Semanas de lunes a domingo, en días de calendario de Bogotá. Un día es una clave "AAAA-MM-DD".
import { diaEnBogota } from './fechas.ts';
import type { Entrega } from './tipos.ts';

const DIA_MS = 24 * 60 * 60 * 1000;

const sumarDias = (dia: string, dias: number) => new Date(Date.parse(dia) + dias * DIA_MS).toISOString().slice(0, 10);

/** Lunes de la semana (en Bogotá) que contiene el instante. */
export function inicioDeSemana(instante: number): string {
  const dia = diaEnBogota(instante);
  const desdeElLunes = (new Date(Date.parse(dia)).getUTCDay() + 6) % 7;
  return sumarDias(dia, -desdeElLunes);
}

/** El lunes de otra semana: `semanas` negativo va hacia atrás. */
export function moverSemana(lunes: string, semanas: number): string {
  return sumarDias(lunes, semanas * 7);
}

export interface DiaDeLaSemana {
  dia: string;
  entregas: Entrega[];
}

/** Los siete días de la semana con sus entregas, hechas incluidas, ordenadas por hora. */
export function entregasDeLaSemana(entregas: Entrega[], lunes: string): DiaDeLaSemana[] {
  return Array.from({ length: 7 }, (_, i) => {
    const dia = sumarDias(lunes, i);
    return {
      dia,
      entregas: entregas
        .filter((e) => diaEnBogota(Date.parse(e.fecha)) === dia)
        .sort((a, b) => Date.parse(a.fecha) - Date.parse(b.fecha)),
    };
  });
}
