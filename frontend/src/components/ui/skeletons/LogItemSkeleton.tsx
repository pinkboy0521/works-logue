import { Skeleton } from '@/components/ui/skeleton'

export function LogItemSkeleton() {
  return (
    <div className="space-y-2 py-3">
      {/* author row */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full shrink-0" />
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      {/* content */}
      <div className="pl-8 space-y-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      {/* reaction bar */}
      <div className="pl-8 flex gap-3 pt-1">
        <Skeleton className="h-6 w-14 rounded-sm" />
        <Skeleton className="h-6 w-14 rounded-sm" />
        <Skeleton className="h-6 w-14 rounded-sm" />
      </div>
    </div>
  )
}
