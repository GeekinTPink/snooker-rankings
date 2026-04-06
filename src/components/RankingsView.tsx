'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  players,
  metadata,
  TOP_DISPLAY_COUNT,
  PUBLIC_PREVIEW_COUNT,
} from '@/data/rankings'
import SiteHeader from '@/components/SiteHeader'
import type { Player } from '@/data/rankings'

export default function RankingsView() {
  const { data: session, status } = useSession()
  const [searchTerm, setSearchTerm] = useState('')

  const showFull = status === 'authenticated'
  const pool = showFull ? players : players.slice(0, PUBLIC_PREVIEW_COUNT)

  const filteredPlayers = pool.filter(
    (player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '↑'
    if (trend === 'down') return '↓'
    return '−'
  }

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-emerald-400'
    if (trend === 'down') return 'text-red-400'
    return 'text-gray-400'
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const subtitle = showFull
    ? `World Tour · Top ${TOP_DISPLAY_COUNT} · Updated ${formatDate(metadata.lastUpdated)}`
    : `World Tour · Top ${PUBLIC_PREVIEW_COUNT} public preview · Sign in for ranks 1–${TOP_DISPLAY_COUNT} · Updated ${formatDate(metadata.lastUpdated)}`

  const footerLine = showFull
    ? `Showing top ${TOP_DISPLAY_COUNT} · Last sync: ${formatDate(metadata.lastUpdated)}`
    : `Public preview: ranks 1–${PUBLIC_PREVIEW_COUNT} only · Sign in to see ranks 1–${TOP_DISPLAY_COUNT} · Last sync: ${formatDate(metadata.lastUpdated)}`

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-snooker-green/95 to-gray-950">
      <SiteHeader
        title="World Snooker Rankings"
        subtitle={subtitle}
        showPricingLink={showFull}
      />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <section className="mb-8 max-w-3xl mx-auto text-center" aria-labelledby="rankings-overview">
          <h2 id="rankings-overview" className="text-xl md:text-2xl font-semibold text-white mb-3">
            Official-style world rankings
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Browse the current world ranking order with prize-money style points. Visitors see the top{' '}
            {PUBLIC_PREVIEW_COUNT} players; after Google sign-in you unlock ranks 1–{TOP_DISPLAY_COUNT}.
          </p>
        </section>

        <section className="mb-8 max-w-3xl mx-auto" aria-labelledby="data-source-heading">
          <h2 id="data-source-heading" className="text-xl md:text-2xl font-semibold text-white mb-2 text-center md:text-left">
            Data source and updates
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed text-center md:text-left">
            Numbers follow the WST Gamechanger published two-year world list (not Wikipedia). The table below
            refreshes when the site data snapshot is updated—check the footer for the last sync date.
          </p>
        </section>

        {!showFull ? (
          <section
            className="mb-6 max-w-2xl mx-auto"
            aria-labelledby="preview-unlock-heading"
          >
            <h2
              id="preview-unlock-heading"
              className="text-lg md:text-xl font-semibold text-white mb-3 text-center"
            >
              Unlock the full top {TOP_DISPLAY_COUNT}
            </h2>
            <div
              className="rounded-2xl border border-snooker-gold/30 bg-snooker-green/20 px-4 py-4 text-center text-sm text-gray-200 leading-relaxed"
              role="status"
            >
              <p>
                You are viewing the <strong className="text-snooker-gold">top {PUBLIC_PREVIEW_COUNT}</strong>{' '}
                players without signing in. Use <strong>Sign in with Google</strong> in the header (or{' '}
                <Link href="/login" className="text-snooker-gold underline hover:text-amber-300">
                  open the login page
                </Link>
                ) to unlock ranks {PUBLIC_PREVIEW_COUNT + 1}–{TOP_DISPLAY_COUNT}.
              </p>
            </div>
          </section>
        ) : null}

        <p className="text-center text-gray-400 text-sm mb-4 max-w-2xl mx-auto leading-relaxed">
          Source: {metadata.source}
        </p>

        <section className="max-w-md mx-auto mb-6" aria-labelledby="search-players-heading">
          <h2
            id="search-players-heading"
            className="text-xl md:text-2xl font-semibold text-white mb-3 text-center md:text-left"
          >
            Find a player
          </h2>
          <label htmlFor="player-search" className="sr-only">
            Search players
          </label>
          <input
            id="player-search"
            type="search"
            placeholder="Search by player or country…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-snooker-gold/80 focus:border-transparent"
          />
        </section>

        <section className="mt-2" aria-labelledby="rankings-table-heading">
          <h2
            id="rankings-table-heading"
            className="text-xl md:text-2xl font-semibold text-white mb-3 text-center md:text-left max-w-6xl mx-auto px-1"
          >
            Rankings table
          </h2>

          <div className="hidden md:block bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-snooker-green/90 border-b border-snooker-gold/20">
                <tr>
                  <th scope="col" className="px-4 lg:px-6 py-4 text-snooker-gold font-semibold w-24">
                    Rank
                  </th>
                  <th scope="col" className="px-4 lg:px-6 py-4 text-white font-semibold">
                    Player
                  </th>
                  <th scope="col" className="px-4 lg:px-6 py-4 text-white font-semibold">
                    Country
                  </th>
                  <th scope="col" className="px-4 lg:px-6 py-4 text-right text-white font-semibold">
                    Points
                  </th>
                  <th scope="col" className="px-4 lg:px-6 py-4 text-center text-white font-semibold w-24">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player, index) => (
                  <PlayerTableRow
                    key={`${player.rank}-${player.name}`}
                    player={player}
                    index={index}
                    getTrendColor={getTrendColor}
                    getTrendIcon={getTrendIcon}
                  />
                ))}
              </tbody>
            </table>
          </div>
          </div>

          <ul className="md:hidden space-y-3 pb-8">
          {filteredPlayers.map((player) => (
            <li
              key={`${player.rank}-${player.name}`}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 shadow-lg shadow-black/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-snooker-gold font-bold text-lg tabular-nums">#{player.rank}</span>
                    {medalForRank(player.rank)}
                    <span className="text-white font-semibold truncate">{player.name}</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{player.country}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white font-mono text-sm tabular-nums">{player.points.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-0.5">points</p>
                </div>
              </div>
              <div className={`mt-3 text-center text-xl ${getTrendColor(player.trend)}`} aria-label={`Trend ${player.trend}`}>
                {getTrendIcon(player.trend)}
              </div>
            </li>
          ))}
          </ul>

          {filteredPlayers.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No players match &ldquo;{searchTerm}&rdquo;</p>
          ) : null}
        </section>
      </div>

      <footer className="border-t border-white/10 bg-black/20 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm max-w-3xl">
          <p>{footerLine}</p>
          <p className="mt-2 text-xs">Next.js · Tailwind · Cloudflare</p>
        </div>
      </footer>
    </main>
  )
}

