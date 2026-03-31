import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getD1 } from '@/lib/d1'

/**
 * POST /api/subscription/init
 * 初始化数据库表（临时接口，部署后调用一次即可）
 */
export async function POST() {
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
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }
    
    // 创建订阅表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        plan_type TEXT NOT NULL,
        billing_cycle TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'CNY',
        status TEXT DEFAULT 'active',
        current_period_start DATETIME NOT NULL,
        current_period_end DATETIME NOT NULL,
        canceled_at DATETIME,
        payment_provider TEXT,
        payment_intent_id TEXT,
        paypal_subscription_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    
    // 创建索引
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id)
    `)
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)
    `)
    
    // 创建定价配置表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS pricing_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plan_key TEXT UNIQUE NOT NULL,
        plan_name TEXT NOT NULL,
        monthly_price REAL DEFAULT 0,
        yearly_price REAL DEFAULT 0,
        currency TEXT DEFAULT 'CNY',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // 插入默认数据
    await db.exec(`
      INSERT OR IGNORE INTO pricing_plans (plan_key, plan_name, monthly_price, yearly_price, currency, is_active) VALUES
      ('free', 'Free', 0, 0, 'CNY', 1),
      ('pro', 'Pro', 19, 199, 'CNY', 1),
      ('premium', 'Premium', 49, 499, 'CNY', 1)
    `)
    
    return NextResponse.json({
      success: true,
      message: 'Database tables initialized successfully'
    })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/subscription/init
 * 检查数据库表是否已初始化
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
        initialized: false,
        error: 'Database not available'
      })
    }
    
    // 检查表是否存在
    const tables = await db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name IN ('subscriptions', 'pricing_plans')
    `).all()
    
    return NextResponse.json({
      initialized: tables.length === 2,
      tables: tables
    })
  } catch (error) {
    console.error('Check error:', error)
    return NextResponse.json({
      initialized: false,
      error: String(error)
    })
  }
}
