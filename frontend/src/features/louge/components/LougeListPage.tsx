'use client'

import { useState, useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Beaker, Search, GitFork, Star } from 'lucide-react'
import { LougeCardSkeleton } from '@/components/ui/skeletons/LougeCardSkeleton'
import { InfiniteScrollTrigger } from '@/components/ui/infinite-scroll-trigger'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { apiClient } from '@/lib/api/client'
import type { PaginatedResponse, LougeWithDetails, LougeStatus } from '@/types'

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

const STATUS_LABELS: Record<LougeStatus, string> = {
  generating: 'Generating',
  published: 'Published',
  archived: 'Archived',
}

const STATUS_VARIANTS: Record<LougeStatus, 'growth' | 'seed' | 'default'> = {
  generating: 'seed',
  published: 'growth',
  archived: 'default',
}

export function LougeListPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['louges', debouncedQuery],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      apiClient.get<PaginatedResponse<LougeWithDetails>>(
        `/api/v1/louges?page=${pageParam}&per_page=20${debouncedQuery ? `&q=${encodeURIComponent(debouncedQuery)}` : ''}`
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.has_next ? lastPage.page + 1 : undefined,
  })

  const louges = data?.pages.flatMap((p) => p.items) ?? []
  const totalCount = data?.pages[0]?.total ?? 0

  if (isLoading) {
    return (
      <div className="max-w-content mx-auto px-4 py-8 space-y-3">
        {[1, 2, 3].map((i) => (
          <LougeCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-content mx-auto px-4 py-24 flex flex-col items-center gap-4">
        <p className="text-muted-foreground text-sm font-mono">Failed to load louges</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="font-display text-3xl text-foreground">Louge Library</h1>
            <p className="text-muted-foreground text-xs mt-1 font-mono tracking-widest uppercase">
              {totalCount} patterns distilled
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search patterns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-colors font-body"
          />
        </div>
      </div>

      {louges.length === 0 ? (
        <div className="flex flex-col items-center py-32 gap-6">
          <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center">
            <Beaker className="w-7 h-7 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-foreground text-sm font-medium">
              {debouncedQuery ? 'No patterns found' : 'No louges yet'}
            </p>
            <p className="text-muted-foreground text-xs">
              {debouncedQuery
                ? 'Try a different search term.'
                : 'Louges are distilled from bloomed seeds.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {louges.map((louge, index) => (
            <button
              key={louge.id}
              onClick={() => router.push(`/louges/${louge.id}`)}
              className="w-full text-left block animate-fade-up"
              style={{
                animationDelay: `${Math.min(index, 8) * 55}ms`,
                animationFillMode: 'both',
              }}
            >
              <div className="group bg-surface border border-border rounded-lg p-5 transition-all duration-200 hover:shadow-card-hover hover:border-muted-foreground/30">
                {/* Pattern name + status */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="seed" className="font-mono text-xs">
                    {louge.pattern_name}
                  </Badge>
                  <Badge variant={STATUS_VARIANTS[louge.status]}>
                    {STATUS_LABELS[louge.status]}
                  </Badge>
                  <span className="ml-auto text-xs text-muted-foreground font-mono shrink-0">
                    {formatRelativeTime(louge.created_at)}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-sm font-medium text-foreground leading-snug mb-3 line-clamp-2 group-hover:text-accent transition-colors duration-150">
                  {louge.title}
                </h2>

                {/* Context / Problem previews */}
                <div className="space-y-1.5 mb-4">
                  {louge.pattern_context && (
                    <div className="flex gap-2">
                      <span className="text-xs font-mono text-accent shrink-0 w-16">Context</span>
                      <p className="text-xs text-muted-foreground line-clamp-1 flex-1">
                        {louge.pattern_context}
                      </p>
                    </div>
                  )}
                  {louge.pattern_problem && (
                    <div className="flex gap-2">
                      <span className="text-xs font-mono text-muted-foreground shrink-0 w-16">Problem</span>
                      <p className="text-xs text-muted-foreground line-clamp-1 flex-1">
                        {louge.pattern_problem}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer: author + quality + forks */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    {louge.author && (
                      <div className="flex items-center gap-1.5">
                        <Avatar className="w-4 h-4">
                          <AvatarImage
                            src={louge.author.avatar_url ?? undefined}
                            alt={louge.author.display_name}
                          />
                          <AvatarFallback className="text-xs">
                            {louge.author.display_name?.slice(0, 1).toUpperCase() ?? '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {louge.author.display_name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Star className="w-3 h-3" />
                      <span className="text-xs font-mono tabular-nums">
                        {Math.round(louge.quality_score * 100)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <GitFork className="w-3 h-3" />
                    <span className="text-xs font-mono tabular-nums">{louge.fork_count}</span>
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
