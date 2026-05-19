/**
 * lib/imagen.ts — convención y utilidades para las imágenes del catálogo.
 *
 * Decisión de diseño:
 *   - Las imágenes viven en `public/productos/{seccion}/{archivo}.{ext}`
 *     (ej. `public/productos/concretos/clase-a/fc150.png`).
 *   - En la BD se guarda la RUTA RELATIVA empezando con "/" (ej.
 *     `/productos/concretos/clase-a/fc150.png`). Nada de URLs absolutas
 *     locales del tipo `http://localhost:3000/...`.
 *   - Esta convención garantiza que las imágenes funcionen igual en
 *     desarrollo local, en LAN (192.168.x.x) y en producción, porque
 *     next/image las sirve relativas al dominio donde corre la app.
 *   - Si en el futuro se usan imágenes externas (Cloudinary, S3, etc.),
 *     se permite la URL absoluta tal cual y se debe añadir el host en
 *     `next.config.ts > images.remotePatterns`.
 *
 * Convenciones de naming:
 *   - Slugs en minúsculas, sin acentos, separados por guiones:
 *     "concreto-fc150", "tirol-reforzado".
 *   - Archivos: lowercase ASCII si es posible. Espacios en nombres están
 *     permitidos por compatibilidad histórica (Next/Image los maneja),
 *     pero se desalientan en archivos nuevos.
 *
 * Placeholder:
 *   - Si un producto no tiene imagen, devolvemos undefined y el
 *     componente que la consume decide qué mostrar (típicamente nada
 *     o un fondo gris).
 */

const PLACEHOLDER: string | undefined = undefined;

/**
 * Convierte cualquier referencia de imagen en una ruta que <Image>
 * pueda renderizar sin sorpresas.
 *
 *   - URLs http(s):       devuelve tal cual (asume host autorizado en next.config.ts).
 *   - Empieza con "/":    devuelve tal cual.
 *   - "productos/..":     prefija "/".
 *   - vacío/undefined:    devuelve undefined (sin imagen).
 */
export function resolverImagenProducto(referencia?: string | null): string | undefined {
  if (!referencia) return PLACEHOLDER;
  const trim = referencia.trim();
  if (!trim) return PLACEHOLDER;

  // URLs externas
  if (/^https?:\/\//i.test(trim)) return trim;

  // Rutas absolutas desde /public
  if (trim.startsWith('/')) return trim;

  // Rutas relativas — prefijar con /
  return `/${trim}`;
}

/**
 * Construye la ruta canónica para una imagen del catálogo a partir de
 * sus tres identificadores. Útil cuando creas un producto en el admin
 * y aún no sabes la ruta exacta.
 *
 *   ej. construirRutaImagen('concretos', 'clase-a', 'fc150.png')
 *       → '/productos/concretos/clase-a/fc150.png'
 */
export function construirRutaImagen(
  seccion: string,
  categoria: string,
  archivo: string
): string {
  const safe = (s: string) => s.replace(/^\/+|\/+$/g, '');
  return `/productos/${safe(seccion)}/${safe(categoria)}/${safe(archivo)}`;
}

/**
 * Valida que un string parezca una ruta de imagen razonable.
 * Lo usamos en el admin antes de hacer INSERT/UPDATE.
 */
export function esRutaImagenValida(ruta: string | null | undefined): boolean {
  if (!ruta) return true; // permitir vacío (sin imagen)
  const trim = ruta.trim();
  if (!trim) return true;
  if (/^https?:\/\//i.test(trim)) return true;
  return /^\/?productos\/.+\.(png|jpe?g|webp|gif|svg|avif)$/i.test(trim);
}
