// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.tsx';
import { abrirAlmacen, CLAVE, type AlmacenWeb } from './lib/almacen.ts';
import { crearStore } from './lib/store.ts';
import type { Datos, Entrega, Materia } from './lib/tipos.ts';
import { storageFalso } from './test/storage-falso.ts';

// Miércoles 14 de octubre de 2026, 9:00 a. m. en Bogotá.
const AHORA = new Date('2026-10-14T09:00:00-05:00');

const materia = (id: string, nombre: string, enlaces: Partial<Materia> = {}): Materia => ({
  id,
  nombre,
  clase: '',
  moodle: '',
  classroom: '',
  ...enlaces,
});

const entrega = (id: string, materiaId: string, texto: string, fecha: string): Entrega => ({
  id,
  materia: materiaId,
  texto,
  fecha,
  hecha: false,
  avisada: false,
});

function montar(datos?: Datos, storage: AlmacenWeb = storageFalso()) {
  if (datos) storage.setItem(CLAVE, JSON.stringify(datos));
  const usuario = userEvent.setup();
  const vista = render(<App store={crearStore(abrirAlmacen(storage))} />);
  return { usuario, vista, guardado: (): Datos => JSON.parse(storage.getItem(CLAVE)!) };
}

const seccion = (titulo: string) => screen.getByRole('region', { name: titulo });
const filas = (region: HTMLElement) => within(region).queryAllByRole('listitem');

beforeEach(() => {
  vi.useFakeTimers({ now: AHORA, toFake: ['Date'] });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Entregas', () => {
  it('agrega una entrega con materia, descripción y fecha, y la borra', async () => {
    const { usuario, guardado } = montar();
    const entregas = seccion('Entregas');

    await usuario.selectOptions(within(entregas).getByLabelText('Materia'), 'Ingeniería de Software');
    await usuario.type(within(entregas).getByPlaceholderText('Descripción (ej. Taller 3)'), 'Taller 3');
    fireEvent.change(within(entregas).getByLabelText('Fecha límite'), { target: { value: '2026-10-14T23:59' } });
    await usuario.click(within(entregas).getByRole('button', { name: 'Agregar' }));

    const [fila] = filas(entregas);
    expect(fila).toHaveTextContent('Taller 3');
    expect(fila).toHaveTextContent('Ingeniería de Software · mié, 14 de oct, 11:59 p. m.');
    expect(fila).toHaveTextContent('Para hoy');
    expect(guardado().entregas).toMatchObject([{ texto: 'Taller 3', fecha: '2026-10-14T23:59:00-05:00', hecha: false }]);
    expect(within(entregas).getByPlaceholderText('Descripción (ej. Taller 3)')).toHaveValue('');

    await usuario.click(within(fila).getByRole('button', { name: 'Borrar Taller 3' }));

    expect(filas(entregas)).toHaveLength(0);
    expect(within(entregas).getByText('Sin entregas registradas.')).toBeInTheDocument();
    expect(guardado().entregas).toEqual([]);
  });

  it('pide completar materia, descripción y fecha', async () => {
    const alerta = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { usuario } = montar();

    await usuario.type(screen.getByPlaceholderText('Descripción (ej. Taller 3)'), 'Taller 3');
    await usuario.click(within(seccion('Entregas')).getByRole('button', { name: 'Agregar' }));

    expect(alerta).toHaveBeenCalledWith('Completa materia, descripción y fecha.');
    expect(filas(seccion('Entregas'))).toHaveLength(0);
  });

  it('marcarla como hecha la deja "Entregada" y la pasa al final', async () => {
    const { usuario, guardado } = montar({
      materias: [materia('m1', 'Ingeniería de Software')],
      entregas: [
        entrega('e1', 'm1', 'Quiz', '2026-10-15T07:00:00-05:00'),
        entrega('e2', 'm1', 'Informe', '2026-10-17T20:00:00-05:00'),
      ],
      drive: [],
    });
    const entregas = seccion('Entregas');
    expect(filas(entregas)[0]).toHaveTextContent('Quiz');
    expect(filas(entregas)[0]).toHaveTextContent('Mañana');
    expect(filas(entregas)[1]).toHaveTextContent('en 3 días');

    await usuario.click(within(entregas).getByRole('checkbox', { name: 'Quiz' }));

    const [primera, segunda] = filas(entregas);
    expect(primera).toHaveTextContent('Informe');
    expect(segunda).toHaveTextContent('Quiz');
    expect(segunda).toHaveTextContent('Entregada');
    expect(within(segunda).getByRole('checkbox')).toBeChecked();
    expect(guardado().entregas.find((e) => e.id === 'e1')?.hecha).toBe(true);
  });
});

