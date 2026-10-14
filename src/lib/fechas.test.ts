import { afterEach, describe, expect, it, vi } from 'vitest';
import { aIsoBogota, diaEnBogota, esIsoBogota } from './fechas.ts';

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
