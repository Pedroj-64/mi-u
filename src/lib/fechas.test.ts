import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  aIsoBogota,
  desdeCampoFecha,
  diaEnBogota,
  esIsoBogota,
  formatoEncabezado,
  formatoFechaEntrega,
} from './fechas.ts';

describe('diaEnBogota', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('calcula hoy en Bogotá aunque el sistema esté en Tokio', () => {
    // Las 20:00 del 14 de octubre en Bogotá son las 10:00 del 15 en Tokio.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-14T20:00:00-05:00'));

    // vite.config.ts fuerza TZ=Asia/Tokyo: en la zona local ya es el 15, así que
    // una implementación que use la zona del sistema devolvería 2026-10-15.
    expect(new Date().getDate()).toBe(15);
    expect(diaEnBogota()).toBe('2026-10-14');
  });
});

describe('aIsoBogota', () => {
  it('escribe la hora de Bogotá con el desfase -05:00', () => {
    expect(aIsoBogota(Date.parse('2026-10-21T01:00:00Z'))).toBe('2026-10-20T20:00:00-05:00');
  });
});

describe('esIsoBogota', () => {
  it('acepta una fecha en el formato que se guarda', () => {
    expect(esIsoBogota('2026-10-20T20:00:00-05:00')).toBe(true);
  });

  it.each([
    '2026-10-21T01:00:00Z',
    '2026-10-20T20:00-05:00',
    '2026-02-30T10:00:00-05:00',
    '2026-10-20T24:00:00-05:00',
    'mañana',
    Date.parse('2026-10-20T20:00:00-05:00'),
    null,
  ])('rechaza %j', (valor) => {
    expect(esIsoBogota(valor)).toBe(false);
  });
});

describe('desdeCampoFecha', () => {
  it('toma el valor del campo datetime-local como hora de Bogotá', () => {
    expect(desdeCampoFecha('2026-10-20T20:00')).toBe('2026-10-20T20:00:00-05:00');
    expect(desdeCampoFecha('2026-10-20T20:00:30')).toBe('2026-10-20T20:00:30-05:00');
  });

  it.each(['', '2026-02-30T10:00', '2026-10-20', 'mañana'])('devuelve null para %j', (valor) => {
    expect(desdeCampoFecha(valor)).toBeNull();
  });
});

describe('formatos para mostrar', () => {
  // En Tokio ya es el 15 a las 10:00 a. m.; lo que se muestra es la hora de Bogotá.
  it('la fecha de una entrega sale en es-CO y hora de Bogotá', () => {
    expect(formatoFechaEntrega('2026-10-14T20:00:00-05:00')).toMatch(/^mié, 14 de oct, 08:00\sp\.\sm\.$/);
  });

  it('el encabezado muestra el día de hoy en Bogotá', () => {
    expect(formatoEncabezado(Date.parse('2026-10-14T20:00:00-05:00'))).toBe('miércoles, 14 de octubre de 2026');
  });
});
