import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSearch, updateSearchName, updateSearch, runSearch, getSavedSearches, SearchRequest, SearchResponse, SavedSearch } from '@/lib/search-api'

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
