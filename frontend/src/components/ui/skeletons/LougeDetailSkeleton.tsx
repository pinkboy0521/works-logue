import { Skeleton } from '@/components/ui/skeleton'

export function LougeDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-sm" />
          <Skeleton className="h-5 w-14 rounded-sm" />
        </div>
        <Skeleton className="h-8 w-2/3" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* quality score */}
      <div className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      </div>

      {/* pattern sections */}
      {['Context', 'Problem', 'Solution'].map((_, i) => (
        <div key={i} className="bg-surface border border-border rounded-lg p-5 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ))}

      {/* fork button area */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-8" />
        </div>
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  )
}
