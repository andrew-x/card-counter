import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import generateId from './id'
import { Game, Player, Round } from './types'

type GameStore = {
  games: Game[]
  hasHydrated: boolean

  // Game actions
  addGame: (
    title: string,
    players: Player[],
    valueMap: Record<string, number>
  ) => void
  updateGame: (
    gameId: string,
    updates: Partial<Omit<Game, 'id' | 'createdAt'>>
  ) => void
  deleteGame: (gameId: string) => void
  getGame: (gameId: string) => Game | undefined

  // Round actions
  addRound: (gameId: string, scores: Record<string, number>) => void
  updateRound: (
    gameId: string,
    roundId: string,
    scores: Record<string, number>
  ) => void
  deleteRound: (gameId: string, roundId: string) => void

  // Utility actions
  clearAllGames: () => void
  setHasHydrated: (hasHydrated: boolean) => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      games: [],
      hasHydrated: false,

      addGame: (title, players, valueMap) => {
        const newGame: Game = {
          id: generateId(),
          title,
          players,
          valueMap,
          rounds: [],
          totals: players.reduce(
            (acc, player) => ({ ...acc, [player.id]: 0 }),
            {}
          ),
          createdAt: new Date(),
        }

        set((state) => ({
          games: [...state.games, newGame],
        }))
      },

      updateGame: (gameId, updates) => {
        set((state) => ({
          games: state.games.map((game) =>
            game.id === gameId ? { ...game, ...updates } : game
          ),
        }))
      },

      deleteGame: (gameId) => {
        set((state) => ({
          games: state.games.filter((game) => game.id !== gameId),
        }))
      },

      getGame: (gameId) => {
        return get().games.find((game) => game.id === gameId)
      },

      addRound: (gameId, scores) => {
        const game = get().getGame(gameId)
        if (!game) return

        const newRound: Round = {
          id: generateId(),
          valueMap: game.valueMap,
          scores,
          createdAt: new Date(),
        }

        // Calculate new totals
        const newTotals = { ...game.totals }
        Object.entries(scores).forEach(([playerId, score]) => {
          newTotals[playerId] = (newTotals[playerId] || 0) + score
        })

        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId
              ? {
                  ...g,
                  rounds: [...g.rounds, newRound],
                  totals: newTotals,
                }
              : g
          ),
        }))
      },

      updateRound: (gameId, roundId, scores) => {
        const game = get().getGame(gameId)
        if (!game) return

        const roundIndex = game.rounds.findIndex((r) => r.id === roundId)
        if (roundIndex === -1) return

        const oldScores = game.rounds[roundIndex].scores

        // Recalculate totals by removing old scores and adding new ones
        const newTotals = { ...game.totals }
        Object.entries(oldScores).forEach(([playerId, score]) => {
          newTotals[playerId] = (newTotals[playerId] || 0) - score
        })
        Object.entries(scores).forEach(([playerId, score]) => {
          newTotals[playerId] = (newTotals[playerId] || 0) + score
        })

        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId
              ? {
                  ...g,
                  rounds: g.rounds.map((r) =>
                    r.id === roundId ? { ...r, scores } : r
                  ),
                  totals: newTotals,
                }
              : g
          ),
        }))
      },

      deleteRound: (gameId, roundId) => {
        const game = get().getGame(gameId)
        if (!game) return

        const roundToDelete = game.rounds.find((r) => r.id === roundId)
        if (!roundToDelete) return

        // Recalculate totals by removing the deleted round's scores
        const newTotals = { ...game.totals }
        Object.entries(roundToDelete.scores).forEach(([playerId, score]) => {
          newTotals[playerId] = (newTotals[playerId] || 0) - score
        })

        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId
              ? {
                  ...g,
                  rounds: g.rounds.filter((r) => r.id !== roundId),
                  totals: newTotals,
                }
              : g
          ),
        }))
      },

      clearAllGames: () => {
        set({ games: [] })
      },

      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated })
      },
    }),
    {
      name: 'game-store',
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
