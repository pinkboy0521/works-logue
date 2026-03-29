'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2',
    'font-body text-sm font-medium tracking-wide',
    'rounded-md border transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-40',
    'overflow-hidden',
    // ripple layer
    'after:absolute after:inset-0 after:rounded-md after:opacity-0 after:transition-opacity',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-accent text-accent-foreground border-accent/80',
          'hover:brightness-110 hover:shadow-bloom',
          'active:brightness-95',
          'after:bg-white/10 hover:after:opacity-100',
        ],
        outline: [
          'bg-transparent text-foreground border-border',
          'hover:bg-surface hover:border-accent/50 hover:text-accent',
          'active:bg-surface-raised',
        ],
        ghost: [
          'bg-transparent text-muted-foreground border-transparent',
          'hover:bg-surface hover:text-foreground',
          'active:bg-surface-raised',
        ],
        destructive: [
          'bg-destructive text-destructive-foreground border-destructive/80',
          'hover:brightness-110',
          'active:brightness-95',
        ],
        growth: [
          'bg-transparent text-growth border-growth/40',
          'hover:bg-growth/10 hover:border-growth/70 hover:shadow-growth-glow',
          'active:bg-growth/15',
        ],
        link: [
          'bg-transparent text-accent border-transparent underline-offset-4',
          'hover:underline hover:text-accent',
          'p-0 h-auto',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-base tracking-wider',
        icon: 'h-9 w-9 p-0',
        'icon-sm': 'h-7 w-7 p-0 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
