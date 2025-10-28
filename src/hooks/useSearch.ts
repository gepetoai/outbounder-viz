import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSearch, updateSearchName, updateSearch, runSearch, getSavedSearches, enrichCandidates, getCandidatesByJobDescription, getCandidatesForReview, SearchRequest, SearchResponse, SavedSearch, EnrichedCandidatesApiResponse, CandidatesByJobDescriptionResponse, EnrichedCandidateResponse } from '@/lib/search-api'

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

export function useSavedSearches() {
  return useQuery<SavedSearch[], Error>({
    queryKey: ['savedSearches'],
    queryFn: getSavedSearches,
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
