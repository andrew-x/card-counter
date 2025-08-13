import { z } from 'zod'

export const loginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

export const newGameSchema = z.object({
  title: z.string().min(1, 'Game title is required'),
  playerNames: z
    .array(z.string().min(1, 'Player name is required'))
    .min(1, 'At least one player is required'),
  valueMap: z.record(z.string(), z.number()),
})

export type Player = {
  id: string
  name: string
}

export type Round = {
  id: string

  valueMap: Record<string, number>
  scores: Record<string, number>

  createdAt: Date
}

export type Game = {
  id: string
  title: string

  players: Player[]
  valueMap: Record<string, number>

  rounds: Round[]
  totals: Record<string, number>

  createdAt: Date
}
