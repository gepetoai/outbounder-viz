import { useQuery, useMutation } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'

export interface ChecklistItem {
  content: string
  is_qualifier: boolean
  fk_job_description_id: number
  id: number
  created_at: string
  updated_at: string
}

interface ChecklistItemRequest {
  content: string
  is_qualifier: boolean
  fk_job_description_id: number
}

interface JobDescriptionChecklistRequest {
  checklist_items: ChecklistItemRequest[]
  organization_id: number
  field_titles: string
  file_data: string
}

export function useChecklistItems(jobDescriptionId: number | null) {
  return useQuery<ChecklistItem[], Error>({
    queryKey: ['checklist-items', jobDescriptionId],
    queryFn: async () => {
      if (!jobDescriptionId) {
        throw new Error('Job description ID is required')
      }
      const response = await axiosInstance.get(`/job-description-checklist-item/job-description/${jobDescriptionId}`)
      return response.data
    },
    enabled: !!jobDescriptionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCreateChecklistItems() {
  return useMutation({
    mutationFn: async (data: JobDescriptionChecklistRequest) => {
      const response = await axiosInstance.post('/job-description-checklist-item/', data)
      return response.data
    },
  })
}
