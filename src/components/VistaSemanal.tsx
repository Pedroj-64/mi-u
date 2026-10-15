import { CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useId, useState } from 'react';
import { estadoEntrega } from '../lib/entregas.ts';
import { diaEnBogota, formatoDiaSemana, formatoHora, formatoSemana } from '../lib/fechas.ts';
import { entregasDeLaSemana, inicioDeSemana, moverSemana } from '../lib/semana.ts';
import type { Entrega, Materia } from '../lib/tipos.ts';
import EtiquetaEstado from './EtiquetaEstado.tsx';
import { botonSecundario } from './estilos.ts';
import PuntoMateria from './PuntoMateria.tsx';

interface Props {
  entregas: Entrega[];
  materias: Materia[];
  ahora: number;
}

/**
 * Siete días de lunes a domingo (en Bogotá) con todas sus entregas, hechas incluidas; no la afectan
 * el filtro ni la búsqueda de la lista. En pantallas pequeñas cada día va apilado.
 */
export default function VistaSemanal({ entregas, materias, ahora }: Props) {
  // Semanas de distancia con la actual: así "esta semana" sigue siendo la correcta si cambia mientras la app está abierta.
  const [desplazamiento, setDesplazamiento] = useState(0);
  const idTitulo = useId();
  const lunes = moverSemana(inicioDeSemana(ahora), desplazamiento);
  const hoy = diaEnBogota(ahora);
  const porId = new Map(materias.map((m) => [m.id, m]));

  return (
    <section aria-labelledby={idTitulo} className="rounded-xl border border-borde p-3 md:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id={idTitulo} className="text-[15px] leading-5 font-semibold">
          {formatoSemana(lunes)}
        </h3>
        <div className="flex gap-2">
          <button type="button" className={botonSecundario} onClick={() => setDesplazamiento((d) => d - 1)}>
            <ChevronLeft size={16} aria-hidden="true" />
            <span className="sr-only md:not-sr-only">Semana anterior</span>
          </button>
          <button
            type="button"
            className={botonSecundario}
            disabled={desplazamiento === 0}
            onClick={() => setDesplazamiento(0)}
          >
            <CalendarCheck size={16} aria-hidden="true" />
            Esta semana
          </button>
          <button type="button" className={botonSecundario} onClick={() => setDesplazamiento((d) => d + 1)}>
            <span className="sr-only md:not-sr-only">Semana siguiente</span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <p className="mt-2 text-[12px] leading-4 text-tenue">
        Muestra todas las entregas de la semana: el filtro y la búsqueda solo cambian la lista de abajo.
      </p>
      <ol className="mt-3 grid gap-2 lg:grid-cols-7">
        {entregasDeLaSemana(entregas, lunes).map(({ dia, entregas: delDia }) => {
          const esHoy = dia === hoy;
          return (
            <li
              key={dia}
              aria-current={esHoy ? 'date' : undefined}
              className={`min-w-0 rounded-[10px] p-2.5 ${esHoy ? 'bg-acento-suave ring-2 ring-acento' : 'bg-fondo'}`}
            >
              <p className="flex items-center justify-between gap-2 text-[13px] leading-[18px] font-semibold">
                <span className={esHoy ? 'text-acento' : ''}>{formatoDiaSemana(dia)}</span>
                {esHoy && (
                  <span className="rounded-full bg-acento px-2 text-[12px] leading-5 font-semibold text-sobre-acento">Hoy</span>
                )}
              </p>
              {delDia.length === 0 ? (
                <p className="mt-1.5 text-[12px] leading-4 text-tenue">Sin entregas</p>
              ) : (
                // grid-cols-1 (minmax(0, 1fr)) deja que la tarjeta se ajuste a la columna en vez de desbordarla.
                <ul className="mt-2 grid grid-cols-1 gap-2">
                  {delDia.map((e) => {
                    const materia = porId.get(e.materia);
                    return (
                      <li key={e.id} className="rounded-lg border border-borde bg-tarjeta p-2">
                        <p
                          className={`text-[13px] leading-[18px] font-medium break-words ${e.hecha ? 'text-tenue line-through' : ''}`}
                        >
                          {e.texto}
                        </p>
                        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[12px] leading-4 text-tenue">
                          {materia && <PuntoMateria color={materia.color} />}
                          <span className="truncate" title={materia?.nombre}>
                            {materia?.nombre ?? 'Materia eliminada'}
                          </span>
                        </p>
                        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <EtiquetaEstado estado={estadoEntrega(e, ahora)} />
                          <span className="text-[12px] leading-4 whitespace-nowrap text-tenue">{formatoHora(e.fecha)}</span>
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