function medalForRank(rank: number) {
  if (rank === 1) return <span aria-hidden>🥇</span>
  if (rank === 2) return <span aria-hidden>🥈</span>
  if (rank === 3) return <span aria-hidden>🥉</span>
  return null
}

function PlayerTableRow({
  player,
  index,
  getTrendColor,
  getTrendIcon,
}: {
  player: Player
  index: number
  getTrendColor: (t: string) => string
  getTrendIcon: (t: string) => string
}) {
  return (
    <tr
      className={`border-t border-white/10 hover:bg-white/5 transition-colors ${
        index % 2 === 1 ? 'bg-white/[0.03]' : ''
      }`}
    >
      <td className="px-4 lg:px-6 py-3.5 text-white font-bold tabular-nums">
        <span className="inline-flex items-center gap-2">
          {medalForRank(player.rank)}
          {player.rank}
        </span>
      </td>
      <td className="px-4 lg:px-6 py-3.5 text-white font-medium">{player.name}</td>
      <td className="px-4 lg:px-6 py-3.5 text-gray-300">{player.country}</td>
      <td className="px-4 lg:px-6 py-3.5 text-right text-white font-mono tabular-nums text-sm">
        {player.points.toLocaleString()}
      </td>
      <td className={`px-4 lg:px-6 py-3.5 text-center text-xl ${getTrendColor(player.trend)}`}>
        {getTrendIcon(player.trend)}
      </td>
    </tr>
  )
}
