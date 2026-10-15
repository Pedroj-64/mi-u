import { CalendarDays, CircleAlert, CircleCheck, Clock, Sunrise, type LucideIcon } from 'lucide-react';
import { etiquetaEstado, type EstadoEntrega } from '../lib/entregas.ts';

// Cada estado lleva icono y texto, nunca solo color (docs/diseno.md, "Estados de las entregas").
const ESTILO: Record<EstadoEntrega['tipo'], { icono: LucideIcon; clases: string }> = {
  entregada: { icono: CircleCheck, clases: 'bg-entregada-fondo text-entregada' },
  vencida: { icono: CircleAlert, clases: 'bg-vencida-fondo text-vencida' },
  hoy: { icono: Clock, clases: 'bg-hoy-fondo text-hoy' },
  manana: { icono: Sunrise, clases: 'bg-manana-fondo text-manana' },
  dias: { icono: CalendarDays, clases: 'bg-dias-fondo text-dias' },
};

export default function EtiquetaEstado({ estado, className = '' }: { estado: EstadoEntrega; className?: string }) {
  const { icono: Icono, clases } = ESTILO[estado.tipo];
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12px] leading-4 font-semibold whitespace-nowrap transition-colors duration-200 ease-estandar ${clases} ${className}`}
    >
      <Icono size={14} aria-hidden="true" />
      {etiquetaEstado(estado)}
    </span>
  );
}
