'use client'

import dayjs from '@/lib/dayjs'
import { useGameStore } from '@/lib/store'
import { Button } from '@mantine/core'
import {
  ArrowLeftIcon,
  CalendarIcon,
  PencilIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import EditGameModal from './_components/EditGameModal'
import RoundsSection from './_components/RoundsSection'
import TotalScoresSection from './_components/TotalScoresSection'

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { getGame, hasHydrated } = useGameStore()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const game = getGame(gameId)

  if (!hasHydrated) {
    return (
      <main className="min-h-screen px-4 py-6">
        <div className="text-center py-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading game...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!game) {
    return (
      <main className="min-h-screen px-4 py-6">
        <div className="text-center py-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Game Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The game you&apos;re looking for doesn&apos;t exist or has been
              deleted.
            </p>
            <Button component={Link} href="/home" variant="light" size="sm">
              Back to Games
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="px-4 py-4 max-w-xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              component={Link}
              href="/home"
              variant="subtle"
              size="sm"
              leftSection={<ArrowLeftIcon size={16} />}
            >
              Back
            </Button>
            <Button
              variant="subtle"
              size="sm"
              leftSection={<PencilIcon size={16} />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit
            </Button>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {game.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <UsersIcon size={16} className="text-blue-500" />
                <span className="font-medium">
                  {game.players.length} players
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="font-medium">{game.rounds.length} rounds</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-2">
              <CalendarIcon size={12} />
              <time dateTime={dayjs(game.createdAt).toISOString()}>
                {dayjs(game.createdAt).format('MMM D, YYYY')}
              </time>
            </div>
          </div>
        </header>

        {/* Total Scores Section */}
        <TotalScoresSection game={game} />

        {/* Rounds Section */}
        <RoundsSection game={game} gameId={gameId} />

        {/* Edit Game Modal */}
        <EditGameModal
          opened={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          game={game}
          gameId={gameId}
        />
      </div>
    </main>
  )
}
