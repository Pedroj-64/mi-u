import { ArrowDown, BookPlus, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import type { CampoEnlace } from '../lib/datos.ts';
import { abrirEnlace } from '../lib/enlaces.ts';
import type { Materia } from '../lib/tipos.ts';
import EstadoVacio from './EstadoVacio.tsx';
import { botonSecundario, campo as claseCampo, fila, tituloElemento } from './estilos.ts';
import PuntoMateria from './PuntoMateria.tsx';

interface Props {
  materias: Materia[];
  campo: CampoEnlace;
  onGuardar: (id: string, campo: CampoEnlace, url: string) => void;
}

/** Props de las secciones que usan estas filas (Clases virtuales, Moodle y Classroom). */
export type PropsSeccionEnlaces = Omit<Props, 'campo'> & { className?: string };

/**
 * Una fila por materia: el nombre arriba y, debajo, el enlace con su botón Abrir, que solo se
 * habilita con un enlace guardado. Va apilada en todos los tamaños porque estas tarjetas son angostas.
 */
export default function EnlacesPorMateria({ materias, campo, onGuardar }: Props) {
  if (materias.length === 0) {
    return (
      <EstadoVacio
        icono={BookPlus}
        titulo="Primero agrega tus materias"
        texto="Aquí aparecerá una fila por materia para guardar su enlace."
        accion="Ir a Mis materias"
        iconoAccion={ArrowDown}
        enfocar="nueva-materia"
      />
    );
  }
  return (
    <ul>
      {materias.map((m) => (
        <li key={m.id} className={`${fila} grid gap-2`}>
          <span className="flex min-w-0 items-center gap-2">
            <PuntoMateria color={m.color} />
            <span className={`${tituloElemento} truncate`} title={m.nombre}>
              {m.nombre}
            </span>
          </span>
          <div className="flex gap-2">
            <CampoDeEnlace nombre={m.nombre} valor={m[campo]} onGuardar={(url) => onGuardar(m.id, campo, url)} />
            <button
              type="button"
              className={botonSecundario}
              disabled={!m[campo]}
              aria-label={`Abrir ${m.nombre}`}
              onClick={() => abrirEnlace(m[campo])}
            >
              <ExternalLink size={16} aria-hidden="true" />
              Abrir
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

interface PropsCampo {
  nombre: string;
  valor: string;
  onGuardar: (url: string) => void;
}

/** Como en mi-u.html, el enlace se guarda al confirmar el campo (al salir de él o con Enter), no en cada tecla. */
function CampoDeEnlace({ nombre, valor, onGuardar }: PropsCampo) {
  const [borrador, setBorrador] = useState(valor);
  const confirmar = () => {
    const url = borrador.trim();
    setBorrador(url);
    if (url !== valor) onGuardar(url);
  };
  return (
    <input
      type="text"
      aria-label={`Enlace de ${nombre}`}
      className={`${claseCampo} flex-1`}
      placeholder="Pega el enlace"
      value={borrador}
      onChange={(e) => setBorrador(e.target.value)}
      onBlur={confirmar}
      onKeyDown={(e) => {
        if (e.key === 'Enter') confirmar();
      }}
    />
  );
}
