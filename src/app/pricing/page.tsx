'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import SiteHeader from '@/components/SiteHeader'

export default function PricingPage() {
  const { status } = useSession()
  const router = useRouter()
  const [isYearly, setIsYearly] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [paypalConfig, setPaypalConfig] = useState<{
    clientId: string
    currency: string
    intent: 'capture' | 'authorize'
  } | null>(null)
  const [paypalConfigLoading, setPaypalConfigLoading] = useState(true)
  const [paypalConfigError, setPaypalConfigError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadPaypalConfig = async () => {
      try {
        setPaypalConfigLoading(true)
        setPaypalConfigError(null)

        const response = await fetch('/api/paypal/config')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load PayPal config')
        }
        if (!data?.clientId) {
          throw new Error('PayPal client id missing')
        }

        if (!cancelled) {
          setPaypalConfig({
            clientId: data.clientId,
            currency: data.currency || 'USD',
            intent: data.intent === 'authorize' ? 'authorize' : 'capture',
          })
        }
      } catch (error) {
        if (!cancelled) {
          setPaypalConfigError(error instanceof Error ? error.message : 'Failed to load PayPal config')
        }
      } finally {
        if (!cancelled) {
          setPaypalConfigLoading(false)
        }
      }
    }

    void loadPaypalConfig()
    return () => {
      cancelled = true
    }
  }, [])

  const plans = [
    {
      key: 'free',
      name: 'Free',
      description: 'Perfect for casual snooker fans',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        { text: 'Current World Rankings', included: true },
        { text: 'Current Season Schedule', included: true },
        { text: 'Recent Match Results', included: true },
        { text: 'Live Data (24h delay)', included: false },
        { text: 'Ad-supported Experience', included: false },
      ],
      cta: 'Current Plan',
      featured: false,
    },
    {
      key: 'pro',
      name: 'Pro',
      description: 'For dedicated snooker enthusiasts',
      monthlyPrice: 2.99,
      yearlyPrice: 29.99,
      features: [
        { text: 'All Free Features', included: true },
        { text: 'Real-time Data Updates', included: true },
        { text: 'Historical Data (5 Years)', included: true },
        { text: 'Player Comparison Tool', included: true },
        { text: 'Ad-free Experience', included: true },
        { text: 'Match Notifications', included: true },
      ],
      cta: 'Start 7-Day Free Trial',
      featured: true,
      badge: 'Best value',
      highlight: 'Save $5.89/year vs monthly',
    },
    {
      key: 'premium',
      name: 'Premium',
      description: 'For professionals & media outlets',
      monthlyPrice: 6.99,
      yearlyPrice: 69.99,
      features: [
        { text: 'All Pro Features', included: true },
        { text: 'Unlimited Historical Data', included: true },
        { text: 'Advanced Analytics Dashboard', included: true },
        { text: 'AI Prediction Models', included: true },
        { text: 'Data Export (CSV/Excel)', included: true },
        { text: 'API Access (500/month)', included: true },
      ],
      cta: 'Subscribe Now',
      featured: false,
    },
  ]

  const handlePlanSelect = (plan: string) => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/pricing')
      return
    }
    setSelectedPlan(plan)
  }

  const currentPrice = (plan: (typeof plans)[0]) => {
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice
  }

  const period = isYearly ? '/year' : '/month'

  const yearlySavings =
    plans.find((p) => p.key === 'pro')!.monthlyPrice * 12 -
    plans.find((p) => p.key === 'pro')!.yearlyPrice
  const yearlyPct = Math.round(
    (yearlySavings / (plans.find((p) => p.key === 'pro')!.monthlyPrice * 12)) * 100
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-snooker-green/90 to-gray-950">
      <SiteHeader
        title="Choose your plan"
        subtitle="Unlock premium snooker data and analytics"
        showBack
        showPricingLink={false}
      />

      <div className="container mx-auto px-4 pt-6 pb-16 max-w-7xl">
        {/* Billing toggle + cards as one visual group */}
        <div className="max-w-6xl mx-auto mb-10 rounded-2xl border border-snooker-gold/20 bg-black/25 p-4 sm:p-6 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 py-2">
            <span className={`font-semibold ${!isYearly ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isYearly}
                onChange={(e) => setIsYearly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-snooker-gold/50 rounded-full peer peer-checked:bg-snooker-green peer-checked:ring-1 peer-checked:ring-snooker-gold/40 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-7" />
            </label>
            <span className={`font-semibold flex flex-wrap items-center justify-center gap-2 ${isYearly ? 'text-white' : 'text-gray-500'}`}>
              Yearly
              <span className="bg-snooker-gold/20 text-snooker-gold text-xs px-2.5 py-1 rounded-full border border-snooker-gold/30">
                Save ~{yearlyPct}% on Pro
              </span>
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mt-8">
            {plans.map((plan) => (
              <div
                key={plan.key}
                className={`relative rounded-2xl p-6 sm:p-8 flex flex-col border transition-shadow duration-300 ${
                  plan.featured
                    ? 'bg-gradient-to-b from-snooker-green/80 to-gray-900/90 border-snooker-gold/50 shadow-lg shadow-snooker-gold/10 md:-translate-y-1 md:shadow-xl'
                    : 'bg-white/5 border-white/10 hover:border-snooker-gold/25'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-snooker-gold text-snooker-green text-xs font-bold px-4 py-1 rounded-full shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  <p className={`text-sm mt-2 ${plan.featured ? 'text-gray-200' : 'text-gray-400'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-xl font-medium text-gray-400">$</span>
                    <span className="text-5xl font-bold text-white tabular-nums">{currentPrice(plan).toFixed(2)}</span>
                  </div>
                  <span className="text-sm text-gray-400">{period}</span>
                  {plan.highlight && <p className="text-snooker-gold/90 text-xs mt-2 font-medium">{plan.highlight}</p>}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className={`flex items-start gap-3 text-sm ${
                        feature.included ? (plan.featured ? 'text-gray-100' : 'text-gray-300') : 'text-gray-600'
                      }`}
                    >
                      {feature.included ? (
                        <span className="text-emerald-400 shrink-0 mt-0.5" aria-hidden>
                          ✓
                        </span>
                      ) : (
                        <span className="text-gray-600 shrink-0 mt-0.5" aria-hidden>
                          —
                        </span>
                      )}
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                {plan.key === 'free' ? (
                  <button
                    type="button"
                    className="w-full py-3.5 px-4 bg-white/10 text-white rounded-xl font-semibold border border-white/10 hover:bg-white/15 transition-colors"
                  >
                    {plan.cta}
                  </button>
                ) : selectedPlan === plan.key ? (
                  <div className="space-y-4">
                    <p className="text-center text-gray-300 text-sm">
                      {plan.name} · {isYearly ? 'Yearly' : 'Monthly'}
                    </p>
                    {paypalConfigLoading ? (
                      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center text-sm text-gray-300">
                        Loading PayPal…
                      </div>
                    ) : paypalConfigError || !paypalConfig ? (
                      <div className="rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-4 text-center text-sm text-red-200">
                        PayPal unavailable: {paypalConfigError || 'invalid config'}
                      </div>
                    ) : (
                      <PayPalScriptProvider
                        options={{
                          clientId: paypalConfig.clientId,
                          currency: paypalConfig.currency,
                          intent: paypalConfig.intent,
                          components: 'buttons',
                        }}
                      >
                        <PayPalButtons
                          style={{ layout: 'vertical' }}
                          createOrder={async () => {
                            const response = await fetch('/api/subscription', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                plan: plan.key,
                                billingCycle: isYearly ? 'yearly' : 'monthly',
                              }),
                            })

                            if (!response.ok) {
                              throw new Error('Failed to create order')
                            }

                            const data = await response.json()
                            return data.orderID
                          }}
                          onApprove={async (data) => {
                            try {
                              const response = await fetch('/api/subscription/approve', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  orderID: data.orderID,
                                  plan: plan.key,
                                  billingCycle: isYearly ? 'yearly' : 'monthly',
                                }),
                              })

                              const result = await response.json()

                              if (result.success) {
                                alert('Subscription successful. Thank you for your support!')
                                router.push('/')
                              } else {
                                throw new Error(result.error || 'Approval failed')
                              }
                            } catch {
                              alert('Payment processing failed. Please contact support.')
                            } finally {
                              setSelectedPlan(null)
                            }
                          }}
                          onError={() => {
                            alert('Payment failed. Please try again or contact support.')
                            setSelectedPlan(null)
                          }}
                          onCancel={() => setSelectedPlan(null)}
                        />
                      </PayPalScriptProvider>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePlanSelect(plan.key)}
                    className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-colors ${
                      plan.featured
                        ? 'bg-gradient-to-r from-snooker-gold to-amber-400 text-snooker-green hover:from-amber-300 hover:to-amber-300 shadow-md shadow-amber-900/20'
                        : 'bg-white/10 text-white border border-white/10 hover:bg-white/15'
                    }`}
                  >
                    {plan.cta}
                  </button>
                )}

                {plan.yearlyPrice > 0 && selectedPlan !== plan.key && (
                  <p className="text-center text-gray-500 text-xs mt-3">Also available at ${plan.monthlyPrice}/mo</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Comparison */}
        <div className="max-w-6xl mx-auto mb-16 rounded-2xl border border-white/10 bg-black/20 p-6 sm:p-8 backdrop-blur-sm overflow-hidden">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Compare features</h2>
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th
                    scope="col"
                    className="text-left py-3 px-3 text-gray-400 font-semibold sticky left-0 bg-gray-950/95 z-10 backdrop-blur-sm"
                  >
                    Feature
                  </th>
                  <th scope="col" className="text-center py-3 px-2 text-white font-semibold">
                    Free
                  </th>
                  <th scope="col" className="text-center py-3 px-2 text-snooker-gold font-semibold">
                    Pro
                  </th>
                  <th scope="col" className="text-center py-3 px-2 text-amber-200/90 font-semibold">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {[
                  { feature: 'Current World Rankings', free: true, pro: true, premium: true },
                  { feature: 'Current Season Schedule', free: true, pro: true, premium: true },
                  { feature: 'Recent Match Results', free: true, pro: true, premium: true },
                  { feature: 'Real-time Data Updates', free: false, pro: true, premium: true },
                  { feature: 'Historical Data', free: false, pro: '5 Years', premium: 'Unlimited' },
                  { feature: 'Player Comparison', free: false, pro: true, premium: true },
                  { feature: 'Advanced Analytics', free: false, pro: false, premium: true },
                  { feature: 'Prediction Models', free: false, pro: false, premium: true },
                  { feature: 'Data Export', free: false, pro: false, premium: true },
                  { feature: 'API Access', free: false, pro: false, premium: '500/month' },
                  { feature: 'Ads', free: 'Yes', pro: 'No', premium: 'No' },
                  { feature: 'Simultaneous Devices', free: '1', pro: '2', premium: '3' },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/[0.04]">
                    <th
                      scope="row"
                      className="py-3 px-3 text-left font-normal text-gray-300 sticky left-0 bg-gray-950/90 z-10 backdrop-blur-sm"
                    >
                      {row.feature}
                    </th>
                    <td className="text-center py-3 px-2">{cellCheck(row.free)}</td>
                    <td className="text-center py-3 px-2">{cellCheck(row.pro, 'pro')}</td>
                    <td className="text-center py-3 px-2">{cellCheck(row.premium, 'premium')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-8">FAQ</h2>
        <div className="max-w-2xl mx-auto space-y-3 mb-16">
          <FAQItem
            question="How do I cancel my subscription?"
            answer="Cancel anytime from your account settings. Access continues until the end of the paid period."
          />
          <FAQItem
            question="Do you offer refunds?"
            answer="Full refund within 7 days of purchase. Contact support with your PayPal receipt."
          />
          <FAQItem
            question="Can I upgrade or downgrade my plan?"
            answer="Upgrades can be done anytime (prorated where applicable). Downgrades apply from the next billing cycle."
          />
          <FAQItem
            question="What payment methods do you accept?"
            answer="PayPal and major cards supported by PayPal. Additional methods may be added later."
          />
          <FAQItem
            question="Do you offer student discounts?"
            answer="Contact support with valid student verification; we may offer limited-time promotions on Pro."
          />
        </div>

        <div className="max-w-xl mx-auto text-center rounded-2xl border border-snooker-gold/25 bg-snooker-green/30 p-8">
          <h3 className="text-xl font-bold text-white mb-2">Ready to subscribe?</h3>
          <p className="text-gray-300 text-sm mb-6">Start with Pro for the best balance of features and price.</p>
          <button
            type="button"
            onClick={() => handlePlanSelect('pro')}
            className="inline-flex justify-center py-3 px-8 rounded-xl bg-gradient-to-r from-snooker-gold to-amber-400 text-snooker-green font-semibold hover:from-amber-300 hover:to-amber-300 transition-colors"
          >
            Start 7-Day Free Trial
          </button>
          <p className="text-gray-500 text-xs mt-4">PayPal · Cancel anytime</p>
        </div>
      </div>

      <footer className="border-t border-white/10 py-6 bg-black/20">
        <p className="text-center text-gray-500 text-sm">Next.js · Tailwind · Cloudflare</p>
      </footer>
    </main>
  )
}

function cellCheck(val: boolean | string, tier?: 'pro' | 'premium'): ReactNode {
  if (val === true) return <span className="text-emerald-400">✓</span>
  if (val === false) return <span className="text-gray-600">—</span>
  return (
    <span className={tier === 'pro' ? 'text-snooker-gold' : tier === 'premium' ? 'text-amber-200/90' : 'text-gray-400'}>
      {val}
    </span>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <button
        type="button"
        className="w-full px-5 py-4 text-left text-white font-medium flex justify-between items-center gap-3 hover:bg-white/5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <svg
          className={`w-5 h-5 shrink-0 text-snooker-gold transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{answer}</div>}
    </div>
  )
}
