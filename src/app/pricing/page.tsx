'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import LoginButton from '@/components/LoginButton'

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isYearly, setIsYearly] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
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
      badge: 'Best Value 🔥',
      highlight: 'Save $5.89/year',
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

  const currentPrice = (plan: any) => {
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice
  }

  const period = isYearly ? '/year' : '/month'

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-snooker-green to-gray-900">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-snooker-green/80 to-snooker-green/40 backdrop-blur-sm border-b border-snooker-gold/20">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="group flex items-center gap-2 text-gray-300 hover:text-white transition-all"
              >
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Back to Rankings</span>
              </button>
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                🎱 Choose Your Plan
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl">
                Unlock premium snooker data and analytics
              </p>
            </div>
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Billing Toggle */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center gap-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-gray-700">
          <span className={`font-semibold text-lg ${!isYearly ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
          <label className="relative inline-flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={isYearly}
              onChange={(e) => setIsYearly(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-16 h-8 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500"></div>
          </label>
          <span className={`font-semibold text-lg flex items-center gap-3 ${isYearly ? 'text-white' : 'text-gray-400'}`}>
            Yearly
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-3xl p-8 transition-all duration-500 card-hover ${
                plan.featured
                  ? 'bg-gradient-to-b from-blue-900/80 to-purple-900/80 border-2 border-blue-400 shadow-2xl shadow-blue-500/20 scale-105 z-10'
                  : 'bg-gray-800/60 backdrop-blur-sm border border-gray-700 hover:border-gray-600'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan Name & Description */}
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-3">{plan.name}</h3>
                <p className={`text-sm ${plan.featured ? 'text-gray-200' : 'text-gray-400'}`}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl font-semibold text-gray-400">$</span>
                  <span className="text-6xl font-bold text-white">
                    {currentPrice(plan).toFixed(2)}
                  </span>
                </div>
                <span className={`text-sm ${plan.featured ? 'text-gray-300' : 'text-gray-400'}`}>
                  {period}
                </span>
                {plan.highlight && (
                  <p className="text-green-400 text-sm mt-2 font-medium">{plan.highlight}</p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className={`flex items-start gap-3 ${
                      feature.included
                        ? plan.featured
                          ? 'text-gray-100'
                          : 'text-gray-300'
                        : 'text-gray-500'
                    }`}
                  >
                    {feature.included ? (
                      <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="text-sm leading-relaxed">{feature.text}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {plan.key === 'free' ? (
                <button className="w-full py-4 px-6 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all">
                  {plan.cta}
                </button>
              ) : selectedPlan === plan.key ? (
                <div className="space-y-4">
                  <div className="text-center text-gray-300 text-sm font-medium">
                    {plan.name} - {isYearly ? 'Yearly' : 'Monthly'}
                  </div>
                  {paypalConfigLoading ? (
                    <div className="rounded-xl border border-gray-600 bg-gray-700/40 px-4 py-4 text-center text-sm text-gray-300">
                      Loading PayPal...
                    </div>
                  ) : paypalConfigError || !paypalConfig ? (
                    <div className="rounded-xl border border-red-600/40 bg-red-900/20 px-4 py-4 text-center text-sm text-red-200">
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
                          setIsProcessing(true)
                          try {
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
                          } catch (error) {
                            console.error('Create order error:', error)
                            throw error
                          }
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
                              alert('🎉 Subscription successful!\nThank you for your support!')
                              router.push('/')
                            } else {
                              throw new Error(result.error || 'Approval failed')
                            }
                          } catch (error) {
                            console.error('Approve error:', error)
                            alert('Payment processing failed. Please contact support.')
                          } finally {
                            setIsProcessing(false)
                            setSelectedPlan(null)
                          }
                        }}
                        onError={(err) => {
                          console.error('PayPal error:', err)
                          alert('Payment failed. Please try again or contact support.')
                          setIsProcessing(false)
                          setSelectedPlan(null)
                        }}
                        onCancel={() => {
                          setIsProcessing(false)
                          setSelectedPlan(null)
                        }}
                      />
                    </PayPalScriptProvider>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handlePlanSelect(plan.key)}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all ${
                    plan.featured
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/30'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {plan.cta}
                </button>
              )}

              {plan.yearlyPrice > 0 && selectedPlan !== plan.key && (
                <p className="text-center text-gray-500 text-xs mt-4">
                  Also available: ${plan.monthlyPrice}/month
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="container mx-auto px-4 pb-20">
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-3xl p-10 border border-gray-700 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-10">Compare Features</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-5 px-6 text-gray-400 font-semibold text-lg">Feature</th>
                  <th className="text-center py-5 px-6 text-white font-semibold text-lg">Free</th>
                  <th className="text-center py-5 px-6 text-blue-400 font-semibold text-lg">Pro</th>
                  <th className="text-center py-5 px-6 text-purple-400 font-semibold text-lg">Premium</th>
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
                  <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                    <td className="py-5 px-6 text-gray-300">{row.feature}</td>
                    <td className="text-center py-5 px-6">
                      {row.free === true ? (
                        <span className="text-green-400 text-xl">✓</span>
                      ) : row.free === false ? (
                        <span className="text-gray-600 text-xl">✗</span>
                      ) : (
                        <span className="text-gray-400">{row.free}</span>
                      )}
                    </td>
                    <td className="text-center py-5 px-6">
                      {row.pro === true ? (
                        <span className="text-green-400 text-xl">✓</span>
                      ) : row.pro === false ? (
                        <span className="text-gray-600 text-xl">✗</span>
                      ) : (
                        <span className="text-blue-400 font-medium">{row.pro}</span>
                      )}
                    </td>
                    <td className="text-center py-5 px-6">
                      {row.premium === true ? (
                        <span className="text-green-400 text-xl">✓</span>
                      ) : row.premium === false ? (
                        <span className="text-gray-600 text-xl">✗</span>
                      ) : (
                        <span className="text-purple-400 font-medium">{row.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          <FAQItem
            question="How do I cancel my subscription?"
            answer="You can cancel anytime in your account settings. Your subscription will remain active until the end of the current billing period."
          />
          <FAQItem
            question="Do you offer refunds?"
            answer="Full refund available within 7 days of purchase. Contact us at support@snooker-ranking.com"
          />
          <FAQItem
            question="Can I upgrade or downgrade my plan?"
            answer="You can upgrade anytime with prorated pricing. Downgrades will take effect at the end of the current billing period."
          />
          <FAQItem
            question="What payment methods do you accept?"
            answer="We accept PayPal and all major credit cards (Visa, Mastercard, Amex). More payment methods coming soon."
          />
          <FAQItem
            question="Do you offer student discounts?"
            answer="Yes! Students get 50% off Pro plan ($14.99/year). Please verify with your .edu email or student ID."
          />
        </div>
      </div>

      {/* Footer CTA */}
      <div className="container mx-auto px-4 pb-20 text-center">
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-3xl p-12 border border-blue-500/30 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
          <p className="text-gray-300 mb-8 text-lg">Join thousands of snooker fans and get access to comprehensive data analytics</p>
          <button
            onClick={() => handlePlanSelect('pro')}
            className="inline-block py-4 px-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/30"
          >
            Start 7-Day Free Trial
          </button>
          <p className="text-gray-400 text-sm mt-6">PayPal & Credit Cards Accepted · Cancel Anytime</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-snooker-green/30 border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="text-sm">
            Built with Next.js + Tailwind CSS | Deployed on Cloudflare
          </p>
        </div>
      </footer>

      <style jsx>{`
        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </main>
  )
}

// FAQ Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
      <button
        className="w-full px-8 py-5 text-left text-white font-semibold flex justify-between items-center hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg">{question}</span>
        <svg
          className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-8 pb-6 text-gray-300 leading-relaxed animate-fade-in">
          {answer}
        </div>
      )}
    </div>
  )
}
