'use client'

import useZodForm from '@/hooks/useZodForm'
import dayjs from '@/lib/dayjs'
import { useGameStore } from '@/lib/store'
import { Game } from '@/lib/types'
import { Accordion, Button, Drawer, NumberInput } from '@mantine/core'
import { CameraIcon, GearIcon, PlusIcon, Trash } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import ScanDrawer from './ScanDrawer'

type RoundsSectionProps = {
  game: Game
  gameId: string
}

const valueMapSchema = z.object({
  valueMap: z.record(z.string(), z.number()),
})

type ValueMapFormData = z.infer<typeof valueMapSchema>

type ValueMapPreset = 'default' | 'split' | 'custom'

const VALUE_MAP_PRESETS = {
  default: {
    A: 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    J: 11,
    Q: 12,
    K: 13,
  },
  split: {
    A: 5,
    '2': 5,
    '3': 5,
    '4': 5,
    '5': 5,
    '6': 5,
    '7': 5,
    '8': 10,
    '9': 10,
    '10': 10,
    J: 10,
    Q: 10,
    K: 10,
  },
}

export default function RoundsSection({ game, gameId }: RoundsSectionProps) {
  const { addRound, updateRound, deleteRound, updateGame } = useGameStore()
  const [openedRounds, setOpenedRounds] = useState<string[]>([])
  const [valueMapDrawerOpen, setValueMapDrawerOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<ValueMapPreset>('custom')
  const [scanDrawerOpen, setScanDrawerOpen] = useState(false)
  const [scanningPlayer, setScanningPlayer] = useState<{
    roundId: string
    playerId: string
  } | null>(null)

  const { handleSubmit, formState, reset, setValue, watch } = useZodForm({
    schema: valueMapSchema,
    defaultValues: {
      valueMap: VALUE_MAP_PRESETS.default,
    },
  })

  const currentValueMap = watch('valueMap')

  // Initialize with the latest round open when component mounts or when rounds change
  useEffect(() => {
    if (game.rounds.length > 0) {
      const sortedRounds = [...game.rounds].sort(
        (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
      )
      const latestRoundId = sortedRounds[0].id

      // Only set the latest round as open if it's not already in the opened rounds
      // This ensures newly added rounds are opened while preserving user's open/close state
      setOpenedRounds((prev) => {
        if (!prev.includes(latestRoundId)) {
          return [latestRoundId]
        }
        return prev
      })
    }
  }, [game.rounds])

  const handleAddRound = () => {
    // Create empty scores for all players
    const emptyScores = game.players.reduce(
      (acc, player) => ({ ...acc, [player.id]: 0 }),
      {}
    )

    addRound(gameId, emptyScores)
  }

  const handleScoreChange = (
    roundId: string,
    playerId: string,
    value: number | string
  ) => {
    const numValue = typeof value === 'string' ? parseInt(value) || 0 : value

    // Get current round scores
    const round = game.rounds.find((r) => r.id === roundId)
    if (!round) return

    // Update with new score
    const updatedScores = {
      ...round.scores,
      [playerId]: numValue,
    }

    // Auto-save immediately
    updateRound(gameId, roundId, updatedScores)
  }

  const handleDeleteRound = (roundId: string) => {
    // Remove the round from opened rounds if it was open
    setOpenedRounds((prev) => prev.filter((id) => id !== roundId))
    // Delete the round from the store
    deleteRound(gameId, roundId)
  }

  const handleOpenValueMapDrawer = () => {
    const gameValueMap = { ...game.valueMap }

    // Reset form with current game value map
    reset({ valueMap: gameValueMap })

    // Determine which preset matches the current value map
    if (
      JSON.stringify(gameValueMap) === JSON.stringify(VALUE_MAP_PRESETS.default)
    ) {
      setSelectedPreset('default')
    } else if (
      JSON.stringify(gameValueMap) === JSON.stringify(VALUE_MAP_PRESETS.split)
    ) {
      setSelectedPreset('split')
    } else {
      setSelectedPreset('custom')
    }

    setValueMapDrawerOpen(true)
  }

  const handleCloseValueMapDrawer = () => {
    setValueMapDrawerOpen(false)
    setSelectedPreset('custom')
    reset({ valueMap: VALUE_MAP_PRESETS.default })
  }

  const handlePresetChange = (preset: ValueMapPreset) => {
    setSelectedPreset(preset)
    if (preset !== 'custom') {
      const presetValueMap = VALUE_MAP_PRESETS[preset]
      setValue('valueMap', presetValueMap)
    }
  }

  const handleValueMapChange = (card: string, value: number) => {
    const newValueMap = { ...currentValueMap, [card]: value }
    setValue('valueMap', newValueMap)
    setSelectedPreset('custom')
  }

  const onSubmit = handleSubmit((data: ValueMapFormData) => {
    updateGame(gameId, { valueMap: data.valueMap })
    handleCloseValueMapDrawer()
  })

  const handleOpenScanDrawer = (roundId: string, playerId: string) => {
    setScanningPlayer({ roundId, playerId })
    setScanDrawerOpen(true)
  }

  const handleCloseScanDrawer = () => {
    setScanDrawerOpen(false)
    setScanningPlayer(null)
  }

  const handleConfirmScan = (score: number) => {
    if (scanningPlayer) {
      handleScoreChange(scanningPlayer.roundId, scanningPlayer.playerId, score)
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Rounds</h2>
        <Button leftSection={<PlusIcon size={16} />} onClick={handleAddRound}>
          Add Round
        </Button>
      </div>

      {game.rounds.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No rounds yet
          </h3>
          <p className="text-gray-600">
            Start playing to see round scores appear here!
          </p>
        </div>
      ) : (
        (() => {
          const sortedRounds = [...game.rounds].sort(
            (a, b) =>
              dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
          )

          return (
            <Accordion
              multiple
              className="space-y-3"
              value={openedRounds}
              onChange={setOpenedRounds}
            >
              {sortedRounds.map((round, index) => {
                const roundNumber = game.rounds.length - index

                return (
                  <Accordion.Item
                    key={round.id}
                    value={round.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <Accordion.Control className="px-4 py-3 hover:bg-gray-50">
                      <h3 className="font-semibold text-gray-900 text-left">
                        Round {roundNumber}
                      </h3>
                    </Accordion.Control>

                    <Accordion.Panel className="px-4 pb-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-700">
                            Player Scores
                          </h4>
                          <Button
                            size="xs"
                            variant="subtle"
                            leftSection={<GearIcon size={14} />}
                            onClick={handleOpenValueMapDrawer}
                          >
                            Configure Value Map
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {game.players
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((player) => {
                              const currentScore = round.scores[player.id] ?? 0

                              return (
                                <div
                                  key={player.id}
                                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                                >
                                  <span className="text-gray-900 font-medium">
                                    {player.name}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="xs"
                                      variant="subtle"
                                      leftSection={<CameraIcon size={14} />}
                                      onClick={() =>
                                        handleOpenScanDrawer(
                                          round.id,
                                          player.id
                                        )
                                      }
                                    >
                                      Scan
                                    </Button>
                                    <div className="w-20">
                                      <input
                                        type="text"
                                        value={currentScore || ''}
                                        onChange={(e) => {
                                          const value = e.target.value
                                          // Only allow numbers and empty string
                                          if (
                                            value === '' ||
                                            /^\d+$/.test(value)
                                          ) {
                                            handleScoreChange(
                                              round.id,
                                              player.id,
                                              value
                                            )
                                          }
                                        }}
                                        className="w-full px-2 py-1 text-right font-semibold text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="0"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                        </div>

                        <div className="flex justify-end mt-4 pt-3 border-t border-gray-200">
                          <Button
                            size="xs"
                            variant="subtle"
                            color="red"
                            leftSection={<Trash size={14} />}
                            onClick={() => handleDeleteRound(round.id)}
                          >
                            Delete Round
                          </Button>
                        </div>
                      </div>
                    </Accordion.Panel>
                  </Accordion.Item>
                )
              })}
            </Accordion>
          )
        })()
      )}

      <Drawer
        opened={valueMapDrawerOpen}
        onClose={handleCloseValueMapDrawer}
        title="Configure Value Map"
        position="bottom"
        size="75%"
        overlayProps={{ opacity: 0.5, blur: 4 }}
        transitionProps={{ duration: 300, transition: 'slide-up' }}
        withCloseButton={false}
        radius="lg"
        styles={{
          content: {
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          },
          header: {
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            paddingBottom: '8px',
          },
        }}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Card Values
            </label>

            <div className="space-y-3">
              <ul className="flex gap-2">
                <li>
                  <Button
                    type="button"
                    variant={selectedPreset === 'default' ? 'filled' : 'subtle'}
                    size="xs"
                    onClick={() => handlePresetChange('default')}
                  >
                    Default
                  </Button>
                </li>
                <li>
                  <Button
                    type="button"
                    variant={selectedPreset === 'split' ? 'filled' : 'subtle'}
                    size="xs"
                    onClick={() => handlePresetChange('split')}
                  >
                    Split (A-7=5, 8-K=10)
                  </Button>
                </li>
              </ul>

              <ul className="grid grid-cols-3 gap-2">
                {[
                  'A',
                  '2',
                  '3',
                  '4',
                  '5',
                  '6',
                  '7',
                  '8',
                  '9',
                  '10',
                  'J',
                  'Q',
                  'K',
                ].map((card) => (
                  <li key={card} className="flex items-center gap-1">
                    <span className="text-sm font-medium w-6">{card}:</span>
                    <NumberInput
                      value={currentValueMap[card] || 0}
                      onChange={(val) =>
                        handleValueMapChange(
                          card,
                          typeof val === 'number' ? val : 0
                        )
                      }
                      size="xs"
                      className="flex-1"
                      error={formState.errors.valueMap?.[card]?.message}
                    />
                  </li>
                ))}
              </ul>

              {selectedPreset === 'custom' && (
                <div className="text-xs text-gray-600">
                  Custom values applied
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="subtle"
              onClick={handleCloseValueMapDrawer}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={formState.isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Drawer>

      <ScanDrawer
        opened={scanDrawerOpen}
        onClose={handleCloseScanDrawer}
        valueMap={game.valueMap}
        onConfirm={handleConfirmScan}
      />
    </section>
  )
}
