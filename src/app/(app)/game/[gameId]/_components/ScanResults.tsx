'use client'

import { ActionIcon, Button, Popover } from '@mantine/core'
import {
  MinusIcon,
  PlusCircleIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

type CardCount = {
  value: string
  count: number
}

type ScanResultsProps = {
  initialCards: string[]
  valueMap: Record<string, number>
  onScoreChange: (newScore: number) => void
}

export default function ScanResults({
  initialCards,
  valueMap,
  onScoreChange,
}: ScanResultsProps) {
  const [cardCounts, setCardCounts] = useState<CardCount[]>([])
  const [addCardPopoverOpened, setAddCardPopoverOpened] = useState(false)

  // Initialize card counts from initial cards
  useEffect(() => {
    const cardOrder = [
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
    ]
    const counts: Record<string, number> = {}

    initialCards.forEach((card) => {
      // AI now returns clean card values, no need to strip suit symbols
      const cardValue = card.trim()
      counts[cardValue] = (counts[cardValue] || 0) + 1
    })

    const sortedCounts = cardOrder
      .filter((card) => counts[card] > 0)
      .map((card) => ({ value: card, count: counts[card] }))

    setCardCounts(sortedCounts)
  }, [initialCards])

  // Calculate total score and notify parent
  useEffect(() => {
    const totalScore = cardCounts.reduce((sum, { value, count }) => {
      return sum + (valueMap[value] || 0) * count
    }, 0)

    onScoreChange(totalScore)
  }, [cardCounts, valueMap, onScoreChange])

  const adjustCardCount = (cardValue: string, delta: number) => {
    setCardCounts((prev) =>
      prev
        .map((card) =>
          card.value === cardValue
            ? { ...card, count: Math.max(0, card.count + delta) }
            : card
        )
        .filter((card) => card.count > 0)
    )
  }

  const removeCardType = (cardValue: string) => {
    setCardCounts((prev) => prev.filter((card) => card.value !== cardValue))
  }

  const addCardType = (cardType: string) => {
    if (!cardCounts.find((card) => card.value === cardType)) {
      setCardCounts((prev) => {
        const cardOrder = [
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
        ]
        const newCard = { value: cardType, count: 1 }
        const updated = [...prev, newCard]
        return updated.sort(
          (a, b) => cardOrder.indexOf(a.value) - cardOrder.indexOf(b.value)
        )
      })
      setAddCardPopoverOpened(false)
    }
  }

  const totalScore = cardCounts.reduce((sum, { value, count }) => {
    return sum + (valueMap[value] || 0) * count
  }, 0)

  const totalCards = cardCounts.reduce((sum, { count }) => sum + count, 0)

  const availableCards = [
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
  ].filter((card) => !cardCounts.find((existing) => existing.value === card))

  return (
    <div className="space-y-4">
      {/* Header with summary */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Scan Results
        </h3>
        <p className="text-sm text-gray-600">{totalCards} cards recognized</p>
      </div>

      {/* Cards section */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Cards Found</h4>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            {cardCounts.length} types
          </span>
        </div>

        <div className="space-y-2">
          {cardCounts.map(({ value, count }) => {
            const pointsPerCard = valueMap[value] || 0
            const totalPoints = pointsPerCard * count
            return (
              <div
                key={value}
                className="flex items-center justify-between bg-blue-50 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-blue-500 text-white text-sm font-medium px-2 py-1 rounded">
                    {value}
                  </span>
                  <div className="flex items-center gap-1">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      size="sm"
                      onClick={() => adjustCardCount(value, -1)}
                    >
                      <MinusIcon size={12} />
                    </ActionIcon>
                    <span className="text-blue-700 font-medium text-sm min-w-[2rem] text-center">
                      x{count}
                    </span>
                    <ActionIcon
                      variant="light"
                      color="blue"
                      size="sm"
                      onClick={() => adjustCardCount(value, 1)}
                    >
                      <PlusIcon size={12} />
                    </ActionIcon>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-blue-900 font-semibold text-sm">
                      {totalPoints} pts
                    </div>
                    <div className="text-xs text-blue-600">
                      {pointsPerCard} each
                    </div>
                  </div>
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="sm"
                    onClick={() => removeCardType(value)}
                  >
                    <TrashIcon size={12} />
                  </ActionIcon>
                </div>
              </div>
            )
          })}
        </div>

        <div className="w-full center-col">
          {/* Add new card section */}
          <Popover
            width={320}
            position="bottom"
            shadow="md"
            opened={addCardPopoverOpened}
            onChange={setAddCardPopoverOpened}
          >
            <Popover.Target>
              <Button
                variant="light"
                leftSection={<PlusCircleIcon size={16} />}
                onClick={() => setAddCardPopoverOpened(true)}
                className="w-full mt-3"
                disabled={availableCards.length === 0}
              >
                Add Card Type
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <div className="p-2">
                <h4 className="text-sm font-medium text-gray-900 mb-3 text-center">
                  Select Card Type
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {availableCards.map((cardType) => (
                    <button
                      key={cardType}
                      onClick={() => addCardType(cardType)}
                      className="flex items-center justify-center bg-blue-500 text-white font-medium py-2 px-3 rounded hover:bg-blue-600 transition-colors duration-150 min-h-[2.5rem]"
                    >
                      {cardType}
                    </button>
                  ))}
                </div>
                {availableCards.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-4">
                    All card types are already added
                  </p>
                )}
              </div>
            </Popover.Dropdown>
          </Popover>
        </div>
      </div>

      {/* Score summary */}
      <div className="bg-green-50 rounded-xl border border-green-200 p-4">
        <div className="text-center">
          <p className="text-sm text-green-700 mb-1">Total Score</p>
          <p className="text-3xl font-bold text-green-900">{totalScore}</p>
          <p className="text-xs text-green-600 mt-1">from {totalCards} cards</p>
        </div>
      </div>
    </div>
  )
}
