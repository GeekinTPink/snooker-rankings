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
    
    // 获取价格（如果数据库不可用，使用默认价格）
    let amountCNY = 0
    if (db) {
      const pricingPlan = await db.prepare(
        'SELECT monthly_price, yearly_price FROM pricing_plans WHERE plan_key = ? AND is_active = 1'
      ).bind(plan).first()
      
      if (!pricingPlan) {
        return NextResponse.json(
          { error: 'Plan not found' },
          { status: 404 }
        )
      }
      
      amountCNY = billingCycle === 'yearly' ? pricingPlan.yearly_price : pricingPlan.monthly_price
    } else {
      // 默认价格（fallback）
      amountCNY = plan === 'premium' 
        ? (billingCycle === 'yearly' ? 499 : 49)
        : (billingCycle === 'yearly' ? 199 : 19)
    }
    
    // 转换为 USD（用于数据库记录）
    const amountUSD = (amountCNY / 7.2).toFixed(2)
    
    // 计算周期
    const now = new Date()
    const currentPeriodStart = now.toISOString()
    const currentPeriodEnd = new Date(
      now.setFullYear(now.getFullYear() + (billingCycle === 'yearly' ? 1 : 0)) +
      (billingCycle === 'monthly' ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000)
    ).toISOString()
    
    // 生成订阅 ID
    const subscriptionId = 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    // 如果数据库可用，创建订阅记录和更新用户计划
    if (db) {
      try {
        // 创建订阅记录
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
        
        // 更新用户计划
        const planExpiresAt = new Date(
          new Date().getTime() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
        ).toISOString()
        
        await db.prepare(`
          UPDATE users 
          SET plan = ?, plan_expires_at = ?, updated_at = ?
          WHERE id = ?
        `).bind(plan, planExpiresAt, new Date().toISOString(), session.user.id).run()
      } catch (dbError) {
        console.error('Database error:', dbError)
        // 数据库错误不影响支付成功的返回
      }
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
