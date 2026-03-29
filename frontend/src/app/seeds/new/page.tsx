import type { Metadata } from 'next'
import { SeedFormPage } from '@/features/seed/components/SeedFormPage'

export const metadata: Metadata = {
  title: 'Plant a Seed — Works Logue',
  description: 'Share a question, observation, or insight to cultivate new knowledge.',
}

export default function NewSeedPage() {
  return <SeedFormPage />
}
