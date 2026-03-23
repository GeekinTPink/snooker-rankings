-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image TEXT,
    email_verified DATETIME,
    
    -- Subscription fields
    plan TEXT DEFAULT 'free' CHECK(plan IN ('free', 'pro', 'premium')),
    plan_expires_at DATETIME,
    trial_ends_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id TEXT PRIMARY KEY,
    favorite_player TEXT,
    notifications_enabled INTEGER DEFAULT 1,
    theme TEXT DEFAULT 'light',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    
    -- Subscription info
    plan_type TEXT NOT NULL CHECK(plan_type IN ('pro', 'premium')),
    billing_cycle TEXT NOT NULL CHECK(billing_cycle IN ('monthly', 'yearly')),
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'CNY',
    
    -- Status
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'canceled', 'expired', 'past_due')),
    
    -- Time periods
    current_period_start DATETIME NOT NULL,
    current_period_end DATETIME NOT NULL,
    canceled_at DATETIME,
    
    -- Payment info
    payment_provider TEXT, -- 'paypal', 'stripe', 'wechat', 'alipay'
    payment_intent_id TEXT,
    paypal_subscription_id TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Pricing plans configuration
CREATE TABLE IF NOT EXISTS pricing_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_key TEXT UNIQUE NOT NULL,
    plan_name TEXT NOT NULL,
    
    -- Prices
    monthly_price REAL DEFAULT 0,
    yearly_price REAL DEFAULT 0,
    currency TEXT DEFAULT 'CNY',
    
    -- Limits
    api_calls_limit INTEGER DEFAULT 0,
    exports_limit INTEGER DEFAULT 0,
    devices_limit INTEGER DEFAULT 1,
    data_history_days INTEGER DEFAULT 0, -- 0 = all
    
    -- Features
    feature_realtime INTEGER DEFAULT 0,
    feature_ads INTEGER DEFAULT 1,
    feature_advanced_stats INTEGER DEFAULT 0,
    feature_predictions INTEGER DEFAULT 0,
    feature_api INTEGER DEFAULT 0,
    
    -- Display
    display_order INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    
    -- Status
    is_active INTEGER DEFAULT 1,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paypal ON subscriptions(paypal_subscription_id);

-- Initialize pricing plans
INSERT OR IGNORE INTO pricing_plans (plan_key, plan_name, monthly_price, yearly_price, currency, api_calls_limit, exports_limit, devices_limit, data_history_days, feature_realtime, feature_ads, feature_advanced_stats, feature_predictions, feature_api, display_order, is_featured, is_active) VALUES
('free', 'Free', 0, 0, 'CNY', 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1),
('pro', 'Pro', 19, 199, 'CNY', 0, 0, 2, 1825, 1, 0, 0, 0, 0, 2, 1, 1),
('premium', 'Premium', 49, 499, 'CNY', 500, 100, 3, 0, 1, 0, 1, 1, 1, 3, 0, 1);
