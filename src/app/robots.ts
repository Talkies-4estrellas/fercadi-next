import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fercadi.com'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/perfil', '/checkout', '/pedido-confirmado'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
