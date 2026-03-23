# PayPal 订阅集成指南

## 1. 创建 PayPal 开发者账号

1. 访问 [PayPal Developer Dashboard](https://developer.paypal.com/)
2. 登录或注册账号
3. 创建 App 获取 Client ID 和 Secret

## 2. 获取 API 凭证

### 沙箱环境（测试）
- 在 Dashboard 创建 Sandbox App
- 获取 `Client ID` 和 `Secret`
- 创建测试买家账号

### 生产环境
- 切换到 Live 模式
- 创建 Live App
- 获取正式的 `Client ID` 和 `Secret`

## 3. 安装 PayPal SDK

```bash
pnpm add @paypal/react-paypal-js
```

## 4. 配置环境变量

在 `.env.local` 添加：

```env
# PayPal Sandbox (测试)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=sb
PAYPAL_CLIENT_SECRET=your_sandbox_secret

# PayPal Live (生产)
# NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id
# PAYPAL_CLIENT_SECRET=your_live_secret
```

## 5. 更新定价页面

在 `src/app/pricing/page.tsx` 中集成 PayPal 按钮：

```tsx
'use client'

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

// 在 handleSubscribe 中集成
const handleSubscribe = async (plan: string) => {
  // ... 创建订单逻辑
}

// 渲染 PayPal 按钮
<PayPalScriptProvider options={{ 
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  currency: 'CNY'
}}>
  <PayPalButtons
    createOrder={async () => {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro', billingCycle: 'yearly' }),
      })
      const order = await res.json()
      return order.orderID
    }}
    onApprove={async (data) => {
      const res = await fetch('/api/subscription/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderID: data.orderID,
          plan: 'pro',
          billingCycle: 'yearly',
        }),
      })
      const result = await res.json()
      if (result.success) {
        alert('订阅成功！')
        router.push('/dashboard')
      }
    }}
  />
</PayPalScriptProvider>
```

## 6. 测试流程

### 沙箱测试
1. 使用沙箱买家账号登录 PayPal
2. 完成支付流程
3. 检查数据库订阅记录
4. 验证用户计划更新

### 关键检查点
- [ ] 订单创建成功
- [ ] PayPal 支付完成
- [ ] 回调处理正确
- [ ] 数据库记录正确
- [ ] 用户计划更新

## 7. 生产部署

### 切换到 Live 模式
1. 更新 `.env.local` 使用 Live Client ID
2. 重新构建部署
3. 进行小额真实支付测试

### Webhook 配置（可选）
用于处理订阅续费、取消等事件：

```bash
# 创建 Webhook
POST /api/subscription/webhook
```

## 8. 定价 API 参考

### 创建订单
```http
POST /api/subscription
Content-Type: application/json

{
  "plan": "pro",
  "billingCycle": "yearly"
}
```

**Response:**
```json
{
  "plan": "pro",
  "billingCycle": "yearly",
  "amount": 199,
  "currency": "CNY",
  "orderID": "5O190127TN364715T"
}
```

### 审批订单
```http
POST /api/subscription/approve
Content-Type: application/json

{
  "orderID": "5O190127TN364715T",
  "plan": "pro",
  "billingCycle": "yearly"
}
```

**Response:**
```json
{
  "success": true,
  "subscription": {
    "id": "sub_xxx",
    "plan": "pro",
    "billingCycle": "yearly",
    "amount": 199,
    "status": "active",
    "currentPeriodEnd": "2027-03-23T00:00:00Z"
  }
}
```

## 9. 数据库迁移

运行 SQL 更新 schema：

```bash
# Cloudflare D1
pnpm wrangler d1 execute snooker-rankings --file=sql/schema.sql
```

## 10. 后续优化

- [ ] 添加订阅管理页面（查看/取消订阅）
- [ ] 实现 Webhook 处理自动续费
- [ ] 添加退款流程
- [ ] 集成邮件通知
- [ ] 添加发票生成

## 参考文档

- [PayPal REST API](https://developer.paypal.com/docs/api/overview/)
- [PayPal Checkout](https://developer.paypal.com/docs/checkout/)
- [@paypal/react-paypal-js](https://github.com/paypal/react-paypal-js)
