# 🚀 部署指南

## 方式一：Git 集成（推荐）

1. **推送到 GitHub**
```bash
cd /root/.openclaw/workspace/snooker-rankings
git init
git add .
git commit -m "Initial commit - Snooker Rankings 2026"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **连接 Cloudflare Pages**
   - 访问 https://pages.cloudflare.com/
   - 点击 "Create a project" → "Connect to Git"
   - 选择你的 GitHub 仓库
   - 构建设置：
     - **Build command:** `npm run build`
     - **Build output directory:** `out`
   - 点击 "Save and Deploy"

3. **配置自定义域名（可选）**
   - 在 Cloudflare Pages 项目设置中添加自定义域名
   - 自动获得 HTTPS 证书

---

## 方式二：Wrangler CLI 直接部署

1. **安装 Wrangler**
```bash
npm install -g wrangler
```

2. **登录 Cloudflare**
```bash
wrangler login
```
浏览器会打开授权页面，点击允许即可。

3. **部署**
```bash
cd /root/.openclaw/workspace/snooker-rankings
npm run build
wrangler pages deploy out --project-name=snooker-rankings
```

4. **查看部署**
部署完成后会显示预览 URL，例如：
```
https://snooker-rankings-xxxx.pages.dev
```

---

## 后续更新

```bash
# 修改代码后重新部署
npm run build
wrangler pages deploy out
```

---

## 环境变量（如需要）

如果后续需要 API 密钥等环境变量：

1. 在 Cloudflare Pages 控制台 → Settings → Environment variables
2. 添加变量（Production / Preview 环境）
3. 重新部署

---

## 查看部署日志

```bash
wrangler pages deployment list --project-name=snooker-rankings
```
