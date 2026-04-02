import { ProfilePage } from '@/features/profile/components/ProfilePage'

export default async function ProfileRoute({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  return <ProfilePage userId={userId} />
}
