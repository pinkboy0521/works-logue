import * as React from 'react'
import { cn } from '@/lib/utils'

// Base skeleton — subtle pulse on surface-raised, feels like lab equipment warming up
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-surface-raised',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
