'use client'

import { useQuery } from '@tanstack/react-query'
import { getMockJobPostings, initializeMockData } from '@/lib/mock-data'
import type { JobPosting } from '@/hooks/useJobPostings'

/**
 * Mock version of useJobPostings that works offline
 * Uses localStorage-backed mock data instead of API calls
 */
export function useMockJobPostings () {
  return useQuery<JobPosting[]>({
    queryKey: ['mockJobPostings'],
    queryFn: async () => {
      // Initialize mock data if not present
      initializeMockData()
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 100))
      return getMockJobPostings()
    },
    staleTime: Infinity, // Mock data doesn't go stale
    gcTime: Infinity
  })
}

