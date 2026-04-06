import type { Metadata } from 'next'
import RankingsJsonLd from '@/components/RankingsJsonLd'
import RankingsView from '@/components/RankingsView'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  OG_IMAGE_ALT,
  SITE_NAME,
  TWITTER_SITE,
} from '@/lib/seo'

export const metadata: Metadata = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: '/',
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ['/opengraph-image'],
    ...(TWITTER_SITE ? { site: TWITTER_SITE, creator: TWITTER_SITE } : {}),
  },
}

export default function Home() {
  return (
    <>
      <RankingsJsonLd path="/" />
      <RankingsView />
    </>
  )
}
