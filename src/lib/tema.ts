export type Tema = 'sistema' | 'claro' | 'oscuro';

export const CLAVE_TEMA = 'mi-u-tema';
export const TEMAS: Tema[] = ['sistema', 'claro', 'oscuro'];

export function leerTema(): Tema {
  try {
    const guardado = localStorage.getItem(CLAVE_TEMA);
    return TEMAS.find((t) => t === guardado) ?? 'sistema';
  } catch {
    return 'sistema'; // localStorage bloqueado: se sigue la preferencia del sistema
  }
}

/** "sistema" quita el atributo y deja que `color-scheme: light dark` siga al navegador. */
export function aplicarTema(tema: Tema) {
  if (tema === 'sistema') delete document.documentElement.dataset.tema;
  else document.documentElement.dataset.tema = tema;
  try {
    if (tema === 'sistema') localStorage.removeItem(CLAVE_TEMA);
    else localStorage.setItem(CLAVE_TEMA, tema);
  } catch {
    // Sin almacenamiento, el tema vale solo para esta sesión.
  }
}
