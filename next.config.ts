import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Acepta peticiones del Mac del equipo y del servidor en LAN durante dev.
  allowedDevOrigins: ['192.168.1.23'],

  // Configuración de imágenes para next/image.
  // - Las imágenes locales en /public/productos/** se sirven automáticamente.
  // - remotePatterns: lista blanca de hosts externos permitidos. Agregar uno
  //   nuevo cada vez que la BD empiece a guardar URLs absolutas de un nuevo CDN.
  // - formats: WebP/AVIF para reducir bytes en producción.
  images: {
    // Las imágenes de productos vienen de Supabase Storage (URLs externas).
    // La optimización server-side de Next añade latencia innecesaria porque
    // tiene que descargar la imagen en el servidor antes de servirla.
    // Con unoptimized:true el <Image> pasa la URL directamente al navegador,
    // igual que un <img> nativo, pero sin perder los atributos width/height/alt.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
