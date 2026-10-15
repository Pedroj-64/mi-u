import { Video } from 'lucide-react';
import EnlacesPorMateria, { type PropsSeccionEnlaces } from './EnlacesPorMateria.tsx';
import Tarjeta from './Tarjeta.tsx';

export default function ClasesVirtuales({ className, ...props }: PropsSeccionEnlaces) {
  return (
    <Tarjeta titulo="Clases virtuales" pista="Enlace de Meet, Zoom o Teams de cada materia." icono={Video} className={className}>
      <EnlacesPorMateria {...props} campo="clase" />
    </Tarjeta>
  );
}
