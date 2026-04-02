'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAtomValue } from 'jotai'
import { GitFork, Users, Star, ChevronRight, ArrowLeft } from 'lucide-react'
import { LougeDetailSkeleton } from '@/components/ui/skeletons/LougeDetailSkeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/lib/api/client'
import { userAtom } from '@/store/atoms'
import type { LougeWithDetails } from '@/types'

interface LougeDetailPageProps {
  id: string
}

function PatternSection({
  label,
  content,
  accent = false,
}: {
  label: string
  content: string
  accent?: boolean
}) {
  return (
    <div className="bg-surface border border-border rounded-lg p-5 space-y-2">
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-mono uppercase tracking-widest ${
            accent ? 'text-accent' : 'text-muted-foreground'
          }`}
        >
          {label}
        </span>
        <div className="flex-1 h-px bg-border/50" />
      </div>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  )
}

export function LougeDetailPage({ id }: LougeDetailPageProps) {
  const router = useRouter()
  const currentUser = useAtomValue(userAtom)
  const [isForkLoading, setIsForkLoading] = useState(false)

  const {
    data: louge,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['louge', id],
    queryFn: () => apiClient.get<LougeWithDetails>(`/api/v1/louges/${id}`),
  })

  const forkMutation = useMutation({
    mutationFn: () =>
      apiClient.post<{ seed_id: string }>(`/api/v1/louges/${id}/fork`, {}),
    onMutate: () => setIsForkLoading(true),
    onSuccess: (data) => {
      router.push(`/seeds/new?from_louge=${id}&seed_id=${data.seed_id}`)
    },
    onError: () => setIsForkLoading(false),
  })

  if (isLoading) {
    return (
      <div className="max-w-content mx-auto px-4 py-8">
        <LougeDetailSkeleton />
      </div>
    )
  }

  if (isError || !louge) {
    return (
      <div className="max-w-content mx-auto px-4 py-24 flex flex-col items-center gap-4">
        <p className="text-muted-foreground text-sm font-mono">Failed to load louge</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const isPublished = louge.status === 'published'
  const canFork = isPublished && !!currentUser

  return (
    <div className="max-w-content mx-auto px-4 py-8 space-y-6 animate-fade-up">
      {/* Back nav */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Louges
      </button>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="seed" className="font-mono text-xs">
            {louge.pattern_name}
          </Badge>
          <Badge variant={isPublished ? 'growth' : 'default'}>
            {isPublished ? 'Published' : louge.status === 'generating' ? 'Generating' : 'Archived'}
          </Badge>
          {louge.published_at && (
            <span className="text-xs text-muted-foreground font-mono ml-auto">
              {new Date(louge.published_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
        <h1 className="font-display text-2xl text-foreground leading-snug">{louge.title}</h1>

        {/* Contributor */}
        {louge.author && (
          <button
            onClick={() => router.push(`/profile/${louge.author!.id}`)}
            className="flex items-center gap-2 group"
          >
            <Avatar className="w-6 h-6">
              <AvatarImage
                src={louge.author.avatar_url ?? undefined}
                alt={louge.author.display_name}
              />
              <AvatarFallback className="text-xs">
                {louge.author.display_name?.slice(0, 2).toUpperCase() ?? '??'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              {louge.author.display_name}
            </span>
            <ChevronRight className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
          </button>
        )}
      </div>

      {/* Quality score */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 shrink-0">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="4"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="hsl(var(--accent))"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - louge.quality_score)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-accent">
              {Math.round(louge.quality_score * 100)}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1.5">
              Quality Score
            </p>
            <Progress value={louge.quality_score * 100} className="h-1.5" color="accent" />
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
            <GitFork className="w-4 h-4" />
            <span className="text-sm font-mono">{louge.fork_count}</span>
          </div>
        </div>
      </div>

      {/* Pattern sections */}
      {louge.pattern_context && (
        <PatternSection label="Context" content={louge.pattern_context} accent />
      )}
      {louge.pattern_problem && (
        <PatternSection label="Problem" content={louge.pattern_problem} />
      )}
      {louge.pattern_solution && (
        <PatternSection label="Solution" content={louge.pattern_solution} />
      )}

      {/* Full content */}
      {louge.content && (
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Full Content
            </span>
            <div className="flex-1 h-px bg-border/50" />
          </div>
          <div className="prose prose-sm prose-invert max-w-none">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {louge.content}
            </p>
          </div>
        </div>
      )}

      {/* Source seed link */}
      {louge.seed && (
        <div className="bg-surface-raised border border-border/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Users className="w-3.5 h-3.5" />
            <span className="font-mono uppercase tracking-widest">Source Seed</span>
          </div>
          <button
            onClick={() => router.push(`/seeds/${louge.seed!.id}`)}
            className="group flex items-center gap-2 w-full text-left"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                {louge.seed.title}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        </div>
      )}

      {/* Fork button */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="w-4 h-4" />
          <span className="font-mono">{louge.fork_count} forks</span>
        </div>
        {canFork && (
          <Button
            onClick={() => forkMutation.mutate()}
            disabled={isForkLoading}
          >
            <GitFork className="w-4 h-4" />
            {isForkLoading ? 'Forking...' : 'Fork this Pattern'}
          </Button>
        )}
        {!currentUser && isPublished && (
          <Button variant="outline" onClick={() => router.push('/login')}>
            Sign in to Fork
          </Button>
        )}
      </div>
    </div>
  )
}
