import { useEffect, useState } from 'react';

/** Hora actual en ms, renovada cada minuto para que las etiquetas y la fecha no queden viejas. */
export function useAhora(intervaloMs = 60_000): number {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);
  return ahora;
}
