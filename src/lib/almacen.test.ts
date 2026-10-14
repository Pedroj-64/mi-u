import { describe, expect, it } from 'vitest';
import { abrirAlmacen, CLAVE, CLAVE_CORRUPTO, type AlmacenWeb } from './almacen.ts';
import type { Datos } from './tipos.ts';

const MATERIAS_BASE = [
  'Infraestructura Computacional',
  'Infraestructura de Comunicaciones',
  'Dirección Estratégica de T.I.',
  'Programación Concurrente',
  'Ingeniería de Software',
  'Ecuaciones Diferenciales',
  'Estructura de Datos',
];

const datosNuevos: Datos = {
  materias: [{ id: 'm1', nombre: 'Ingeniería de Software', clase: 'https://meet.google.com/abc', moodle: '', classroom: '' }],
  entregas: [{ id: 'e1', materia: 'm1', texto: 'Taller 3', fecha: '2026-10-20T20:00:00-05:00', hecha: false, avisada: false }],
  drive: [{ id: 'd1', nombre: 'Carpeta de PETI', url: 'https://drive.google.com/drive/folders/abc' }],
};

/** localStorage en memoria; `valores` deja revisar qué quedó guardado. */
function storageFalso(inicial: Record<string, string> = {}) {
  const valores = new Map(Object.entries(inicial));
  return {
    valores,
    getItem: (clave: string) => valores.get(clave) ?? null,
    setItem: (clave: string, valor: string) => {
      valores.set(clave, valor);
    },
  };
}

const lanza = (nombre: string) => (): never => {
  throw new DOMException('Simulado en la prueba', nombre);
};

const nombres = (datos: Datos) => datos.materias.map((m) => m.nombre);

