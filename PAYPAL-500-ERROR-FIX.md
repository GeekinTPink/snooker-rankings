# PayPal 500 错误修复指南

## 问题原因

**500 Internal Server Error** - 后端 API 无法获取 PayPal Access Token

### 根本原因
1. ❌ `PAYPAL_CLIENT_SECRET` 未配置到 Cloudflare Workers
2. ❌ 生产环境 Client ID 用于沙箱测试（环境不匹配）

## 解决步骤

### 步骤 1：获取沙箱凭证（推荐测试用）

1. 访问 [PayPal Developer Dashboard](https://developer.paypal.com/)
2. 点击 **Apps & Credentials**
3. 切换到 **Sandbox** 标签
4. 点击 **Create App**
5. 记录生成的：
   - **Client ID** (沙箱)
   - **Secret** (沙箱)

### 步骤 2：配置 Cloudflare 环境变量

**⚠️ 重要：** Secret 不能写在 `wrangler.toml` 中，必须通过 Dashboard 配置！

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **snooker-rankings**
3. 点击 **Settings** → **Environment Variables**
4. 点击 **Add variable**
5. 添加以下变量：

```
Variable Name: PAYPAL_CLIENT_SECRET
Value: <你的沙箱 Secret>
Environment: production
```

```
Variable Name: NEXT_PUBLIC_PAYPAL_CLIENT_ID
Value: <你的沙箱 Client ID>
Environment: production
```

```
Variable Name: PAYPAL_MODE
Value: sandbox
Environment: production
```

6. 点击 **Save**
7. **重新部署** Workers（环境变量修改后需要重新部署）

### 步骤 3：重新部署

```bash
cd /root/.openclaw/workspace/snooker-rankings
pnpm deploy
```

### 步骤 4：测试

1. 清除浏览器缓存
2. 访问 https://snookercenter.xyz/pricing
3. 选择套餐，点击 PayPal 按钮
4. 使用**沙箱买家账号**登录
5. 完成支付流程

## 生产环境配置（正式上线时）

### 使用生产凭证

1. 在 PayPal Developer 切换到 **Live** 标签
2. 创建 Live App 或使用现有
3. 获取生产 Client ID 和 Secret
4. 在 Cloudflare 更新环境变量：

```
NEXT_PUBLIC_PAYPAL_CLIENT_ID = <生产 Client ID>
PAYPAL_CLIENT_SECRET = <生产 Secret>
PAYPAL_MODE = live
```

## 调试技巧

### 检查 Cloudflare Workers 日志

1. Cloudflare Dashboard → Workers → snooker-rankings
2. 点击 **Logs** 标签
3. 筛选错误日志
4. 查找 `Error getting PayPal access token` 相关错误

### 本地测试

```bash
# 1. 复制环境变量
cp .env.local .dev.vars

# 2. 本地运行
pnpm dev

# 3. 测试 API
curl -X POST http://localhost:3000/api/subscription \
  -H "Content-Type: application/json" \
  -d '{"plan":"pro","billingCycle":"yearly"}'
```

### 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 500 Internal Server Error | Secret 未配置 | 在 Cloudflare 配置 PAYPAL_CLIENT_SECRET |
| 401 Unauthorized | Client ID 或 Secret 错误 | 检查凭证是否正确 |
| 400 Bad Request | 环境不匹配 | 确保 PAYPAL_MODE 与 Client ID 匹配 |

## 安全提示

- ✅ **永远不要**将 Secret 提交到 Git
- ✅ 使用 Cloudflare Environment Variables 管理敏感信息
- ✅ 沙箱和生产环境使用不同的凭证
- ✅ 定期检查凭证是否泄露

## 快速检查清单

- [ ] 已获取 PayPal 沙箱 Client ID 和 Secret
- [ ] 已在 Cloudflare 配置环境变量
- [ ] PAYPAL_MODE = "sandbox"（测试）或 "live"（生产）
- [ ] 已重新部署 Workers
- [ ] 已清除浏览器缓存
- [ ] 使用沙箱买家账号测试

## 联系支持

如果问题仍未解决，请提供：
1. Cloudflare Workers 错误日志
2. 浏览器控制台完整错误信息
3. PayPal Developer App 配置截图（隐藏 Secret）
