import { ProfileHeaderSkeleton } from '@/components/ui/skeletons/ProfileHeaderSkeleton'
import { ScoreBreakdownSkeleton } from '@/components/ui/skeletons/ScoreBreakdownSkeleton'

export default function Loading() {
  return (
    <div className="max-w-content mx-auto px-4 py-8 space-y-6">
      <ProfileHeaderSkeleton />
      <ScoreBreakdownSkeleton />
    </div>
  )
}
