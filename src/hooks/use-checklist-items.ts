import { useApiQuery, useApiMutation } from './use-api'
import axiosInstance from '@/lib/axios'

export interface ChecklistItem {
  content: string
  is_qualifier: boolean
  fk_job_description_id: number
  id: number
  created_at: string
  updated_at: string
  originalContent?: string
}

interface ChecklistItemRequest {
  content: string
  is_qualifier: boolean
  fk_job_description_id: number
  is_new: boolean
  is_updated: boolean
}

interface JobDescriptionChecklistRequest {
  checklist_items: ChecklistItemRequest[]
  organization_id: number
  field_titles: string
  file_data: string
}

export function useChecklistItems(jobDescriptionId: number | null) {
  return useApiQuery<ChecklistItem[]>(
    ['checklist-items', jobDescriptionId?.toString() || ''],
    `/job-description-checklist-item/job-description/${jobDescriptionId}`,
    {
      enabled: !!jobDescriptionId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      requireAuth: true
    }
  )
}

export function useCreateChecklistItems() {
  return useApiMutation(
    async (data: JobDescriptionChecklistRequest) => {
      const response = await axiosInstance.post('/job-description-checklist-item/', data)
      return response.data
    },
    {
      requireAuth: true
    }
  )
}
