'use client'

import { Button } from '@mantine/core'
import Link from 'next/link'

export default function Error() {
  return (
    <main className="size-full center-all">
      <div className="center-col gap-y-8">
        <h1 className="text-3xl font-semibold">Unknown Error</h1>
        <Button component={Link} href="/">
          Go Home
        </Button>
      </div>
    </main>
  )
}
