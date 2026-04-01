'use client'

import { useRouter } from 'next/navigation'
import LoginButton from '@/components/LoginButton'

type SiteHeaderProps = {
  title: string
  subtitle?: string
  showBack?: boolean
  showPricingLink?: boolean
}

export default function SiteHeader({
  title,
  subtitle,
  showBack,
  showPricingLink = true,
}: SiteHeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 bg-snooker-green/90 backdrop-blur-md border-b border-snooker-gold/25 shadow-lg shadow-black/20">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 min-w-0 flex-1">
            {showBack && (
              <button
                type="button"
                onClick={() => router.push('/')}
                className="shrink-0 inline-flex items-center gap-2 text-snooker-gold/90 hover:text-snooker-gold text-sm font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Rankings
              </button>
            )}
            <div className="min-w-0 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">{title}</h1>
              {subtitle ? (
                <p className="mt-1 text-sm sm:text-base text-gray-300 max-w-2xl">{subtitle}</p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 shrink-0">
            {showPricingLink && (
              <button
                type="button"
                onClick={() => router.push('/pricing')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-snooker-gold to-amber-400 text-snooker-green font-semibold text-sm shadow-md shadow-amber-900/30 hover:from-amber-300 hover:to-amber-400 transition-all"
              >
                Pricing
              </button>
            )}
            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  )
}
