# Cloudflare Pages 环境变量配置

## 已通过 `wrangler secret` 配置的变量（敏感信息）

以下变量已通过 Wrangler CLI 配置到 Cloudflare：

- ✅ `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- ✅ `PAYPAL_CLIENT_SECRET`
- ✅ `GOOGLE_CLIENT_SECRET`
- ✅ `NEXTAUTH_SECRET`

## 需要在 Cloudflare Dashboard 手动添加的变量

访问：**https://dash.cloudflare.com/?to=/:account/pages/prod/snooker-rankings/settings/environment-variables**

添加以下非敏感变量：

| 变量名 | 值 |
|--------|-----|
| `PAYPAL_MODE` | `live` |
| `NEXTAUTH_URL` | `https://snookercenter.xyz` |
| `GOOGLE_CLIENT_ID` | `106854256017-fjdpam073dnbm60lhfmuno7lrp9apn14.apps.googleusercontent.com` |

## 配置完成后

1. 访问 **Deployments** 页面
2. 点击 **Retry deployment** 重新部署
3. 或者推送新 commit 自动触发部署
