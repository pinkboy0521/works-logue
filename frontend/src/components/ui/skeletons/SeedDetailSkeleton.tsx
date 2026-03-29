import { Skeleton } from '@/components/ui/skeleton'

export function SeedDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-sm" />
          <Skeleton className="h-5 w-20 rounded-sm" />
        </div>
        <Skeleton className="h-8 w-3/4" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* growth indicator */}
      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
        <div className="flex justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-10" />
          ))}
        </div>
      </div>

      {/* content */}
      <div className="bg-surface border border-border rounded-lg p-5 space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className={`h-3.5 ${i === 4 ? 'w-1/2' : 'w-full'}`} />
        ))}
      </div>

      {/* tags */}
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-16 rounded-sm" />
        ))}
      </div>

      {/* log section header */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>

      {/* log items */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-surface border border-border rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-16" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ))}
    </div>
  )
}
