/** Agrega https:// si el enlace no trae protocolo, como mi-u.html. */
export function completarUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/** Abre el enlace en otra pestaña; no hace nada si está vacío. */
export function abrirEnlace(url: string): void {
  if (url) window.open(completarUrl(url), '_blank', 'noopener');
}
