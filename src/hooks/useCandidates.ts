import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveCandidate,
  rejectCandidate,
  getShortlistedCandidates,
  getRejectedCandidates,
  ApproveRejectCandidateRequest,
  BulkCandidateRequest,
  approveCandidateFromRejected,
  rejectCandidateFromShortlisted,
  bulkDeleteShortlistedCandidates,
  bulkDeleteRejectedCandidates,
  EnrichedCandidateResponse
} from '@/lib/search-api'

export function useApproveCandidate() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, ApproveRejectCandidateRequest>({
    mutationFn: approveCandidate,
    onSuccess: (_, variables) => {
      console.log('Candidate approved successfully:', variables.fk_candidate_id)

      // Invalidate all review candidates queries (with pagination) to refetch updated data
      queryClient.invalidateQueries({ 
        queryKey: ['candidates', 'review', variables.fk_job_description_id],
        refetchType: 'active' 
      })

      // Invalidate shortlisted candidates to show updated count
      queryClient.invalidateQueries({ queryKey: ['shortlistedCandidates'], refetchType: 'active' })
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

      // Invalidate all review candidates queries (with pagination) to refetch updated data
      queryClient.invalidateQueries({ 
        queryKey: ['candidates', 'review', variables.fk_job_description_id],
        refetchType: 'active' 
      })

      // Invalidate rejected candidates to show updated count
      queryClient.invalidateQueries({ queryKey: ['rejectedCandidates'], refetchType: 'active' })
    },
    onError: (error) => {
      console.error('Failed to reject candidate:', error)
    }
  })
}

export function useShortlistedCandidates(
  jobDescriptionId: number | null | undefined,
  offset: number = 0,
  limit: number = 25
) {
  return useQuery({
    queryKey: ['shortlistedCandidates', jobDescriptionId, offset, limit],
    queryFn: () => {
      if (!jobDescriptionId) {
        throw new Error('Job description ID is required')
      }
      return getShortlistedCandidates(jobDescriptionId, offset, limit)
    },
    enabled: !!jobDescriptionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useRejectedCandidates(
  jobDescriptionId: number | null | undefined,
  offset: number = 0,
  limit: number = 25
) {
  return useQuery({
    queryKey: ['rejectedCandidates', jobDescriptionId, offset, limit],
    queryFn: () => {
      if (!jobDescriptionId) {
        throw new Error('Job description ID is required')
      }
      return getRejectedCandidates(jobDescriptionId, offset, limit)
    },
    enabled: !!jobDescriptionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useApproveCandidateFromRejected() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, BulkCandidateRequest>({
    mutationFn: approveCandidateFromRejected,
    onSuccess: (_, variables) => {
      console.log('Candidate(s) approved from rejected:', variables.fk_candidate_ids)
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['shortlistedCandidates'] })
      queryClient.invalidateQueries({ queryKey: ['rejectedCandidates'] })
    },
    onError: (error) => {
      console.error('Failed to approve candidate from rejected:', error)
    }
  })
}

export function useRejectCandidateFromShortlisted() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, BulkCandidateRequest>({
    mutationFn: rejectCandidateFromShortlisted,
    onSuccess: (_, variables) => {
      console.log('Candidate(s) rejected from shortlisted:', variables.fk_candidate_ids)
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['shortlistedCandidates'] })
      queryClient.invalidateQueries({ queryKey: ['rejectedCandidates'] })
    },
    onError: (error) => {
      console.error('Failed to reject candidate from shortlisted:', error)
    }
  })
}

export function useSendToReviewFromShortlisted() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, BulkCandidateRequest>({
    mutationFn: bulkDeleteShortlistedCandidates,
    onSuccess: (_, variables) => {
      console.log('Candidate(s) sent to review from shortlisted:', variables.fk_candidate_ids)
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['shortlistedCandidates'] })
      // Invalidate review candidates to show the candidates that were sent back
      queryClient.invalidateQueries({ 
        queryKey: ['candidates', 'review', variables.fk_job_description_id],
        refetchType: 'active' 
      })
    },
    onError: (error) => {
      console.error('Failed to send candidates to review from shortlisted:', error)
    }
  })
}

export function useSendToReviewFromRejected() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, BulkCandidateRequest>({
    mutationFn: bulkDeleteRejectedCandidates,
    onSuccess: (_, variables) => {
      console.log('Candidate(s) sent to review from rejected:', variables.fk_candidate_ids)
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['rejectedCandidates'] })
      // Invalidate review candidates to show the candidates that were sent back
      queryClient.invalidateQueries({ 
        queryKey: ['candidates', 'review', variables.fk_job_description_id],
        refetchType: 'active' 
      })
    },
    onError: (error) => {
      console.error('Failed to send candidates to review from rejected:', error)
    }
  })
}
