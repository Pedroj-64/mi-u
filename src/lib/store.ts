// Estado de la app fuera de React: cada cambio se guarda enseguida en el almacén, como
// hacía mi-u.html, y la interfaz se suscribe con useSyncExternalStore.
import type { Almacen } from './almacen.ts';
import type { Datos } from './tipos.ts';

export interface EstadoStore {
  datos: Datos;
  /** Mensajes del almacén para el usuario: el de la carga (dura toda la sesión) y el del último guardado. */
  avisos: string[];
}

export interface Store {
  obtener(): EstadoStore;
  suscribir(oyente: () => void): () => void;
  /** Aplica el cambio, lo guarda y avisa a la interfaz. */
  actualizar(cambio: (datos: Datos) => Datos): void;
}

const sinRepetir = (...avisos: (string | null)[]) => [...new Set(avisos.filter((aviso) => aviso !== null))];

export function crearStore(almacen: Almacen): Store {
  let estado: EstadoStore = { datos: almacen.datos, avisos: sinRepetir(almacen.aviso) };
  const oyentes = new Set<() => void>();
  return {
    obtener: () => estado,
    suscribir(oyente) {
      oyentes.add(oyente);
      return () => oyentes.delete(oyente);
    },
    actualizar(cambio) {
      const datos = cambio(estado.datos);
      estado = { datos, avisos: sinRepetir(almacen.aviso, almacen.guardar(datos)) };
      oyentes.forEach((oyente) => oyente());
    },
  };
}
