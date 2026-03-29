'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProfileError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Profile] Error boundary caught:', error)
  }, [error])

  return (
    <div className="max-w-content mx-auto px-4 py-24 flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center">
        <span className="text-destructive text-lg">!</span>
      </div>
      <div className="text-center space-y-1">
        <p className="text-foreground text-sm font-medium">Failed to load profile</p>
        <p className="text-muted-foreground text-xs font-mono">
          {error.message || 'An unexpected error occurred'}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
