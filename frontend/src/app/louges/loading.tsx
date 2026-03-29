import { LougeCardSkeleton } from '@/components/ui/skeletons/LougeCardSkeleton'

export default function Loading() {
  return (
    <div className="max-w-content mx-auto px-4 py-8 space-y-3">
      {[1, 2, 3].map((i) => (
        <LougeCardSkeleton key={i} />
      ))}
    </div>
  )
}
