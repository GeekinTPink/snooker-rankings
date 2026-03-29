'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import LoginButton from '@/components/LoginButton'

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isYearly, setIsYearly] = useState(true) // 默认年付
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const plans = [
    {
      key: 'free',
      name: 'Free',
      description: 'For casual users',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        { text: 'Current World Rankings', included: true },
        { text: 'Current Season Schedule', included: true },
        { text: 'Recent Match Results', included: true },
        { text: 'Live Data (24h delay)', included: false },
        { text: 'With Ads', included: false },
      ],
      cta: 'Current Plan',
      featured: false,
    },
    {
      key: 'pro',
      name: 'Pro',
      description: 'For snooker enthusiasts',
      monthlyPrice: 2.99,
      yearlyPrice: 29.99,
      features: [
        { text: 'All Free Features', included: true },
        { text: 'Real-time Data Updates', included: true },
        { text: 'Historical Data (5 Years)', included: true },
        { text: 'Player Comparison', included: true },
        { text: 'Ad-free Experience', included: true },
        { text: 'Match Notifications', included: true },
      ],
      cta: 'Start 7-Day Free Trial',
      featured: true,
      badge: '最受欢迎 🔥',
    },
    {
      key: 'premium',
      name: 'Premium',
      description: 'For professionals & media',
      monthlyPrice: 6.99,
      yearlyPrice: 69.99,
      features: [
        { text: 'All Pro Features', included: true },
        { text: 'Full Historical Data', included: true },
        { text: 'Advanced Analytics', included: true },
        { text: 'Prediction Models', included: true },
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
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        currency: 'CNY',
        intent: 'capture',
      }}
    >
      <main className="min-h-screen bg-gradient-to-b from-snooker-green to-gray-900">
        {/* Header */}
        <header className="bg-snooker-green border-b border-snooker-gold/30">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Rankings
                </button>
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  🎱 Choose Your Subscription
                </h1>
              </div>
              <LoginButton />
            </div>
            <p className="text-xl text-gray-300 text-center max-w-2xl mx-auto">
              Get comprehensive snooker data, from live rankings to deep analytics
            </p>
          </div>
        </header>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 py-12">
          <span className={`font-medium ${!isYearly ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isYearly}
              onChange={(e) => setIsYearly(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className={`font-medium flex items-center gap-2 ${isYearly ? 'text-white' : 'text-gray-400'}`}>
            Yearly
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Save 20%</span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.key}
                className={`rounded-2xl p-8 transition-all duration-300 card-hover ${
                  plan.featured
                    ? 'bg-gradient-to-b from-blue-900 to-gray-800 border-2 border-blue-500 relative'
                    : 'bg-gray-800 border border-gray-700'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-sm px-4 py-1 rounded-full font-medium">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className={`text-sm ${plan.featured ? 'text-gray-300' : 'text-gray-400'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">
                    ${currentPrice(plan)}
                  </span>
                  <span className={plan.featured ? 'text-gray-300' : 'text-gray-400'}>
                    {period}
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className={`flex items-center gap-3 ${
                        feature.included
                          ? plan.featured
                            ? 'text-gray-200'
                            : 'text-gray-300'
                          : 'text-gray-400'
                      }`}
                    >
                      {feature.included ? (
                        <svg
                          className="w-5 h-5 text-green-500 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-600 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {feature.text}
                    </li>
                  ))}
                </ul>

                {plan.key === 'free' ? (
                  <button className="w-full py-3 px-6 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors">
                    当前计划
                  </button>
                ) : selectedPlan === plan.key ? (
                  <div className="space-y-3">
                    <div className="text-center text-gray-300 text-sm">
                      {plan.name} - {isYearly ? '年付' : '月付'}
                    </div>
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
                  </div>
                ) : (
                  <button
                    onClick={() => handlePlanSelect(plan.key)}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      plan.featured
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    {plan.cta}
                  </button>
                )}

                {plan.yearlyPrice > 0 && selectedPlan !== plan.key && (
                  <p className="text-center text-gray-400 text-xs mt-3">
                    Yearly: ${plan.yearlyPrice} (Save ${(plan.monthlyPrice * 12 - plan.yearlyPrice).toFixed(2)})
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Feature Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                    <th className="text-center py-4 px-4 text-white font-medium">Free</th>
                    <th className="text-center py-4 px-4 text-blue-400 font-medium">Pro</th>
                    <th className="text-center py-4 px-4 text-purple-400 font-medium">Premium</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-4">Current World Rankings</td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-500">✓</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-500">✓</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-500">✓</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-4">Real-time Data</td>
                    <td className="text-center py-4 px-4">
                      <span className="text-gray-600">✗</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-500">✓</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-500">✓</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-4">Historical Data</td>
                    <td className="text-center py-4 px-4">
                      <span className="text-gray-600">✗</span>
                    </td>
                    <td className="text-center py-4 px-4">5 Years</td>
                    <td className="text-center py-4 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-4">Player Comparison</td>
                    <td className="text-center py-4 px-4">
                      <span className="text-gray-600">✗</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-500">✓</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-500">✓</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-4">Advanced Analytics</td>
                    <td className="text-center py-4 px-4">
                      <span className="text-gray-600">✗</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-gray-600">✗</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-500">✓</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-4">Prediction Models</td>
                    <td className="text-center py-4 px-4">
                      <span className="text-gray-600">✗</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-gray-600">✗</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-500">✓</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-4">Data Export</td>
                    <td className="text-center py-4 px-4">
                      <span className="text-gray-600">✗</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-gray-600">✗</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-500">✓</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-4">API Access</td>
                    <td className="text-center py-4 px-4">
                      <span className="text-gray-600">✗</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-gray-600">✗</span>
                    </td>
                    <td className="text-center py-4 px-4">500 次/月</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-4">Ads</td>
                    <td className="text-center py-4 px-4">Yes</td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-500">No</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-500">No</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4">Simultaneous Devices</td>
                    <td className="text-center py-4 px-4">1</td>
                    <td className="text-center py-4 px-4">2</td>
                    <td className="text-center py-4 px-4">3</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">FAQ</h2>
          <div className="space-y-4">
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
        <div className="max-w-4xl mx-auto px-4 pb-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
          <p className="text-gray-300 mb-8">Join thousands of snooker fans and get access to comprehensive data analytics</p>
          <button
            onClick={() => handlePlanSelect('pro')}
            className="inline-block py-3 px-8 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Start 7-Day Free Trial
          </button>
          <p className="text-gray-400 text-sm mt-4">PayPal & Credit Cards Accepted · Cancel Anytime</p>
        </div>

        {/* Footer */}
        <footer className="bg-snooker-green/50 border-t border-white/10 py-6">
          <div className="container mx-auto px-4 text-center text-gray-400">
            <p className="mt-2 text-sm">
              Built with Next.js + Tailwind CSS | Deployed on Cloudflare
            </p>
          </div>
        </footer>

        <style jsx>{`
          .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          }
        `}</style>
      </main>
    </PayPalScriptProvider>
  )
}

// FAQ Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <button
        className="w-full px-6 py-4 text-left text-white font-medium flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {question}
        <svg
          className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="px-6 pb-4 text-gray-300">{answer}</div>}
    </div>
  )
}
