// Bogotá está en UTC−5 todo el año (no tiene horario de verano), así que la app
// usa ese desfase fijo para todas las fechas, sin importar la zona del equipo.
const DESFASE = '-05:00';
const HORA_MS = 60 * 60 * 1000;
const DIA_MS = 24 * HORA_MS;
const DESFASE_MS = -5 * HORA_MS;
const FORMATO_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-05:00$/;

/** Instante → fecha en el formato que se guarda: "2026-10-20T20:00:00-05:00". */
export function aIsoBogota(instante: number): string {
  return new Date(instante + DESFASE_MS).toISOString().slice(0, 19) + DESFASE;
}

/** true si el valor es una fecha válida en el formato que se guarda. */
export function esIsoBogota(valor: unknown): valor is string {
  if (typeof valor !== 'string' || !FORMATO_ISO.test(valor)) return false;
  // Date.parse acepta fechas imposibles como el 30 de febrero (las corre al mes
  // siguiente), así que solo vale si al volver a escribirla queda igual.
  const instante = Date.parse(valor);
  return !Number.isNaN(instante) && aIsoBogota(instante) === valor;
}

/** Fecha de calendario en Bogotá ("AAAA-MM-DD") del instante dado; sin argumento, la de hoy. */
export function diaEnBogota(instante: number = Date.now()): string {
  return aIsoBogota(instante).slice(0, 10);
}

/** Días de calendario en Bogotá de `desde` a `hasta`: 0 si caen el mismo día, 1 si al siguiente… */
export function diasEntre(desde: number, hasta: number): number {
  return numeroDeDia(hasta) - numeroDeDia(desde);
}

function numeroDeDia(instante: number): number {
  return Math.floor((instante + DESFASE_MS) / DIA_MS);
}
