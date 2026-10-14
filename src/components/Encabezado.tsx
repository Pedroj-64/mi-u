import { formatoEncabezado } from '../lib/fechas.ts';

export default function Encabezado({ ahora }: { ahora: number }) {
  return (
    <header className="px-4 pt-9 pb-3 text-center">
      <h1 className="text-[30px] font-bold tracking-[-0.5px]">Mi U</h1>
      <p className="mt-1.5 text-tenue capitalize">{formatoEncabezado(ahora)}</p>
    </header>
  );
}
