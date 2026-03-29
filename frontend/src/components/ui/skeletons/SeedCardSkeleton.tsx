import { Skeleton } from '@/components/ui/skeleton'

export function SeedCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-lg p-5 space-y-3">
      {/* header: avatar + name + date */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
        {/* seed type badge */}
        <Skeleton className="h-5 w-14 rounded-sm" />
      </div>

      {/* title */}
      <Skeleton className="h-5 w-4/5" />

      {/* body text: 2 lines */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>

      {/* footer: growth stage + log count */}
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-1.5 w-28 rounded-full" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  )
}
