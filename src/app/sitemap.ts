import type { MetadataRoute } from 'next'
import { metadata as rankingsMeta } from '@/data/rankings'
import { resolveSiteOrigin } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = resolveSiteOrigin()
  if (!origin) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[sitemap] No site origin: set NEXT_PUBLIC_SITE_URL or AUTH_URL (or deploy with CF_PAGES_URL) so sitemap.xml is not empty.'
      )
    }
    return []
  }

  const lastModified = rankingsMeta.lastUpdated ? new Date(rankingsMeta.lastUpdated) : new Date()

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${origin}/`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${origin}/rankings`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.95,
    },
  ]

  return entries
}
