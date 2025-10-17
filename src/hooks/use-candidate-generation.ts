import { useApiQuery } from './use-api'

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
  return useApiQuery<CandidateGenerationResponse>(
    ['candidate-generation', jobDescriptionId?.toString() || ''],
    `/candidate-generation/job-description/${jobDescriptionId}/limit/20`,
    {
      enabled: !!jobDescriptionId,
      requireAuth: true
    }
  )
}
