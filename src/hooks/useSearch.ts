import { useMutation } from '@tanstack/react-query'
import { createSearch, SearchRequest, SearchResponse } from '@/lib/search-api'

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
