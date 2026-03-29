import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from '@/hooks/use-toast'
import type { ReactionType, SeedWithDetails, Log, ApiError } from '@/types'

interface UseReactionMutationArgs {
  seedId: string
}

interface ReactionMutationVariables {
  logId: string
  type: ReactionType
}

interface ReactionContext {
  previousSeed: SeedWithDetails | undefined
}

export function useReactionMutation({ seedId }: UseReactionMutationArgs) {
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, ReactionMutationVariables, ReactionContext>({
    mutationFn: ({ logId, type }) =>
      apiClient.post<void>(`/api/v1/logs/${logId}/reactions`, { type }),

    onMutate: async ({ logId, type }) => {
      await queryClient.cancelQueries({ queryKey: ['seed', seedId] })

      const previousSeed = queryClient.getQueryData<SeedWithDetails>(['seed', seedId])

      queryClient.setQueryData<SeedWithDetails>(['seed', seedId], (old) => {
        if (!old?.logs) return old
        return {
          ...old,
          logs: old.logs.map((log: Log) => {
            if (log.id !== logId) return log
            const summary = log.reaction_summary ?? { insight: 0, agree: 0, helpful: 0 }
            return {
              ...log,
              reaction_summary: {
                ...summary,
                [type]: summary[type] + 1,
              },
            }
          }),
        }
      })

      return { previousSeed }
    },

    onError: (error, _variables, context) => {
      if (context?.previousSeed !== undefined) {
        queryClient.setQueryData(['seed', seedId], context.previousSeed)
      }
      // 409 (duplicate reaction) は無視
      if (error.code === '409') return
      toast({
        variant: 'destructive',
        title: 'Failed to add reaction',
        description: error.message,
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['seed', seedId] })
    },
  })
}
