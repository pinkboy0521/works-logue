'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAtomValue } from 'jotai'
import {
  Award,
  ChevronDown,
  ChevronUp,
  Edit2,
  Sprout,
  BookOpen,
} from 'lucide-react'
import { ProfileHeaderSkeleton } from '@/components/ui/skeletons/ProfileHeaderSkeleton'
import { ScoreBreakdownSkeleton } from '@/components/ui/skeletons/ScoreBreakdownSkeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/ui/modal'
import { apiClient } from '@/lib/api/client'
import { userAtom } from '@/store/atoms'
import type { UserProfile } from '@/types'

interface ProfilePageProps {
  params: { userId: string }
}

interface ScoreHistory {
  seed_contribution: number
  log_quality: number
  reaction_received: number
  louge_published: number
  total: number
  updated_at: string
}

export function ProfilePage({ params }: ProfilePageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const currentUser = useAtomValue(userAtom)
  const [isScoreExpanded, setIsScoreExpanded] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editBio, setEditBio] = useState('')

  const isOwnProfile = currentUser?.id === params.userId

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['profile', params.userId],
    queryFn: () => apiClient.get<UserProfile>(`/api/v1/users/${params.userId}/profile`),
  })

  // Sync edit fields when profile loads
  useEffect(() => {
    if (profile) {
      setEditDisplayName(profile.display_name)
      setEditBio(profile.bio ?? '')
    }
  }, [profile])

  const { data: scoreHistory, isLoading: isScoreLoading } = useQuery({
    queryKey: ['scoreHistory', params.userId],
    queryFn: () => apiClient.get<ScoreHistory>(`/api/v1/users/${params.userId}/score-history`),
    enabled: isScoreExpanded,
  })

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      apiClient.put<UserProfile>('/api/v1/users/me', {
        display_name: editDisplayName,
        bio: editBio,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', params.userId] })
      setIsEditOpen(false)
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-content mx-auto px-4 py-8 space-y-6">
        <ProfileHeaderSkeleton />
        <ScoreBreakdownSkeleton />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="max-w-content mx-auto px-4 py-24 flex flex-col items-center gap-4">
        <p className="text-muted-foreground text-sm font-mono">Failed to load profile</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const scoreBreakdownItems = scoreHistory
    ? [
        { label: 'Seed Contribution', value: scoreHistory.seed_contribution, max: 500 },
        { label: 'Log Quality', value: scoreHistory.log_quality, max: 300 },
        { label: 'Reactions Received', value: scoreHistory.reaction_received, max: 200 },
        { label: 'Louge Published', value: scoreHistory.louge_published, max: 200 },
      ]
    : []

  return (
    <>
      <div className="max-w-content mx-auto px-4 py-8 space-y-6 animate-fade-up">
        {/* Profile Header */}
        <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 shrink-0">
              <AvatarImage
                src={profile.avatar_url ?? undefined}
                alt={profile.display_name}
              />
              <AvatarFallback className="text-lg font-display">
                {profile.display_name?.slice(0, 2).toUpperCase() ?? '??'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl text-foreground leading-tight">
                {profile.display_name}
              </h1>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                @{profile.username}
              </p>
              {/* Tags */}
              {((profile.industry_tags?.length ?? 0) > 0 ||
                (profile.role_tags?.length ?? 0) > 0) && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {profile.industry_tags?.map((tag) => (
                    <Badge key={tag.id} variant="seed" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                  {profile.role_tags?.map((tag) => (
                    <Badge key={tag.id} variant="growth" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {isOwnProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="shrink-0"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </Button>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
          )}

          {/* Stats */}
          <div className="flex gap-6 pt-1 border-t border-border/50">
            <div className="space-y-0.5">
              <p className="text-lg font-mono text-foreground tabular-nums">
                {profile.seed_count ?? 0}
              </p>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Sprout className="w-3 h-3" />
                <span className="text-xs">Seeds</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-lg font-mono text-foreground tabular-nums">
                {profile.louge_count ?? 0}
              </p>
              <div className="flex items-center gap-1 text-muted-foreground">
                <BookOpen className="w-3 h-3" />
                <span className="text-xs">Louges</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-lg font-mono text-accent tabular-nums">
                {profile.total_score}
              </p>
              <p className="text-xs text-muted-foreground">Total Score</p>
            </div>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <div
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setIsScoreExpanded((v) => !v)}
            role="button"
            aria-expanded={isScoreExpanded}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
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
                    strokeDashoffset={`${2 * Math.PI * 20 * Math.max(0, 1 - profile.total_score / 1200)}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-accent">
                  {profile.total_score}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Total Score</p>
                <p className="text-xs text-muted-foreground font-mono">
                  Click to see breakdown
                </p>
              </div>
            </div>
            <div className="text-muted-foreground group-hover:text-foreground transition-colors">
              {isScoreExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>

          {/* Score breakdown accordion */}
          {isScoreExpanded && (
            <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
              {isScoreLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between">
                        <div className="h-3 bg-surface-raised rounded w-28 animate-pulse" />
                        <div className="h-3 bg-surface-raised rounded w-10 animate-pulse" />
                      </div>
                      <div className="h-1.5 bg-surface-raised rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                scoreBreakdownItems.map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className="text-xs font-mono text-foreground tabular-nums">
                        {item.value}
                      </span>
                    </div>
                    <Progress
                      value={(item.value / item.max) * 100}
                      className="h-1"
                      color="growth"
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Badges */}
        {(profile.badges?.length ?? 0) > 0 && (
          <div className="bg-surface border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-medium text-foreground">Badges</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {profile.badges!.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() =>
                    badge.reference_id && router.push(`/louges/${badge.reference_id}`)
                  }
                  disabled={!badge.reference_id}
                  className="group flex items-center gap-3 bg-surface-raised border border-border/50 rounded-lg p-3 text-left hover:border-accent/30 hover:shadow-card-hover transition-all duration-200 disabled:opacity-60 disabled:cursor-default"
                >
                  <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground capitalize">
                      {badge.badge_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {new Date(badge.awarded_at).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal open={isEditOpen} onOpenChange={setIsEditOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit Profile</ModalTitle>
          </ModalHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Display Name
              </label>
              <input
                type="text"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                maxLength={100}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Bio
              </label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                maxLength={500}
                rows={4}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-colors resize-none"
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-muted-foreground text-right font-mono">
                {editBio.length}/500
              </p>
            </div>
          </div>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateProfileMutation.mutate()}
              disabled={updateProfileMutation.isPending || !editDisplayName.trim()}
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
