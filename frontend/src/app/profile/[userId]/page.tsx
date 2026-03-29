import { ProfilePage } from '@/features/profile/components/ProfilePage'

export default function ProfileRoute({ params }: { params: { userId: string } }) {
  return <ProfilePage params={params} />
}
