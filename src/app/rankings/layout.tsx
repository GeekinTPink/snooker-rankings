import type { Metadata } from 'next'
import {
  OG_IMAGE_ALT,
  RANKINGS_DESCRIPTION,
  RANKINGS_TITLE,
  SITE_NAME,
  TWITTER_SITE,
} from '@/lib/seo'

export const metadata: Metadata = {
  title: RANKINGS_TITLE,
  description: RANKINGS_DESCRIPTION,
  alternates: {
    canonical: '/rankings',
  },
  openGraph: {
    title: RANKINGS_TITLE,
    description: RANKINGS_DESCRIPTION,
    type: 'website',
    url: '/rankings',
    siteName: SITE_NAME,
    locale: 'en_US',
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
    title: RANKINGS_TITLE,
    description: RANKINGS_DESCRIPTION,
    images: ['/opengraph-image'],
    ...(TWITTER_SITE ? { site: TWITTER_SITE, creator: TWITTER_SITE } : {}),
  },
}

export default function RankingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
