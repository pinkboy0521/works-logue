'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function SeedDetailError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[SeedDetailError]', error)
  }, [error])

  return (
    <div className="max-w-content mx-auto px-4 py-24 flex flex-col items-center gap-6">
      <div className="text-center space-y-2">
        <h2 className="font-display text-xl text-foreground">Seed not found</h2>
        <p className="text-muted-foreground text-sm">
          {error.message || 'This seed could not be loaded.'}
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          Retry
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/seeds">Back to feed</Link>
        </Button>
      </div>
    </div>
  )
}
