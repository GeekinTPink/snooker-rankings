import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'World Snooker Rankings — Top 16 free, full top 64 with sign-in',
  description:
    'WST-style world snooker rankings: ranks 1–16 visible without an account. Sign in with Google to see ranks 17–64 with prize money and countries. Data from the WST Gamechanger rankings API.',
  alternates: {
    canonical: '/rankings',
  },
  openGraph: {
    title: 'World Snooker Rankings',
    description:
      'Top 16 world rankings free; sign in for the full top 64. Updated from official-style WST data.',
    type: 'website',
  },
}

export default function RankingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
