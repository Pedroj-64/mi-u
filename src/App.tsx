import { useSyncExternalStore } from 'react';
import AulaMoodle from './components/AulaMoodle.tsx';
import ClasesVirtuales from './components/ClasesVirtuales.tsx';
import Classroom from './components/Classroom.tsx';
import Drive from './components/Drive.tsx';
import Encabezado from './components/Encabezado.tsx';
import Entregas from './components/Entregas.tsx';
import Materias from './components/Materias.tsx';
import Respaldo from './components/Respaldo.tsx';
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
      <Encabezado ahora={ahora} />
      <main className="mx-auto grid max-w-[1100px] grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4 p-4">
        {avisos.map((aviso) => (
          <p
            key={aviso}
            role="alert"
            className="col-span-full rounded-[14px] bg-alerta-suave px-[18px] py-3 text-[13px]"
          >
            {aviso}
          </p>
        ))}
        <Entregas
          entregas={datos.entregas}
          materias={datos.materias}
          ahora={ahora}
          nombreMateria={nombreDe}
          mostrarBotonAvisos={avisosNavegador.mostrarBoton}
          onPedirAvisos={avisosNavegador.pedirPermiso}
          onAgregar={(entrega) => store.actualizar((d) => agregarEntrega(d, entrega))}
          onAlternar={(id) => store.actualizar((d) => alternarEntrega(d, id))}
          onBorrar={(id) => store.actualizar((d) => borrarEntrega(d, id))}
        />
        <ClasesVirtuales materias={datos.materias} onGuardar={guardarEnlaceDe} />
        <AulaMoodle materias={datos.materias} onGuardar={guardarEnlaceDe} />
        <Classroom materias={datos.materias} onGuardar={guardarEnlaceDe} />
        <Drive
          enlaces={datos.drive}
          onAgregar={(nombre, url) => store.actualizar((d) => agregarDrive(d, nombre, url))}
          onQuitar={(id) => store.actualizar((d) => quitarDrive(d, id))}
        />
        <Materias
          materias={datos.materias}
          onAgregar={(nombre) => store.actualizar((d) => agregarMateria(d, nombre))}
          onQuitar={(id) => store.actualizar((d) => quitarMateria(d, id))}
        />
        <Respaldo datos={datos} onImportar={(nuevos) => store.actualizar(() => nuevos)} />
      </main>
    </>
  );
}
