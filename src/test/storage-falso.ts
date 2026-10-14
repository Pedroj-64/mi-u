/** localStorage en memoria para las pruebas; `valores` deja revisar qué quedó guardado. */
export function storageFalso(inicial: Record<string, string> = {}) {
  const valores = new Map(Object.entries(inicial));
  return {
    valores,
    getItem: (clave: string) => valores.get(clave) ?? null,
    setItem: (clave: string, valor: string) => {
      valores.set(clave, valor);
    },
  };
}
