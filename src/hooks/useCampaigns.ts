'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { startCampaign, pauseCampaign, resumeCampaign, createCampaign, updateCampaign, deleteCampaign, CampaignResponse, CampaignWithDetails, CampaignPayload } from '@/lib/search-api'
import { ApiError, fetchJson } from '@/lib/api-client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// LinkedIn profile raw data structure
export interface LinkedInRawData {
  picture_url?: string
  headline?: string
  education?: Array<{
    school_name?: string
    degree?: string
    field_of_study?: string
    start_date?: string
    end_date?: string
  }>
  experience?: Array<{
    title?: string
    company_name?: string
    duration?: string
    start_date?: string
    end_date?: string
    description?: string
  }>
  [key: string]: unknown // Allow additional fields
}

// Types based on CUSTOM_MESSAGES_API.md
export interface CampaignCandidateWithDetails {
  id: number // campaign_candidate_id
  campaign_id: number
  campaign_name: string
  status: 'pending' | 'in_progress' | 'completed'
  connected_at: string | null
  candidate: {
    id: number
    first_name: string
    last_name: string
    linkedin_shorthand_slug: string
    linkedin_canonical_slug: string
    company_name: string
    city: string
    state: string
    job_title: string
    raw_data: LinkedInRawData
    fk_job_description_search_id: number
    created_at: string
    updated_at: string
  }
  created_at: string
  updated_at: string
}

// API functions
async function fetchCampaignCandidates(campaignId: number): Promise<CampaignCandidateWithDetails[]> {
  return fetchJson<CampaignCandidateWithDetails[]>(`${API_BASE_URL}/campaigns/${campaignId}/candidates`, {
    method: 'GET',
  })
}

// React Query hooks
export function useCampaignCandidates(campaignId: number | null) {
  return useQuery({
    queryKey: ['campaignCandidates', campaignId],
    queryFn: () => fetchCampaignCandidates(campaignId!),
    enabled: !!campaignId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useStartCampaign() {
  const queryClient = useQueryClient()

  return useMutation<CampaignResponse, ApiError, number>({
    mutationFn: startCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] })
    },
  })
}

export function usePauseCampaign() {
  const queryClient = useQueryClient()

  return useMutation<CampaignResponse, ApiError, number>({
    mutationFn: pauseCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] })
    },
  })
}

export function useResumeCampaign() {
  const queryClient = useQueryClient()

  return useMutation<CampaignResponse, ApiError, number>({
    mutationFn: resumeCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] })
    },
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()

  return useMutation<CampaignWithDetails, ApiError, CampaignPayload>({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] })
    },
  })
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient()

  return useMutation<CampaignWithDetails, ApiError, { campaignId: number; data: CampaignPayload }>({
    mutationFn: ({ campaignId, data }) => updateCampaign(campaignId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] })
    },
  })
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, number>({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] })
    },
  })
}
