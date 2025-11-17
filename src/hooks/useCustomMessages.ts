'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { fetchJson } from '@/lib/api-client'
import { type LinkedInRawData } from './useCampaigns'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// Types based on CUSTOM_MESSAGES_API.md
export interface CustomMessageGeneratorContext {
  first_name?: string
  last_name?: string
  headline?: string
  current_job?: string
  company?: string
  location?: string
  industry?: string
  experience_years?: string
  education?: string
  skills?: string
}

export interface CustomMessagesGenerationCreate {
  message_type?: string // Optional, defaults to "initial_message"
  user_instructions: string
  campaign_candidate_id: number
  context_variables: Record<string, boolean> // Variables to include (true = include, false = exclude)
}

export interface CustomMessagesGeneration {
  id: number
  user_instructions: string
  context_data: CustomMessageGeneratorContext
  campaign_id: number
  campaign_candidate_id: number
  generated_message: string
  action_type?: string
}

export interface CustomMessageCandidate {
  id: number
  fk_custom_messages_instruction_id: number
  fk_campaign_candidate_id: number
  generated_message: string
  created_at: string
  updated_at: string
  action_type?: string
}

export interface CampaignCandidateWithCustomMessage {
  id: number
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
  latest_custom_message: string | null
  custom_message_id: number | null
  custom_message_instruction_id: number | null
  custom_message_created_at: string | null
  action_type?: string
}

export interface InstructionsFeedbackItemCreate {
  content: string
}

export interface AddInstructionsFeedbackRequest {
  custom_messages_candidate_id: number
  feedbacks: InstructionsFeedbackItemCreate[]
}

export interface CustomMessageUpdate {
  id: number
  fk_custom_messages_instruction_id: number
  fk_campaign_candidate_id: number
  generated_message: string
}

// API functions
async function generateCustomMessage(
  data: CustomMessagesGenerationCreate
): Promise<CustomMessagesGeneration> {
  return fetchJson<CustomMessagesGeneration>(`${API_BASE_URL}/custom-messages-generation/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

async function fetchCustomMessagesByCampaign(
  campaignId: number
): Promise<CustomMessageCandidate[]> {
  return fetchJson<CustomMessageCandidate[]>(
    `${API_BASE_URL}/custom-messages-generation/campaign/${campaignId}/custom-messages`,
    {
      method: 'GET',
    }
  )
}

async function addFeedbackAndRegenerate(
  data: AddInstructionsFeedbackRequest
): Promise<CustomMessagesGeneration> {
  return fetchJson<CustomMessagesGeneration>(`${API_BASE_URL}/custom-messages-generation/feedback`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

async function fetchCandidatesWithMessages(
  campaignId: number
): Promise<CampaignCandidateWithCustomMessage[]> {
  return fetchJson<CampaignCandidateWithCustomMessage[]>(
    `${API_BASE_URL}/custom-messages-generation/campaign/${campaignId}/candidates-with-messages`,
    {
      method: 'GET',
    }
  )
}

async function updateCustomMessage(
  customMessageId: number,
  data: CustomMessageUpdate
): Promise<CustomMessageCandidate> {
  return fetchJson<CustomMessageCandidate>(
    `${API_BASE_URL}/custom-messages-generation/${customMessageId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  )
}

// React Query hooks
export function useGenerateCustomMessage() {
  return useMutation({
    mutationFn: generateCustomMessage,
    onError: (error) => {
      console.error('Failed to generate custom message:', error)
    },
  })
}

export function useCustomMessagesByCampaign(campaignId: number | null) {
  return useQuery({
    queryKey: ['customMessages', campaignId],
    queryFn: () => fetchCustomMessagesByCampaign(campaignId!),
    enabled: !!campaignId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAddFeedbackAndRegenerate() {
  return useMutation({
    mutationFn: addFeedbackAndRegenerate,
    onError: (error) => {
      console.error('Failed to regenerate message with feedback:', error)
    },
  })
}

export function useCandidatesWithMessages(campaignId: number | null) {
  return useQuery({
    queryKey: ['candidatesWithMessages', campaignId],
    queryFn: () => fetchCandidatesWithMessages(campaignId!),
    enabled: !!campaignId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateCustomMessage() {
  return useMutation({
    mutationFn: ({ customMessageId, data }: { customMessageId: number; data: CustomMessageUpdate }) =>
      updateCustomMessage(customMessageId, data),
    onError: (error) => {
      console.error('Failed to update custom message:', error)
    },
  })
}
