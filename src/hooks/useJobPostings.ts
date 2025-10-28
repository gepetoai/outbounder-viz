'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchJson, fetchWithAuth } from '@/lib/api-client'

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
const API_BASE_URL = 'http://localhost:8096/api/v1'

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

async function deleteJobPosting(id: number): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/job-description/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete job posting: ${response.statusText}`)
  }
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
