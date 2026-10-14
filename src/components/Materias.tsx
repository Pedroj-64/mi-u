import { useState } from 'react';
import type { Materia } from '../lib/tipos.ts';
import { boton, botonQuitar, campo, fila, formulario, pista, tituloFila } from './estilos.ts';
import Tarjeta from './Tarjeta.tsx';

interface Props {
  materias: Materia[];
  onAgregar: (nombre: string) => void;
  /** Quita la materia con sus enlaces y sus entregas. */
  onQuitar: (id: string) => void;
}

export default function Materias({ materias, onAgregar, onQuitar }: Props) {
  const [nombre, setNombre] = useState('');

  const agregar = () => {
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) return;
    onAgregar(nombreLimpio);
    setNombre('');
  };

  const quitar = (m: Materia) => {
    if (window.confirm(`¿Quitar "${m.nombre}"? También se borran sus links y entregas.`)) onQuitar(m.id);
  };

  return (
    <Tarjeta titulo="Mis materias" pista="Las materias aparecen en todas las secciones.">
      {materias.length === 0 ? (
        <p className={pista}>Agrega tus materias para empezar.</p>
      ) : (
        <ul>
          {materias.map((m) => (
            <li key={m.id} className={fila}>
              <span className={tituloFila}>{m.nombre}</span>
              <button
                type="button"
                className={botonQuitar}
                title="Quitar"
                aria-label={`Quitar ${m.nombre}`}
                onClick={() => quitar(m)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className={formulario}>
        <input
          type="text"
          className={campo}
          placeholder="Nueva materia"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button type="button" className={boton} onClick={agregar}>
          Agregar
        </button>
      </div>
    </Tarjeta>
  );
}
