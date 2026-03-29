import type { Metadata } from 'next'
import { SeedDetailPage } from '@/features/seed/components/SeedDetailPage'

export const metadata: Metadata = {
  title: 'Seed — Works Logue',
}

export default function SeedDetailRoute({ params }: { params: { id: string } }) {
  return <SeedDetailPage id={params.id} />
}
