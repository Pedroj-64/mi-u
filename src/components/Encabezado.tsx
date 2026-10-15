import { CalendarDays, CircleAlert, Clock, type LucideIcon } from 'lucide-react';
import type { ResumenEntregas } from '../lib/entregas.ts';
import { formatoEncabezado, saludo } from '../lib/fechas.ts';

interface Props {
  ahora: number;
  resumen: ResumenEntregas;
}

export default function Encabezado({ ahora, resumen }: Props) {
  return (
    <header className="mx-auto max-w-[1120px] px-4 pt-6 pb-4 md:px-6 md:pt-10 md:pb-6">
      <p className="flex items-center gap-2 text-[15px] leading-5 font-bold">
        <Marca />
        Mi U
      </p>
      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[24px] leading-[30px] font-bold tracking-[-0.02em] md:text-[28px] md:leading-[34px]">
            {saludo(ahora)}
          </h1>
          <p className="mt-1 text-[15px] leading-5 text-tenue">{formatoEncabezado(ahora)}</p>
        </div>
        <ul aria-label="Resumen de entregas" className="grid grid-cols-3 gap-2 md:gap-3 lg:min-w-[540px]">
          <Contador icono={CircleAlert} numero={resumen.vencidas} etiqueta="Vencidas" tono="bg-vencida-fondo text-vencida" />
          <Contador icono={Clock} numero={resumen.hoy} etiqueta="Para hoy" tono="bg-hoy-fondo text-hoy" />
          <Contador icono={CalendarDays} numero={resumen.proximos} etiqueta="Próximos 7 días" tono="bg-acento-suave text-acento" />
        </ul>
      </div>
    </header>
  );
}

interface PropsContador {
  icono: LucideIcon;
  numero: number;
  etiqueta: string;
  /** Colores del icono cuando hay algo que contar; en cero el contador queda neutro. */
  tono: string;
}

function Contador({ icono: Icono, numero, etiqueta, tono }: PropsContador) {
  return (
    <li className="flex flex-col items-start gap-2 rounded-[14px] border border-borde bg-tarjeta p-3 shadow-[var(--sombra-tarjeta)] md:flex-row md:items-center md:gap-3 md:px-4">
      <span className={`grid size-9 shrink-0 place-items-center rounded-[10px] ${numero > 0 ? tono : 'bg-superficie text-tenue'}`}>
        <Icono size={18} aria-hidden="true" />
      </span>
      <span>
        <span className="block text-[24px] leading-7 font-bold tracking-[-0.01em]">{numero}</span>
        <span className="block text-[13px] leading-[18px] text-tenue">{etiqueta}</span>
      </span>
    </li>
  );
}

/** El mismo dibujo del ícono de la pestaña, con los colores del acento de cada modo. */
function Marca() {
  return (
    <svg width="16" height="16" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" className="fill-acento" />
      <path d="M10 8v9a6 6 0 0 0 12 0V8" fill="none" strokeWidth="3.5" strokeLinecap="round" className="stroke-sobre-acento" />
    </svg>
  );
}
