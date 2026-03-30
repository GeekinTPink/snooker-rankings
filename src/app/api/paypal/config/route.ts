import { NextResponse } from 'next/server'

/**
 * GET /api/paypal/config
 * 返回前端初始化 PayPal SDK 所需的最小配置。
 */
export async function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const mode = process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox'

  if (!clientId) {
    return NextResponse.json(
      { error: 'PayPal client id not configured' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    clientId,
    mode,
    currency: 'USD',
    intent: 'capture',
  })
}

