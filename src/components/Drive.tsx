import { useState } from 'react';
import { abrirEnlace } from '../lib/enlaces.ts';
import type { DriveLink } from '../lib/tipos.ts';
import { boton, botonQuitar, botonSuave, campo, fila, formulario, formularioArriba, tituloFila } from './estilos.ts';
import Tarjeta from './Tarjeta.tsx';

interface Props {
  enlaces: DriveLink[];
  onAgregar: (nombre: string, url: string) => void;
  onQuitar: (id: string) => void;
}

export default function Drive({ enlaces, onAgregar, onQuitar }: Props) {
  const [nombre, setNombre] = useState('');
  const [url, setUrl] = useState('');

  const guardar = () => {
    const nombreLimpio = nombre.trim();
    const urlLimpia = url.trim();
    if (!nombreLimpio || !urlLimpia) {
      window.alert('Escribe un nombre y un enlace.');
      return;
    }
    onAgregar(nombreLimpio, urlLimpia);
    setNombre('');
    setUrl('');
  };

  return (
    <Tarjeta titulo="Drive" pista="Acceso rápido a tu Drive y a carpetas que uses seguido.">
      <div className={formularioArriba}>
        <button type="button" className={`${botonSuave} w-full`} onClick={() => abrirEnlace('https://drive.google.com')}>
          Abrir Google Drive
        </button>
      </div>
      <ul>
        {enlaces.map((l) => (
          <li key={l.id} className={fila}>
            <span className={tituloFila}>{l.nombre}</span>
            <button type="button" className={boton} aria-label={`Abrir ${l.nombre}`} onClick={() => abrirEnlace(l.url)}>
              Abrir
            </button>
            <button
              type="button"
              className={botonQuitar}
              title="Quitar"
              aria-label={`Quitar ${l.nombre}`}
              onClick={() => onQuitar(l.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div className={formulario}>
        <input
          type="text"
          className={campo}
          placeholder="Nombre (ej. Carpeta de PETI)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input type="text" className={campo} placeholder="Enlace" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button type="button" className={boton} onClick={guardar}>
          Guardar
        </button>
      </div>
    </Tarjeta>
  );
}
