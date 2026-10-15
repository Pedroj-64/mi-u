import { Search } from 'lucide-react';
import { useId } from 'react';
import { FILTROS, type FiltroEntregas } from '../lib/filtros.ts';
import Campo from './Campo.tsx';
import { campo } from './estilos.ts';

const NOMBRE: Record<FiltroEntregas, string> = {
  todas: 'Todas',
  pendientes: 'Pendientes',
  vencidas: 'Vencidas',
  entregadas: 'Entregadas',
};

interface Props {
  filtro: FiltroEntregas;
  conteos: Record<FiltroEntregas, number>;
  busqueda: string;
  onFiltro: (filtro: FiltroEntregas) => void;
  onBusqueda: (busqueda: string) => void;
}

/** Botones de filtro (con aria-pressed) y búsqueda; los dos se combinan sobre la lista de entregas. */
export default function FiltrosEntregas({ filtro, conteos, busqueda, onFiltro, onBusqueda }: Props) {
  const idEtiqueta = useId();
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="grid min-w-0 gap-1.5">
        <span id={idEtiqueta} className="text-[13px] leading-[18px] font-medium">
          Filtrar por estado
        </span>
        <div role="group" aria-labelledby={idEtiqueta} className="flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f}
              id={`filtro-${f}`}
              type="button"
              aria-pressed={filtro === f}
              onClick={() => onFiltro(f)}
              className="group inline-flex h-10 cursor-pointer items-center gap-2 rounded-[10px] border border-borde-control bg-tarjeta px-3 text-[14px] leading-5 font-semibold text-texto transition duration-150 ease-estandar hover:bg-superficie aria-pressed:border-acento aria-pressed:bg-acento aria-pressed:text-sobre-acento"
            >
              {NOMBRE[f]}{' '}
              <span className="font-normal text-tenue tabular-nums group-aria-pressed:text-sobre-acento">{conteos[f]}</span>
            </button>
          ))}
        </div>
      </div>
      <Campo id="buscar-entregas" etiqueta="Buscar entregas" className="md:w-72">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute top-3 left-3 text-tenue" aria-hidden="true" />
          <input
            id="buscar-entregas"
            type="search"
            className={`${campo} pl-9`}
            placeholder="Descripción o materia"
            value={busqueda}
            onChange={(e) => onBusqueda(e.target.value)}
          />
        </div>
      </Campo>
    </div>
  );
}
