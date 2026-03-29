'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Lightbulb, ThumbsUp, Sparkles, MessageSquare, ChevronDown, Sprout } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useReactionMutation } from '@/features/log/hooks/useReactionMutation'
import { useReplyMutation } from '@/features/log/hooks/useReplyMutation'
import type { Log, ReactionType } from '@/types'

// ─── Helpers ────────────────────────────────────────────────

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHr / 24)
  if (diffMin < 1) return '< 1m'
  if (diffMin < 60) return `${diffMin}m`
  if (diffHr < 24) return `${diffHr}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

function initials(userId: string): string {
  return userId.slice(0, 2).toUpperCase()
}

// ─── Reaction config ─────────────────────────────────────────

const REACTIONS: { type: ReactionType; Icon: React.ElementType; label: string }[] = [
  { type: 'insight', Icon: Lightbulb, label: 'Insight' },
  { type: 'agree',   Icon: ThumbsUp,  label: 'Agree'   },
  { type: 'helpful', Icon: Sparkles,  label: 'Helpful' },
]

// ─── ReactionBar ─────────────────────────────────────────────

interface ReactionBarProps {
  log: Log
  seedId: string
  currentUserId?: string
}

function ReactionBar({ log, seedId, currentUserId }: ReactionBarProps) {
  const router = useRouter()
  const mutation = useReactionMutation({ seedId })
  const [ripple, setRipple] = useState<ReactionType | null>(null)

  const handleReact = (type: ReactionType) => {
    if (!currentUserId) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    setRipple(type)
    setTimeout(() => setRipple(null), 600)
    mutation.mutate({ logId: log.id, type })
  }

  return (
    <div className="flex items-center gap-0.5">
      {REACTIONS.map(({ type, Icon, label }) => {
        const count = log.reaction_summary?.[type] ?? 0
        const isRippling = ripple === type

        return (
          <button
            key={type}
            onClick={() => handleReact(type)}
            aria-label={label}
            disabled={mutation.isPending}
            className={cn(
              'relative group inline-flex items-center gap-1',
              'px-2 py-1 rounded-md overflow-hidden',
              'text-xs font-mono transition-all duration-200',
              'text-muted-foreground hover:text-growth hover:bg-growth/5',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              count > 0 && 'text-growth/70'
            )}
          >
            {/* ripple effect */}
            {isRippling && (
              <span className="absolute inset-0 rounded-md animate-ripple bg-growth/20 pointer-events-none" />
            )}
            <Icon className="w-3 h-3 flex-shrink-0 transition-transform duration-150 group-hover:scale-110" />
            {count > 0 && (
              <span className="tabular-nums leading-none">{count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── ReplyForm ────────────────────────────────────────────────

interface ReplyFormProps {
  logId: string
  seedId: string
  currentUserId?: string
}

function ReplyForm({ logId, seedId, currentUserId }: ReplyFormProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState('')
  const mutation = useReplyMutation({ seedId })

  const handleToggle = () => {
    if (!currentUserId) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    setIsOpen((v) => !v)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    mutation.mutate(
      { logId, content: trimmed },
      { onSuccess: () => { setContent(''); setIsOpen(false) } }
    )
  }

  return (
    <div className="mt-3">
      <button
        onClick={handleToggle}
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-mono',
          'transition-colors duration-150',
          'text-muted-foreground/60 hover:text-muted-foreground',
        )}
      >
        <MessageSquare className="w-3 h-3" />
        <span>reply</span>
        <ChevronDown
          className={cn(
            'w-3 h-3 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="relative">
              {/* left accent line on textarea */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-border rounded-full" />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add an observation…"
                rows={2}
                maxLength={1000}
                className={cn(
                  'w-full bg-transparent border-0 border-b border-border',
                  'pl-4 pr-2 py-2',
                  'text-sm font-body text-foreground placeholder:text-muted-foreground/40',
                  'resize-none focus:outline-none focus:border-growth/40',
                  'transition-colors duration-150'
                )}
              />
            </div>
            <div className="flex items-center justify-between pl-4">
              <span className="text-xs font-mono text-muted-foreground/40 tabular-nums">
                {content.length}/1000
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-mono text-muted-foreground/60 hover:text-muted-foreground px-2 py-1 rounded transition-colors duration-150"
                >
                  cancel
                </button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!content.trim() || mutation.isPending}
                  className="text-xs h-7 px-3"
                >
                  {mutation.isPending ? '…' : 'post'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── LogItem ──────────────────────────────────────────────────

interface LogItemProps {
  log: Log
  seedId: string
  currentUserId?: string
  replies?: Log[]
  isReply?: boolean
  index?: number
}

function LogItem({
  log,
  seedId,
  currentUserId,
  replies = [],
  isReply = false,
  index = 0,
}: LogItemProps) {
  const isAI = log.is_ai_facilitation

  return (
    <div
      className={cn(
        'group relative animate-fade-up opacity-0',
        'fill-mode-forwards'
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Connecting thread line for replies */}
      {isReply && (
        <div className="absolute -left-4 top-0 bottom-0 flex items-stretch">
          <div className="w-px bg-border/50 mx-auto" />
        </div>
      )}

      <div
        className={cn(
          'relative flex gap-3',
          isReply && 'pl-0'
        )}
      >
        {/* Left accent bar */}
        <div className="flex-shrink-0 flex flex-col items-center">
          {isAI ? (
            <div className="w-px flex-1 bg-gradient-to-b from-accent/60 via-accent/30 to-transparent" />
          ) : (
            <div className={cn(
              'w-px flex-1 transition-colors duration-300',
              'bg-border group-hover:bg-growth/30'
            )} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pb-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            {isAI ? (
              <>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-accent/10 border border-accent/20">
                  <Zap className="w-2.5 h-2.5 text-accent" />
                  <span className="text-xs font-mono text-accent tracking-widest uppercase leading-none">
                    Works Logue AI
                  </span>
                </div>
                <span className="text-xs font-mono text-muted-foreground/40 tabular-nums">
                  {formatTimestamp(log.created_at)}
                </span>
              </>
            ) : (
              <>
                <Avatar className="w-5 h-5 flex-shrink-0">
                  <AvatarFallback className="text-xs font-mono bg-surface-raised text-muted-foreground">
                    {initials(log.user_id)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-mono text-muted-foreground/40 tabular-nums">
                  {formatTimestamp(log.created_at)}
                </span>
              </>
            )}
          </div>

          {/* Body */}
          <p
            className={cn(
              'text-sm leading-relaxed whitespace-pre-wrap',
              isAI
                ? 'text-foreground/80 italic font-body'
                : 'text-foreground font-body'
            )}
          >
            {log.content}
          </p>

          {/* Actions */}
          {!isReply && (
            <div className="mt-2 flex items-center gap-3">
              <ReactionBar log={log} seedId={seedId} currentUserId={currentUserId} />
              <div className="w-px h-3 bg-border/50" />
              <ReplyForm logId={log.id} seedId={seedId} currentUserId={currentUserId} />
            </div>
          )}

          {/* Replies */}
          {!isReply && replies.length > 0 && (
            <div className="mt-4 pl-4 border-l border-border/40 space-y-3">
              {replies.map((reply, i) => (
                <LogItem
                  key={reply.id}
                  log={reply}
                  seedId={seedId}
                  currentUserId={currentUserId}
                  isReply
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── LogThread (main export) ──────────────────────────────────

interface LogThreadProps {
  logs: Log[]
  seedId: string
  currentUserId?: string
}

export function LogThread({ logs, seedId, currentUserId }: LogThreadProps) {
  const topLevel = logs.filter((l) => l.parent_log_id === null)
  const replyMap = logs.reduce<Record<string, Log[]>>((acc, l) => {
    if (l.parent_log_id) {
      acc[l.parent_log_id] = [...(acc[l.parent_log_id] ?? []), l]
    }
    return acc
  }, {})

  if (topLevel.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-raised border border-border flex items-center justify-center">
          <Sprout className="w-4 h-4 text-muted-foreground/40" />
        </div>
        <p className="text-xs font-mono text-muted-foreground/40 tracking-wider uppercase">
          No observations yet
        </p>
        <p className="text-xs text-muted-foreground/30 font-body">
          Add the first field note.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* Header label */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs font-mono text-muted-foreground/40 uppercase tracking-widest">
          Field Notes
        </span>
        <div className="flex-1 h-px bg-border/40" />
        <span className="text-xs font-mono text-muted-foreground/40 tabular-nums">
          {topLevel.length}
        </span>
      </div>

      {topLevel.map((log, i) => (
        <LogItem
          key={log.id}
          log={log}
          seedId={seedId}
          currentUserId={currentUserId}
          replies={replyMap[log.id] ?? []}
          index={i}
        />
      ))}
    </div>
  )
}
