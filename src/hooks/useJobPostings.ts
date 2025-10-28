'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchJson } from '@/lib/api-client'

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

// API functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
console.log('API_BASE_URL', API_BASE_URL)

async function createJobPosting(data: CreateJobPostingRequest): Promise<JobPosting> {
  return fetchJson<JobPosting>(`${API_BASE_URL}/job-description/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

async function fetchJobPostings(): Promise<JobPosting[]> {
  return fetchJson<JobPosting[]>(`${API_BASE_URL}/job-description/`, {
    method: 'GET',
  })
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
