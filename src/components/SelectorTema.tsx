import { useState } from 'react';
import { aplicarTema, leerTema, TEMAS, type Tema } from '../lib/tema.ts';

const ETIQUETA: Record<Tema, string> = { sistema: 'Sistema', claro: 'Claro', oscuro: 'Oscuro' };

export default function SelectorTema() {
  const [tema, setTema] = useState<Tema>(leerTema);
  const elegir = (nuevo: Tema) => {
    aplicarTema(nuevo);
    setTema(nuevo);
  };

  return (
    <div role="group" aria-label="Tema" className="inline-flex rounded-full border border-borde bg-tarjeta p-0.5">
      {TEMAS.map((t) => (
        <button
          key={t}
          type="button"
          aria-pressed={tema === t}
          onClick={() => elegir(t)}
          className={`cursor-pointer rounded-full px-3 py-1 text-[12px] transition-colors ${
            tema === t ? 'bg-acento text-sobre-acento' : 'text-tenue hover:text-texto'
          }`}
        >
          {ETIQUETA[t]}
        </button>
      ))}
    </div>
  );
}
