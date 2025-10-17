import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { useAuth } from './use-auth'

// Generic hook for GET requests
export function useApiQuery<T>(
  queryKey: string[],
  url: string,
  options?: {
    enabled?: boolean
    staleTime?: number
    gcTime?: number
    requireAuth?: boolean
  }
) {
  const { isSignedIn, isLoaded } = useAuth()
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await axiosInstance.get<T>(url)
      return response.data
    },
    enabled: options?.enabled !== false && (!options?.requireAuth || (isLoaded && isSignedIn)),
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
    requireAuth?: boolean
  }
) {
  const queryClient = useQueryClient()
  const { isSignedIn, isLoaded } = useAuth()

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      if (options?.requireAuth && (!isLoaded || !isSignedIn)) {
        throw new Error('Authentication required for this operation')
      }
      return mutationFn(variables)
    },
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
