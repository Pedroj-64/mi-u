import { TriangleAlert } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import AulaMoodle from './components/AulaMoodle.tsx';
import ClasesVirtuales from './components/ClasesVirtuales.tsx';
import Classroom from './components/Classroom.tsx';
import Drive from './components/Drive.tsx';
import Encabezado from './components/Encabezado.tsx';
import Entregas from './components/Entregas.tsx';
import Materias from './components/Materias.tsx';
import { useAhora } from './hooks/useAhora.ts';
import { useAvisos } from './hooks/useAvisos.ts';
import {
  agregarDrive,
  agregarEntrega,
  agregarMateria,
  alternarEntrega,
  borrarEntrega,
  guardarEnlace,
  marcarAvisadas,
  nombreMateria,
  quitarDrive,
  quitarMateria,
  type CampoEnlace,
} from './lib/datos.ts';
import { resumenEntregas } from './lib/entregas.ts';
import type { Store } from './lib/store.ts';

export default function App({ store }: { store: Store }) {
  const { datos, avisos } = useSyncExternalStore(store.suscribir, store.obtener);
  const ahora = useAhora();
  const nombreDe = (id: string) => nombreMateria(datos.materias, id);
  const avisosNavegador = useAvisos(datos.entregas, nombreDe, (ids) => store.actualizar((d) => marcarAvisadas(d, ids)));
  const guardarEnlaceDe = (id: string, campo: CampoEnlace, url: string) =>
    store.actualizar((d) => guardarEnlace(d, id, campo, url));

  return (
    <>
      <Encabezado ahora={ahora} resumen={resumenEntregas(datos.entregas, ahora)} />
      {/* Escritorio: Entregas a todo el ancho, luego tres tarjetas de enlaces y luego Drive y Mis materias. */}
      <main className="mx-auto grid max-w-[1120px] gap-4 px-4 pb-10 md:grid-cols-2 md:gap-5 md:px-6 lg:grid-cols-6">
        {avisos.map((aviso) => (
          <div
            key={aviso}
            role="alert"
            className="flex items-start gap-3 rounded-xl bg-aviso-fondo px-4 py-3 text-[14px] leading-5 md:col-span-2 lg:col-span-6"
          >
            <TriangleAlert size={20} className="shrink-0 text-aviso" aria-hidden="true" />
            <p>{aviso}</p>
          </div>
        ))}
        <Entregas
          className="md:col-span-2 lg:col-span-6"
          entregas={datos.entregas}
          materias={datos.materias}
          ahora={ahora}
          mostrarBotonAvisos={avisosNavegador.mostrarBoton}
          onPedirAvisos={avisosNavegador.pedirPermiso}
          onAgregar={(entrega) => store.actualizar((d) => agregarEntrega(d, entrega))}
          onAlternar={(id) => store.actualizar((d) => alternarEntrega(d, id))}
          onBorrar={(id) => store.actualizar((d) => borrarEntrega(d, id))}
        />
        <ClasesVirtuales className="lg:col-span-2" materias={datos.materias} onGuardar={guardarEnlaceDe} />
        <AulaMoodle className="lg:col-span-2" materias={datos.materias} onGuardar={guardarEnlaceDe} />
        <Classroom className="lg:col-span-2" materias={datos.materias} onGuardar={guardarEnlaceDe} />
        <Drive
          className="lg:col-span-3"
          enlaces={datos.drive}
          onAgregar={(nombre, url) => store.actualizar((d) => agregarDrive(d, nombre, url))}
          onQuitar={(id) => store.actualizar((d) => quitarDrive(d, id))}
        />
        <Materias
          className="md:col-span-2 lg:col-span-3"
          materias={datos.materias}
          onAgregar={(nombre) => store.actualizar((d) => agregarMateria(d, nombre))}
          onQuitar={(id) => store.actualizar((d) => quitarMateria(d, id))}
        />
      </main>
    </>
  );
}
