'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchJson } from '@/lib/api-client'

// Types
export interface LinkedInAccount {
  id: number
  email: string
  first_name: string
  last_name: string
  profile_picture_url: string | null
  public_identifier: string
  is_premium: boolean
  sales_navigator_id: string | null
  recruiter_id: string | null
  agent_name: string | null
  unipile_account_id: string
  fk_organization_id: number
  created_at: string
  updated_at: string
}

export interface ConnectAccountResponse {
  url: string
}

// API functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

async function fetchLinkedInAccounts(): Promise<LinkedInAccount[]> {
  return fetchJson<LinkedInAccount[]>(`${API_BASE_URL}/linkedin-accounts/`, {
    method: 'GET',
  })
}

async function connectLinkedInAccount(): Promise<ConnectAccountResponse> {
  return fetchJson<ConnectAccountResponse>(`${API_BASE_URL}/linkedin-accounts/`, {
    method: 'POST',
  })
}

// React Query hooks
export function useLinkedInAccounts() {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['linkedInAccounts'],
    queryFn: fetchLinkedInAccounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: (query) => {
      // Check if we're in polling mode
      const pollingData = queryClient.getQueryData<{ initialCount: number; startedAt: number }>(['linkedInAccounts', 'polling'])
      
      if (pollingData && query.state.data) {
        const currentCount = query.state.data.length
        const elapsed = Date.now() - pollingData.startedAt
        const maxPollingTime = 5 * 60 * 1000 // 5 minutes

        // Stop polling if we have more accounts than before
        if (currentCount > pollingData.initialCount) {
          // Clear polling state
          queryClient.removeQueries({ queryKey: ['linkedInAccounts', 'polling'] })
          return false
        }

        // Stop polling if we've exceeded max time
        if (elapsed > maxPollingTime) {
          queryClient.removeQueries({ queryKey: ['linkedInAccounts', 'polling'] })
          return false
        }

        // Continue polling every 2 seconds
        return 2000
      }
      
      return false
    },
  })
}

export function useConnectLinkedInAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: connectLinkedInAccount,
    onSuccess: async (data) => {
      // Open the OAuth URL in a new window
      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer')
      }
      
      // Get the current account count before starting polling
      const currentData = queryClient.getQueryData<LinkedInAccount[]>(['linkedInAccounts'])
      const initialCount = currentData?.length ?? 0
      
      // Store the initial count in query client metadata so the hook can access it
      queryClient.setQueryData(['linkedInAccounts', 'polling'], {
        initialCount,
        startedAt: Date.now(),
      })
      
      // Invalidate to trigger a refetch and start polling
      queryClient.invalidateQueries({ queryKey: ['linkedInAccounts'] })
    },
    onError: (error) => {
      console.error('Failed to connect LinkedIn account:', error)
    },
  })
}

