import { Skeleton } from '@/components/ui/skeleton'

export function ScoreBreakdownSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
      {/* total score */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-16" />
      </div>

      <div className="h-px bg-border" />

      {/* score breakdown items */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3.5 w-10" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      ))}

      {/* badges section */}
      <div className="h-px bg-border" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
