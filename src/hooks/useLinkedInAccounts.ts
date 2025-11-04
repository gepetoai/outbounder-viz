'use client'

import { useQuery } from '@tanstack/react-query'
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

// API functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

async function fetchLinkedInAccounts(): Promise<LinkedInAccount[]> {
  return fetchJson<LinkedInAccount[]>(`${API_BASE_URL}/linkedin-accounts/`, {
    method: 'GET',
  })
}

// React Query hook
export function useLinkedInAccounts() {
  return useQuery({
    queryKey: ['linkedInAccounts'],
    queryFn: fetchLinkedInAccounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

