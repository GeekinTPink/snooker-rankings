import { NextResponse } from 'next/server'
import { auth } from '@/auth'

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
    
    const db = (globalThis as any).DB
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }
    
    // TODO: 调用 PayPal API 捕获订单
    // 1. 验证 orderID
    // 2. 捕获支付
    // 3. 确认支付成功
    
    // 示例：模拟 PayPal 支付成功
    console.log('Approving PayPal order:', orderID)
    
    // 获取价格
    const pricingPlan = await db.prepare(
      'SELECT monthly_price, yearly_price FROM pricing_plans WHERE plan_key = ? AND is_active = 1'
    ).bind(plan).first()
    
    if (!pricingPlan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }
    
    const amount = billingCycle === 'yearly' ? pricingPlan.yearly_price : pricingPlan.monthly_price
    
    // 计算周期
    const now = new Date()
    const currentPeriodStart = now.toISOString()
    const currentPeriodEnd = new Date(
      now.setFullYear(now.getFullYear() + (billingCycle === 'yearly' ? 1 : 0)) +
      (billingCycle === 'monthly' ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000)
    ).toISOString()
    
    // 生成订阅 ID
    const subscriptionId = 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
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
      amount,
      'CNY',
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
    
    return NextResponse.json({
      success: true,
      subscription: {
        id: subscriptionId,
        plan,
        billingCycle,
        amount,
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
