import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in',
  description:
    'Sign in with Google for snooker ranks 17–64 with countries and prize money—WST Gamechanger–style list. Visitors keep free top 16; premium options after login.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
