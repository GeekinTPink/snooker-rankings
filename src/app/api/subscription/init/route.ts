import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getD1 } from '@/lib/d1'

/**
 * 安全地给已有表添加列——SQLite 不支持 ALTER TABLE ADD COLUMN IF NOT EXISTS，
 * 用 PRAGMA table_info 检查后再决定是否执行。
 */
async function addColumnIfMissing(
  db: any,
  table: string,
  column: string,
  definition: string
): Promise<boolean> {
  const info = await db.prepare(`PRAGMA table_info(${table})`).all()
  const exists = (info.results ?? info).some((c: any) => c.name === column)
  if (!exists) {
    await db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
    return true
  }
  return false
}

/**
 * POST /api/subscription/init
 * 初始化/迁移数据库表（幂等，可重复调用）
 */
export async function POST() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getD1()

    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const migrations: string[] = []

    // ── 1. subscriptions 表 ──────────────────────────────────────────────
    await db.exec(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        plan_type TEXT NOT NULL,
        billing_cycle TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
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
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_subscriptions_user   ON subscriptions(user_id)`)
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)`)
    migrations.push('subscriptions table ensured')

    // ── 2. pricing_plans 表 ──────────────────────────────────────────────
    await db.exec(`
      CREATE TABLE IF NOT EXISTS pricing_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plan_key TEXT UNIQUE NOT NULL,
        plan_name TEXT NOT NULL,
        monthly_price REAL DEFAULT 0,
        yearly_price REAL DEFAULT 0,
        currency TEXT DEFAULT 'USD',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // upsert 价格（覆盖历史 CNY 数据）
    await db.exec(`
      INSERT INTO pricing_plans (plan_key, plan_name, monthly_price, yearly_price, currency, is_active)
      VALUES
        ('free',    'Free',    0,    0,     'USD', 1),
        ('pro',     'Pro',     2.99, 29.99, 'USD', 1),
        ('premium', 'Premium', 6.99, 69.99, 'USD', 1)
      ON CONFLICT(plan_key) DO UPDATE SET
        monthly_price = excluded.monthly_price,
        yearly_price  = excluded.yearly_price,
        currency      = excluded.currency,
        is_active     = excluded.is_active
    `)
    migrations.push('pricing_plans table ensured (prices upserted to USD)')

    // ── 3. users 表——补充订阅相关列（NextAuth 默认不含这些列）───────────
    const planAdded         = await addColumnIfMissing(db, 'users', 'plan',           "TEXT NOT NULL DEFAULT 'free'")
    const expiresAdded      = await addColumnIfMissing(db, 'users', 'plan_expires_at', 'DATETIME')
    const trialAdded        = await addColumnIfMissing(db, 'users', 'trial_ends_at',   'DATETIME')
    const updatedAtAdded    = await addColumnIfMissing(db, 'users', 'updated_at',      'DATETIME')

    if (planAdded)      migrations.push('users.plan column added')
    if (expiresAdded)   migrations.push('users.plan_expires_at column added')
    if (trialAdded)     migrations.push('users.trial_ends_at column added')
    if (updatedAtAdded) migrations.push('users.updated_at column added')

    return NextResponse.json({ success: true, migrations })
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
 * 检查当前数据库状态（表是否存在、users 列是否齐全）
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getD1()

    if (!db) {
      return NextResponse.json({ initialized: false, error: 'Database not available' })
    }

    const tables = await db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name IN ('subscriptions', 'pricing_plans')
    `).all()

    const userCols = await db.prepare(`PRAGMA table_info(users)`).all()
    const colNames: string[] = (userCols.results ?? userCols).map((c: any) => c.name)
    const usersMigrated =
      colNames.includes('plan') &&
      colNames.includes('plan_expires_at') &&
      colNames.includes('trial_ends_at')

    const tableNames = (tables.results ?? tables).map((t: any) => t.name)

    return NextResponse.json({
      initialized: tableNames.length === 2 && usersMigrated,
      tables: tableNames,
      usersMigrated,
      usersColumns: colNames,
    })
  } catch (error) {
    console.error('Check error:', error)
    return NextResponse.json({ initialized: false, error: String(error) })
  }
}
