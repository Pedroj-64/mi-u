import type { LucideIcon } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { pista as clasePista } from './estilos.ts';

interface Props {
  titulo: string;
  pista: string;
  icono: LucideIcon;
  /** Ubicación en la cuadrícula de App. */
  className?: string;
  children: ReactNode;
}

export default function Tarjeta({ titulo, pista, icono: Icono, className = '', children }: Props) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={`min-w-0 rounded-2xl border border-borde bg-tarjeta p-5 shadow-[var(--sombra-tarjeta)] md:p-6 ${className}`}
    >
      <h2 id={id} className="flex items-center gap-2.5 text-[18px] leading-6 font-semibold tracking-[-0.01em]">
        <Icono size={20} className="shrink-0 text-acento" aria-hidden="true" />
        {titulo}
      </h2>
      <p className={`mt-1 ${clasePista}`}>{pista}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}
