import type { Metadata } from 'next'
import { SeedDetailPage } from '@/features/seed/components/SeedDetailPage'

export const metadata: Metadata = {
  title: 'Seed — Works Logue',
}

export default async function SeedDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SeedDetailPage id={id} />
}
