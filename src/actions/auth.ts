'use server'

import { publicActionClient } from '@/lib/action'
import { AUTH_COOKIE_NAME, PASSWORD } from '@/lib/constants'
import { createToken } from '@/lib/jwt'
import { loginSchema } from '@/lib/types'
import { returnValidationErrors } from 'next-safe-action'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const login = publicActionClient
  .metadata({ action: 'login' })
  .schema(loginSchema)
  .action(async ({ parsedInput: { password } }) => {
    if (password !== PASSWORD) {
      returnValidationErrors(loginSchema, {
        password: {
          _errors: ['Password is incorrect'],
        },
      })
    }

    const token = await createToken()
    const cookieStore = await cookies()
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    redirect('/home')
  })

export const logout = publicActionClient
  .metadata({ action: 'logout' })
  .action(async () => {
    const cookieStore = await cookies()
    cookieStore.delete(AUTH_COOKIE_NAME)

    redirect('/')
  })