describe('Mis materias', () => {
  it('agrega una materia y aparece en todas las secciones', async () => {
    const { usuario, guardado } = montar();
    const materias = seccion('Mis materias');

    await usuario.type(within(materias).getByPlaceholderText('Nueva materia'), '  Cálculo Integral ');
    await usuario.click(within(materias).getByRole('button', { name: 'Agregar' }));

    expect(within(materias).getByText('Cálculo Integral')).toBeInTheDocument();
    for (const titulo of ['Clases virtuales', 'Aula virtual (Moodle)', 'Classroom']) {
      expect(within(seccion(titulo)).getByLabelText('Enlace de Cálculo Integral')).toBeInTheDocument();
    }
    expect(within(seccion('Entregas')).getByRole('option', { name: 'Cálculo Integral' })).toBeInTheDocument();
    expect(guardado().materias.at(-1)).toMatchObject({ nombre: 'Cálculo Integral', clase: '', moodle: '', classroom: '' });
  });

  it('quitar una materia pide confirmación y borra también sus enlaces y entregas', async () => {
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { usuario, guardado } = montar({
      materias: [materia('m1', 'Ingeniería de Software', { clase: 'meet.google.com/abc' }), materia('m2', 'Estructura de Datos')],
      entregas: [
        entrega('e1', 'm1', 'Taller 3', '2026-10-20T20:00:00-05:00'),
        entrega('e2', 'm2', 'Parcial', '2026-10-21T08:00:00-05:00'),
      ],
      drive: [],
    });

    await usuario.click(within(seccion('Mis materias')).getByRole('button', { name: 'Quitar Ingeniería de Software' }));

    expect(confirmar).toHaveBeenCalledWith('¿Quitar "Ingeniería de Software"? También se borran sus links y entregas.');
    expect(screen.queryByText('Ingeniería de Software')).not.toBeInTheDocument();
    expect(filas(seccion('Entregas')).map((f) => within(f).getByRole('checkbox').getAttribute('aria-label'))).toEqual([
      'Parcial',
    ]);
    expect(guardado()).toMatchObject({ materias: [{ id: 'm2' }], entregas: [{ id: 'e2' }] });
  });

  it('si se cancela la confirmación no quita nada', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const storage = storageFalso();
    const { usuario } = montar(undefined, storage);

    await usuario.click(within(seccion('Mis materias')).getByRole('button', { name: 'Quitar Ingeniería de Software' }));

    expect(within(seccion('Mis materias')).getByText('Ingeniería de Software')).toBeInTheDocument();
    expect(storage.valores.has(CLAVE)).toBe(false);
  });
});

describe('Enlaces por materia', () => {
  it('guarda el enlace al salir del campo, habilita Abrir y lo abre con https://', async () => {
    const abrir = vi.spyOn(window, 'open').mockReturnValue(null);
    const { usuario, guardado } = montar();
    const clases = seccion('Clases virtuales');
    const boton = within(clases).getByRole('button', { name: 'Abrir Ingeniería de Software' });
    expect(boton).toBeDisabled();

    await usuario.type(within(clases).getByLabelText('Enlace de Ingeniería de Software'), '  meet.google.com/abc-defg-hij ');
    expect(boton).toBeDisabled(); // Como en mi-u.html, se guarda al confirmar el campo, no en cada tecla.
    await usuario.tab();

    expect(boton).toBeEnabled();
    expect(within(clases).getByLabelText('Enlace de Ingeniería de Software')).toHaveValue('meet.google.com/abc-defg-hij');
    expect(guardado().materias.find((m) => m.nombre === 'Ingeniería de Software')?.clase).toBe('meet.google.com/abc-defg-hij');

    await usuario.click(boton);
    expect(abrir).toHaveBeenCalledWith('https://meet.google.com/abc-defg-hij', '_blank', 'noopener');
  });

  it('Enter también guarda, y cada sección guarda su propio enlace', async () => {
    const { usuario, guardado } = montar();

    await usuario.type(
      within(seccion('Aula virtual (Moodle)')).getByLabelText('Enlace de Estructura de Datos'),
      'https://moodle.u.edu.co/course/7{Enter}',
    );

    expect(within(seccion('Aula virtual (Moodle)')).getByRole('button', { name: 'Abrir Estructura de Datos' })).toBeEnabled();
    expect(within(seccion('Classroom')).getByRole('button', { name: 'Abrir Estructura de Datos' })).toBeDisabled();
    expect(guardado().materias.find((m) => m.nombre === 'Estructura de Datos')).toMatchObject({
      clase: '',
      moodle: 'https://moodle.u.edu.co/course/7',
      classroom: '',
    });
  });
});

