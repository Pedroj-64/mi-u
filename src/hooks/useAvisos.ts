import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { debeAvisar } from '../lib/entregas.ts';
import type { Entrega } from '../lib/tipos.ts';

const REVISAR_CADA_MS = 60_000;

function permisoActual(): NotificationPermission | 'sin-soporte' {
  return typeof Notification === 'undefined' ? 'sin-soporte' : Notification.permission;
}

/**
 * Avisos del navegador como en mi-u.html: con permiso concedido revisa al abrir y cada
 * 60 s, avisa las entregas que toquen según debeAvisar y las marca como avisadas.
 */
export function useAvisos(entregas: Entrega[], nombreMateria: (id: string) => string, marcarAvisadas: (ids: string[]) => void) {
  const [permiso, setPermiso] = useState(permisoActual);
  // Evita repetir un aviso antes de que llegue el estado con `avisada` (por ejemplo, con StrictMode).
  const yaAvisadas = useRef(new Set<string>());

  const revisar = useEffectEvent(() => {
    const ahora = Date.now();
    const avisadas: string[] = [];
    for (const e of entregas) {
      if (!debeAvisar(e, ahora) || yaAvisadas.current.has(e.id)) continue;
      try {
        new Notification('Entrega en menos de 24 h', { body: `${e.texto} · ${nombreMateria(e.materia)}` });
      } catch {
        continue; // Algunos navegadores (Chrome en Android) no dejan crear avisos así; se reintenta luego.
      }
      yaAvisadas.current.add(e.id);
      avisadas.push(e.id);
    }
    if (avisadas.length > 0) marcarAvisadas(avisadas);
  });

  useEffect(() => {
    if (permiso !== 'granted') return;
    revisar();
    const id = setInterval(() => revisar(), REVISAR_CADA_MS);
    return () => clearInterval(id);
  }, [permiso]);

  const pedirPermiso = () => {
    Notification.requestPermission().then(setPermiso);
  };

  return { mostrarBoton: permiso === 'default', pedirPermiso };
}
