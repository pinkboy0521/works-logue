import type { Metadata } from 'next'
import { SeedFeedPage } from '@/features/seed/components/SeedFeedPage'

export const metadata: Metadata = {
  title: 'Seed Feed — Works Logue',
  description: 'Discover and explore seeds of knowledge cultivated by the community.',
}

export default function SeedsPage() {
  return <SeedFeedPage />
}
