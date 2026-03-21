import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'World Snooker Rankings 2026 - Live Snooker Rankings',
  description: 'Track the latest world snooker rankings for 2026. View player rankings, points, tournament results, and ranking history.',
  keywords: 'snooker rankings, world snooker rankings 2026, snooker players, snooker points, snooker tournament',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
