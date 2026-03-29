import { SeedCardSkeleton } from '@/components/ui/skeletons/SeedCardSkeleton'

export default function SeedsLoading() {
  return (
    <div className="max-w-content mx-auto px-4 py-8 space-y-3">
      {[1, 2, 3].map((i) => (
        <SeedCardSkeleton key={i} />
      ))}
    </div>
  )
}
