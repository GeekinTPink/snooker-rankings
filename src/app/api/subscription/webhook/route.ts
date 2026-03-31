import { NextResponse } from 'next/server'
import { getD1 } from '@/lib/d1'

const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

/**
 * 获取 PayPal Access Token
 */
async function getPayPalAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
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
 * 验证 Webhook 事件（防止伪造请求）
 */
async function verifyWebhookEvent(request: Request): Promise<boolean> {
  const accessToken = await getPayPalAccessToken()
  const webhookId = process.env.PAYPAL_WEBHOOK_ID

  if (!webhookId) {
    console.warn('PAYPAL_WEBHOOK_ID not configured, skipping verification')
    return true // 开发环境跳过验证
  }

  const body = await request.text()
  const headers = request.headers

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      auth_algo: headers.get('PAYPAL-AUTH-ALGO') || '',
      cert_url: headers.get('PAYPAL-CERT-URL') || '',
      transmission_id: headers.get('PAYPAL-TRANSMISSION-ID') || '',
      transmission_sig: headers.get('PAYPAL-TRANSMISSION-SIG') || '',
      transmission_time: headers.get('PAYPAL-TRANSMISSION-TIME') || '',
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }),
  })

  if (!response.ok) {
    console.error('Webhook verification failed:', await response.text())
    return false
  }

  const data = await response.json()
  return data.verification_status === 'SUCCESS'
}

/**
 * POST /api/subscription/webhook
 * PayPal Webhook 回调处理
 */
export async function POST(request: Request) {
  try {
    const eventType = request.headers.get('PAYPAL-EVENT-TYPE')
    const body = await request.json()

    console.log('[PayPal Webhook] Received event:', eventType, body.id)

    // 验证 Webhook 签名（生产环境必须）
    const isValid = await verifyWebhookEvent(request)
    if (!isValid) {
      console.error('[PayPal Webhook] Invalid signature')
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    const db = getD1()

    // 根据事件类型处理
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        console.log('[PayPal Webhook] Payment completed:', body.resource.id)
        
        const captureId = body.resource.id
        const orderId = body.resource.supplementary_data?.related_ids?.order_id
        const amount = body.resource.amount?.value
        const currency = body.resource.amount?.currency_code

        if (!db) {
          console.warn('[PayPal Webhook] Database not available')
          return NextResponse.json({ success: true })
        }

        // 查找对应的订阅记录
        const subscription = await db.prepare(
          'SELECT * FROM subscriptions WHERE payment_intent_id = ? OR paypal_subscription_id = ?'
        ).bind(captureId, captureId).first()

        if (subscription) {
          // 更新订阅状态
          await db.prepare(`
            UPDATE subscriptions 
            SET status = 'active', updated_at = ?
            WHERE id = ?
          `).bind(new Date().toISOString(), subscription.id).run()

          // 更新用户计划
          const planDuration = subscription.billing_cycle === 'yearly' ? 365 : 30
          const planExpiresAt = new Date(
            new Date().getTime() + planDuration * 24 * 60 * 60 * 1000
          ).toISOString()

          await db.prepare(`
            UPDATE users 
            SET plan = ?, plan_expires_at = ?, updated_at = ?
            WHERE id = ?
          `).bind(subscription.plan_type, planExpiresAt, new Date().toISOString(), subscription.user_id).run()

          console.log('[PayPal Webhook] Subscription activated:', subscription.id)
        } else {
          console.warn('[PayPal Webhook] Subscription not found for capture:', captureId)
        }
        break
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        console.log('[PayPal Webhook] Payment refunded:', body.resource.id)
        
        const captureId = body.resource.id

        if (db) {
          // 查找并更新订阅状态
          const subscription = await db.prepare(
            'SELECT * FROM subscriptions WHERE payment_intent_id = ? OR paypal_subscription_id = ?'
          ).bind(captureId, captureId).first()

          if (subscription) {
            await db.prepare(`
              UPDATE subscriptions 
              SET status = 'refunded', updated_at = ?
              WHERE id = ?
            `).bind(new Date().toISOString(), subscription.id).run()

            // 降级用户为 free
            await db.prepare(`
              UPDATE users 
              SET plan = 'free', plan_expires_at = NULL, updated_at = ?
              WHERE id = ?
            `).bind(new Date().toISOString(), subscription.user_id).run()

            console.log('[PayPal Webhook] Subscription refunded:', subscription.id)
          }
        }
        break
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.FAILED': {
        console.log('[PayPal Webhook] Payment failed:', body.resource.id)
        
        const captureId = body.resource.id

        if (db) {
          await db.prepare(`
            UPDATE subscriptions 
            SET status = 'failed', updated_at = ?
            WHERE payment_intent_id = ? OR paypal_subscription_id = ?
          `).bind(new Date().toISOString(), captureId, captureId).run()
        }
        break
      }

      // 周期性订阅事件（未来扩展）
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        console.log('[PayPal Webhook] Subscription activated:', body.resource.id)
        break
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        console.log('[PayPal Webhook] Subscription cancelled:', body.resource.id)
        
        const subscriptionId = body.resource.id

        if (db) {
          const subscription = await db.prepare(
            'SELECT * FROM subscriptions WHERE paypal_subscription_id = ?'
          ).bind(subscriptionId).first()

          if (subscription) {
            await db.prepare(`
              UPDATE subscriptions 
              SET status = 'cancelled', updated_at = ?
              WHERE id = ?
            `).bind(new Date().toISOString(), subscription.id).run()
          }
        }
        break
      }

      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        console.log('[PayPal Webhook] Subscription expired:', body.resource.id)
        
        const subscriptionId = body.resource.id

        if (db) {
          const subscription = await db.prepare(
            'SELECT * FROM subscriptions WHERE paypal_subscription_id = ?'
          ).bind(subscriptionId).first()

          if (subscription) {
            await db.prepare(`
              UPDATE subscriptions 
              SET status = 'expired', updated_at = ?
              WHERE id = ?
            `).bind(new Date().toISOString(), subscription.id).run()

            // 降级用户为 free
            await db.prepare(`
              UPDATE users 
              SET plan = 'free', updated_at = ?
              WHERE id = ?
            `).bind(new Date().toISOString(), subscription.user_id).run()
          }
        }
        break
      }

      default:
        console.log('[PayPal Webhook] Unhandled event type:', eventType)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PayPal Webhook] Error processing webhook:', error)
    // 返回 200 避免 PayPal 重试（已记录日志）
    return NextResponse.json({ success: true })
  }
}

/**
 * GET /api/subscription/webhook
 * 用于测试 Webhook 连通性
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    mode: process.env.PAYPAL_MODE || 'sandbox',
    webhookConfigured: !!process.env.PAYPAL_WEBHOOK_ID,
  })
}
