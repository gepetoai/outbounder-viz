import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApproveRejectCandidateRequest, ShortlistedCandidate, RejectedCandidate } from '@/lib/search-api'
import { 
  addMockShortlistedCandidate, 
  addMockRejectedCandidate, 
  getMockShortlistedCandidates, 
  getMockRejectedCandidates,
  getMockCandidates,
  removeMockCandidateDecision
} from '@/lib/mock-data'

// Mock API functions
async function approveCandidate(data: ApproveRejectCandidateRequest): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  addMockShortlistedCandidate(data.fk_candidate_id)
}

async function rejectCandidate(data: ApproveRejectCandidateRequest): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  addMockRejectedCandidate(data.fk_candidate_id)
}

async function moveCandidateToReview(data: ApproveRejectCandidateRequest): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  removeMockCandidateDecision(data.fk_candidate_id)
}

async function getShortlistedCandidates(jobDescriptionId: number): Promise<ShortlistedCandidate[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200))
  const shortlistedIds = getMockShortlistedCandidates()
  const allCandidates = getMockCandidates()
  
  return shortlistedIds.map((candidateId, index) => {
    const candidate = allCandidates.find(c => c.id === candidateId)
    if (!candidate) return null
    
    return {
      id: index + 1,
      fk_job_description_id: jobDescriptionId,
      fk_candidate_id: candidateId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      fk_candidate: candidate
    }
  }).filter(Boolean) as ShortlistedCandidate[]
}

async function getRejectedCandidates(jobDescriptionId: number): Promise<RejectedCandidate[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200))
  const rejectedIds = getMockRejectedCandidates()
  const allCandidates = getMockCandidates()
  
  return rejectedIds.map((candidateId, index) => {
    const candidate = allCandidates.find(c => c.id === candidateId)
    if (!candidate) return null
    
    return {
      id: index + 1,
      fk_job_description_id: jobDescriptionId,
      fk_candidate_id: candidateId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      fk_candidate: candidate
    }
  }).filter(Boolean) as RejectedCandidate[]
}

export function useApproveCandidate() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, ApproveRejectCandidateRequest>({
    mutationFn: approveCandidate,
    onSuccess: (_, variables) => {
      console.log('Candidate approved successfully:', variables.fk_candidate_id)
      // Invalidate all candidate queries to refresh the data
      // Need to invalidate all three because candidate might be moving from rejected->approved
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['shortlistedCandidates'] })
      queryClient.invalidateQueries({ queryKey: ['rejectedCandidates'] })
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
      // Invalidate all candidate queries to refresh the data
      // Need to invalidate all three because candidate might be moving from approved->rejected
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['shortlistedCandidates'] })
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

export function useMoveCandidateToReview() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, ApproveRejectCandidateRequest>({
    mutationFn: moveCandidateToReview,
    onSuccess: (_, variables) => {
      console.log('Candidate moved to review successfully:', variables.fk_candidate_id)
      // Invalidate all candidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['shortlistedCandidates'] })
      queryClient.invalidateQueries({ queryKey: ['rejectedCandidates'] })
    },
    onError: (error) => {
      console.error('Failed to move candidate to review:', error)
    }
  })
}

// Combined hook for approved and rejected candidates
export function useCandidates(jobDescriptionId: number | null | undefined) {
  const approvedQuery = useShortlistedCandidates(jobDescriptionId)
  const rejectedQuery = useRejectedCandidates(jobDescriptionId)

  return {
    data: {
      approved_candidates: approvedQuery.data?.map(c => c.fk_candidate) || [],
      rejected_candidates: rejectedQuery.data?.map(c => c.fk_candidate) || []
    },
    isLoading: approvedQuery.isLoading || rejectedQuery.isLoading,
    isError: approvedQuery.isError || rejectedQuery.isError,
    error: approvedQuery.error || rejectedQuery.error
  }
}
