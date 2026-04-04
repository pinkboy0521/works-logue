'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { ArrowLeft, MessageSquare, Zap, ThumbsUp, Star, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { GrowthIndicator, STAGE_LABELS } from '@/features/seed/components/GrowthIndicator'
import { useSeedRealtime } from '@/features/seed/hooks/useSeedRealtime'
import { SeedDetailSkeleton } from '@/components/ui/skeletons/SeedDetailSkeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/lib/api/client'
import { userAtom } from '@/store/atoms'
import type { SeedWithDetails, Log, LogFormInput } from '@/types'
import { cn } from '@/lib/utils'

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

const PATTERN_SCORE_LABELS: Record<string, string> = {
  context_score: 'Context',
  problem_score: 'Problem',
  solution_score: 'Solution',
  nameable_score: 'Nameable',
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHr / 24)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

interface SeedDetailPageProps {
  id: string
}

export function SeedDetailPage({ id }: SeedDetailPageProps) {
  const queryClient = useQueryClient()
  const currentUser = useAtomValue(userAtom)
  const [logContent, setLogContent] = useState('')

  const { data: seed, isLoading, isError } = useQuery({
    queryKey: ['seed', id],
    queryFn: () => apiClient.get<SeedWithDetails>(`/api/v1/seeds/${id}`),
  })

  useSeedRealtime(id)

  const logMutation = useMutation({
    mutationFn: (data: LogFormInput) =>
      apiClient.post<Log>(`/api/v1/seeds/${id}/logs`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seed', id] })
      setLogContent('')
    },
  })

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = logContent.trim()
    if (!trimmed) return
    logMutation.mutate({ content: trimmed, seed_id: id })
  }

  if (isLoading) return <SeedDetailSkeleton />

  if (isError || !seed) {
    return (
      <div className="max-w-content mx-auto px-4 py-24 flex flex-col items-center gap-4">
        <p className="text-muted-foreground text-sm font-mono">Seed not found</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/seeds">Back to feed</Link>
        </Button>
      </div>
    )
  }

  const completenessPercent = Math.round(seed.structural_completeness * 100)

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      {/* Back nav */}
      <Link
        href="/seeds"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 mb-8 font-mono tracking-wide"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Seed Feed
      </Link>

      {/* Stage hero */}
      <div className="flex items-start gap-5 mb-8">
        <div className="shrink-0 flex flex-col items-center gap-2">
          <GrowthIndicator stage={seed.stage} size="lg" animated />
          <span className="text-xs text-muted-foreground font-mono tracking-wider uppercase">
            {STAGE_LABELS[seed.stage]}
          </span>
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="seed">{SEED_TYPE_LABELS[seed.type]}</Badge>
            {seed.tags?.map((tag) => (
              <Badge key={tag.id} variant="default">
                {tag.name}
              </Badge>
            ))}
          </div>
          <h1 className="font-display text-2xl text-foreground leading-snug">{seed.title}</h1>
        </div>
      </div>

      {/* Author */}
      {seed.author && (
        <div className="flex items-center gap-2.5 mb-6 pb-6 border-b border-border">
          <Avatar className="w-7 h-7">
            <AvatarImage src={seed.author.avatar_url ?? undefined} alt={seed.author.display_name} />
            <AvatarFallback>{seed.author.display_name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-foreground font-medium">{seed.author.display_name}</span>
          <span className="text-xs text-muted-foreground font-mono">
            {formatRelativeTime(seed.created_at)}
          </span>
        </div>
      )}

      {/* LougeStatusBanner */}
      {(seed.status === 'blooming' || seed.stage === 'bloomed') && (
        <div className={cn(
          'rounded-lg border px-5 py-4 mb-6 flex items-center gap-3',
          seed.stage === 'bloomed'
            ? 'border-accent/40 bg-accent/5'
            : 'border-border bg-surface'
        )}>
          {seed.stage === 'bloomed' ? (
            <>
              <Sparkles className="w-4 h-4 text-accent shrink-0" />
              <span className="text-sm text-foreground flex-1">
                Louge が完成しました
              </span>
              {seed.louge_id && (
                <Link
                  href={`/louges/${seed.louge_id}`}
                  className="text-xs text-accent hover:text-accent/80 font-mono tracking-wide transition-colors whitespace-nowrap"
                >
                  Louge を見る →
                </Link>
              )}
            </>
          ) : (
            <>
              <Loader2 className="w-4 h-4 text-muted-foreground shrink-0 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Louge 生成中...
              </span>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{seed.content}</p>
      </div>

      {/* Structural completeness */}
      <div className="bg-surface border border-border rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground font-mono tracking-wider uppercase">
            Structural Completeness
          </span>
          <span className="text-sm text-growth font-mono font-medium">{completenessPercent}%</span>
        </div>
        <Progress value={completenessPercent} color="growth" className="h-1.5" />

        {/* Pattern analysis scores */}
        {seed.pattern_analysis && (
          <div className="grid grid-cols-2 gap-3 mt-5">
            {(
              Object.entries(seed.pattern_analysis) as [string, number | string][]
            )
              .filter(([key]) => key.endsWith('_score'))
              .map(([key, val]) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground font-mono">
                      {PATTERN_SCORE_LABELS[key] ?? key}
                    </span>
                    <span className="text-xs text-foreground font-mono">
                      {typeof val === 'number' ? Math.round(val * 100) : 0}%
                    </span>
                  </div>
                  <Progress
                    value={typeof val === 'number' ? val * 100 : 0}
                    color="accent"
                    className="h-1"
                  />
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Log thread */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">
            Logs
            {seed.logs && seed.logs.length > 0 && (
              <span className="text-muted-foreground font-mono ml-2">{seed.logs.length}</span>
            )}
          </h2>
        </div>

        {/* Log list */}
        {seed.logs && seed.logs.length > 0 ? (
          <div className="space-y-3 mb-6">
            {seed.logs.map((log) => (
              <LogItem key={log.id} log={log} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center mb-6">
            <p className="text-xs text-muted-foreground font-mono">
              No logs yet. Add the first observation.
            </p>
          </div>
        )}

        {/* Log form */}
        {currentUser ? (
          <form onSubmit={handleLogSubmit} className="space-y-3">
            <textarea
              value={logContent}
              onChange={(e) => setLogContent(e.target.value)}
              placeholder="Add a log, observation, or insight…"
              rows={3}
              maxLength={1000}
              className={cn(
                'w-full bg-surface border border-border rounded-md px-4 py-3',
                'text-sm text-foreground placeholder:text-muted-foreground',
                'resize-none focus:outline-none focus:ring-1 focus:ring-ring',
                'transition-colors duration-150'
              )}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">
                {logContent.length}/1000
              </span>
              <Button
                type="submit"
                size="sm"
                loading={logMutation.isPending}
                disabled={!logContent.trim()}
              >
                Post Log
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 border border-border rounded-lg">
            <p className="text-xs text-muted-foreground">
              <Link href="/login" className="text-accent hover:underline">
                Sign in
              </Link>{' '}
              to add a log
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

function LogItem({ log }: { log: Log }) {
  const reactionIcons = {
    insight: Zap,
    agree: ThumbsUp,
    helpful: Star,
  }

  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-lg p-4',
        log.is_ai_facilitation && 'border-accent/30 bg-surface-raised'
      )}
    >
      {log.is_ai_facilitation && (
        <div className="flex items-center gap-1.5 mb-2">
          <Zap className="w-3 h-3 text-accent" />
          <span className="text-xs text-accent font-mono tracking-wider uppercase">
            AI Facilitation
          </span>
        </div>
      )}
      <p className="text-sm text-foreground leading-relaxed mb-3 whitespace-pre-wrap">
        {log.content}
      </p>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground font-mono flex-1">
          {formatRelativeTime(log.created_at)}
        </span>
        {log.reaction_summary && (
          <div className="flex items-center gap-2">
            {(
              Object.entries(reactionIcons) as [
                keyof typeof reactionIcons,
                React.ElementType,
              ][]
            ).map(([key, Icon]) => {
              const count = log.reaction_summary?.[key] ?? 0
              if (count === 0) return null
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono"
                >
                  <Icon className="w-3 h-3" />
                  {count}
                </span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
