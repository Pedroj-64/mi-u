import { ExternalLink, School } from 'lucide-react';
import { abrirEnlace } from '../lib/enlaces.ts';
import EnlacesPorMateria, { type PropsSeccionEnlaces } from './EnlacesPorMateria.tsx';
import { botonSecundario } from './estilos.ts';
import Tarjeta from './Tarjeta.tsx';

export default function Classroom({ className, ...props }: PropsSeccionEnlaces) {
  return (
    <Tarjeta titulo="Classroom" pista="Clase de cada materia en Google Classroom." icono={School} className={className}>
      <button
        type="button"
        className={`${botonSecundario} mb-4 w-full`}
        onClick={() => abrirEnlace('https://classroom.google.com')}
      >
        <ExternalLink size={16} aria-hidden="true" />
        Abrir Google Classroom
      </button>
      <EnlacesPorMateria {...props} campo="classroom" />
    </Tarjeta>
  );
}
