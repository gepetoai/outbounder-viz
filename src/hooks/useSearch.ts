import { useMutation } from '@tanstack/react-query'
import { createSearch, updateSearchName, SearchRequest, SearchResponse } from '@/lib/search-api'

export function useCreateSearch() {
  return useMutation<SearchResponse, Error, SearchRequest>({
    mutationFn: createSearch,
    onSuccess: (data) => {
      console.log('Search created successfully:', data)
    },
    onError: (error) => {
      console.error('Failed to create search:', error)
    }
  })
}

export function useUpdateSearchName() {
  return useMutation<void, Error, { searchId: number; searchTitle: string }>({
    mutationFn: ({ searchId, searchTitle }) => updateSearchName(searchId, searchTitle),
    onSuccess: () => {
      console.log('Search name updated successfully')
    },
    onError: (error) => {
      console.error('Failed to update search name:', error)
    }
  })
}
