import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from 'next-safe-action'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { AUTH_COOKIE_NAME } from './constants'
import generateId from './id'
import { verifyToken } from './jwt'
import logger from './logger'

export const publicActionClient = createSafeActionClient({
  handleServerError(e) {
    logger.error(e, 'Action failed')

    if (e instanceof Error) {
      return e.message
    }

    return DEFAULT_SERVER_ERROR_MESSAGE
  },
  defineMetadataSchema() {
    return z.object({
      action: z.string(),
    })
  },
}).use(async ({ next, clientInput, metadata }) => {
  const requestId = generateId('req')
  logger.info({
    requestId,
    metadata,
    clientInput,
  })

  const start = performance.now()
  const result = await next()
  const end = performance.now()
  const duration = end - start

  logger.info({
    requestId,
    metadata,
    duration: `${duration.toFixed(2)}ms`,
    result,
  })

  return result
})

export const secureActionClient = publicActionClient.use(async ({ next }) => {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token || !(await verifyToken(token))) {
    throw new Error('Unauthorized')
  }

  return await next()
})
