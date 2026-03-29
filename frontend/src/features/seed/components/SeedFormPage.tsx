'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Sparkles, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GrowthIndicator } from '@/features/seed/components/GrowthIndicator'
import { apiClient } from '@/lib/api/client'
import { seedFormDraftAtom } from '@/store/atoms'
import type { SeedFormInput, SeedType, Tag, Seed, CleanseSuggestion } from '@/types'
import { cn } from '@/lib/utils'

const SEED_TYPE_META: Record<
  SeedType,
  { label: string; description: string; symbol: string }
> = {
  query: { label: 'Query', description: '未解決の疑問・問いかけ', symbol: '?' },
  pain: { label: 'Pain', description: '業務・生活上の課題', symbol: '!' },
  failure: { label: 'Failure', description: '失敗から得た教訓', symbol: '×' },
  hypothesis: { label: 'Hypothesis', description: '検証したい仮説', symbol: '~' },
  comparison: { label: 'Comparison', description: '複数の選択肢を比較', symbol: '⇄' },
  observation: { label: 'Observation', description: '気づき・発見', symbol: '◎' },
  knowledge: { label: 'Knowledge', description: '体系化した知識', symbol: '◆' },
  practice: { label: 'Practice', description: '実践・経験の記録', symbol: '★' },
}

const SEED_TYPES = Object.keys(SEED_TYPE_META) as SeedType[]

const STEPS = ['Type', 'Content', 'Tags', 'Confirm'] as const

interface FormValues {
  type: SeedType | ''
  title: string
  content: string
}

