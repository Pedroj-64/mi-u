/** Claves de los colores de materia, en el orden fijo de docs/diseno.md. */
export const COLORES_MATERIA = ['orquidea', 'oliva', 'magenta', 'turquesa', 'violeta', 'rosa', 'lima', 'petroleo'] as const;

export type ColorMateria = (typeof COLORES_MATERIA)[number];

export function esColorMateria(valor: unknown): valor is ColorMateria {
  return typeof valor === 'string' && (COLORES_MATERIA as readonly string[]).includes(valor);
}

/** Color para una materia nueva: el primero sin usar; si ya se usan todos, el menos usado (en empate, el primero). */
export function siguienteColor(usados: readonly string[]): ColorMateria {
  const veces = (color: ColorMateria) => usados.filter((u) => u === color).length;
  return COLORES_MATERIA.reduce((mejor, color) => (veces(color) < veces(mejor) ? color : mejor));
}
