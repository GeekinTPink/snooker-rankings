import { NextResponse } from 'next/server'
import { metadata as rankingsMeta } from '@/data/rankings'
import { resolveSiteOrigin } from '@/lib/site'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Plain Route Handler (not MetadataRoute) so responses are real XML without
 * Next.js RSC Vary headers, which can confuse crawlers and GSC.
 */
export async function GET() {
  const origin = resolveSiteOrigin()
  const headers = {
    'Content-Type': 'text/xml; charset=utf-8',
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  }

  if (!origin) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[sitemap] No site origin: set NEXT_PUBLIC_SITE_URL or AUTH_URL (or CF_PAGES_URL) so sitemap.xml URLs are correct.'
      )
    }
    const empty = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>
`
    return new NextResponse(empty, { status: 200, headers })
  }

  const lastModified = rankingsMeta.lastUpdated ? new Date(rankingsMeta.lastUpdated) : new Date()
  const lastmod = lastModified.toISOString()

  const urls: { loc: string; changefreq: string; priority: string }[] = [
    { loc: `${origin}/`, changefreq: 'daily', priority: '1' },
    { loc: `${origin}/rankings`, changefreq: 'daily', priority: '0.95' },
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

  return new NextResponse(body, { status: 200, headers })
}
