'use client'

import { logout } from '@/actions/auth'
import { Button } from '@mantine/core'
import { useAction } from 'next-safe-action/hooks'

export default function Logout() {
  const { execute, isPending } = useAction(logout)

  return (
    <Button
      onClick={() => execute()}
      loading={isPending}
      size="compact-xs"
      variant="subtle"
      color="gray"
    >
      Logout
    </Button>
  )
}
