'use client'

import dayjs from '@/lib/dayjs'
import { useGameStore } from '@/lib/store'
import { Button } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  CalendarIcon,
  Plus,
  PlusIcon,
  TrashIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import Link from 'next/link'
import NewGameModal from './_components/NewGameModal'

export default function App() {
  const { games, deleteGame } = useGameStore()
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <main className="min-h-screen">
      <div className="px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Games</h1>
          <Button
            onClick={open}
            leftSection={<PlusIcon size={16} />}
            variant="filled"
            size="sm"
            className="shadow-md"
          >
            New Game
          </Button>
        </header>

        {games.length === 0 ? (
          <section className="text-center py-16">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={24} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                No games yet
              </h2>
              <p className="text-gray-600 mb-6">
                Create your first game to get started tracking scores!
              </p>
              <Button onClick={open} variant="light" size="sm">
                Create Game
              </Button>
            </div>
          </section>
        ) : (
          <section>
            <ul className="space-y-3">
              {games
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((game) => (
                  <li key={game.id}>
                    <article className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <Link href={`/game/${game.id}`} className="block p-4">
                        <header className="flex items-start justify-between mb-3">
                          <h2 className="text-lg font-semibold text-gray-900 leading-tight truncate pr-3">
                            {game.title}
                          </h2>
                          <Button
                            variant="subtle"
                            color="red"
                            size="xs"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              deleteGame(game.id)
                            }}
                            className="flex-shrink-0"
                            aria-label={`Delete ${game.title}`}
                          >
                            <TrashIcon size={16} />
                          </Button>
                        </header>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1.5">
                            <UsersIcon size={16} className="text-blue-500" />
                            <span className="font-medium">
                              {game.players.length}
                            </span>
                            <span>players</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="font-medium">
                              {game.rounds.length}
                            </span>
                            <span>rounds</span>
                          </div>
                        </div>

                        <footer className="flex items-center gap-1.5 text-xs text-gray-500">
                          <CalendarIcon size={12} />
                          <time dateTime={dayjs(game.createdAt).toISOString()}>
                            Created{' '}
                            {dayjs(game.createdAt).format('MMM D, YYYY')}
                          </time>
                        </footer>
                      </Link>
                    </article>
                  </li>
                ))}
            </ul>
          </section>
        )}

        <NewGameModal opened={opened} onClose={close} />
      </div>
    </main>
  )
}
