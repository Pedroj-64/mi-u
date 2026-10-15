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

/** Valor de un campo datetime-local ("2026-10-20T20:00") → fecha en el formato que se guarda, o null si no es válido. */
export function desdeCampoFecha(valor: string): string | null {
  const iso = `${valor.length === 16 ? `${valor}:00` : valor}${DESFASE}`;
  return esIsoBogota(iso) ? iso : null;
}

// Para mostrar fechas se usa Intl con la zona de Bogotá, equivalente al desfase fijo,
// y las mismas opciones de formato que mi-u.html.
const formatoEntrega = new Intl.DateTimeFormat('es-CO', {
  timeZone: 'America/Bogota',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const formatoLargo = new Intl.DateTimeFormat('es-CO', {
  timeZone: 'America/Bogota',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** Fecha de una entrega para la lista: "mar, 20 de oct, 08:00 p. m.". */
export function formatoFechaEntrega(fecha: string): string {
  return formatoEntrega.format(Date.parse(fecha));
}

/** Fecha del encabezado, con mayúscula inicial: "Miércoles, 14 de octubre de 2026". */
export function formatoEncabezado(instante: number): string {
  const texto = formatoLargo.format(instante);
  return texto.charAt(0).toLocaleUpperCase('es-CO') + texto.slice(1);
}

/** Saludo según la hora de Bogotá: días de 5:00 a 11:59, tardes de 12:00 a 18:59 y noches el resto. */
export function saludo(instante: number): string {
  const hora = new Date(instante + DESFASE_MS).getUTCHours();
  if (hora >= 5 && hora < 12) return 'Buenos días';
  if (hora >= 12 && hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
