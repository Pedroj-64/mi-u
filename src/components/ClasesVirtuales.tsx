import EnlacesPorMateria, { type PropsSeccionEnlaces } from './EnlacesPorMateria.tsx';
import Tarjeta from './Tarjeta.tsx';

export default function ClasesVirtuales(props: PropsSeccionEnlaces) {
  return (
    <Tarjeta titulo="Clases virtuales" pista="Enlace de Meet, Zoom o Teams de cada materia.">
      <EnlacesPorMateria {...props} campo="clase" />
    </Tarjeta>
  );
}
