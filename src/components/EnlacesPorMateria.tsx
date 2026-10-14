import { useState } from 'react';
import type { CampoEnlace } from '../lib/datos.ts';
import { abrirEnlace } from '../lib/enlaces.ts';
import type { Materia } from '../lib/tipos.ts';
import { boton, campo as claseCampo, fila, pista } from './estilos.ts';

interface Props {
  materias: Materia[];
  campo: CampoEnlace;
  onGuardar: (id: string, campo: CampoEnlace, url: string) => void;
}

/** Props de las secciones que usan estas filas (Clases virtuales, Moodle y Classroom). */
export type PropsSeccionEnlaces = Omit<Props, 'campo'>;

/** Una fila por materia con su enlace y el botón Abrir, que solo se habilita con un enlace guardado. */
export default function EnlacesPorMateria({ materias, campo, onGuardar }: Props) {
  if (materias.length === 0) return <p className={pista}>Primero agrega tus materias.</p>;
  return (
    <ul>
      {materias.map((m) => (
        <li key={m.id} className={fila}>
          <span className="flex-[0_0_165px] truncate text-[14px] font-semibold max-[520px]:basis-full" title={m.nombre}>
            {m.nombre}
          </span>
          <CampoEnlace nombre={m.nombre} valor={m[campo]} onGuardar={(url) => onGuardar(m.id, campo, url)} />
          <button
            type="button"
            className={boton}
            disabled={!m[campo]}
            aria-label={`Abrir ${m.nombre}`}
            onClick={() => abrirEnlace(m[campo])}
          >
            Abrir
          </button>
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
function CampoEnlace({ nombre, valor, onGuardar }: PropsCampo) {
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
      className={`${claseCampo} min-w-0 flex-1 max-[520px]:basis-[calc(100%-90px)]`}
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
