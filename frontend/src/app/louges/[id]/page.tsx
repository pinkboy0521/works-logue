import { LougeDetailPage } from '@/features/louge/components/LougeDetailPage'

export default async function LougeDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <LougeDetailPage id={id} />
}
