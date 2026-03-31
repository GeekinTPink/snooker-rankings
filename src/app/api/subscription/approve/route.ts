import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getD1 } from '@/lib/d1'

const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

/**
 * 获取 PayPal Access Token
 */
async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !secret) {
    throw new Error('PayPal credentials not configured')
  }

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${secret}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token')
  }

  const data = await response.json()
  return data.access_token
}

/**
 * POST /api/subscription/approve
 * PayPal 支付审批回调
 */
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { orderID, plan, billingCycle } = body
    
    if (!orderID || !plan || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }
    
    const db = getD1()

    // 在扣款前确认数据库可用，避免扣款后无法激活订阅
    if (!db) {
      console.error('Database not available, refusing to capture payment')
      return NextResponse.json(
        { error: 'Service temporarily unavailable, please try again later' },
        { status: 503 }
      )
    }

    // 从数据库获取价格（单位 USD）
    const pricingPlan = await db.prepare(
      'SELECT monthly_price, yearly_price FROM pricing_plans WHERE plan_key = ? AND is_active = 1'
    ).bind(plan).first()

    if (!pricingPlan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    const amountUSD: number = billingCycle === 'yearly'
      ? (pricingPlan.yearly_price as number)
      : (pricingPlan.monthly_price as number)

    // 获取 PayPal Access Token
    const accessToken = await getPayPalAccessToken()
    
    // 捕获 PayPal Order
    const paypalResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!paypalResponse.ok) {
      const errorData = await paypalResponse.json()
      console.error('PayPal capture error:', errorData)
      return NextResponse.json(
        { error: 'Payment capture failed' },
        { status: 400 }
      )
    }

    const captureData = await paypalResponse.json()
    
    // 确认支付状态
    if (captureData.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }
    
    console.log('PayPal payment captured:', orderID)

    // 计算周期
    const now = new Date()
    const currentPeriodStart = now.toISOString()
    const daysToAdd = billingCycle === 'yearly' ? 365 : 30
    const currentPeriodEnd = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000).toISOString()
    
    // 生成订阅 ID
    const subscriptionId = 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

    // 创建订阅记录并更新用户计划
    try {
      await db.prepare(`
        INSERT INTO subscriptions (
          id, user_id, plan_type, billing_cycle, amount, currency,
          status, current_period_start, current_period_end,
          payment_provider, payment_intent_id, paypal_subscription_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        subscriptionId,
        session.user.id,
        plan,
        billingCycle,
        amountUSD,
        'USD',
        'active',
        currentPeriodStart,
        currentPeriodEnd,
        'paypal',
        orderID,
        orderID,
        new Date().toISOString(),
        new Date().toISOString()
      ).run()

      await db.prepare(`
        UPDATE users 
        SET plan = ?, plan_expires_at = ?, updated_at = ?
        WHERE id = ?
      `).bind(plan, currentPeriodEnd, new Date().toISOString(), session.user.id).run()
    } catch (dbError) {
      console.error('Database write failed after PayPal capture:', orderID, dbError)
      return NextResponse.json(
        { error: 'Subscription activation failed, please contact support with your order ID: ' + orderID },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscriptionId,
        plan,
        billingCycle,
        amount: amountUSD,
        status: 'active',
        currentPeriodEnd,
      }
    })
  } catch (error) {
    console.error('Error approving subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
