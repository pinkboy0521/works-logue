import { Skeleton } from '@/components/ui/skeleton'

export function LougeCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-lg p-5 space-y-3">
      {/* pattern name + status badge */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20 rounded-sm" />
        <Skeleton className="h-5 w-16 rounded-sm" />
      </div>

      {/* title */}
      <Skeleton className="h-5 w-3/4" />

      {/* pattern fields */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Skeleton className="h-3 w-12 shrink-0" />
          <Skeleton className="h-3 flex-1" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-3 w-12 shrink-0" />
          <Skeleton className="h-3 flex-1" />
        </div>
      </div>

      {/* footer: score + fork count */}
      <div className="flex items-center justify-between pt-1 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-1 w-1 rounded-full" />
          <Skeleton className="h-3.5 w-16" />
        </div>
        <Skeleton className="h-7 w-14 rounded-md" />
      </div>
    </div>
  )
}
