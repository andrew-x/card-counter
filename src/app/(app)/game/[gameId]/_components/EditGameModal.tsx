'use client'

import useZodForm from '@/hooks/useZodForm'
import generateId from '@/lib/id'
import { useGameStore } from '@/lib/store'
import { Game, newGameSchema, Player } from '@/lib/types'
import { Button, Drawer, NumberInput, TextInput } from '@mantine/core'
import { Plus, Trash } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useFieldArray } from 'react-hook-form'
import type { z } from 'zod'

type EditGameFormData = z.infer<typeof newGameSchema>

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

type EditGameModalProps = {
  opened: boolean
  onClose: () => void
  game: Game
  gameId: string
}

export default function EditGameModal({
  opened,
  onClose,
  game,
  gameId,
}: EditGameModalProps) {
  const { updateGame } = useGameStore()
  const [selectedPreset, setSelectedPreset] = useState<ValueMapPreset>('custom')
  const [customValueMap, setCustomValueMap] = useState<Record<string, number>>(
    game.valueMap
  )

  const { register, handleSubmit, formState, control, reset, setValue } =
    useZodForm({
      schema: newGameSchema,
      defaultValues: {
        title: game.title,
        playerNames: game.players.map((p) => p.name),
        valueMap: game.valueMap,
      },
    })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'playerNames',
  })

  const handleAddPlayer = () => {
    append('')
  }

  const handleRemovePlayer = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const handlePresetChange = (preset: ValueMapPreset) => {
    setSelectedPreset(preset)
    if (preset !== 'custom') {
      const presetValueMap = VALUE_MAP_PRESETS[preset]
      setCustomValueMap(presetValueMap)
      setValue('valueMap', presetValueMap)
    }
  }

  const handleValueMapChange = (card: string, value: number) => {
    const newValueMap = { ...customValueMap, [card]: value }
    setCustomValueMap(newValueMap)
    setValue('valueMap', newValueMap)
    setSelectedPreset('custom')
  }

  const onSubmit = handleSubmit((data: EditGameFormData) => {
    const filteredPlayerNames = data.playerNames.filter(
      (name) => name.trim() !== ''
    )

    // Create new players for new names, keep existing players for existing names
    const existingPlayerMap = new Map(game.players.map((p) => [p.name, p]))
    const players: Player[] = filteredPlayerNames.map((name) => {
      const trimmedName = name.trim()
      const existingPlayer = existingPlayerMap.get(trimmedName)
      return existingPlayer || { id: generateId(), name: trimmedName }
    })

    // Recalculate totals for remaining players
    const newTotals: Record<string, number> = {}
    players.forEach((player) => {
      const existingTotal = game.totals[player.id] || 0
      newTotals[player.id] = existingTotal
    })

    updateGame(gameId, {
      title: data.title.trim(),
      players,
      valueMap: data.valueMap,
      totals: newTotals,
    })

    handleClose()
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  // Determine current preset when modal opens
  useEffect(() => {
    if (opened) {
      const currentValueMap = game.valueMap
      let preset: ValueMapPreset = 'custom'

      if (
        JSON.stringify(currentValueMap) ===
        JSON.stringify(VALUE_MAP_PRESETS.default)
      ) {
        preset = 'default'
      } else if (
        JSON.stringify(currentValueMap) ===
        JSON.stringify(VALUE_MAP_PRESETS.split)
      ) {
        preset = 'split'
      }

      setSelectedPreset(preset)
      setCustomValueMap(currentValueMap)

      reset({
        title: game.title,
        playerNames: game.players.map((p) => p.name),
        valueMap: currentValueMap,
      })
    }
  }, [opened, game, reset])

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      title="Edit Game"
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
        <TextInput
          label="Game Title"
          placeholder="Enter game title"
          {...register('title')}
          error={formState.errors.title?.message}
          required
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Players</label>
            <Button
              type="button"
              variant="subtle"
              size="xs"
              onClick={handleAddPlayer}
              leftSection={<Plus size={14} />}
            >
              Add Player
            </Button>
          </div>

          <ul className="space-y-2">
            {fields.map((field, index) => (
              <li key={field.id} className="flex gap-2">
                <TextInput
                  placeholder={`Player ${index + 1} name`}
                  {...register(`playerNames.${index}`)}
                  error={formState.errors.playerNames?.[index]?.message}
                  className="flex-1"
                  required
                />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="subtle"
                    color="red"
                    size="xs"
                    onClick={() => handleRemovePlayer(index)}
                  >
                    <Trash size={14} />
                  </Button>
                )}
              </li>
            ))}
          </ul>
          {formState.errors.playerNames?.root && (
            <div className="text-red-500 text-sm">
              {formState.errors.playerNames.root.message}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Card Values</label>

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
                    value={customValueMap[card]}
                    onChange={(val) =>
                      handleValueMapChange(
                        card,
                        typeof val === 'number' ? val : 0
                      )
                    }
                    min={0}
                    max={100}
                    size="xs"
                    className="flex-1"
                  />
                </li>
              ))}
            </ul>

            {selectedPreset === 'custom' && (
              <div className="text-xs text-gray-600">Custom values applied</div>
            )}
          </div>

          {formState.errors.valueMap && (
            <div className="text-red-500 text-sm mt-1">
              {formState.errors.valueMap.message}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="subtle"
            onClick={handleClose}
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
  )
}
