'use client'

import { cn } from '@/lib/utils'
import type { GrowthStage } from '@/types'

interface GrowthIndicatorProps {
  stage: GrowthStage
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

const SIZE_CLASS = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
} as const

export const STAGE_LABELS: Record<GrowthStage, string> = {
  seed: 'Seed',
  sprout: 'Sprout',
  growth: 'Growth',
  near_bloom: 'Near Bloom',
  flowering: 'Flowering',
  bloomed: 'Bloomed',
}

export function GrowthIndicator({
  stage,
  size = 'md',
  animated = true,
}: GrowthIndicatorProps) {
  const cls = SIZE_CLASS[size]

  const stageAnimation = animated
    ? ({
        seed: 'animate-seed-breathe',
        sprout: 'animate-sprout-grow',
        growth: '',
        near_bloom: '',
        flowering: 'animate-bloom-burst',
        bloomed: 'animate-bloom-glow',
      } as Record<GrowthStage, string>)[stage]
    : ''

  return (
    <svg
      viewBox="0 0 40 40"
      className={cn('inline-block', cls, stageAnimation)}
      role="img"
      aria-label={`Growth stage: ${STAGE_LABELS[stage]}`}
    >
      {stage === 'seed' && <SeedShape />}
      {stage === 'sprout' && <SproutShape />}
      {stage === 'growth' && <GrowthShape />}
      {stage === 'near_bloom' && <NearBloomShape />}
      {stage === 'flowering' && <FloweringShape />}
      {stage === 'bloomed' && <BloomedShape />}
    </svg>
  )
}

function SeedShape() {
  return (
    <g>
      <ellipse cx="20" cy="22" rx="11" ry="14" className="fill-surface stroke-border" strokeWidth="1.5" />
      <path d="M 13 18 Q 20 12 27 18" className="stroke-muted-foreground fill-none" strokeWidth="0.7" opacity="0.5" />
      <path d="M 13 22 Q 20 16 27 22" className="stroke-muted-foreground fill-none" strokeWidth="0.7" opacity="0.35" />
      <path d="M 14 26 Q 20 20 26 26" className="stroke-muted-foreground fill-none" strokeWidth="0.7" opacity="0.2" />
      <line x1="20" y1="8" x2="20" y2="11" className="stroke-border" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  )
}

function SproutShape() {
  return (
    <g>
      <line x1="6" y1="34" x2="34" y2="34" className="stroke-border" strokeWidth="1" opacity="0.5" />
      <path d="M 20 34 Q 19 26 20 17" className="stroke-growth fill-none" strokeWidth="2" strokeLinecap="round" />
      <path d="M 20 23 Q 14 18 12 21 Q 15 26 20 25" className="fill-growth" opacity="0.8" />
      <path d="M 20 23 Q 26 18 28 21 Q 25 26 20 25" className="fill-growth" opacity="0.8" />
      <path d="M 20 17 Q 18 12 20 10 Q 22 12 20 17" className="fill-growth" opacity="0.65" />
    </g>
  )
}

function GrowthShape() {
  return (
    <g>
      <line x1="6" y1="36" x2="34" y2="36" className="stroke-border" strokeWidth="1" opacity="0.35" />
      <path d="M 20 36 L 20 8" className="stroke-growth fill-none" strokeWidth="2" strokeLinecap="round" />
      <path d="M 20 30 Q 11 26 8 19 Q 15 23 20 28" className="fill-growth stroke-growth" strokeWidth="0.5" opacity="0.9" />
      <path d="M 20 30 Q 29 26 32 19 Q 25 23 20 28" className="fill-growth stroke-growth" strokeWidth="0.5" opacity="0.9" />
      <path d="M 20 28 Q 14 25 9 20" className="stroke-background fill-none" strokeWidth="0.5" opacity="0.4" />
      <path d="M 20 28 Q 26 25 31 20" className="stroke-background fill-none" strokeWidth="0.5" opacity="0.4" />
      <path d="M 20 21 Q 13 17 10 10 Q 16 14 20 19" className="fill-growth stroke-growth" strokeWidth="0.5" opacity="0.75" />
      <path d="M 20 21 Q 27 17 30 10 Q 24 14 20 19" className="fill-growth stroke-growth" strokeWidth="0.5" opacity="0.75" />
    </g>
  )
}

