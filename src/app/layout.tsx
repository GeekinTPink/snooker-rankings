import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.AUTH_URL
const metadataBase =
  siteUrl && /^https?:\/\//i.test(siteUrl) ? new URL(siteUrl) : undefined

export const metadata: Metadata = {
  ...(metadataBase ? { metadataBase } : {}),
  title: {
    default: 'World Snooker Rankings — WST-style world rankings',
    template: '%s | World Snooker Rankings',
  },
  description:
    'World snooker world rankings: top 16 free on the public page; sign in with Google for the full top 64, countries, and prize money. Data from the WST Gamechanger API.',
  keywords:
    'snooker rankings, world snooker rankings, WST, World Snooker Tour, snooker players, prize money rankings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
