import { useMemo } from 'react'
import { useCandidatesForReview } from './useSearch'
import { useShortlistedCandidates, useRejectedCandidates } from './useCandidates'
import { mapEnrichedCandidateToCandidate, type Candidate } from '@/lib/utils'
import type { EnrichedCandidateResponse } from '@/lib/search-api'

interface UsePaginatedCandidatesParams {
  viewMode: 'review' | 'approved' | 'rejected'
  jobDescriptionId: number | null | undefined
  offset: number
  limit: number
}

interface UsePaginatedCandidatesResult {
  candidates: Candidate[]
  totalCount: number
  isLoading: boolean
  error: Error | null
  rawCandidates: EnrichedCandidateResponse[] | any[] // For review mode, returns EnrichedCandidateResponse[], for others returns ShortlistedCandidate[] or RejectedCandidate[]
}

/**
 * Custom hook to fetch and manage paginated candidates based on view mode.
 * Consolidates the logic for fetching review, approved, and rejected candidates.
 * 
 * @param params - Configuration object with viewMode, jobDescriptionId, offset, and limit
 * @returns Object containing candidates list, total count, loading state, and error
 */
export function usePaginatedCandidates({
  viewMode,
  jobDescriptionId,
  offset,
  limit,
}: UsePaginatedCandidatesParams): UsePaginatedCandidatesResult {
  // Fetch candidates based on view mode
  const reviewQuery = useCandidatesForReview(
    viewMode === 'review' ? jobDescriptionId : null,
    offset,
    limit
  )
  
  const shortlistedQuery = useShortlistedCandidates(
    viewMode === 'approved' ? jobDescriptionId : null,
    offset,
    limit
  )
  
  const rejectedQuery = useRejectedCandidates(
    viewMode === 'rejected' ? jobDescriptionId : null,
    offset,
    limit
  )

  // Determine which query to use based on view mode
  const activeQuery = useMemo(() => {
    switch (viewMode) {
      case 'review':
        return reviewQuery
      case 'approved':
        return shortlistedQuery
      case 'rejected':
        return rejectedQuery
      default:
        return reviewQuery
    }
  }, [viewMode, reviewQuery, shortlistedQuery, rejectedQuery])

  // Extract and transform data based on view mode
  return useMemo(() => {
    const isLoading = activeQuery.isLoading ?? false
    const error = activeQuery.error ?? null

    switch (viewMode) {
      case 'review': {
        const response = activeQuery.data as { candidates: EnrichedCandidateResponse[], total_count: number } | undefined
        const rawCandidates = response?.candidates || []
        const candidates = rawCandidates.map(mapEnrichedCandidateToCandidate)
        const totalCount = response?.total_count || 0
        
        return {
          candidates,
          totalCount,
          isLoading,
          error,
          rawCandidates,
        }
      }
      
      case 'approved': {
        const response = activeQuery.data as { candidates: any[], total_count: number } | undefined
        const rawCandidates = response?.candidates || []
        const candidates = rawCandidates.map((item: any) => 
          mapEnrichedCandidateToCandidate(item.fk_candidate)
        )
        const totalCount = response?.total_count || 0
        
        return {
          candidates,
          totalCount,
          isLoading,
          error,
          rawCandidates,
        }
      }
      
      case 'rejected': {
        const response = activeQuery.data as { candidates: any[], total_count: number } | undefined
        const rawCandidates = response?.candidates || []
        const candidates = rawCandidates.map((item: any) => 
          mapEnrichedCandidateToCandidate(item.fk_candidate)
        )
        const totalCount = response?.total_count || 0
        
        return {
          candidates,
          totalCount,
          isLoading,
          error,
          rawCandidates,
        }
      }
      
      default:
        return {
          candidates: [],
          totalCount: 0,
          isLoading: false,
          error: null,
          rawCandidates: [],
        }
    }
  }, [viewMode, activeQuery.data, activeQuery.isLoading, activeQuery.error])
}
