// 斯诺克排名数据 — 从 WST 官网获取的实时数据
// 数据来源: https://www.wst.tv/rankings/

import rankingsData from './rankings-data.json'
import wstRankingsData from './rankings-wst.json'

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

// 优先使用 WST 实时数据，如果没有则使用本地 JSON 数据
function getRankingsData() {
  // 检查 WST 数据是否可用且较新（24小时内）
  if (wstRankingsData?.players?.length > 0) {
    const wstDate = new Date(wstRankingsData.lastUpdated)
    const now = new Date()
    const hoursDiff = (now.getTime() - wstDate.getTime()) / (1000 * 60 * 60)
    
    if (hoursDiff < 24) {
      return wstRankingsData
    }
  }
  
  return rankingsData
}

const activeData = getRankingsData()

/** 登录用户可见的世界排名前 N 位（与 WST 职业赛 top 64 种子线一致） */
export const TOP_DISPLAY_COUNT = 64

/** 未登录访客可见条数（SEO 可索引的公开预览） */
export const PUBLIC_PREVIEW_COUNT = 16

const allPlayers = activeData.players as Player[]
export const players: Player[] = allPlayers.slice(0, TOP_DISPLAY_COUNT)

// 数据元信息（playerCount 与列表一致，为当前页展示人数）
export const metadata = {
  lastUpdated: activeData.lastUpdated,
  source: activeData.source,
  playerCount: players.length
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
