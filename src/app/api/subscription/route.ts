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
    throw new Error(process.env.PAYPAL_MODE + 'Failed to get PayPal access token: ' + response.statusText)
  }

  const data = await response.json()
  return data.access_token
}

/**
 * GET /api/subscription
 * 获取当前用户的订阅状态
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const db = getD1()
    
    if (!db) {
      return NextResponse.json({
        plan: 'free',
        status: 'active',
        features: {
          realtime: false,
          ads: true,
          apiCallsRemaining: 0,
          exportsRemaining: 0,
          devicesLimit: 1,
        }
      })
    }
    
    // 获取用户订阅信息
    const user = await db.prepare(
      'SELECT plan, plan_expires_at, trial_ends_at FROM users WHERE id = ?'
    ).bind(session.user.id).first()
    
    if (!user) {
      return NextResponse.json({
        plan: 'free',
        status: 'active',
        features: {
          realtime: false,
          ads: true,
          apiCallsRemaining: 0,
          exportsRemaining: 0,
          devicesLimit: 1,
        }
      })
    }
    
    // 检查订阅是否过期
    const now = new Date()
    const planExpiresAt = user.plan_expires_at ? new Date(user.plan_expires_at) : null
    const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null
    
    let status = 'active'
    let plan = user.plan || 'free'
    
    // 检查试用是否结束
    if (trialEndsAt && now > trialEndsAt && plan === 'free') {
      // 试用结束，降级为 free
      plan = 'free'
    }
    
    // 检查订阅是否过期
    if (planExpiresAt && now > planExpiresAt && plan !== 'free') {
      status = 'expired'
      plan = 'free'
    }
    
    // 获取功能权限
    const features = getPlanFeatures(plan)
    
    return NextResponse.json({
      plan: plan,
      status: status,
      currentPeriodEnd: planExpiresAt?.toISOString(),
      trialEndsAt: trialEndsAt?.toISOString(),
      billingCycle: 'monthly', // TODO: 从订阅表获取
      cancelAtPeriodEnd: false,
      features: features
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/subscription
 * 创建订阅（PayPal）
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
    const { plan, billingCycle } = body
    
    // 验证参数
    if (!plan || !['pro', 'premium'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }
    
    if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle' },
        { status: 400 }
      )
    }
    
    const db = getD1()
    
    // 如果数据库不可用，使用默认价格
    let amount = 0
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
      
      amount = billingCycle === 'yearly' ? pricingPlan.yearly_price : pricingPlan.monthly_price
    } else {
      // 默认价格（fallback）
      amount = plan === 'premium' 
        ? (billingCycle === 'yearly' ? 499 : 49)
        : (billingCycle === 'yearly' ? 199 : 19)
    }
    
    // 获取 PayPal Access Token
    const accessToken = await getPayPalAccessToken()
    
    // 创建 PayPal Order
    const paypalResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: (amount / 7.2).toFixed(2), // CNY 转 USD（近似汇率）
            },
            description: `Snooker Rankings ${plan.toUpperCase()} - ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}`,
          },
        ],
      }),
    })

    if (!paypalResponse.ok) {
      const errorData = await paypalResponse.json()
      console.error('PayPal API error:', errorData)
      throw new Error('Failed to create PayPal order')
    }

    const orderData = await paypalResponse.json()
    
    return NextResponse.json({
      orderID: orderData.id,
      plan,
      billingCycle,
      amount,
      currency: 'USD',
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * 获取计划功能
 */
function getPlanFeatures(plan: string) {
  switch (plan) {
    case 'premium':
      return {
        realtime: true,
        ads: false,
        apiCallsRemaining: 500,
        exportsRemaining: 100,
        devicesLimit: 3,
        dataHistoryDays: 0, // unlimited
        advancedStats: true,
        predictions: true,
      }
    case 'pro':
      return {
        realtime: true,
        ads: false,
        apiCallsRemaining: 0,
        exportsRemaining: 0,
        devicesLimit: 2,
        dataHistoryDays: 1825, // 5 years
        advancedStats: false,
        predictions: false,
      }
    default: // free
      return {
        realtime: false,
        ads: true,
        apiCallsRemaining: 0,
        exportsRemaining: 0,
        devicesLimit: 1,
        dataHistoryDays: 1,
        advancedStats: false,
        predictions: false,
      }
  }
}
