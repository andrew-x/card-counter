'use client'

import { login } from '@/actions/auth'
import { showError } from '@/hooks/notifications'
import logger from '@/lib/logger'
import { loginSchema } from '@/lib/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, PasswordInput } from '@mantine/core'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'

export default function Home() {
  const {
    form: { formState, register },
    handleSubmitWithAction,
  } = useHookFormAction(login, zodResolver(loginSchema), {
    formProps: {
      defaultValues: {
        password: '',
      },
    },
    actionProps: {
      onError: (error: unknown) => {
        logger.error(error, 'Login failed')
        if (!formState.errors.password) {
          showError()
        }
      },
    },
  })

  return (
    <div className="size-full center-all py-8 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="center-col gap-2">
            <h1 className="text-3xl font-bold text-foreground">Card Counter</h1>
            <p className="text-lg text-muted-foreground text-center">
              Enter your password to continue
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmitWithAction}>
          <div className="space-y-4">
            <PasswordInput
              {...register('password')}
              label="Password"
              placeholder="Enter your password"
              size="md"
              error={formState.errors.password?.message}
              disabled={formState.isSubmitting}
              styles={{
                input: {
                  fontSize: '16px', // Prevent zoom on iOS
                },
              }}
            />

            <Button
              type="submit"
              size="md"
              loading={formState.isSubmitting}
              className="mt-6"
              fullWidth
            >
              Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
