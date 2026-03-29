'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Sprout } from 'lucide-react'
import { GrowthIndicator, STAGE_LABELS } from '@/features/seed/components/GrowthIndicator'
import { SeedCardSkeleton } from '@/components/ui/skeletons/SeedCardSkeleton'
import { InfiniteScrollTrigger } from '@/components/ui/infinite-scroll-trigger'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/lib/api/client'
import type { PaginatedResponse, SeedWithDetails } from '@/types'

const SEED_TYPE_LABELS: Record<string, string> = {
  query: 'Query',
  pain: 'Pain',
  failure: 'Failure',
  hypothesis: 'Hypothesis',
  comparison: 'Compare',
  observation: 'Observe',
  knowledge: 'Knowledge',
  practice: 'Practice',
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHr / 24)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m`
  if (diffHr < 24) return `${diffHr}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

export function SeedFeedPage() {
  const router = useRouter()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['seeds'],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      apiClient.get<PaginatedResponse<SeedWithDetails>>(
        `/api/v1/seeds?page=${pageParam}&per_page=20`
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.has_next ? lastPage.page + 1 : undefined,
  })

  const seeds = data?.pages.flatMap((p) => p.items) ?? []
  const totalCount = data?.pages[0]?.total ?? 0

  if (isLoading) {
    return (
      <div className="max-w-content mx-auto px-4 py-8 space-y-3">
        {[1, 2, 3].map((i) => (
          <SeedCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-content mx-auto px-4 py-24 flex flex-col items-center gap-4">
        <p className="text-muted-foreground text-sm font-mono">Failed to load seeds</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-foreground">Seed Feed</h1>
          <p className="text-muted-foreground text-xs mt-1 font-mono tracking-widest uppercase">
            {totalCount} seeds cultivated
          </p>
        </div>
        <Button onClick={() => router.push('/seeds/new')}>
          <Sprout className="w-4 h-4" />
          Seed を植える
        </Button>
      </div>

      {seeds.length === 0 ? (
        <div className="flex flex-col items-center py-32 gap-6">
          <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center">
            <Sprout className="w-7 h-7 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-foreground text-sm font-medium">No seeds yet</p>
            <p className="text-muted-foreground text-xs">Plant the first seed of knowledge.</p>
          </div>
          <Button onClick={() => router.push('/seeds/new')}>Plant a Seed</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {seeds.map((seed, index) => (
            <button
              key={seed.id}
              onClick={() => router.push(`/seeds/${seed.id}`)}
              className="w-full text-left block animate-fade-up"
              style={{
                animationDelay: `${Math.min(index, 8) * 55}ms`,
                animationFillMode: 'both',
              }}
            >
              <div className="group bg-surface border border-border rounded-lg p-5 transition-all duration-200 hover:shadow-card-hover hover:border-muted-foreground/30">
                {/* Author row */}
                <div className="flex items-center gap-2.5 mb-3">
                  <Avatar className="w-6 h-6 shrink-0">
                    <AvatarImage
                      src={seed.author?.avatar_url ?? undefined}
                      alt={seed.author?.display_name}
                    />
                    <AvatarFallback>
                      {seed.author?.display_name?.slice(0, 2).toUpperCase() ?? '??'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-foreground font-medium truncate flex-1">
                    {seed.author?.display_name ?? 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">
                    {formatRelativeTime(seed.created_at)}
                  </span>
                  <Badge variant="seed">{SEED_TYPE_LABELS[seed.type]}</Badge>
                </div>

                {/* Content row */}
                <div className="flex gap-3 mb-4">
                  <div className="shrink-0 mt-0.5">
                    <GrowthIndicator stage={seed.stage} size="sm" animated={false} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-medium text-foreground leading-snug mb-1.5 line-clamp-2 group-hover:text-accent transition-colors duration-150">
                      {seed.title}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {seed.content.length > 100
                        ? seed.content.slice(0, 100) + '…'
                        : seed.content}
                    </p>
                  </div>
                </div>

                {/* Footer: stage badge + completeness bar */}
                <div className="flex items-center gap-3">
                  <Badge variant="growth" className="shrink-0">
                    {STAGE_LABELS[seed.stage]}
                  </Badge>
                  <div className="flex-1 flex items-center gap-2">
                    <Progress
                      value={seed.structural_completeness * 100}
                      className="h-1 flex-1"
                      color="growth"
                    />
                    <span className="text-xs text-muted-foreground font-mono tabular-nums w-8 text-right">
                      {Math.round(seed.structural_completeness * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}

          <InfiniteScrollTrigger
            onIntersect={() => fetchNextPage()}
            isLoading={isFetchingNextPage}
            hasMore={hasNextPage ?? false}
            className="py-4"
          />
        </div>
      )}
    </div>
  )
}