describe('Drive', () => {
  it('agrega un enlace, lo abre y lo quita', async () => {
    const abrir = vi.spyOn(window, 'open').mockReturnValue(null);
    const { usuario, guardado } = montar();
    const drive = seccion('Drive');

    await usuario.type(within(drive).getByPlaceholderText('Nombre (ej. Carpeta de PETI)'), 'Carpeta de PETI');
    await usuario.type(within(drive).getByPlaceholderText('Enlace'), 'drive.google.com/drive/folders/abc');
    await usuario.click(within(drive).getByRole('button', { name: 'Guardar' }));

    expect(filas(drive)).toHaveLength(1);
    expect(guardado().drive).toMatchObject([{ nombre: 'Carpeta de PETI', url: 'drive.google.com/drive/folders/abc' }]);

    await usuario.click(within(drive).getByRole('button', { name: 'Abrir Carpeta de PETI' }));
    expect(abrir).toHaveBeenCalledWith('https://drive.google.com/drive/folders/abc', '_blank', 'noopener');

    await usuario.click(within(drive).getByRole('button', { name: 'Quitar Carpeta de PETI' }));
    expect(filas(drive)).toHaveLength(0);
    expect(guardado().drive).toEqual([]);
  });
});

describe('Encabezado', () => {
  it('muestra la fecha de hoy en es-CO, con el día de Bogotá', () => {
    vi.setSystemTime(new Date('2026-10-14T20:00:00-05:00')); // En Tokio ya es el 15.
    montar();
    expect(screen.getByRole('banner')).toHaveTextContent('miércoles, 14 de octubre de 2026');
  });
});

