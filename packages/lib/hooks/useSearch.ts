import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SearchRequest, SearchResponse, SavedSearch, EnrichedCandidatesApiResponse, CandidatesByJobDescriptionResponse, EnrichedCandidateResponse } from '@/lib/search-api'
import { getMockCandidates, getMockShortlistedCandidates, getMockRejectedCandidates, getMockCandidatesForJob, getMockJobPostings } from '../mock-data'

// Mock API functions
async function createSearch(data: SearchRequest): Promise<SearchResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  return {
    total_results: 150,
    search_id: 1,
    query_json: data as unknown as Record<string, unknown>
  }
}

async function updateSearchName(searchId: number, searchTitle: string): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  console.log('Mock: Updated search name', searchId, searchTitle)
}

async function updateSearch(searchId: number, data: SearchRequest): Promise<SearchResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  return {
    total_results: 150,
    search_id: searchId,
    query_json: data as unknown as Record<string, unknown>
  }
}

async function runSearch(searchId: number): Promise<SearchResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    total_results: 150,
    search_id: searchId,
    query_json: {}
  }
}

async function getSavedSearchesByJobDescription(jobDescriptionId: number): Promise<SavedSearch[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  // Return empty array for now - user can create searches
  return []
}

async function enrichCandidates(searchId: number, limit: number): Promise<EnrichedCandidatesApiResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  const allCandidates = getMockCandidates()
  const candidates = allCandidates.slice(0, Math.min(limit, allCandidates.length))
  
  return {
    candidates: candidates,
    excluded_count: 0
  }
}

async function getCandidatesByJobDescription(jobDescriptionId: number): Promise<CandidatesByJobDescriptionResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  const jobCandidates = getMockCandidatesForJob(jobDescriptionId)
  const jobPostings = getMockJobPostings()
  const job = jobPostings.find(j => j.id === jobDescriptionId)
  
  return {
    candidates: jobCandidates,
    target_candidates_count: job?.target_candidates_count || 500,
    current_candidates_count: jobCandidates.length
  }
}

async function getCandidatesForReview(jobDescriptionId: number): Promise<EnrichedCandidateResponse[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  const jobCandidates = getMockCandidatesForJob(jobDescriptionId)
  const shortlistedIds = getMockShortlistedCandidates()
  const rejectedIds = getMockRejectedCandidates()
  
  // Filter out already reviewed candidates
  return jobCandidates.filter(candidate => 
    !shortlistedIds.includes(candidate.id) && !rejectedIds.includes(candidate.id)
  )
}

export function useCreateSearch() {
  const queryClient = useQueryClient()

  return useMutation<SearchResponse, Error, SearchRequest>({
    mutationFn: createSearch,
    onSuccess: (data) => {
      console.log('Search created successfully:', data)
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] })
    },
    onError: (error) => {
      console.error('Failed to create search:', error)
    }
  })
}

export function useUpdateSearchName() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { searchId: number; searchTitle: string }>({
    mutationFn: ({ searchId, searchTitle }) => updateSearchName(searchId, searchTitle),
    onSuccess: () => {
      console.log('Search name updated successfully')
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] })
    },
    onError: (error) => {
      console.error('Failed to update search name:', error)
    }
  })
}

export function useUpdateSearch() {
  const queryClient = useQueryClient()

  return useMutation<SearchResponse, Error, { searchId: number; data: SearchRequest }>({
    mutationFn: ({ searchId, data }) => updateSearch(searchId, data),
    onSuccess: () => {
      console.log('Search updated successfully')
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] })
    },
    onError: (error) => {
      console.error('Failed to update search:', error)
    }
  })
}

export function useRunSearch() {
  const queryClient = useQueryClient()

  return useMutation<SearchResponse, Error, number>({
    mutationFn: (searchId) => runSearch(searchId),
    onSuccess: (data) => {
      console.log('Search run successfully:', data)
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] })
    },
    onError: (error) => {
      console.error('Failed to run search:', error)
    }
  })
}

export function useSavedSearches(jobDescriptionId: number) {
  return useQuery<SavedSearch[], Error>({
    queryKey: ['savedSearches', jobDescriptionId],
    queryFn: () => getSavedSearchesByJobDescription(jobDescriptionId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useEnrichCandidates() {
  return useMutation<EnrichedCandidatesApiResponse, Error, { searchId: number; limit: number }>({
    mutationFn: ({ searchId, limit }) => enrichCandidates(searchId, limit),
    onSuccess: (data) => {
      console.log('Candidates enriched successfully:', data.candidates.length, 'candidates')
    },
    onError: (error) => {
      console.error('Failed to enrich candidates:', error)
    }
  })
}

export function useCandidatesByJobDescription(jobDescriptionId: number | null | undefined) {
  return useQuery<CandidatesByJobDescriptionResponse, Error>({
    queryKey: ['candidates', 'job-description', jobDescriptionId],
    queryFn: () => {
      if (!jobDescriptionId) {
        throw new Error('Job description ID is required')
      }
      return getCandidatesByJobDescription(jobDescriptionId)
    },
    enabled: !!jobDescriptionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useCandidatesForReview(jobDescriptionId: number | null | undefined) {
  return useQuery<EnrichedCandidateResponse[], Error>({
    queryKey: ['candidates', 'review', jobDescriptionId],
    queryFn: () => {
      if (!jobDescriptionId) {
        throw new Error('Job description ID is required')
      }
      return getCandidatesForReview(jobDescriptionId)
    },
    enabled: !!jobDescriptionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
