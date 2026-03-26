# PayPal 沙箱测试问题排查

## 问题现象
用户反馈：点击完成购物后页面关闭，没有扣款。

## 原因分析

### 1. 沙箱环境不会真实扣款 ✅ 正常行为
PayPal 沙箱环境是**测试环境**，使用虚拟账户和虚拟资金，不会产生真实交易。

**沙箱测试流程：**
1. 用户点击 PayPal 按钮
2. 登录沙箱买家账号（虚拟账号）
3. 确认支付（使用虚拟资金）
4. PayPal 返回支付成功
5. 后端捕获订单并更新订阅状态

**关键点：** 沙箱环境的"扣款"只是模拟，不会从真实银行卡扣款。

### 2. 环境变量配置问题 ⚠️ 已修复
部署时使用了测试 Client ID，但代码中 `PAYPAL_MODE` 需要正确配置。

**修复内容：**
- 更新 `wrangler.toml` 添加 `PAYPAL_MODE = "live"`
- 增强前端错误处理和日志记录

### 3. 页面关闭问题
支付成功后 `router.push('/')` 会跳转页面，这是预期行为。

## 测试步骤

### 沙箱环境测试

1. **准备沙箱账号**
   - 访问 [PayPal Developer Dashboard](https://developer.paypal.com/)
   - 创建 Sandbox 测试买家账号
   - 记录账号邮箱和密码

2. **测试支付流程**
   ```
   1. 访问定价页面 (/pricing)
   2. 选择 Pro 或 Premium 套餐
   3. 点击"免费试用 7 天"或"立即订阅"
   4. 弹出 PayPal 窗口，使用沙箱账号登录
   5. 确认支付
   6. 等待支付完成，页面自动跳转回首页
   ```

3. **验证订阅状态**
   - 检查浏览器控制台日志（F12）
   - 查看是否有"订阅成功"提示
   - 检查数据库订阅记录

### 检查日志

**前端控制台（浏览器 F12）：**
```javascript
// 应该看到以下日志
PayPal onApprove called with orderID: 5O190127TN364715T
Approval response status: 200
Approval response: {success: true, subscription: {...}}
```

**后端日志（Cloudflare Workers）：**
```
PayPal payment captured: 5O190127TN364715T
Database: Created subscription sub_xxx
Database: Updated user plan to pro
```

## 常见问题

### Q1: 沙箱支付失败
**可能原因：**
- 沙箱账号余额不足（可在 PayPal Developer 充值虚拟资金）
- 网络问题导致 API 调用失败
- Client ID 或 Secret 配置错误

**解决方法：**
1. 检查 PayPal Developer Dashboard 中的沙箱账号余额
2. 检查浏览器控制台网络请求
3. 验证环境变量配置

### Q2: 页面跳转但没有订阅成功
**可能原因：**
- `/api/subscription/approve` 接口调用失败
- 数据库写入失败
- 用户未登录

**排查步骤：**
1. 检查浏览器 Network 面板，查看 API 请求状态
2. 检查 Cloudflare Workers 日志
3. 确认用户已登录（需要 Google OAuth）

### Q3: 真实扣款测试
**注意：** 沙箱环境不会真实扣款！

如需测试真实支付：
1. 切换到生产环境（`PAYPAL_MODE=live`）
2. 使用真实 PayPal 账号
3. 进行小额测试（如 ¥1）
4. 测试完成后可退款

## 已修复的问题

1. ✅ 增强前端错误处理，显示详细错误信息
2. ✅ 添加控制台日志，便于调试
3. ✅ 更新 wrangler.toml 环境变量配置
4. ✅ 优化 onCancel 处理逻辑

## 下一步

1. 重新部署应用：
   ```bash
   cd /root/.openclaw/workspace/snooker-rankings
   pnpm deploy
   ```

2. 使用沙箱账号测试完整支付流程

3. 检查浏览器控制台的日志输出

4. 验证数据库订阅记录是否正确创建

## 参考文档

- [PayPal Sandbox Testing](https://developer.paypal.com/tools/sandbox/)
- [PayPal Checkout Integration](https://developer.paypal.com/docs/checkout/)
- [@paypal/react-paypal-js Documentation](https://github.com/paypal/react-paypal-js)
