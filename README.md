# 🎱 World Snooker Rankings 2026

Live snooker world rankings website built with Next.js and deployed on Cloudflare Pages.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Deployment:** Cloudflare Pages

## 📁 Project Structure

```
snooker-rankings/
├── src/
│   ├── app/
│   │   ├── layout.tsx    # Root layout with SEO metadata
│   │   ├── page.tsx      # Main rankings page
│   │   └── globals.css   # Global styles
│   ├── components/        # Reusable components
│   └── data/             # Data utilities
├── public/               # Static assets
└── package.json
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## ☁️ Deploy to Cloudflare Pages

### Option 1: Git Integration (Recommended)

1. Push code to GitHub/GitLab
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
3. Click "Create a project" → "Connect to Git"
4. Select your repository
5. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
6. Click "Deploy"

### Option 2: Direct Upload with Wrangler CLI

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build the project
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy out --project-name=snooker-rankings
```

## 📊 Features

- ✅ Live rankings table (Top 128 players)
- ✅ Search by player name or country
- ✅ Ranking trend indicators (↑↓−)
- ✅ Responsive design (mobile-first)
- ✅ SEO optimized metadata
- ✅ Fast global CDN (Cloudflare)

## 🔮 Roadmap

- [ ] Real-time data from World Snooker API
- [ ] Player detail pages with career stats
- [ ] Historical ranking charts
- [ ] Tournament calendar with points breakdown
- [ ] Multi-language support (EN, ZH, AR)
- [ ] Email alerts for ranking updates

## 📝 License

MIT

---

Built with ❤️ for snooker fans worldwide
