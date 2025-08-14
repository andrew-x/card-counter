'use server'

import { publicActionClient } from '@/lib/action'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

const scanCardSchema = z.object({
  image: z.string().min(1, 'Image is required'),
  valueMap: z.record(z.string(), z.number()),
})

const cardRecognitionSchema = z.array(z.string())

export const scanCards = publicActionClient
  .metadata({ action: 'scanCards' })
  .schema(scanCardSchema)
  .action(async ({ parsedInput: { image, valueMap } }) => {
    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      messages: [
        {
          role: 'system',
          content: `
You are an automated card identification service. Your one and only function is to analyze an image and output the values of the playing cards you see.

**Standard Operating Procedure:**
1.  On receiving an image, immediately scan for all clearly visible playing cards from a standard 52-card deck.
2.  For each card found, identify its face value. Ignore any cards that are ambiguous, blurry, or partially obscured.
3.  Return all identified card values as a JSON array.

**Mandatory Output Format:**
-   Your response must be a JSON array of strings containing the card values.
-   Allowed values: 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'
-   Include every card found, including duplicates.
-   Only return the card values, no other information.

**Example:** If the input image contains a 4, a Queen, and another 4, your output should be:
["4", "Q", "4"]
          `,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `
Analyze the image and output the values of the playing cards you see.
`,
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

    // eslint-disable-next-line no-console
    console.log('🤖 Raw LLM Response:', JSON.stringify(result.object, null, 2))

    const recognizedCards = result.object
    const totalScore = recognizedCards.reduce((sum, card) => {
      return sum + (valueMap[card] || 0)
    }, 0)

    return {
      recognizedCards,
      totalScore,
    }
  })
