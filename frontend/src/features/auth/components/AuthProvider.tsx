'use client'

import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { useQueryClient } from '@tanstack/react-query'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { userAtom, sessionAtom, notificationUnreadCountAtom } from '@/store/atoms'
import type { User } from '@/types'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

function mapSessionUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): User {
  return {
    id: supabaseUser.id,
    username: (supabaseUser.user_metadata?.username as string) ?? '',
    display_name: (supabaseUser.user_metadata?.display_name as string) ?? '',
    avatar_url: (supabaseUser.user_metadata?.avatar_url as string) ?? null,
    bio: null,
    total_score: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useSetAtom(userAtom)
  const setSession = useSetAtom(sessionAtom)
  const setNotificationUnreadCount = useSetAtom(notificationUnreadCountAtom)
  const queryClient = useQueryClient()
  const supabase = getBrowserClient()

  // 1. 初期セッション取得 + onAuthStateChange 購読
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ? mapSessionUser(session.user) : null)
      setSession(session ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setSession(null)
        queryClient.clear()
      } else if (session?.user) {
        setUser(mapSessionUser(session.user))
        setSession(session)
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setSession, queryClient, supabase])

  // 2. Realtime 通知購読（ログイン中のみ）
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    const unsubAuth = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (channel) {
        supabase.removeChannel(channel)
        channel = null
      }
      if (session?.user) {
        const userId = session.user.id
        channel = supabase
          .channel(`notifications:${userId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userId}`,
            },
            () => {
              setNotificationUnreadCount((prev) => prev + 1)
            }
          )
          .subscribe()
      }
    })

    return () => {
      unsubAuth.data.subscription.unsubscribe()
      if (channel) supabase.removeChannel(channel)
    }
  }, [supabase, setNotificationUnreadCount])

  return <>{children}</>
}