describe('abrirAlmacen', () => {
  it('la primera vez carga las materias base, sin entregas ni avisos', () => {
    const { datos, aviso } = abrirAlmacen(storageFalso());
    expect(aviso).toBeNull();
    expect(nombres(datos)).toEqual(MATERIAS_BASE);
    expect(datos.entregas).toEqual([]);
    expect(datos.drive).toEqual([]);
  });

  it('guarda y vuelve a cargar los mismos datos', () => {
    const storage = storageFalso();
    expect(abrirAlmacen(storage).guardar(datosNuevos)).toBeNull();
    expect(abrirAlmacen(storage)).toMatchObject({ datos: datosNuevos, aviso: null });
  });

  it('migra las fechas en milisegundos de mi-u.html al formato ISO de Bogotá', () => {
    // mi-u.html guardaba new Date(valorDelCampo).getTime(); en un equipo en Bogotá,
    // "2026-10-20T20:00" da este instante.
    const viejo = {
      ...datosNuevos,
      entregas: [
        { ...datosNuevos.entregas[0], fecha: Date.parse('2026-10-20T20:00:00-05:00') },
        { ...datosNuevos.entregas[0], id: 'e2', fecha: '2026-10-22T07:30:00-05:00' },
      ],
    };
    const storage = storageFalso({ [CLAVE]: JSON.stringify(viejo) });
    const almacen = abrirAlmacen(storage);

    expect(almacen.aviso).toBeNull();
    expect(almacen.datos.entregas.map((e) => e.fecha)).toEqual(['2026-10-20T20:00:00-05:00', '2026-10-22T07:30:00-05:00']);
    expect(almacen.datos.materias).toEqual(datosNuevos.materias);
    expect(almacen.datos.drive).toEqual(datosNuevos.drive);

    almacen.guardar(almacen.datos);
    expect(JSON.parse(storage.valores.get(CLAVE)!).entregas[0].fecha).toBe('2026-10-20T20:00:00-05:00');
  });

  it('JSON inválido: lo copia en mi-u-v1-corrupto, carga el estado inicial y avisa', () => {
    const storage = storageFalso({ [CLAVE]: '{"materias": [' });
    const { datos, aviso } = abrirAlmacen(storage);

    expect(storage.valores.get(CLAVE_CORRUPTO)).toBe('{"materias": [');
    expect(storage.valores.get(CLAVE)).toBe('{"materias": [');
    expect(nombres(datos)).toEqual(MATERIAS_BASE);
    expect(aviso).toContain('"mi-u-v1-corrupto"');
  });

  it.each([
    ['no es un objeto', '[]'],
    ['es null', 'null'],
    ['faltan listas', '{"materias": []}'],
    ['materia sin nombre', JSON.stringify({ ...datosNuevos, materias: [{ id: 'm1', clase: '', moodle: '', classroom: '' }] })],
    ['fecha que no existe', JSON.stringify({ ...datosNuevos, entregas: [{ ...datosNuevos.entregas[0], fecha: '2026-02-30T10:00:00-05:00' }] })],
    ['"hecha" no es booleano', JSON.stringify({ ...datosNuevos, entregas: [{ ...datosNuevos.entregas[0], hecha: 'no' }] })],
  ])('forma incorrecta (%s): copia, estado inicial y aviso', (_caso, crudo) => {
    const storage = storageFalso({ [CLAVE]: crudo });
    const { datos, aviso } = abrirAlmacen(storage);

    expect(storage.valores.get(CLAVE_CORRUPTO)).toBe(crudo);
    expect(storage.valores.get(CLAVE)).toBe(crudo);
    expect(nombres(datos)).toEqual(MATERIAS_BASE);
    expect(aviso).toContain('"mi-u-v1-corrupto"');
  });

  it('no pisa una copia anterior distinta: usa mi-u-v1-corrupto-2', () => {
    const storage = storageFalso({ [CLAVE]: 'dañado nuevo', [CLAVE_CORRUPTO]: 'dañado viejo' });
    const { aviso } = abrirAlmacen(storage);

    expect(storage.valores.get(CLAVE_CORRUPTO)).toBe('dañado viejo');
    expect(storage.valores.get(`${CLAVE_CORRUPTO}-2`)).toBe('dañado nuevo');
    expect(aviso).toContain('"mi-u-v1-corrupto-2"');
  });

  it('no duplica la copia si al recargar el contenido dañado es el mismo', () => {
    const storage = storageFalso({ [CLAVE]: 'dañado' });
    abrirAlmacen(storage);
    abrirAlmacen(storage);
    expect([...storage.valores.keys()].sort()).toEqual([CLAVE, CLAVE_CORRUPTO]);
  });

  it('si no puede hacer la copia, avisa y no sobrescribe los datos dañados', () => {
    // Falla solo la copia: así se comprueba que guardar() ni siquiera intenta escribir en "mi-u-v1".
    const base = storageFalso({ [CLAVE]: 'dañado' });
    const storage = {
      ...base,
      setItem: (clave: string, valor: string) => {
        if (clave.startsWith(CLAVE_CORRUPTO)) throw new DOMException('Simulado en la prueba', 'QuotaExceededError');
        base.setItem(clave, valor);
      },
    };
    const almacen = abrirAlmacen(storage);

    expect(almacen.aviso).toMatch(/no se pudo hacer una copia/);
    expect(almacen.guardar(datosNuevos)).toBe(almacen.aviso);
    expect(base.valores.get(CLAVE)).toBe('dañado');
  });

  it('localStorage bloqueado: sigue en memoria y avisa sin lanzar errores', () => {
    const bloqueado: AlmacenWeb = { getItem: lanza('SecurityError'), setItem: lanza('SecurityError') };
    const almacen = abrirAlmacen(bloqueado);

    expect(nombres(almacen.datos)).toEqual(MATERIAS_BASE);
    expect(almacen.aviso).toMatch(/no deja guardar/);
    expect(almacen.guardar(datosNuevos)).toBe(almacen.aviso);
  });

  it('sin localStorage (null, o sin window como en Node): sigue en memoria y avisa', () => {
    expect(abrirAlmacen(null).aviso).toMatch(/no deja guardar/);
    expect(abrirAlmacen().aviso).toMatch(/no deja guardar/);
  });

  it('localStorage lleno al guardar: devuelve un aviso en vez de lanzar un error', () => {
    const almacen = abrirAlmacen({ ...storageFalso(), setItem: lanza('QuotaExceededError') });

    expect(almacen.aviso).toBeNull();
    expect(almacen.guardar(datosNuevos)).toMatch(/está lleno/);
  });
});
