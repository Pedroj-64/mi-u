import type { ColorMateria } from '../lib/colores.ts';

// Clases escritas completas para que Tailwind las encuentre al compilar.
const FONDO: Record<ColorMateria, string> = {
  orquidea: 'bg-materia-orquidea',
  oliva: 'bg-materia-oliva',
  magenta: 'bg-materia-magenta',
  turquesa: 'bg-materia-turquesa',
  violeta: 'bg-materia-violeta',
  rosa: 'bg-materia-rosa',
  lima: 'bg-materia-lima',
  petroleo: 'bg-materia-petroleo',
};

/** Punto de 10 px con el color de la materia; siempre va junto a su nombre. */
export default function PuntoMateria({ color, className = '' }: { color: ColorMateria; className?: string }) {
  return <span aria-hidden="true" className={`inline-block size-2.5 shrink-0 rounded-full ${FONDO[color]} ${className}`} />;
}
