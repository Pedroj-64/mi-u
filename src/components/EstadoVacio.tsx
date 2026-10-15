import { Plus, type LucideIcon } from 'lucide-react';
import { botonSecundario } from './estilos.ts';

interface Props {
  icono: LucideIcon;
  titulo: string;
  texto: string;
  accion: string;
  iconoAccion?: LucideIcon;
  /** id del campo que recibe el foco al pulsar el botón. */
  enfocar: string;
}

export default function EstadoVacio({ icono: Icono, titulo, texto, accion, iconoAccion: IconoAccion = Plus, enfocar }: Props) {
  return (
    <div className="grid justify-items-center gap-1.5 rounded-xl bg-fondo px-6 py-8 text-center">
      <span className="mb-1.5 grid size-12 place-items-center rounded-full bg-acento-suave text-acento">
        <Icono size={28} aria-hidden="true" />
      </span>
      <p className="text-[15px] leading-5 font-semibold">{titulo}</p>
      <p className="text-[13px] leading-[18px] text-tenue">{texto}</p>
      <button type="button" className={`${botonSecundario} mt-2`} onClick={() => document.getElementById(enfocar)?.focus()}>
        <IconoAccion size={16} aria-hidden="true" />
        {accion}
      </button>
    </div>
  );
}
