import { useState } from 'react';
import { estadoEntrega, etiquetaEstado, ordenarEntregas, type EstadoEntrega } from '../lib/entregas.ts';
import { desdeCampoFecha, formatoFechaEntrega } from '../lib/fechas.ts';
import type { Entrega, Materia } from '../lib/tipos.ts';
import { boton, botonQuitar, botonSuave, campo, fila, formulario, pista } from './estilos.ts';
import Tarjeta from './Tarjeta.tsx';

const COLOR_ETIQUETA: Record<EstadoEntrega['tipo'], string> = {
  entregada: 'bg-exito-suave text-exito',
  vencida: 'bg-peligro-suave text-peligro',
  hoy: 'bg-alerta-suave text-alerta',
  manana: 'bg-borde text-tenue',
  dias: 'bg-borde text-tenue',
};

interface Props {
  entregas: Entrega[];
  materias: Materia[];
  ahora: number;
  nombreMateria: (id: string) => string;
  mostrarBotonAvisos: boolean;
  onPedirAvisos: () => void;
  onAgregar: (entrega: Pick<Entrega, 'materia' | 'texto' | 'fecha'>) => void;
  onAlternar: (id: string) => void;
  onBorrar: (id: string) => void;
}

export default function Entregas(props: Props) {
  const { entregas, materias, ahora, nombreMateria, mostrarBotonAvisos, onPedirAvisos, onAgregar, onAlternar, onBorrar } =
    props;
  const [materia, setMateria] = useState('');
  const [texto, setTexto] = useState('');
  const [fecha, setFecha] = useState('');
  // Si la materia elegida ya no existe (o aún no se eligió), queda la primera, como en un <select> normal.
  const materiaElegida = materias.some((m) => m.id === materia) ? materia : (materias[0]?.id ?? '');

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
      ancha
    >
      {mostrarBotonAvisos && (
        <button type="button" className={botonSuave} onClick={onPedirAvisos}>
          Activar avisos del navegador
        </button>
      )}
      <div className={formulario}>
        <select aria-label="Materia" className={campo} value={materiaElegida} onChange={(e) => setMateria(e.target.value)}>
          {materias.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
            </option>
          ))}
        </select>
        <input
          type="text"
          className={campo}
          placeholder="Descripción (ej. Taller 3)"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <input
          type="datetime-local"
          aria-label="Fecha límite"
          className={campo}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        <button type="button" className={boton} onClick={agregar}>
          Agregar
        </button>
      </div>
      {lista.length === 0 ? (
        <p className={pista}>Sin entregas registradas.</p>
      ) : (
        <ul>
          {lista.map((e) => {
            const estado = estadoEntrega(e, ahora);
            return (
              <li key={e.id} className={fila}>
                <input
                  type="checkbox"
                  aria-label={e.texto}
                  className="m-[3px_3px_3px_4px] size-[18px] flex-none text-[13px] accent-acento"
                  checked={e.hecha}
                  onChange={() => onAlternar(e.id)}
                />
                <div className="min-w-0 flex-1">
                  <div className={`overflow-hidden text-[14px] font-semibold text-ellipsis ${e.hecha ? 'line-through opacity-55' : ''}`}>
                    {e.texto}
                  </div>
                  {/* Un solo nodo de texto, como en mi-u.html: así el navegador lo compone igual. */}
                  <div className="mt-[2px] text-[12px] text-tenue">
                    {`${nombreMateria(e.materia)} · ${formatoFechaEntrega(e.fecha)}`}
                  </div>
                </div>
                <span className={`rounded-[999px] px-[9px] py-[3px] text-[12px] whitespace-nowrap ${COLOR_ETIQUETA[estado.tipo]}`}>
                  {etiquetaEstado(estado)}
                </span>
                <button
                  type="button"
                  className={botonQuitar}
                  title="Borrar"
                  aria-label={`Borrar ${e.texto}`}
                  onClick={() => onBorrar(e.id)}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Tarjeta>
  );
}
