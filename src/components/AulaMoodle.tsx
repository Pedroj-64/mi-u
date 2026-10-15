import { GraduationCap } from 'lucide-react';
import EnlacesPorMateria, { type PropsSeccionEnlaces } from './EnlacesPorMateria.tsx';
import Tarjeta from './Tarjeta.tsx';

export default function AulaMoodle({ className, ...props }: PropsSeccionEnlaces) {
  return (
    <Tarjeta
      titulo="Aula virtual (Moodle)"
      pista="Aula de cada materia en la plataforma de la universidad."
      icono={GraduationCap}
      className={className}
    >
      <EnlacesPorMateria {...props} campo="moodle" />
    </Tarjeta>
  );
}
