import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in',
  description:
    'Sign in with Google to unlock ranks 17–64 of the world snooker rankings and optional premium features.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
