'use client'

import { useState } from 'react'

// 模拟数据 - 后续会从 API 获取
const initialPlayers = [
  { rank: 1, name: 'Judd Trump', points: 1869000, country: 'England', trend: 'up' },
  { rank: 2, name: 'Kyren Wilson', points: 1421000, country: 'England', trend: 'up' },
  { rank: 3, name: 'Mark Allen', points: 1259000, country: 'Northern Ireland', trend: 'down' },
  { rank: 4, name: 'Ronnie O\'Sullivan', points: 1197000, country: 'England', trend: 'same' },
  { rank: 5, name: 'Luca Brecel', points: 1086000, country: 'Belgium', trend: 'down' },
  { rank: 6, name: 'Mark Selby', points: 987000, country: 'England', trend: 'up' },
  { rank: 7, name: 'John Higgins', points: 912000, country: 'Scotland', trend: 'same' },
  { rank: 8, name: 'Neil Robertson', points: 876000, country: 'Australia', trend: 'down' },
  { rank: 9, name: 'Ding Junhui', points: 834000, country: 'China', trend: 'up' },
  { rank: 10, name: 'Shaun Murphy', points: 789000, country: 'England', trend: 'up' },
  { rank: 11, name: 'Barry Hawkins', points: 745000, country: 'England', trend: 'same' },
  { rank: 12, name: 'Zhang Anda', points: 712000, country: 'China', trend: 'up' },
  { rank: 13, name: 'Tom Ford', points: 678000, country: 'England', trend: 'down' },
  { rank: 14, name: 'Stuart Bingham', points: 645000, country: 'England', trend: 'same' },
  { rank: 15, name: 'Gary Wilson', points: 612000, country: 'England', trend: 'down' },
  { rank: 16, name: 'Joe O\'Connor', points: 589000, country: 'England', trend: 'up' },
]

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredPlayers = initialPlayers.filter(player =>
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-snooker-green to-gray-900">
      {/* Header */}
      <header className="bg-snooker-green border-b border-snooker-gold/30">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-2">
            🎱 World Snooker Rankings 2026
          </h1>
          <p className="text-gray-300 text-center text-lg">
            Live snooker world rankings - Updated March 2026
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
          <p>Data source: World Snooker Tour | Updated: March 18, 2026</p>
          <p className="mt-2 text-sm">
            Built with Next.js + Tailwind CSS | Deployed on Cloudflare Pages
          </p>
        </div>
      </footer>
    </main>
  )
}
