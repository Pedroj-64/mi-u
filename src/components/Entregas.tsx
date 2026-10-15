import {
  BellRing,
  CalendarDays,
  CircleAlert,
  CircleCheck,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Plus,
  Sunrise,
  Trash,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { estadoEntrega, etiquetaEstado, ordenarEntregas, type EstadoEntrega } from '../lib/entregas.ts';
import { desdeCampoFecha, formatoFechaEntrega } from '../lib/fechas.ts';
import type { Entrega, Materia } from '../lib/tipos.ts';
import Campo from './Campo.tsx';
import EstadoVacio from './EstadoVacio.tsx';
import { botonIcono, botonPrincipal, botonSecundario, campo, fila, tituloElemento } from './estilos.ts';
import PuntoMateria from './PuntoMateria.tsx';
import Tarjeta from './Tarjeta.tsx';

// Cada estado lleva icono y texto, nunca solo color (docs/diseno.md, "Estados de las entregas").
const ESTILO_ESTADO: Record<EstadoEntrega['tipo'], { icono: LucideIcon; clases: string }> = {
  entregada: { icono: CircleCheck, clases: 'bg-entregada-fondo text-entregada' },
  vencida: { icono: CircleAlert, clases: 'bg-vencida-fondo text-vencida' },
  hoy: { icono: Clock, clases: 'bg-hoy-fondo text-hoy' },
  manana: { icono: Sunrise, clases: 'bg-manana-fondo text-manana' },
  dias: { icono: CalendarDays, clases: 'bg-dias-fondo text-dias' },
};

interface Props {
  entregas: Entrega[];
  materias: Materia[];
  ahora: number;
  mostrarBotonAvisos: boolean;
  onPedirAvisos: () => void;
  onAgregar: (entrega: Pick<Entrega, 'materia' | 'texto' | 'fecha'>) => void;
  onAlternar: (id: string) => void;
  onBorrar: (id: string) => void;
  className?: string;
}

export default function Entregas(props: Props) {
  const { entregas, materias, ahora, mostrarBotonAvisos, onPedirAvisos, onAgregar, onAlternar, onBorrar, className } =
    props;
  const [materia, setMateria] = useState('');
  const [texto, setTexto] = useState('');
  const [fecha, setFecha] = useState('');
  // Si la materia elegida ya no existe (o aún no se eligió), queda la primera, como en un <select> normal.
  const materiaElegida = materias.some((m) => m.id === materia) ? materia : (materias[0]?.id ?? '');
  const porId = new Map(materias.map((m) => [m.id, m]));

  const agregar = () => {
    const descripcion = texto.trim();
    const fechaGuardada = desdeCampoFecha(fecha);
    if (!descripcion || !fechaGuardada || !materiaElegida) {
      window.alert('Completa materia, descripción y fecha.');
      return;
    }
    onAgregar({ materia: materiaElegida, texto: descripcion, fecha: fechaGuardada });
    setTexto('');
    setFecha('');
  };

  const lista = ordenarEntregas(entregas);

  return (
    <Tarjeta
      titulo="Entregas"
      pista="Agrega una entrega con su fecha límite. Las vencidas y las que vencen pronto aparecen destacadas."
      icono={ClipboardList}
      className={className}
    >
      {mostrarBotonAvisos && (
        <button type="button" className={`${botonSecundario} mb-4`} onClick={onPedirAvisos}>
          <BellRing size={16} aria-hidden="true" />
          Activar avisos del navegador
        </button>
      )}
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)_auto] md:items-end">
        <Campo id="entrega-materia" etiqueta="Materia">
          <select id="entrega-materia" className={campo} value={materiaElegida} onChange={(e) => setMateria(e.target.value)}>
            {materias.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id="entrega-descripcion" etiqueta="Descripción">
          <input
            id="entrega-descripcion"
            type="text"
            className={campo}
            placeholder="Ej. Taller 3"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </Campo>
        <Campo id="entrega-fecha" etiqueta="Fecha límite">
          <input
            id="entrega-fecha"
            type="datetime-local"
            className={campo}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </Campo>
        <button type="button" className={botonPrincipal} onClick={agregar}>
          <Plus size={16} aria-hidden="true" />
          Agregar
        </button>
      </div>
      <div className="mt-4">
        {lista.length === 0 ? (
          <EstadoVacio
            icono={ClipboardCheck}
            titulo="Todavía no tienes entregas"
            texto="Cuando agregues una, verás aquí cuánto falta para su fecha límite."
            accion="Agregar entrega"
            enfocar="entrega-descripcion"
          />
        ) : (
          <ul>
            {lista.map((e) => (
              <FilaEntrega
                key={e.id}
                entrega={e}
                materia={porId.get(e.materia)}
                ahora={ahora}
                onAlternar={onAlternar}
                onBorrar={onBorrar}
              />
            ))}
          </ul>
        )}
      </div>
    </Tarjeta>
  );
}

interface PropsFila {
  entrega: Entrega;
  materia: Materia | undefined;
  ahora: number;
  onAlternar: (id: string) => void;
  onBorrar: (id: string) => void;
}

/** En móvil la etiqueta de estado baja a la segunda fila; desde md va a la derecha. */
function FilaEntrega({ entrega: e, materia, ahora, onAlternar, onBorrar }: PropsFila) {
  const estado = estadoEntrega(e, ahora);
  const { icono: Icono, clases } = ESTILO_ESTADO[estado.tipo];
  return (
    <li
      className={`${fila} grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 md:grid-cols-[auto_minmax(0,1fr)_auto_auto]`}
    >
      <input
        type="checkbox"
        aria-label={e.texto}
        className="row-span-2 size-[18px] cursor-pointer accent-acento md:row-span-1"
        checked={e.hecha}
        onChange={() => onAlternar(e.id)}
      />
      <div className="min-w-0">
        <p className={`${tituloElemento} break-words transition-colors duration-200 ease-estandar ${e.hecha ? 'text-tenue line-through' : ''}`}>
          {e.texto}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] leading-[18px] text-tenue">
          {/* El nombre completo puede pasar de línea; el separador va pegado a él (espacio no separable). */}
          <span className="min-w-0 break-words">
            {materia && <PuntoMateria color={materia.color} className="mr-1.5 align-middle" />}
            {materia?.nombre ?? 'Materia eliminada'}
            <span aria-hidden="true">{' · '}</span>
          </span>
          <span className="whitespace-nowrap">{formatoFechaEntrega(e.fecha)}</span>
        </p>
      </div>
      <span
        className={`col-start-2 row-start-2 inline-flex h-6 items-center gap-1.5 justify-self-start rounded-full px-2.5 text-[12px] leading-4 font-semibold whitespace-nowrap transition-colors duration-200 ease-estandar md:col-start-3 md:row-start-1 ${clases}`}
      >
        <Icono size={14} aria-hidden="true" />
        {etiquetaEstado(estado)}
      </span>
      <button
        type="button"
        className={`${botonIcono} col-start-3 row-span-2 row-start-1 md:col-start-4 md:row-span-1`}
        title="Borrar"
        aria-label={`Borrar ${e.texto}`}
        onClick={() => onBorrar(e.id)}
      >
        <Trash size={18} aria-hidden="true" />
      </button>
    </li>
  );
}
