'use client'

import { useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { useRouter } from 'next/navigation'
import { userAtom } from '@/store/atoms'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = useAtomValue(userAtom)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.replace('/seeds')
    }
  }, [user, router])

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {children}
    </div>
  )
}
