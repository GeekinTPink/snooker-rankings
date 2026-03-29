# PayPal Webhook 配置指南

## 📦 已创建的文件

- `src/app/api/subscription/webhook/route.ts` - Webhook 处理 API

## 🔧 配置步骤

### 步骤 1：部署代码

```bash
cd /root/.openclaw/workspace/snooker-rankings
bash deploy.sh
```

### 步骤 2：在 PayPal Developer 注册 Webhook

1. 访问 [PayPal Developer Dashboard](https://developer.paypal.com/)
2. 进入 **Apps & Credentials**
3. 选择你的 App（沙箱或 Live）
4. 点击 **Add webhook**

### 步骤 3：配置 Webhook URL

**Webhook URL:**
```
https://snookercenter.xyz/api/subscription/webhook
```

**选择监听的事件:**

✅ 必选事件：
- ☑️ `PAYMENT.CAPTURE.COMPLETED` - 支付完成
- ☑️ `PAYMENT.CAPTURE.REFUNDED` - 退款
- ☑️ `PAYMENT.CAPTURE.DENIED` - 支付拒绝
- ☑️ `PAYMENT.CAPTURE.FAILED` - 支付失败

📅 周期性订阅（未来扩展）：
- ☑️ `BILLING.SUBSCRIPTION.ACTIVATED` - 订阅激活
- ☑️ `BILLING.SUBSCRIPTION.CANCELLED` - 订阅取消
- ☑️ `BILLING.SUBSCRIPTION.EXPIRED` - 订阅过期

### 步骤 4：获取 Webhook ID

创建 Webhook 后，PayPal 会生成一个 **Webhook ID**（类似 `8AB12345CD678901E`）

### 步骤 5：配置 Cloudflare 环境变量

在 Cloudflare Dashboard 添加：

```
Variable Name: PAYPAL_WEBHOOK_ID
Value: <你的 Webhook ID>
Environment: production
```

### 步骤 6：重新部署

```bash
bash deploy.sh
```

---

## 🧪 测试 Webhook

### 方法一：使用 PayPal Developer 工具

1. 在 PayPal Developer Dashboard 找到你的 Webhook
2. 点击 **Notifications** 标签
3. 点击 **Send notification**
4. 选择事件类型（如 `PAYMENT.CAPTURE.COMPLETED`）
5. 填写测试数据
6. 点击发送

### 方法二：本地测试

```bash
# 发送测试请求
curl -X POST https://snookercenter.xyz/api/subscription/webhook \
  -H "Content-Type: application/json" \
  -H "PAYPAL-EVENT-TYPE: PAYMENT.CAPTURE.COMPLETED" \
  -d '{
    "id": "WH-TEST-123456",
    "event_type": "PAYMENT.CAPTURE.COMPLETED",
    "resource": {
      "id": "CAPTURE-ID-123",
      "status": "COMPLETED",
      "amount": {
        "value": "199.00",
        "currency_code": "USD"
      },
      "supplementary_data": {
        "related_ids": {
          "order_id": "ORDER-ID-123"
        }
      }
    }
  }'
```

### 方法三：检查 Webhook 状态

```bash
curl https://snookercenter.xyz/api/subscription/webhook
```

返回：
```json
{
  "status": "ok",
  "mode": "sandbox",
  "webhookConfigured": true
}
```

---

## 📊 查看 Webhook 日志

### Cloudflare Workers 日志

1. Cloudflare Dashboard → Workers → snooker-rankings
2. 点击 **Logs** 标签
3. 筛选 `[PayPal Webhook]` 相关日志

### 关键日志标记

- `[PayPal Webhook] Received event:` - 收到事件
- `[PayPal Webhook] Payment completed:` - 支付完成
- `[PayPal Webhook] Subscription activated:` - 订阅激活
- `[PayPal Webhook] Invalid signature` - 签名验证失败

---

## 🔒 安全说明

### Webhook 签名验证

代码已实现签名验证（`verifyWebhookEvent` 函数）：

- ✅ 验证 `PAYPAL-AUTH-ALGO`
- ✅ 验证 `PAYPAL-CERT-URL`
- ✅ 验证 `PAYPAL-TRANSMISSION-ID`
- ✅ 验证 `PAYPAL-TRANSMISSION-SIG`
- ✅ 验证 `PAYPAL-TRANSMISSION-TIME`

### 环境变量要求

| 变量 | 用途 | 必需 |
|------|------|------|
| `PAYPAL_WEBHOOK_ID` | Webhook 验证 | 生产环境必需 |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal Client ID | ✅ |
| `PAYPAL_CLIENT_SECRET` | PayPal Secret | ✅ |
| `PAYPAL_MODE` | 环境模式 | ✅ |

---

## 🐛 常见问题

### 1. Webhook 不触发

**原因：** PayPal 无法访问你的 URL

**解决：**
- 确保 URL 是 `https://`（不能用 http）
- 确保域名已正确解析到 Cloudflare
- 检查 Cloudflare Firewall 是否拦截

### 2. 签名验证失败

**原因：** `PAYPAL_WEBHOOK_ID` 配置错误

**解决：**
- 检查 Webhook ID 是否正确复制
- 确保沙箱和 Live 环境使用对应的 Webhook ID

### 3. 重复处理事件

**原因：** PayPal 可能重试发送相同事件

**解决：**
- 代码已处理（返回 200 避免重试）
- 数据库层面可以用 `event_id` 做去重（可选优化）

---

## 📈 后续优化建议

### 1. 事件去重

```typescript
// 在数据库中添加 webhook_events 表
CREATE TABLE webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT,
  received_at TEXT,
  processed BOOLEAN DEFAULT 0
)
```

### 2. 异步队列处理

对于高并发场景，使用队列处理 Webhook：
- Cloudflare Queues
- 避免阻塞响应

### 3. 通知用户

支付完成后发送邮件/消息通知：
```typescript
// 在 PAYMENT.CAPTURE.COMPLETED 处理后
await sendEmail(user.email, '支付成功', '...')
```

---

## ✅ 检查清单

- [ ] 已部署 Webhook API
- [ ] 已在 PayPal Developer 创建 Webhook
- [ ] Webhook URL: `https://snookercenter.xyz/api/subscription/webhook`
- [ ] 已配置 `PAYPAL_WEBHOOK_ID` 环境变量
- [ ] 已测试 Webhook 连通性
- [ ] 已验证签名功能
- [ ] 已监听必要的事件类型

---

**下一步：** 配置完成后，用沙箱账号完成一次支付测试，检查 Webhook 是否正常触发！
