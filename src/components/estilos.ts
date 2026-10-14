// Clases de Tailwind que reproducen los estilos de mi-u.html.
const botonBase = 'cursor-pointer rounded-lg text-[13px] whitespace-nowrap';

export const boton = `${botonBase} bg-acento px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-35`;
export const botonSuave = `${botonBase} bg-acento-suave px-3 py-2 text-acento`;
export const botonQuitar = `${botonBase} px-2 py-1.5 text-tenue hover:text-texto`;
export const campo = 'w-full rounded-lg border border-borde px-2.5 py-[9px] text-[13px] text-texto';

const filaDeControles = 'flex flex-wrap gap-2 *:min-w-0 *:flex-[1_1_150px]';
export const formulario = `my-3 ${filaDeControles}`;
/** Sin margen superior, como el botón general de Classroom y de Drive. */
export const formularioArriba = `mb-3 ${filaDeControles}`;

export const fila = 'flex items-center gap-2 border-b border-borde py-[9px] last:border-b-0 max-[520px]:flex-wrap';
export const tituloFila = 'min-w-0 flex-1 overflow-hidden text-[14px] font-semibold text-ellipsis';
export const pista = 'mb-[14px] text-[13px] text-tenue';
