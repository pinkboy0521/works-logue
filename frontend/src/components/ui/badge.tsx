import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Badges styled as botanical classification labels
const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 rounded-sm',
    'border px-2 py-0.5',
    'font-mono text-xs font-medium tracking-wider uppercase',
    'transition-colors duration-150',
    'whitespace-nowrap',
  ],
  {
    variants: {
      variant: {
        default: 'bg-surface border-border text-muted-foreground',
        accent: 'bg-accent/10 border-accent/40 text-accent',
        growth: 'bg-growth/10 border-growth/40 text-growth',
        destructive: 'bg-destructive/10 border-destructive/40 text-destructive',
        outline: 'bg-transparent border-border text-foreground',
        // Seed type classification badges
        seed: 'bg-surface border-border/80 text-muted-foreground hover:border-accent/40',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
