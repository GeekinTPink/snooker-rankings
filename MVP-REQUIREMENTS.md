# 🎱 World Snooker Rankings 2026 - MVP 需求文档

**版本：** 1.0  
**创建日期：** 2026-03-18  
**状态：** 待开发  
**技术栈：** Next.js + Tailwind CSS + Cloudflare Pages

---

## 📋 目录

1. [项目概述](#1-项目概述)
2. [用户画像](#2-用户画像)
3. [核心需求](#3-核心需求)
4. [功能规格](#4-功能规格)
5. [技术架构](#5-技术架构)
6. [数据模型](#6-数据模型)
7. [页面设计](#7-页面设计)
8. [开发计划](#8-开发计划)
9. [成功指标](#9-成功指标)

---

## 1. 项目概述

### 1.1 产品定位

为全球斯诺克球迷提供**快速、准确、直观**的世界排名查询服务。

### 1.2 核心价值

| 价值点 | 说明 |
|--------|------|
| ⚡ 快速 | 3 秒内加载完成，全球 CDN 加速 |
| 📊 直观 | 可视化排名趋势，一目了然 |
| 📱 移动友好 | 手机端体验优先 |
| 🔍 易发现 | SEO 优化，Google 搜索友好 |

### 1.3 目标关键词

- **核心词：** `world snooker rankings 2026`
- **长尾词：** `snooker world rankings`, `snooker player points`, `snooker ranking system`

---

## 2. 用户画像

### 2.1 主要用户群体

| 用户类型 | 占比 | 需求场景 |
|---------|------|---------|
| 🎱 斯诺克球迷 | 60% | 查看偶像排名、追踪排名变化 |
| 💰 博彩玩家 | 25% | 赛前分析、赔率参考 |
| 📰 体育记者 | 10% | 报道素材、数据引用 |
| 🎰 体育从业者 | 5% | 赛事分析、球员评估 |

### 2.2 用户故事

```
作为一名斯诺克球迷，
我希望快速查看最新的世界排名，
以便了解我喜欢的球员当前状态。

作为一名博彩玩家，
我希望看到球员的排名趋势，
以便分析球员近期表现。

作为一名体育记者，
我希望获取准确的排名数据，
以便撰写报道时引用。
```

---

## 3. 核心需求

### 3.1 Must Have（MVP 必备）

| 优先级 | 功能 | 说明 |
|--------|------|------|
| P0 | 排名列表展示 | 展示 Top 128 球员排名 |
| P0 | 搜索功能 | 按球员名/国家搜索 |
| P0 | 响应式设计 | 适配手机/平板/桌面 |
| P0 | SEO 元数据 | Title、Description、Keywords |
| P1 | 排名趋势标识 | ↑↓− 箭头显示变化 |
| P1 | 数据更新时间 | 显示最后更新时间 |

### 3.2 Nice to Have（后续迭代）

| 优先级 | 功能 | 说明 |
|--------|------|------|
| P2 | 球员详情页 | 点击查看球员详细信息 |
| P2 | 历史排名图表 | 排名变化曲线图 |
| P2 | 赛事日历 | 显示 upcoming 比赛 |
| P3 | 多语言支持 | 英文、中文、阿拉伯语 |
| P3 | 邮件订阅 | 排名更新提醒 |

---

## 4. 功能规格

### 4.1 排名列表页（Home）

**URL:** `/`

**功能描述:**
- 展示 Top 128 球员排名表格
- 支持分页加载（每页 25/50/100 条）
- 支持搜索过滤
- 支持按列排序（排名、姓名、积分、国家）

**数据字段:**

| 字段 | 类型 | 说明 |
|------|------|------|
| rank | number | 当前排名 (1-128) |
| name | string | 球员姓名 |
| country | string | 国家/地区 |
| points | number | 积分 |
| trend | enum | 排名趋势 (up/down/same) |
| previous_rank | number | 上期排名 |

**交互设计:**
- 点击表头可排序
- 搜索框实时过滤
- 鼠标悬停高亮行
- 移动端表格可横向滚动

---

### 4.2 搜索功能

**搜索范围:**
- 球员姓名（支持模糊匹配）
- 国家/地区名称

**搜索逻辑:**
```javascript
// 伪代码
function searchPlayers(query) {
  return players.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.country.toLowerCase().includes(query.toLowerCase())
  )
}
```

**UI 要求:**
- 搜索框置于页面顶部
- 实时搜索（输入即过滤）
- 显示匹配结果数量
- 无结果时显示友好提示

---

### 4.3 排名趋势标识

**规则:**
- `↑` 绿色：排名上升（相比上期）
- `↓` 红色：排名下降（相比上期）
- `−` 灰色：排名不变

**数据来源:**
- 对比当前排名与上期排名
- 首次上线时所有球员标记为 `−`

---

## 5. 技术架构

### 5.1 技术选型

```
┌─────────────────────────────────────┐
│           Cloudflare CDN            │
│         (全球加速 + HTTPS)           │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         Cloudflare Pages            │
│           (静态托管)                 │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│          Next.js (SSG)              │
│      (静态生成 + 客户端交互)          │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         Tailwind CSS                │
│           (样式框架)                 │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│      数据源 (World Snooker API)      │
│         或 爬虫抓取                  │
└─────────────────────────────────────┘
```

### 5.2 项目结构

```
snooker-rankings/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # 根布局（SEO）
│   │   ├── page.tsx         # 首页（排名列表）
│   │   ├── player/
│   │   │   └── [id]/
│   │   │       └── page.tsx # 球员详情页（P2）
│   │   └── globals.css      # 全局样式
│   ├── components/
│   │   ├── RankingTable.tsx # 排名表格组件
│   │   ├── SearchBar.tsx    # 搜索框组件
│   │   ├── PlayerCard.tsx   # 球员卡片组件
│   │   └── TrendIcon.tsx    # 趋势图标组件
│   ├── data/
│   │   ├── rankings.ts      # 排名数据
│   │   └── api.ts           # API 调用
│   └── types/
│       └── index.ts         # TypeScript 类型定义
├── public/
│   ├── favicon.ico
│   └── og-image.png         # 社交分享图
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 5.3 部署流程

```bash
# 开发
npm run dev

# 构建
npm run build

# 部署到 Cloudflare Pages
wrangler pages deploy out --project-name=snooker-rankings
```

**CI/CD（可选）:**
- GitHub Actions 自动构建部署
- 每次 push 到 main 分支自动部署

---

## 6. 数据模型

### 6.1 Player 接口

```typescript
interface Player {
  id: string           // 球员唯一 ID
  rank: number         // 当前排名
  name: string         // 姓名
  country: string      // 国家
  points: number       // 积分
  trend: 'up' | 'down' | 'same'
  previous_rank: number // 上期排名
  age?: number         // 年龄（P2）
  turned_pro?: number  // 转为职业年份（P2）
  ranking_titles?: number // 排名赛冠军数（P2）
}
```

### 6.2 数据来源

**方案 A: 官方 API（优先）**
- 网址：https://www.worldsnooker.com/
- 需要确认是否有公开 API

**方案 B: 网页爬虫**
- 目标页面：https://www.worldsnooker.com/rankings/
- 工具：Puppeteer / Playwright
- 频率：每周更新 1 次（重大赛事后手动更新）

**方案 C: 第三方 API**
- snooker.org
- CueTracker.net

### 6.3 更新策略

| 数据 | 更新频率 | 方式 |
|------|---------|------|
| 排名数据 | 每周 / 赛事后 | 手动触发更新 |
| 球员信息 | 每月 | 自动同步 |
| 历史数据 | 一次性导入 | 手动 |

---

## 7. 页面设计

### 7.1 首页线框图

```
┌────────────────────────────────────────────┐
│  🎱 World Snooker Rankings 2026            │  ← Header
│  Live snooker world rankings               │
├────────────────────────────────────────────┤
│  [🔍 Search player or country...]          │  ← 搜索框
├────────────────────────────────────────────┤
│  Rank │ Player │ Country │ Points │ Trend  │  ← 表头
│  ─────┼────────┼─────────┼────────┼──────  │
│  🥇 1 │ J. Trump │ England │ 1,869K │   −   │
│  🥈 2 │ K. Wilson │ England │ 1,421K │   ↑   │
│  🥉 3 │ M. Allen │ N.Ireland│ 1,259K │   ↓   │
│   4   │ R. O'Sullivan │ England │ 1,197K │  − │
│   ...                                       │
│  [Load More]                                │
├────────────────────────────────────────────┤
│  Data source: World Snooker Tour           │  ← Footer
│  Updated: March 18, 2026                   │
└────────────────────────────────────────────┘
```

### 7.2 配色方案

| 用途 | 颜色 | Hex |
|------|------|-----|
| 主背景 | Snooker Green | `#0a4d2e` |
| 强调色 | Snooker Gold | `#d4af37` |
| 辅助色 | Snooker Red | `#c41e3a` |
| 文字 | White | `#ffffff` |
| 次要文字 | Gray | `#9ca3af` |

### 7.3 移动端适配

- 表格支持横向滚动
- 搜索框全宽显示
- 字体大小自适应
- 触摸友好（按钮 ≥ 44px）

---

## 8. 开发计划

### 8.1 里程碑

| 阶段 | 时间 | 目标 |
|------|------|------|
| Phase 1 | Week 1 | 完成 MVP 核心功能 |
| Phase 2 | Week 2 | 数据对接 + SEO 优化 |
| Phase 3 | Week 3 | 测试 + 部署上线 |
| Phase 4 | Week 4+ | 迭代优化（P2/P3 功能） |

### 8.2 任务分解

**Phase 1 - MVP 开发（3-5 天）**

- [ ] 项目初始化（Next.js + Tailwind）
- [ ] 排名表格组件开发
- [ ] 搜索功能实现
- [ ] 响应式布局调整
- [ ] 模拟数据填充

**Phase 2 - 数据对接（2-3 天）**

- [ ] 确定数据源（API / 爬虫）
- [ ] 实现数据抓取脚本
- [ ] 数据格式转换
- [ ] SEO 元数据优化
- [ ] 社交分享图（OG Image）

**Phase 3 - 测试部署（2 天）**

- [ ] 功能测试
- [ ] 性能测试（Lighthouse）
- [ ] 移动端兼容性测试
- [ ] Cloudflare Pages 部署
- [ ] 域名配置（可选）

**Phase 4 - 迭代优化（持续）**

- [ ] 球员详情页
- [ ] 历史排名图表
- [ ] 赛事日历
- [ ] 多语言支持

---

## 9. 成功指标

### 9.1 技术指标

| 指标 | 目标值 | 测量方式 |
|------|--------|---------|
| 首屏加载时间 | < 2s | Lighthouse |
| 页面大小 | < 500KB | Chrome DevTools |
| SEO 评分 | > 90 | Lighthouse |
| 移动端适配 | 100% | Responsive Test |

### 9.2 业务指标

| 指标 | 目标（3 个月） | 测量方式 |
|------|--------------|---------|
| 月活跃用户 | 10,000+ | Google Analytics |
| Google 排名 | 核心词前 10 | Google Search |
| 跳出率 | < 40% | Google Analytics |
| 平均停留时长 | > 2 分钟 | Google Analytics |

### 9.3 SEO 目标

- **核心词排名：** `world snooker rankings 2026` → 前 5 名
- **长尾词覆盖：** 20+ 关键词有排名
- **自然流量：** 月均 5,000+ 搜索访问

---

## 📎 附录

### A. 竞品分析

| 网站 | 优势 | 劣势 | 机会点 |
|------|------|------|--------|
| worldsnooker.com | 官方权威 | 体验一般、广告多 | 更好的 UX |
| snooker.org | 数据全面 | 界面老旧 | 现代化设计 |
| wikipedia | SEO 强 | 更新慢 | 实时更新 |

### B. 风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|---------|
| 数据源不稳定 | 高 | 多数据源备份 |
| SEO 竞争激烈 | 中 | 长尾词策略 |
| 版权问题 | 中 | 仅展示公开数据 |

### C. 参考资料

- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [World Snooker Tour](https://www.worldsnooker.com/)

---

**文档结束**  
*最后更新：2026-03-18*