describe('Avisos del navegador', () => {
  function simularNotificaciones(permiso: NotificationPermission) {
    const creadas: { titulo: string; cuerpo?: string }[] = [];
    class NotificacionFalsa {
      static permission = permiso;
      static requestPermission = vi.fn(async () => {
        NotificacionFalsa.permission = 'granted';
        return NotificacionFalsa.permission;
      });
      constructor(titulo: string, opciones?: NotificationOptions) {
        creadas.push({ titulo, cuerpo: opciones?.body });
      }
    }
    vi.stubGlobal('Notification', NotificacionFalsa);
    return creadas;
  }

  it('el botón solo aparece con permiso "default" y desaparece al concederlo', async () => {
    simularNotificaciones('default');
    const { usuario } = montar();

    await usuario.click(screen.getByRole('button', { name: 'Activar avisos del navegador' }));

    expect(screen.queryByRole('button', { name: 'Activar avisos del navegador' })).not.toBeInTheDocument();
  });

  it('sin soporte de avisos, o con el permiso negado, no hay botón', () => {
    montar();
    expect(screen.queryByRole('button', { name: 'Activar avisos del navegador' })).not.toBeInTheDocument();
    cleanup();

    simularNotificaciones('denied');
    montar();
    expect(screen.queryByRole('button', { name: 'Activar avisos del navegador' })).not.toBeInTheDocument();
  });

  it('con permiso concedido avisa al abrir y cada 60 s, una sola vez por entrega', () => {
    vi.useRealTimers();
    vi.useFakeTimers({ now: AHORA, toFake: ['Date', 'setInterval', 'clearInterval'] });
    const creadas = simularNotificaciones('granted');
    const storage = storageFalso();
    storage.setItem(
      CLAVE,
      JSON.stringify({
        materias: [materia('m1', 'Ingeniería de Software')],
        entregas: [
          entrega('e1', 'm1', 'Quiz', '2026-10-14T11:00:00-05:00'),
          entrega('e2', 'm1', 'Parcial', '2026-10-15T10:00:00-05:00'),
        ],
        drive: [],
      }),
    );
    const avisadas = () => (JSON.parse(storage.getItem(CLAVE)!) as Datos).entregas.map((e) => e.avisada);

    // StrictMode repite los efectos al montar: aun así, cada entrega se avisa una sola vez.
    render(
      <StrictMode>
        <App store={crearStore(abrirAlmacen(storage))} />
      </StrictMode>,
    );

    // Quiz vence en 2 h: se avisa al abrir.
    expect(creadas).toEqual([{ titulo: 'Entrega en menos de 24 h', cuerpo: 'Quiz · Ingeniería de Software' }]);
    expect(avisadas()).toEqual([true, false]);

    // Parcial vence en 25 h: entra en la ventana de 24 h en la revisión de las 10:00.
    act(() => vi.advanceTimersByTime(59 * 60_000));
    expect(creadas).toHaveLength(1);
    act(() => vi.advanceTimersByTime(60_000));
    expect(creadas.map((a) => a.cuerpo)).toEqual(['Quiz · Ingeniería de Software', 'Parcial · Ingeniería de Software']);
    expect(avisadas()).toEqual([true, true]);

    act(() => vi.advanceTimersByTime(10 * 60_000));
    expect(creadas).toHaveLength(2);
  });

  it('al desmontar no deja intervalos activos', () => {
    vi.useRealTimers();
    vi.useFakeTimers({ now: AHORA, toFake: ['Date', 'setInterval', 'clearInterval'] });
    simularNotificaciones('granted');
    const { vista } = montar();
    expect(vi.getTimerCount()).toBe(2); // El reloj de las etiquetas y la revisión de avisos.

    vista.unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('Avisos del almacén', () => {
  it('muestra un mensaje si localStorage está bloqueado', () => {
    render(<App store={crearStore(abrirAlmacen(null))} />);
    expect(screen.getByRole('alert')).toHaveTextContent('El navegador no deja guardar datos en este sitio.');
  });

  it('muestra un mensaje si localStorage se llena al guardar, y el cambio sigue en pantalla', async () => {
    const lleno = {
      ...storageFalso(),
      setItem: () => {
        throw new DOMException('Simulado en la prueba', 'QuotaExceededError');
      },
    };
    const { usuario } = montar(undefined, lleno);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await usuario.type(screen.getByPlaceholderText('Nueva materia'), 'Cálculo Integral');
    await usuario.click(within(seccion('Mis materias')).getByRole('button', { name: 'Agregar' }));

    expect(screen.getByRole('alert')).toHaveTextContent('El almacenamiento del navegador está lleno');
    expect(within(seccion('Mis materias')).getByText('Cálculo Integral')).toBeInTheDocument();
  });
});

describe('Respaldo', () => {
  const respaldo = (datos: unknown) => new File([JSON.stringify(datos)], 'respaldo.json', { type: 'application/json' });

  it('importa un respaldo válido después de confirmar y lo guarda', async () => {
    const { usuario, guardado } = montar();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const nuevos: Datos = { materias: [materia('m1', 'Física')], entregas: [], drive: [] };

    await usuario.upload(within(seccion('Respaldo')).getByLabelText('Archivo de respaldo'), respaldo(nuevos));

    expect(await within(seccion('Mis materias')).findByText('Física')).toBeInTheDocument();
    expect(guardado()).toEqual(nuevos);
  });

  it('rechaza un archivo inválido sin tocar los datos', async () => {
    const { usuario } = montar();
    const alerta = vi.spyOn(window, 'alert').mockImplementation(() => {});

    await usuario.upload(within(seccion('Respaldo')).getByLabelText('Archivo de respaldo'), respaldo({ x: 1 }));

    await vi.waitFor(() => expect(alerta).toHaveBeenCalledWith(expect.stringContaining('no es un respaldo válido')));
    expect(within(seccion('Mis materias')).getByText('Estructura de Datos')).toBeInTheDocument();
  });
});
