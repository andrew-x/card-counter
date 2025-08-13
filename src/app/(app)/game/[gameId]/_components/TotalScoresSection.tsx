'use client'

import { Game } from '@/lib/types'

type TotalScoresSectionProps = {
  game: Game
}

export default function TotalScoresSection({ game }: TotalScoresSectionProps) {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Total Scores</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="space-y-3">
          {game.players
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((player) => {
              const score = game.totals[player.id] || 0
              const highestScore = Math.max(...Object.values(game.totals))
              const isWinner = score === highestScore && game.rounds.length > 0

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isWinner
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-semibold text-sm text-gray-700">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">
                      {player.name}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {score}
                  </span>
                </div>
              )
            })}
        </div>
      </div>
    </section>
  )
}
