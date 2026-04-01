import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'World Snooker Rankings — WST snapshot',
  description:
    'World Snooker Tour–style rankings table: player order, countries, and points (sourced from Wikipedia season pages; refreshed via build).',
  keywords: 'snooker rankings, world snooker rankings, snooker players, snooker points, WST',
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
