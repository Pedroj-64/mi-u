import { useId, type ReactNode } from 'react';
import { pista as clasePista } from './estilos.ts';

interface Props {
  titulo: string;
  pista: string;
  /** Ocupa todo el ancho de la cuadrícula, como la tarjeta de Entregas. */
  ancha?: boolean;
  children: ReactNode;
}

export default function Tarjeta({ titulo, pista, ancha = false, children }: Props) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={`min-w-0 rounded-[14px] border border-borde bg-tarjeta p-[18px] ${ancha ? 'col-span-full' : ''}`}
    >
      <h2 id={id} className="mb-[2px] flex items-center justify-between gap-2 text-[17px] font-bold">
        {titulo}
      </h2>
      <p className={clasePista}>{pista}</p>
      {children}
    </section>
  );
}
