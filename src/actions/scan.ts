'use server'

import { publicActionClient } from '@/lib/action'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

const scanCardSchema = z.object({
  image: z.string().min(1, 'Image is required'),
  valueMap: z.record(z.string(), z.number()),
})

const cardRecognitionSchema = z.object({
  recognizedCards: z.array(z.string()),
  confidence: z.number().min(0).max(1),
})

export const scanCards = publicActionClient
  .metadata({ action: 'scanCards' })
  .schema(scanCardSchema)
  .action(async ({ parsedInput: { image, valueMap } }) => {
    const result = await generateObject({
      model: google('gemini-2.5-flash-lite'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image of playing cards and identify each card you can clearly see.

Please identify each card using the format: A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K (for face values).
DO NOT include suits or any other text, your answer should only be a list with these possible values: A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K.

Be conservative in your recognition - only include cards you can clearly identify. If you're unsure about a card, don't include it.`,
            },
            {
              type: 'image',
              image: image,
            },
          ],
        },
      ],
      schema: cardRecognitionSchema,
    })

    const totalScore = result.object.recognizedCards.reduce((sum, card) => {
      return sum + (valueMap[card] || 0)
    }, 0)

    return {
      ...result.object,
      totalScore,
    }
  })
