// Todas las fechas de la app se calculan en esta zona, sin importar la del equipo.
const ZONA_HORARIA = 'America/Bogota';

const formatoDia = new Intl.DateTimeFormat('en-US', {
  timeZone: ZONA_HORARIA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Fecha de calendario en Bogotá ("AAAA-MM-DD") del instante dado; sin argumento, la de hoy. */
export function diaEnBogota(instante: number = Date.now()): string {
  const partes = Object.fromEntries(formatoDia.formatToParts(instante).map((p) => [p.type, p.value]));
  return `${partes.year}-${partes.month}-${partes.day}`;
}
