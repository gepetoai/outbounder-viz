import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { approveCandidate, rejectCandidate, getShortlistedCandidates, getRejectedCandidates, ApproveRejectCandidateRequest } from '@/lib/search-api'

export function useApproveCandidate() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, ApproveRejectCandidateRequest>({
    mutationFn: approveCandidate,
    onSuccess: (_, variables) => {
      console.log('Candidate approved successfully:', variables.fk_candidate_id)
      // Invalidate candidates query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['shortlistedCandidates'] })
    },
    onError: (error) => {
      console.error('Failed to approve candidate:', error)
    }
  })
}

export function useRejectCandidate() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, ApproveRejectCandidateRequest>({
    mutationFn: rejectCandidate,
    onSuccess: (_, variables) => {
      console.log('Candidate rejected successfully:', variables.fk_candidate_id)
      // Invalidate candidates query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['rejectedCandidates'] })
    },
    onError: (error) => {
      console.error('Failed to reject candidate:', error)
    }
  })
}

export function useShortlistedCandidates(jobDescriptionId: number | null | undefined) {
  return useQuery({
    queryKey: ['shortlistedCandidates', jobDescriptionId],
    queryFn: () => {
      if (!jobDescriptionId) {
        throw new Error('Job description ID is required')
      }
      return getShortlistedCandidates(jobDescriptionId)
    },
    enabled: !!jobDescriptionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useRejectedCandidates(jobDescriptionId: number | null | undefined) {
  return useQuery({
    queryKey: ['rejectedCandidates', jobDescriptionId],
    queryFn: () => {
      if (!jobDescriptionId) {
        throw new Error('Job description ID is required')
      }
      return getRejectedCandidates(jobDescriptionId)
    },
    enabled: !!jobDescriptionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
