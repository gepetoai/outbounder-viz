import { useApiMutation } from './use-api'
import axiosInstance from '@/lib/axios'

interface JobDescriptionRequest {
  title: string
  url: string
  raw_text: null
  fk_organization_id: number
}

interface JobDescriptionResponse {
  title: string
  url: string
  raw_text: string
  fk_organization_id: number
  id: number
  created_at: string
  updated_at: string
  organization: null
}

export function useJobDescription() {
  return useApiMutation<JobDescriptionResponse, JobDescriptionRequest>(
    async (data) => {
      const response = await axiosInstance.post('/job-description/', data)
      return response.data
    },
    {
      requireAuth: true
    }
  )
}
