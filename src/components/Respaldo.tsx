import { useRef } from 'react';
import { interpretar } from '../lib/almacen.ts';
import type { Datos } from '../lib/tipos.ts';
import { botonSuave } from './estilos.ts';
import Tarjeta from './Tarjeta.tsx';

interface Props {
  datos: Datos;
  onImportar: (datos: Datos) => void;
}

export default function Respaldo({ datos, onImportar }: Props) {
  const entrada = useRef<HTMLInputElement>(null);

  const exportar = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `mi-u-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    enlace.click();
    URL.revokeObjectURL(url);
  };

  const importar = async (archivo: File | undefined) => {
    if (!archivo) return;
    const nuevos = interpretar(await archivo.text());
    if (!nuevos) window.alert('El archivo no es un respaldo válido de Mi U.');
    else if (window.confirm('Esto reemplazará todos tus datos actuales con los del archivo. ¿Continuar?')) onImportar(nuevos);
    if (entrada.current) entrada.current.value = ''; // permite volver a elegir el mismo archivo
  };

  return (
    <Tarjeta titulo="Respaldo" pista="Guarda tus datos en un archivo o restáuralos en otro navegador o equipo.">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={botonSuave} onClick={exportar}>
          Exportar JSON
        </button>
        <button type="button" className={botonSuave} onClick={() => entrada.current?.click()}>
          Importar JSON
        </button>
        <input
          ref={entrada}
          type="file"
          accept="application/json,.json"
          aria-label="Archivo de respaldo"
          hidden
          onChange={(e) => importar(e.target.files?.[0])}
        />
      </div>
    </Tarjeta>
  );
}
