'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** 'growth' (green) | 'accent' (amber) | 'default' */
  color?: 'growth' | 'accent' | 'default'
}

// Progress bar — represents botanical growth stages
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, color = 'growth', ...props }, ref) => {
  const fillClass = {
    growth: 'bg-growth shadow-growth-glow',
    accent: 'bg-accent',
    default: 'bg-primary',
  }[color]

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-1.5 w-full overflow-hidden rounded-full bg-surface-raised border border-border/40',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'h-full transition-all duration-500 ease-out rounded-full',
          fillClass
        )}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
