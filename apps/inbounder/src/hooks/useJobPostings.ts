'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMockJobPostings, addMockJobPosting, initializeMockData } from '@/lib/mock-data'

// Types
export interface JobPosting {
  id: number
  title: string
  url: string
  raw_text?: string
  target_candidates_count: number
  fk_organization_id: number
  created_at?: string
}

export interface CreateJobPostingRequest {
  title: string
  url: string
  raw_text?: string
  target_candidates_count: number
  fk_organization_id: number
}

// Mock API functions
async function createJobPosting(data: CreateJobPostingRequest): Promise<JobPosting> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  return addMockJobPosting(data)
}

async function fetchJobPostings(): Promise<JobPosting[]> {
  // Initialize mock data if needed
  initializeMockData()
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  return getMockJobPostings()
}

// React Query hooks
export function useJobPostings() {
  return useQuery({
    queryKey: ['jobPostings'],
    queryFn: fetchJobPostings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateJobPosting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createJobPosting,
    onSuccess: () => {
      // Invalidate and refetch job postings after successful creation
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] })
    },
    onError: (error) => {
      console.error('Failed to create job posting:', error)
    },
  })
}
