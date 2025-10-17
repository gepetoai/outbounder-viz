import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'

// Generic hook for GET requests
export function useApiQuery<T>(
  queryKey: string[],
  url: string,
  options?: {
    enabled?: boolean
    staleTime?: number
    gcTime?: number
  }
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await axiosInstance.get<T>(url)
      return response.data
    },
    enabled: options?.enabled,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
  })
}

// Generic hook for POST/PUT/DELETE requests
export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void
    onError?: (error: Error) => void
    invalidateQueries?: string[]
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      options?.onSuccess?.(data)
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey: [queryKey] })
        })
      }
    },
    onError: options?.onError,
  })
}
