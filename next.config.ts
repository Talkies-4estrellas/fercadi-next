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
    remotePatterns: [
      // Las imágenes de productos vienen de dominios externos variados (importadas
      // desde CSV), por lo que se permite cualquier host HTTPS. HTTP queda bloqueado.
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
