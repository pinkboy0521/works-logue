import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from '@/hooks/use-toast'
import type { Log, SeedWithDetails, ApiError } from '@/types'

interface UseReplyMutationArgs {
  seedId: string
}

interface ReplyMutationVariables {
  logId: string
  content: string
}

interface ReplyContext {
  previousSeed: SeedWithDetails | undefined
}

export function useReplyMutation({ seedId }: UseReplyMutationArgs) {
  const queryClient = useQueryClient()

  return useMutation<Log, ApiError, ReplyMutationVariables, ReplyContext>({
    mutationFn: ({ logId, content }) =>
      apiClient.post<Log>(`/api/v1/logs/${logId}/replies`, { content }),

    onMutate: async ({ logId, content }) => {
      await queryClient.cancelQueries({ queryKey: ['seed', seedId] })

      const previousSeed = queryClient.getQueryData<SeedWithDetails>(['seed', seedId])

      const optimisticReply: Log = {
        id: crypto.randomUUID(),
        seed_id: seedId,
        user_id: '',
        parent_log_id: logId,
        content,
        is_ai_facilitation: false,
        facilitation_type: null,
        created_at: new Date().toISOString(),
        reaction_summary: { insight: 0, agree: 0, helpful: 0 },
      }

      queryClient.setQueryData<SeedWithDetails>(['seed', seedId], (old) => {
        if (!old?.logs) return old
        return {
          ...old,
          logs: [...old.logs, optimisticReply],
        }
      })

      return { previousSeed }
    },

    onError: (error, _variables, context) => {
      if (context?.previousSeed !== undefined) {
        queryClient.setQueryData(['seed', seedId], context.previousSeed)
      }
      toast({
        variant: 'destructive',
        title: 'Failed to post reply',
        description: error.message,
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['seed', seedId] })
    },
  })
}
