'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import type { SeedWithDetails } from '@/types'

export function useSeedRealtime(seedId: string | undefined): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!seedId) return

    const supabase = getBrowserClient()

    const channel = supabase
      .channel(`seed-detail-${seedId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'seeds',
          filter: `id=eq.${seedId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          queryClient.setQueryData<SeedWithDetails>(
            ['seed', seedId],
            (old) => (old ? { ...old, ...(payload.new as Partial<SeedWithDetails>) } : old)
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'louges',
          filter: `seed_id=eq.${seedId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          if ((payload.new as { status?: string }).status === 'published') {
            queryClient.invalidateQueries({ queryKey: ['louges'] })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [seedId, queryClient])
}
