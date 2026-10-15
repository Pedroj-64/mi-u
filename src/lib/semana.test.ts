import { describe, expect, it } from 'vitest';
import { entregasDeLaSemana, inicioDeSemana, moverSemana } from './semana.ts';
import type { Entrega } from './tipos.ts';

const entrega = (id: string, fecha: string, hecha = false): Entrega => ({
  id,
  materia: 'm1',
  texto: id,
  fecha,
  hecha,
  avisada: false,
});

describe('inicioDeSemana', () => {
  it('un lunes es el inicio de su propia semana', () => {
    expect(inicioDeSemana(Date.parse('2026-10-12T00:00:00-05:00'))).toBe('2026-10-12');
    expect(inicioDeSemana(Date.parse('2026-10-12T23:59:00-05:00'))).toBe('2026-10-12');
  });

  it('un domingo pertenece a la semana que empezó el lunes anterior', () => {
    expect(inicioDeSemana(Date.parse('2026-10-18T00:00:00-05:00'))).toBe('2026-10-12');
    // A las 20:00 de Bogotá ya es lunes en Tokio (la zona de las pruebas): manda Bogotá.
    expect(inicioDeSemana(Date.parse('2026-10-18T20:00:00-05:00'))).toBe('2026-10-12');
  });

  it('funciona cuando la semana cruza un cambio de mes o de año', () => {
    expect(inicioDeSemana(Date.parse('2026-11-01T10:00:00-05:00'))).toBe('2026-10-26');
    expect(inicioDeSemana(Date.parse('2026-12-02T10:00:00-05:00'))).toBe('2026-11-30');
    expect(inicioDeSemana(Date.parse('2027-01-01T10:00:00-05:00'))).toBe('2026-12-28');
  });
});

describe('moverSemana', () => {
  it('avanza y retrocede de a siete días, también entre meses', () => {
    expect(moverSemana('2026-10-26', 1)).toBe('2026-11-02');
    expect(moverSemana('2026-10-26', -1)).toBe('2026-10-19');
    expect(moverSemana('2026-10-26', 0)).toBe('2026-10-26');
  });
});

describe('entregasDeLaSemana', () => {
  it('va de lunes a domingo e incluye el domingo completo, de 00:00 a 23:59', () => {
    const dias = entregasDeLaSemana(
      [
        entrega('domingo-tarde', '2026-10-18T23:59:00-05:00'),
        entrega('domingo-madrugada', '2026-10-18T00:00:00-05:00'),
        entrega('lunes-siguiente', '2026-10-19T00:00:00-05:00'),
        entrega('domingo-anterior', '2026-10-11T23:59:00-05:00'),
        entrega('miercoles-hecha', '2026-10-14T09:00:00-05:00', true),
      ],
      '2026-10-12',
    );
    expect(dias.map((d) => d.dia)).toEqual([
      '2026-10-12',
      '2026-10-13',
      '2026-10-14',
      '2026-10-15',
      '2026-10-16',
      '2026-10-17',
      '2026-10-18',
    ]);
    expect(dias[6].entregas.map((e) => e.id)).toEqual(['domingo-madrugada', 'domingo-tarde']);
    expect(dias[2].entregas.map((e) => e.id)).toEqual(['miercoles-hecha']);
    expect(dias.flatMap((d) => d.entregas).map((e) => e.id)).not.toContain('lunes-siguiente');
    expect(dias.flatMap((d) => d.entregas).map((e) => e.id)).not.toContain('domingo-anterior');
  });
});
