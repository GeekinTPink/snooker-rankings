'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { players, metadata } from '../data/rankings'
import LoginButton from '@/components/LoginButton'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // 检查登录状态，未登录重定向到登录页
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])
  
  // 加载中或已登录才显示内容
  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-snooker-green to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </main>
    )
  }
  
  // 未登录时不渲染内容（会被重定向）
  if (!session) {
    return null
  }

  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '↑'
    if (trend === 'down') return '↓'
    return '−'
  }

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-400'
  }

  // 格式化日期显示
  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-snooker-green to-gray-900">
      {/* Header */}
      <header className="bg-snooker-green border-b border-snooker-gold/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              🎱 World Snooker Rankings 2026
            </h1>
            <LoginButton />
          </div>
          <p className="text-gray-300 text-center text-lg">
            Live snooker world rankings - Updated {formatDate(metadata.lastUpdated)}
          </p>
        </div>
      </header>

      {/* Search */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search player or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-snooker-gold"
          />
        </div>
      </div>

      {/* Rankings Table */}
      <div className="container mx-auto px-4 pb-12">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-snooker-green/80">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-semibold">Rank</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Player</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Country</th>
                  <th className="px-6 py-4 text-right text-white font-semibold">Points</th>
                  <th className="px-6 py-4 text-center text-white font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player, index) => (
                  <tr 
                    key={player.rank}
                    className={`border-t border-white/10 hover:bg-white/10 transition-colors ${
                      index % 2 === 0 ? 'bg-transparent' : 'bg-white/5'
                    }`}
                  >
                    <td className="px-6 py-4 text-white font-bold text-lg">
                      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : ''} {player.rank}
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{player.name}</td>
                    <td className="px-6 py-4 text-gray-300">{player.country}</td>
                    <td className="px-6 py-4 text-right text-white font-mono">
                      {player.points.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 text-center text-2xl ${getTrendColor(player.trend)}`}>
                      {getTrendIcon(player.trend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredPlayers.length === 0 && (
          <p className="text-center text-gray-400 mt-8">No players found matching "{searchTerm}"</p>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-snooker-green/50 border-t border-white/10 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>Data source: {metadata.source} | Updated: {formatDate(metadata.lastUpdated)}</p>
          <p className="mt-2 text-sm">
            Built with Next.js + Tailwind CSS | Deployed on Cloudflare Pages
          </p>
        </div>
      </footer>
    </main>
  )
}
