import { describe, expect, it } from 'vitest';
import { debeAvisar, estadoEntrega, etiquetaEstado, ordenarEntregas, type EstadoEntrega } from './entregas.ts';
import type { Entrega } from './tipos.ts';

// Miércoles 14 de octubre de 2026, 9:00 a. m. en Bogotá. En Tokio, la zona en la
// que corren las pruebas, ya son las 23:00: si el cálculo usara la zona del
// sistema, "23:59 de hoy" en Bogotá caería en otro día.
const ahora = Date.parse('2026-10-14T09:00:00-05:00');
const HORA = 60 * 60 * 1000;

function entrega(fecha: string, cambios: Partial<Entrega> = {}): Entrega {
  return { id: 'e1', materia: 'm1', texto: 'Taller 3', fecha, hecha: false, avisada: false, ...cambios };
}

describe('estadoEntrega', () => {
  it('23:59 de hoy es "hoy"', () => {
    expect(estadoEntrega(entrega('2026-10-14T23:59:00-05:00'), ahora)).toEqual({ tipo: 'hoy' });
  });

  it('00:00 de mañana es "manana"', () => {
    expect(estadoEntrega(entrega('2026-10-15T00:00:00-05:00'), ahora)).toEqual({ tipo: 'manana' });
  });

  it('cuenta días de calendario, no bloques de 24 h: 23:59 de mañana sigue siendo "manana"', () => {
    expect(estadoEntrega(entrega('2026-10-15T23:59:00-05:00'), ahora)).toEqual({ tipo: 'manana' });
  });

  it('una hora exacta que ya pasó es "vencida"', () => {
    expect(estadoEntrega(entrega('2026-10-14T08:00:00-05:00'), ahora)).toEqual({ tipo: 'vencida' });
  });

  it('vence justo después de la hora límite, no en el instante exacto', () => {
    const limite = entrega('2026-10-14T09:00:00-05:00');
    expect(estadoEntrega(limite, ahora)).toEqual({ tipo: 'hoy' });
    expect(estadoEntrega(limite, ahora + 1)).toEqual({ tipo: 'vencida' });
  });

  it('una entrega hecha es "entregada" aunque la fecha ya haya pasado', () => {
    expect(estadoEntrega(entrega('2026-10-01T08:00:00-05:00', { hecha: true }), ahora)).toEqual({ tipo: 'entregada' });
  });

  it('dos días o más es "dias", con el número de días', () => {
    expect(estadoEntrega(entrega('2026-10-16T00:00:00-05:00'), ahora)).toEqual({ tipo: 'dias', dias: 2 });
    expect(estadoEntrega(entrega('2026-10-24T18:00:00-05:00'), ahora)).toEqual({ tipo: 'dias', dias: 10 });
  });
});

describe('debeAvisar', () => {
  it.each([
    ['diferencia 0', 0, false],
    ['falta 1 ms', 1, true],
    ['faltan 24 h exactas', 24 * HORA, true],
    ['faltan 24 h y 1 ms', 24 * HORA + 1, false],
  ])('borde exacto, %s (%i ms): avisa = %s', (_caso, restante, esperado) => {
    const e = entrega('2026-10-15T09:00:00-05:00');
    expect(debeAvisar(e, Date.parse(e.fecha) - restante)).toBe(esperado);
  });

  it('no depende de la etiqueta: avisa aunque la entrega sea "manana"', () => {
    const e = entrega('2026-10-15T07:00:00-05:00');
    expect(estadoEntrega(e, ahora)).toEqual({ tipo: 'manana' });
    expect(debeAvisar(e, ahora)).toBe(true);
  });

  it('no avisa si ya se avisó, si está hecha o si ya venció', () => {
    expect(debeAvisar(entrega('2026-10-14T20:00:00-05:00', { avisada: true }), ahora)).toBe(false);
    expect(debeAvisar(entrega('2026-10-14T20:00:00-05:00', { hecha: true }), ahora)).toBe(false);
    expect(debeAvisar(entrega('2026-10-14T08:00:00-05:00'), ahora)).toBe(false);
  });
});

describe('etiquetaEstado', () => {
  it.each([
    [{ tipo: 'entregada' }, 'Entregada'],
    [{ tipo: 'vencida' }, 'Vencida'],
    [{ tipo: 'hoy' }, 'Para hoy'],
    [{ tipo: 'manana' }, 'Mañana'],
    [{ tipo: 'dias', dias: 6 }, 'en 6 días'],
  ] satisfies [EstadoEntrega, string][])('%j → %s', (estado, texto) => {
    expect(etiquetaEstado(estado)).toBe(texto);
  });
});

describe('ordenarEntregas', () => {
  it('pone las pendientes primero y las entregadas al final, cada grupo por fecha', () => {
    const lista = [
      entrega('2026-10-20T08:00:00-05:00', { id: 'hecha-tarde', hecha: true }),
      entrega('2026-10-18T08:00:00-05:00', { id: 'pendiente-tarde' }),
      entrega('2026-10-10T08:00:00-05:00', { id: 'hecha-temprano', hecha: true }),
      entrega('2026-10-13T08:00:00-05:00', { id: 'pendiente-vencida' }),
    ];
    expect(ordenarEntregas(lista).map((e) => e.id)).toEqual([
      'pendiente-vencida',
      'pendiente-tarde',
      'hecha-temprano',
      'hecha-tarde',
    ]);
    expect(lista[0].id).toBe('hecha-tarde');
  });
});
