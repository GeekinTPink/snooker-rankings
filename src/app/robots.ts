import type { MetadataRoute } from 'next'
import { resolveSiteOrigin } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  const origin = resolveSiteOrigin()
  const sitemapUrl = origin ? `${origin}/sitemap.xml` : undefined

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    ...(sitemapUrl ? { sitemap: sitemapUrl } : {}),
  }
}