function NearBloomShape() {
  return (
    <g>
      <line x1="6" y1="37" x2="34" y2="37" className="stroke-border" strokeWidth="1" opacity="0.3" />
      <path d="M 20 37 L 20 9" className="stroke-growth fill-none" strokeWidth="2" strokeLinecap="round" />
      <path d="M 20 32 Q 12 28 9 22 Q 16 25 20 30" className="fill-growth" opacity="0.9" />
      <path d="M 20 32 Q 28 28 31 22 Q 24 25 20 30" className="fill-growth" opacity="0.9" />
      <path d="M 20 24 Q 14 20 11 14 Q 17 18 20 22" className="fill-growth" opacity="0.75" />
      <path d="M 20 24 Q 26 20 29 14 Q 23 18 20 22" className="fill-growth" opacity="0.75" />
      <path d="M 18 9 Q 16 5 20 3 Q 24 5 22 9 Z" className="fill-accent" opacity="0.9" />
      <path d="M 20 9 Q 18 5 20 3" className="stroke-accent fill-none" strokeWidth="0.8" opacity="0.6" />
      <path d="M 20 9 Q 22 5 20 3" className="stroke-accent fill-none" strokeWidth="0.8" opacity="0.6" />
    </g>
  )
}

function FloweringShape() {
  const petals = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180)
    return {
      cx: 20 + Math.cos(angle) * 8,
      cy: 14 + Math.sin(angle) * 8,
      deg: i * 60 - 90,
    }
  })

  return (
    <g>
      <path d="M 20 36 L 20 19" className="stroke-growth fill-none" strokeWidth="2" strokeLinecap="round" />
      <path d="M 20 30 Q 13 27 10 22 Q 16 24 20 28" className="fill-growth" opacity="0.8" />
      <path d="M 20 30 Q 27 27 30 22 Q 24 24 20 28" className="fill-growth" opacity="0.8" />
      {petals.map(({ cx, cy, deg }, i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx="5"
          ry="3"
          transform={`rotate(${deg} ${cx} ${cy})`}
          className="fill-accent stroke-accent"
          strokeWidth="0.5"
          opacity="0.75"
        />
      ))}
      <circle cx="20" cy="14" r="4.5" className="fill-accent stroke-accent" strokeWidth="1" />
      <circle cx="20" cy="14" r="2" className="fill-accent-foreground" />
    </g>
  )
}

function BloomedShape() {
  const outerPetals = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 - 90) * (Math.PI / 180)
    return {
      cx: 20 + Math.cos(angle) * 9.5,
      cy: 13 + Math.sin(angle) * 9.5,
      deg: i * 45 - 90,
    }
  })
  const innerPetals = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 - 67.5) * (Math.PI / 180)
    return {
      cx: 20 + Math.cos(angle) * 7,
      cy: 13 + Math.sin(angle) * 7,
      deg: i * 45 - 67.5,
    }
  })

  return (
    <g>
      <path d="M 20 37 L 20 21" className="stroke-growth fill-none" strokeWidth="2" strokeLinecap="round" />
      <path d="M 20 31 Q 13 28 10 23 Q 16 25 20 29" className="fill-growth" opacity="0.8" />
      <path d="M 20 31 Q 27 28 30 23 Q 24 25 20 29" className="fill-growth" opacity="0.8" />
      {outerPetals.map(({ cx, cy, deg }, i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="5.5" ry="3"
          transform={`rotate(${deg} ${cx} ${cy})`}
          className="fill-accent stroke-accent" strokeWidth="0.5" opacity="0.8" />
      ))}
      {innerPetals.map(({ cx, cy, deg }, i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="4" ry="2.5"
          transform={`rotate(${deg} ${cx} ${cy})`}
          className="fill-accent stroke-accent" strokeWidth="0.3" opacity="0.55" />
      ))}
      <circle cx="20" cy="13" r="5" className="fill-accent stroke-accent" strokeWidth="1.5" />
      <circle cx="20" cy="13" r="2.5" className="fill-accent-foreground" />
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i * 72) * (Math.PI / 180)
        return (
          <circle key={i}
            cx={20 + Math.cos(a) * 3.5}
            cy={13 + Math.sin(a) * 3.5}
            r="0.8" className="fill-accent-foreground" opacity="0.6" />
        )
      })}
    </g>
  )
}
