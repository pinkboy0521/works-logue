import { LougeDetailPage } from '@/features/louge/components/LougeDetailPage'

export default function LougeDetailRoute({ params }: { params: { id: string } }) {
  return <LougeDetailPage params={params} />
}