export function SeedFormPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [, setDraft] = useAtom(seedFormDraftAtom)

  const [step, setStep] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [cleanseSuggestion, setCleanseSuggestion] = useState<CleanseSuggestion | null>(null)
  const [cleanseLoading, setCleanseLoading] = useState(false)

  const {
    register,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { type: '', title: '', content: '' },
  })

  const watchedType = watch('type')
  const watchedTitle = watch('title')
  const watchedContent = watch('content')

  const { data: availableTags } = useQuery({
    queryKey: ['tags'],
    queryFn: () => apiClient.get<Tag[]>('/api/v1/tags'),
    enabled: step === 2,
  })

  const createMutation = useMutation({
    mutationFn: (data: SeedFormInput) =>
      apiClient.post<Seed>('/api/v1/seeds', data),
    onSuccess: (seed) => {
      queryClient.invalidateQueries({ queryKey: ['seeds'] })
      setDraft(null)
      router.push(`/seeds/${seed.id}`)
    },
  })

  const handleNext = async () => {
    let valid = false
    if (step === 0) valid = !!(watchedType)
    if (step === 1) {
      valid = await trigger(['title', 'content'])
    }
    if (step === 2) valid = true
    if (!valid) return

    // Save draft
    setDraft({
      type: watchedType as SeedType || undefined,
      title: watchedTitle || undefined,
      content: watchedContent || undefined,
      tags: selectedTags,
    })

    setStep((s) => s + 1)
  }

  const handleSubmit = () => {
    const values = getValues()
    if (!values.type) return
    createMutation.mutate({
      type: values.type as SeedType,
      title: values.title,
      content: values.content,
      tags: selectedTags,
    })
  }

  const handleCleanse = async () => {
    const content = getValues('content')
    if (!content.trim()) return
    setCleanseLoading(true)
    setCleanseSuggestion(null)
    try {
      const result = await apiClient.post<CleanseSuggestion>('/api/v1/ai/cleanse', {
        content,
      })
      setCleanseSuggestion(result)
    } catch {
      // silently fail
    } finally {
      setCleanseLoading(false)
    }
  }

  const acceptCleanse = () => {
    if (!cleanseSuggestion) return
    setValue('content', cleanseSuggestion.suggestion)
    setCleanseSuggestion(null)
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    )
  }

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/seeds"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 mb-8 font-mono tracking-wide"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Seed Feed
      </Link>

      {/* Title */}
      <div className="mb-8">
        <h1 className="font-display text-2xl text-foreground">Plant a Seed</h1>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          Cultivate a question, observation, or insight.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200',
                i === step && 'bg-surface-raised border border-border',
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-medium border transition-all duration-200',
                  i < step && 'bg-accent border-accent text-accent-foreground',
                  i === step && 'bg-transparent border-accent text-accent',
                  i > step && 'bg-transparent border-border text-muted-foreground',
                )}
              >
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-mono transition-colors duration-200',
                  i <= step ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'w-8 h-px transition-colors duration-200',
                  i < step ? 'bg-accent/50' : 'bg-border',
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-64">
        {/* Step 0: Type selection */}
        {step === 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-5">
              What kind of seed are you planting?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {SEED_TYPES.map((type) => {
                const meta = SEED_TYPE_META[type]
                const selected = watchedType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue('type', type)}
                    className={cn(
                      'text-left p-4 rounded-lg border transition-all duration-150',
                      'hover:border-accent/40 hover:bg-surface-raised',
                      selected
                        ? 'border-accent bg-surface-raised shadow-bloom'
                        : 'border-border bg-surface',
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className={cn(
                          'text-lg font-mono leading-none',
                          selected ? 'text-accent' : 'text-muted-foreground',
                        )}
                      >
                        {meta.symbol}
                      </span>
                      {selected && (
                        <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                      )}
                    </div>
                    <p
                      className={cn(
                        'text-sm font-medium mb-0.5 transition-colors',
                        selected ? 'text-accent' : 'text-foreground',
                      )}
                    >
                      {meta.label}
                    </p>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {meta.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 1: Content input */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-muted-foreground font-mono tracking-wider uppercase">
                  Title
                </label>
                <span className="text-xs text-muted-foreground font-mono">
                  {watchedTitle.length}/200
                </span>
              </div>
              <input
                {...register('title', {
                  required: 'Title is required',
                  maxLength: { value: 200, message: 'Max 200 characters' },
                })}
                type="text"
                placeholder="Give your seed a clear title…"
                className={cn(
                  'w-full bg-surface border rounded-md px-4 py-3',
                  'text-sm text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-1 focus:ring-ring transition-colors',
                  errors.title ? 'border-destructive' : 'border-border',
                )}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-destructive font-mono">{errors.title.message}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-muted-foreground font-mono tracking-wider uppercase">
                  Content
                </label>
                <span className="text-xs text-muted-foreground font-mono">
                  {watchedContent.length}/2000
                </span>
              </div>
              <textarea
                {...register('content', {
                  required: 'Content is required',
                  maxLength: { value: 2000, message: 'Max 2000 characters' },
                })}
                placeholder="Describe your seed in detail…"
                rows={7}
                className={cn(
                  'w-full bg-surface border rounded-md px-4 py-3',
                  'text-sm text-foreground placeholder:text-muted-foreground',
                  'resize-none focus:outline-none focus:ring-1 focus:ring-ring transition-colors',
                  errors.content ? 'border-destructive' : 'border-border',
                )}
              />
              {errors.content && (
                <p className="mt-1 text-xs text-destructive font-mono">{errors.content.message}</p>
              )}
            </div>

            {/* AI Cleanse */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-xs text-foreground font-medium">AI Cleanse</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCleanse}
                  disabled={cleanseLoading || !watchedContent.trim()}
                >
                  {cleanseLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Suggest'
                  )}
                </Button>
              </div>

              {cleanseSuggestion ? (
                <div className="space-y-3">
                  <div className="bg-surface-raised rounded-md p-3">
                    <p className="text-xs text-muted-foreground font-mono mb-1.5 uppercase tracking-wider">
                      Suggestion
                    </p>
                    <p className="text-xs text-foreground leading-relaxed">
                      {cleanseSuggestion.suggestion}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={acceptCleanse}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCleanseSuggestion(null)}
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  AI が content を構造化・改善する提案を行います。
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Tag selection */}
        {step === 2 && (
          <div>
            <p className="text-sm text-muted-foreground mb-5">
              Add tags to help others find your seed. (optional)
            </p>
            {availableTags && availableTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-md border text-xs font-mono tracking-wide transition-all duration-150',
                        isSelected
                          ? 'bg-accent/10 border-accent/60 text-accent'
                          : 'bg-surface border-border text-muted-foreground hover:border-border/80 hover:text-foreground',
                      )}
                    >
                      {isSelected && <Check className="inline w-3 h-3 mr-1" />}
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              </div>
            )}
            {selectedTags.length > 0 && (
              <p className="mt-4 text-xs text-muted-foreground font-mono">
                {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">Review your seed before planting.</p>

            <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
              {/* Type + Stage */}
              <div className="flex items-center gap-3">
                <GrowthIndicator stage="seed" size="sm" animated />
                <Badge variant="seed">
                  {watchedType ? SEED_TYPE_META[watchedType as SeedType]?.label : '—'}
                </Badge>
                {selectedTags.length > 0 && (
                  <span className="text-xs text-muted-foreground font-mono">
                    {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Title */}
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">
                  Title
                </p>
                <p className="text-sm text-foreground font-medium">{watchedTitle}</p>
              </div>

              {/* Content */}
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">
                  Content
                </p>
                <p className="text-sm text-foreground leading-relaxed line-clamp-4">
                  {watchedContent}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        {step > 0 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={step === 0 && !watchedType}
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            loading={createMutation.isPending}
          >
            Plant Seed
          </Button>
        )}
      </div>

      {createMutation.isError && (
        <p className="mt-3 text-xs text-destructive font-mono text-center">
          Failed to create seed. Please try again.
        </p>
      )}
    </div>
  )
}
