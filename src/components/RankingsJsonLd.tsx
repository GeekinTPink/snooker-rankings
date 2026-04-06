import { players, PUBLIC_PREVIEW_COUNT, TOP_DISPLAY_COUNT } from '@/data/rankings'
import { resolveSiteOrigin } from '@/lib/site'

type RankingsJsonLdProps = {
  /** URL path for this page’s WebPage entity (`/` or `/rankings`). */
  path: '/' | '/rankings'
}

/**
 * Public SEO view matches the first N rows shown to guests (see RankingsView).
 */
export default function RankingsJsonLd({ path }: RankingsJsonLdProps) {
  const origin = resolveSiteOrigin()
  if (!origin) return null

  const preview = players.slice(0, PUBLIC_PREVIEW_COUNT)
  const pageUrl = path === '/' ? `${origin}/` : `${origin}/rankings`

  const itemListElement = preview.map((p, i) => ({
    '@type': 'ListItem' as const,
    position: p.rank ?? i + 1,
    item: {
      '@type': 'Person',
      name: p.name,
      nationality: {
        '@type': 'Country',
        name: p.country,
      },
    },
  }))

  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      url: origin,
      name: 'World Snooker Rankings',
      description:
        'World snooker world rankings from WST Gamechanger data: free top 16 preview; sign in for the full top 64.',
      publisher: { '@id': `${origin}/#website` },
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: 'World Snooker Rankings',
      description:
        'WST-style world rankings: ranks 1–16 without signing in; ranks 1–64 after Google sign-in.',
      isPartOf: { '@id': `${origin}/#website` },
      about: { '@type': 'Thing', name: 'World Snooker Tour world rankings' },
      mainEntity: { '@id': `${pageUrl}#itemlist` },
    },
    {
      '@type': 'ItemList',
      '@id': `${pageUrl}#itemlist`,
      name: `World snooker rankings — top ${PUBLIC_PREVIEW_COUNT} (public preview of ${TOP_DISPLAY_COUNT})`,
      numberOfItems: preview.length,
      itemListElement,
    },
  ]

  const payload = {
    '@context': 'https://schema.org',
    '@graph': graph,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}
