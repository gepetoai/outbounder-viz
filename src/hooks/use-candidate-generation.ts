import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'

export interface JobDescriptionChecklistItem {
  id: number
  content: string
  is_qualifier: boolean
  fk_job_description_id: number
  created_at: string
  updated_at: string
}

export interface CandidateChecklistItemStatus {
  status: boolean
  reasoning: string
  fk_job_description_checklist_item_id: number
  fk_candidate_id: number
  id: number
  created_at: string
  updated_at: string
}

export interface Candidate {
  first_name: string
  last_name: string
  linkedin_shorthand_slug: string
  linkedin_canonical_slug: string
  company_name: string
  city: string
  state: string
  job_title: string
  fk_job_description_query_id: number
  id: number
  created_at: string
  updated_at: string
  job_description_query: null
  candidate_checklist_item_statuses: CandidateChecklistItemStatus[]
}

export interface CandidateGenerationResponse {
  candidates: Candidate[]
  checklist_items: JobDescriptionChecklistItem[]
}

export function useCandidateGeneration(jobDescriptionId: number | null) {
  return useQuery({
    queryKey: ['candidate-generation', jobDescriptionId],
    queryFn: async (): Promise<CandidateGenerationResponse> => {
      if (!jobDescriptionId) {
        throw new Error('Job description ID is required')
      }
      const response = await axiosInstance.get(`/candidate-generation/job-description/${jobDescriptionId}`)
      return response.data
    },
    enabled: !!jobDescriptionId,
  })
}
