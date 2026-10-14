import { abrirEnlace } from '../lib/enlaces.ts';
import EnlacesPorMateria, { type PropsSeccionEnlaces } from './EnlacesPorMateria.tsx';
import { botonSuave, formularioArriba } from './estilos.ts';
import Tarjeta from './Tarjeta.tsx';

export default function Classroom(props: PropsSeccionEnlaces) {
  return (
    <Tarjeta titulo="Classroom" pista="Clase de cada materia en Google Classroom.">
      <div className={formularioArriba}>
        <button type="button" className={`${botonSuave} w-full`} onClick={() => abrirEnlace('https://classroom.google.com')}>
          Abrir Google Classroom
        </button>
      </div>
      <EnlacesPorMateria {...props} campo="classroom" />
    </Tarjeta>
  );
}
