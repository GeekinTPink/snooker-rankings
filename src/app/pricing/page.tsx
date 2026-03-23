'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LoginButton from '@/components/LoginButton'

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    {
      key: 'free',
      name: 'Free',
      description: '适合偶尔查看排名的用户',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        { text: '当前世界排名', included: true },
        { text: '本赛季赛程表', included: true },
        { text: '近期比赛结果', included: true },
        { text: '实时数据（延迟 24 小时）', included: false },
        { text: '含广告', included: false },
      ],
      cta: '当前计划',
      featured: false,
    },
    {
      key: 'pro',
      name: 'Pro',
      description: '适合斯诺克爱好者',
      monthlyPrice: 19,
      yearlyPrice: 199,
      features: [
        { text: 'Free 全部功能', included: true },
        { text: '实时数据更新', included: true },
        { text: '历史数据（5 年）', included: true },
        { text: '球员对比功能', included: true },
        { text: '无广告体验', included: true },
        { text: '比赛提醒推送', included: true },
      ],
      cta: '免费试用 7 天',
      featured: true,
      badge: '最受欢迎 🔥',
    },
    {
      key: 'premium',
      name: 'Premium',
      description: '适合专业分析师/媒体',
      monthlyPrice: 49,
      yearlyPrice: 499,
      features: [
        { text: 'Pro 全部功能', included: true },
        { text: '历史数据（全量）', included: true },
        { text: '高级统计分析', included: true },
        { text: '预测模型', included: true },
        { text: '数据导出（CSV/Excel）', included: true },
        { text: 'API 访问（500 次/月）', included: true },
      ],
      cta: '立即订阅',
      featured: false,
    },
  ]

  const handleSubscribe = async (plan: string) => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/pricing')
      return
    }

    try {
      // 创建订阅订单
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          billingCycle: isYearly ? 'yearly' : 'monthly',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create subscription')
      }

      const data = await response.json()
      
      // TODO: 这里集成 PayPal Checkout
      // 使用 @paypal/react-paypal-js 库
      console.log('Order created:', data)
      
      // 临时：显示成功消息
      alert(`订单创建成功！\n套餐：${plan.toUpperCase()}\n周期：${isYearly ? '年付' : '月付'}\n金额：¥${data.amount}`)
      
      // 实际流程：
      // 1. 弹出 PayPal 支付窗口
      // 2. 用户完成支付
      // 3. 调用 /api/subscription/approve 确认
      // 4. 跳转到个人中心/感谢页面
      
    } catch (error) {
      console.error('Subscription error:', error)
      alert('订阅失败：' + (error as Error).message)
    }
  }

  const currentPrice = (plan: any) => {
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice
  }

  const period = isYearly ? '/年' : '/月'

  return (
    <main className="min-h-screen bg-gradient-to-b from-snooker-green to-gray-900">
      {/* Header */}
      <header className="bg-snooker-green border-b border-snooker-gold/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              🎱 选择你的订阅方案
            </h1>
            <LoginButton />
          </div>
          <p className="text-xl text-gray-300 text-center max-w-2xl mx-auto">
            获取最全面的斯诺克数据，从实时排名到深度分析
          </p>
        </div>
      </header>

      {/* Billing Toggle */}
      <div className="flex justify-center items-center gap-4 py-12">
        <span className={`font-medium ${!isYearly ? 'text-white' : 'text-gray-400'}`}>月付</span>
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
          年付
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">省 20%</span>
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
                  ¥{currentPrice(plan)}
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

              <button
                onClick={() => handleSubscribe(plan.key)}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  plan.featured
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {plan.cta}
              </button>

              {plan.yearlyPrice > 0 && (
                <p className="text-center text-gray-400 text-xs mt-3">
                  年付仅需 ¥{plan.yearlyPrice}，省¥{plan.monthlyPrice * 12 - plan.yearlyPrice}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <h2 className="text-3xl font-bold text-white text-center mb-8">功能详细对比</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">功能</th>
                  <th className="text-center py-4 px-4 text-white font-medium">Free</th>
                  <th className="text-center py-4 px-4 text-blue-400 font-medium">Pro</th>
                  <th className="text-center py-4 px-4 text-purple-400 font-medium">Premium</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700">
                  <td className="py-4 px-4">当前世界排名</td>
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
                  <td className="py-4 px-4">实时数据</td>
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
                  <td className="py-4 px-4">历史数据</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-gray-600">✗</span>
                  </td>
                  <td className="text-center py-4 px-4">5 年</td>
                  <td className="text-center py-4 px-4">全部</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 px-4">球员对比</td>
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
                  <td className="py-4 px-4">高级统计</td>
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
                  <td className="py-4 px-4">预测模型</td>
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
                  <td className="py-4 px-4">数据导出</td>
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
                  <td className="py-4 px-4">API 访问</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-gray-600">✗</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-gray-600">✗</span>
                  </td>
                  <td className="text-center py-4 px-4">500 次/月</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 px-4">广告</td>
                  <td className="text-center py-4 px-4">有</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-500">无</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-500">无</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4">同时登录设备</td>
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
        <h2 className="text-3xl font-bold text-white text-center mb-8">常见问题</h2>
        <div className="space-y-4">
          <FAQItem question="如何取消订阅？" answer="随时可以在个人中心的"订阅管理"页面取消订阅。取消后，当前周期结束前仍可正常使用所有功能。" />
          <FAQItem question="支持退款吗？" answer="订阅后 7 天内如不满意可申请全额退款。请联系客服邮箱 support@snooker-ranking.com" />
          <FAQItem question="可以升级或降级套餐吗？" answer="可以随时升级套餐，差价按比例计算。降级将在当前周期结束后生效。" />
          <FAQItem question="支持哪些支付方式？" answer="目前支持 PayPal、信用卡（Visa/Mastercard/Amex）。后续将支持微信支付和支付宝。" />
          <FAQItem question="学生有优惠吗？" answer="是的！学生认证后可享受 Pro 套餐半价优惠（¥99/年）。请使用 edu 邮箱或上传学生证进行验证。" />
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-4xl mx-auto px-4 pb-16 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">准备好开始了吗？</h3>
        <p className="text-gray-300 mb-8">
          加入数千名斯诺克爱好者的行列，获取最全面的数据分析
        </p>
        <button
          onClick={() => handleSubscribe('pro')}
          className="inline-block py-3 px-8 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          免费试用 7 天
        </button>
        <p className="text-gray-400 text-sm mt-4">无需信用卡 · 随时取消</p>
      </div>

      {/* Footer */}
      <footer className="bg-snooker-green/50 border-t border-white/10 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="mt-2 text-sm">
            Built with Next.js + Tailwind CSS | Deployed on Cloudflare Pages
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
