// 斯诺克排名数据抓取脚本
// 数据来源：https://www.worldsnooker.com/rankings/

export interface Player {
  rank: number
  name: string
  points: number
  country: string
  trend: 'up' | 'down' | 'same'
}

// 模拟数据 - 后续替换为真实 API 调用
export const mockPlayers: Player[] = [
  { rank: 1, name: 'Judd Trump', points: 1869000, country: 'England', trend: 'same' },
  { rank: 2, name: 'Kyren Wilson', points: 1421000, country: 'England', trend: 'same' },
  { rank: 3, name: 'Mark Allen', points: 1259000, country: 'Northern Ireland', trend: 'same' },
  { rank: 4, name: 'Ronnie O\'Sullivan', points: 1197000, country: 'England', trend: 'same' },
  { rank: 5, name: 'Luca Brecel', points: 1086000, country: 'Belgium', trend: 'same' },
  { rank: 6, name: 'Mark Selby', points: 987000, country: 'England', trend: 'same' },
  { rank: 7, name: 'John Higgins', points: 912000, country: 'Scotland', trend: 'same' },
  { rank: 8, name: 'Neil Robertson', points: 876000, country: 'Australia', trend: 'same' },
  { rank: 9, name: 'Ding Junhui', points: 834000, country: 'China', trend: 'same' },
  { rank: 10, name: 'Shaun Murphy', points: 789000, country: 'England', trend: 'same' },
]

// TODO: 实现真实数据抓取
export async function fetchRankings(): Promise<Player[]> {
  // 方案 1: 调用 World Snooker 官方 API（如果有）
  // 方案 2: 使用 Puppeteer/Playwright 抓取网页
  // 方案 3: 使用第三方 API（如 snooker.org）
  
  // 暂时返回模拟数据
  return mockPlayers
}

// 格式化积分数
export function formatPoints(points: number): string {
  return points.toLocaleString()
}

// 获取趋势图标
export function getTrendIcon(trend: string): string {
  if (trend === 'up') return '↑'
  if (trend === 'down') return '↓'
  return '−'
}
