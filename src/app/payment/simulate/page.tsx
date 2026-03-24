'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SimulatePaymentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'confirm' | 'processing' | 'success'>('confirm')

  const orderID = searchParams.get('orderID') || ''
  const plan = searchParams.get('plan') || 'premium'
  const billingCycle = searchParams.get('billingCycle') || 'yearly'
  const amount = searchParams.get('amount') || '0'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/payment/simulate?orderID=${orderID}&plan=${plan}&billingCycle=${billingCycle}&amount=${amount}`)
    }
  }, [status, router, orderID, plan, billingCycle, amount])

  const handleSimulatePayment = async () => {
    setIsProcessing(true)
    setPaymentStep('processing')

    // 模拟支付处理延迟
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      const response = await fetch('/api/subscription/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderID,
          plan,
          billingCycle,
          simulate: true,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setPaymentStep('success')
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        throw new Error(result.error || 'Payment failed')
      }
    } catch (error) {
      console.error('Simulate payment error:', error)
      alert('模拟支付失败，请重试')
      setPaymentStep('confirm')
    } finally {
      setIsProcessing(false)
    }
  }

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-snooker-green to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-snooker-green to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">模拟支付</h1>
          <p className="text-gray-400">这是测试环境，不会真实扣款</p>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">订单详情</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">订阅计划</span>
              <span className="text-white font-medium capitalize">{plan.toUpperCase()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">计费周期</span>
              <span className="text-white font-medium">
                {billingCycle === 'yearly' ? '年付' : '月付'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">订单 ID</span>
              <span className="text-gray-500 text-sm font-mono">{orderID}</span>
            </div>
            
            <div className="border-t border-gray-700 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">应付金额</span>
                <span className="text-3xl font-bold text-green-400">¥{amount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Simulation Box */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          {paymentStep === 'confirm' && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">确认支付</h3>
                <p className="text-gray-400">点击下方按钮完成模拟支付</p>
              </div>

              <button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full py-4 px-6 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? '处理中...' : '确认支付 ¥' + amount}
              </button>

              <p className="text-center text-gray-500 text-sm mt-4">
                🧪 测试模式 · 不会产生真实交易
              </p>
            </>
          )}

          {paymentStep === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-white mb-2">正在处理支付...</h3>
              <p className="text-gray-400">请稍候，正在确认支付状态</p>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">🎉 支付成功！</h3>
              <p className="text-gray-400 mb-4">感谢您的订阅，正在跳转...</p>
              <p className="text-green-400 text-sm">订阅计划：{plan.toUpperCase()} · {billingCycle === 'yearly' ? '年付' : '月付'}</p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/pricing')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← 返回价格页面
          </button>
        </div>
      </div>
    </main>
  )
}
