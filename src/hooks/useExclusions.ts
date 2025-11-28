'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchJson, ApiError } from '@/lib/api-client'

// Types
export interface ExclusionCandidate {
  id: number
  first_name: string
  last_name: string
}

export interface ExclusionCandidatesResponse {
  candidates: ExclusionCandidate[]
  total_count: number
}

// API functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8096/api/v1'

async function fetchExclusions(offset: number = 0, limit: number = 10): Promise<ExclusionCandidatesResponse> {
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  })
  return fetchJson<ExclusionCandidatesResponse>(`${API_BASE_URL}/exclusion-list/candidates?${params}`, {
    method: 'GET',
  })
}

async function uploadExclusionsCSV(file: File): Promise<ExclusionCandidatesResponse> {
  // Read file and encode as base64
  const fileData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result) {
        // Convert ArrayBuffer to base64
        const base64 = btoa(
          new Uint8Array(reader.result as ArrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        )
        resolve(base64)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsArrayBuffer(file)
  })

  return fetchJson<ExclusionCandidatesResponse>(`${API_BASE_URL}/exclusion-list/`, {
    method: 'POST',
    body: JSON.stringify({
      field_titles: 'first_name, last_name',
      file_data: fileData,
    }),
  })
}

// React Query hooks
export function useExclusions(offset: number = 0, limit: number = 10) {
  return useQuery({
    queryKey: ['exclusions', offset, limit],
    queryFn: () => fetchExclusions(offset, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUploadExclusionsCSV() {
  const queryClient = useQueryClient()

  return useMutation<ExclusionCandidatesResponse, ApiError, File>({
    mutationFn: uploadExclusionsCSV,
    onSuccess: () => {
      // Invalidate and refetch exclusions after successful upload
      queryClient.invalidateQueries({ queryKey: ['exclusions'] })
    },
    onError: (error) => {
      console.error('Failed to upload exclusions CSV:', error)
    },
  })
}

