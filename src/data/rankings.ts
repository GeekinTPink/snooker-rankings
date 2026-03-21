// 斯诺克排名数据
// 数据来源：https://www.snooker.org/res/index.asp?template=31
// 每日凌晨 3 点 UTC 自动更新

import rankingsData from './rankings-data.json'

export interface Player {
  rank: number
  name: string
  points: number
  country: string
  trend: 'up' | 'down' | 'same'
}

export interface RankingsData {
  lastUpdated: string
  source: string
  playerCount: number
  players: Player[]
}

// 从本地 JSON 文件加载数据（由爬虫脚本每日更新）
export const players: Player[] = rankingsData.players

// 数据元信息
export const metadata = {
  lastUpdated: rankingsData.lastUpdated,
  source: rankingsData.source,
  playerCount: rankingsData.playerCount
}

// 获取所有排名（兼容旧 API）
export async function fetchRankings(): Promise<Player[]> {
  return players
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
