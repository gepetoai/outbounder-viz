'use client'

import { useQuery } from '@tanstack/react-query'
import { getMockCandidatesForJob, initializeMockData } from '@/lib/mock-data'
import type { CandidatesByJobDescriptionResponse } from '@/lib/search-api'

/**
 * Mock version of useCandidatesByJobDescription that works offline
 * Uses localStorage-backed mock data instead of API calls
 */
export function useMockCandidatesByJobDescription (jobDescriptionId: number | null | undefined) {
  return useQuery<CandidatesByJobDescriptionResponse>({
    queryKey: ['mockCandidates', 'job-description', jobDescriptionId],
    queryFn: async () => {
      if (!jobDescriptionId) {
        return { candidates: [] }
      }
      
      // Initialize mock data if not present
      initializeMockData()
      
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const candidates = getMockCandidatesForJob(jobDescriptionId)
      return { candidates }
    },
    enabled: !!jobDescriptionId,
    staleTime: Infinity, // Mock data doesn't go stale
    gcTime: Infinity
  })
}

