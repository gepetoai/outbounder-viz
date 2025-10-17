import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'

interface ChecklistItem {
  content: string
  is_qualifier: boolean
  fk_job_description_id: number
  id: number
  created_at: string
  updated_at: string
  job_description: null
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
