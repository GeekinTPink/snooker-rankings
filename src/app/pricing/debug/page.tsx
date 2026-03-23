'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

export default function DebugPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">支付调试页面</h1>
      
      <div className="space-y-4 max-w-2xl">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">登录状态</h2>
          <p>Session Status: <span className="text-yellow-400">{status}</span></p>
          <p>Session Data: <pre className="bg-gray-700 p-2 rounded mt-2 text-sm">{JSON.stringify(session, null, 2)}</pre></p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">环境变量检查</h2>
          <p>PAYPAL_CLIENT_ID: <span className="text-green-400">{process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? '✅ 已配置' : '❌ 未配置'}</span></p>
          <p className="text-xs text-gray-400 mt-1">
            Client ID 前缀：{process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.substring(0, 20)}...
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">PayPal 支付测试</h2>
          <PayPalScriptProvider
            options={{
              clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
              currency: 'CNY',
              intent: 'capture',
            }}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-400">点击下方按钮测试支付流程：</p>
              <PayPalButtons
                style={{ layout: 'vertical' }}
                createOrder={async () => {
                  console.log('Creating order...')
                  try {
                    const response = await fetch('/api/subscription', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        plan: 'pro',
                        billingCycle: 'monthly',
                      }),
                    })

                    if (!response.ok) {
                      const error = await response.json()
                      throw new Error(error.error || 'Failed to create order')
                    }

                    const data = await response.json()
                    console.log('Order created:', data)
                    return data.orderID
                  } catch (error) {
                    console.error('Create order error:', error)
                    throw error
                  }
                }}
                onApprove={async (data) => {
                  console.log('Order approved:', data)
                  try {
                    const response = await fetch('/api/subscription/approve', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        orderID: data.orderID,
                        plan: 'pro',
                        billingCycle: 'monthly',
                      }),
                    })

                    const result = await response.json()
                    console.log('Approval result:', result)

                    if (result.success) {
                      alert('🎉 支付成功！')
                      router.push('/')
                    } else {
                      throw new Error(result.error || 'Approval failed')
                    }
                  } catch (error) {
                    console.error('Approve error:', error)
                    alert('支付失败：' + (error as Error).message)
                  }
                }}
                onError={(err) => {
                  console.error('PayPal Error:', err)
                  alert('PayPal 错误：' + JSON.stringify(err))
                }}
              />
            </div>
          </PayPalScriptProvider>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">API 测试</h2>
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/subscription', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    plan: 'pro',
                    billingCycle: 'monthly',
                  }),
                })
                const data = await response.json()
                console.log('API Response:', data)
                alert('API 响应：' + JSON.stringify(data, null, 2))
              } catch (error) {
                console.error('API Error:', error)
                alert('API 错误：' + (error as Error).message)
              }
            }}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
          >
            测试创建订单 API
          </button>
        </div>
      </div>
    </div>
  )
}
