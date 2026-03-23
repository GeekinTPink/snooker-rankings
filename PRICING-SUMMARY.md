# 定价系统实现总结

## ✅ 已完成

### 1. 数据库 Schema
**文件**: `sql/schema.sql`

新增表：
- `users` - 添加 `plan`, `plan_expires_at`, `trial_ends_at` 字段
- `subscriptions` - 订阅订单表
- `pricing_plans` - 定价配置表（支持动态调整）

### 2. 定价页面
**文件**: `src/app/pricing/page.tsx`

功能：
- ✅ 三层定价展示（Free/Pro/Premium）
- ✅ 月付/年付切换（年付省 20%）
- ✅ Pro 卡片高亮（"最受欢迎"标签）
- ✅ 功能对比表格
- ✅ FAQ 折叠面板
- ✅ 响应式设计
- ✅ 登录状态检测
- ✅ 订阅按钮集成

### 3. 订阅 API
**文件**: `src/app/api/subscription/route.ts`

接口：
- `GET /api/subscription` - 获取当前订阅状态
- `POST /api/subscription` - 创建订阅订单

### 4. PayPal 审批回调
**文件**: `src/app/api/subscription/approve/route.ts`

功能：
- 处理 PayPal 支付成功回调
- 创建订阅记录
- 更新用户计划

### 5. 集成文档
**文件**: `PAYPAL-INTEGRATION.md`

内容：
- PayPal 账号创建指南
- SDK 安装步骤
- 环境变量配置
- 代码集成示例
- 测试流程

---

## 📊 定价结构

| 计划 | 月付 | 年付 | 核心功能 |
|------|------|------|----------|
| Free | ¥0 | ¥0 | 基础排名、赛程、比分（延迟 24h） |
| Pro | ¥19 | ¥199 | 实时数据、历史 5 年、球员对比、无广告 |
| Premium | ¥49 | ¥499 | 全量历史、高级统计、预测模型、数据导出、API |

---

## 🔧 下一步操作

### 立即执行

1. **安装 PayPal SDK**
```bash
cd /root/.openclaw/workspace/snooker-rankings
pnpm add @paypal/react-paypal-js
```

2. **配置环境变量**
在 `.env.local` 添加：
```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=sb
PAYPAL_CLIENT_SECRET=your_paypal_secret
```

3. **运行数据库迁移**
```bash
pnpm wrangler d1 execute snooker-rankings --file=sql/schema.sql
```

4. **测试定价页面**
```bash
pnpm dev
# 访问 http://localhost:3000/pricing
```

### 后续优化

- [ ] 集成真实的 PayPal API（替换模拟代码）
- [ ] 添加订阅管理页面（查看/取消订阅）
- [ ] 实现 Webhook 处理自动续费
- [ ] 添加邮件通知（订阅成功/即将到期）
- [ ] 实现学生优惠验证
- [ ] 添加邀请奖励系统

---

## 📁 文件清单

```
snooker-rankings/
├── sql/
│   └── schema.sql                    # 数据库表结构（已更新）
├── src/app/
│   ├── api/
│   │   └── subscription/
│   │       ├── route.ts              # 订阅 API
│   │       └── approve/route.ts      # PayPal 审批回调
│   └── pricing/
│       └── page.tsx                  # 定价页面
├── .env.local                        # 环境变量（需配置 PayPal）
├── PAYPAL-INTEGRATION.md             # PayPal 集成指南
└── PRICING-SUMMARY.md                # 本文档
```

---

## 🚀 快速测试

1. 启动开发服务器：
```bash
cd /root/.openclaw/workspace/snooker-rankings
pnpm dev
```

2. 访问定价页面：
```
http://localhost:3000/pricing
```

3. 点击"免费试用 7 天"或"立即订阅"按钮

4. 检查控制台输出订单数据

---

## 💡 提示

- 当前代码使用模拟数据，需要配置真实的 PayPal 凭证
- 测试时建议使用沙箱环境
- 生产环境前务必进行真实支付测试
- 记得在 Cloudflare D1 执行数据库迁移
