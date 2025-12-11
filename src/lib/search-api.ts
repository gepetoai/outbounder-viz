import { SearchParams } from '@/components/recruiter/SearchTab'
import { fetchWithAuth, fetchJson } from './api-client'

export interface SearchRequest {
  number_of_jobs: number
  graduation_year_from: number
  graduation_year_to: number
  maximum_years_of_experience: number
  use_experience_fallback: boolean
  department: string
  current_job_in_department: boolean
  minimum_years_in_department: number
  management_level: string
  job_titles: string
  job_titles_lookup_order: number
  minimum_months_in_current_role: number
  locations: Array<{
    city?: string
    state?: string
    radius?: number
    country?: string
  }>
  candidate_experience_location: boolean
  number_of_min_connections: number
  industry_exclusions: string
  job_title_exclusions: string
  profile_keywords_exclusions: string
  company_exclusions: string
  search_title: string
  maximum_years_of_experience_per_role: number
  fk_job_description_id?: number | null
  search_id?: number
  job_titles_inclusions: string
  profile_keywords_inclusions: string
  industry_inclusions: string
  language?: string
}

export interface SearchResponse {
  total_results: number
  total_results_from_search?: number
  search_id: number
  query_json: Record<string, unknown>
}

export interface SavedSearch {
  id: number
  search_title: string
  number_of_jobs: number
  graduation_year_from: number
  graduation_year_to: number
  maximum_years_of_experience: number
  use_experience_fallback: boolean
  department: string
  current_job_in_department: boolean
  minimum_years_in_department: number
  management_level: string
  job_titles: string
  job_titles_lookup_order: number
  minimum_months_in_current_role: number
  candidate_location_city: string
  candidate_location_city_expanded: string
  candidate_location_state: string
  candidate_location_radius: number
  locations?: Array<{
    city?: string
    state?: string
    radius?: number
    country?: string
  }>
  candidate_experience_location: boolean
  number_of_min_connections: number
  industry_exclusions: string
  job_title_exclusions: string
  profile_keywords_exclusions: string
  company_exclusions: string
  maximum_years_of_experience_per_role: number
  job_titles_inclusions?: string
  profile_keywords_inclusions?: string
  industry_inclusions?: string
  language?: string
  total_addressable_market: number
  fk_job_description_id: number | null
  created_at: string
  updated_at: string
  candidates: unknown[]
}

export interface EnrichedCandidateResponse {
  first_name: string
  last_name: string
  linkedin_shorthand_slug: string
  linkedin_canonical_slug: string | null
  company_name: string
  city: string
  state: string
  job_title: string
  raw_data: {
    picture_url?: string
    websites_linkedin?: string
    description?: string
    headline?: string
    generated_headline?: string
    skills?: string[]
    education?: Array<{
      title: string
      major: string | null
      institution_url?: string
      description?: string | null
      activities_and_societies?: string
      date_from: number
      date_to: number
    }>
    experience?: Array<{
      title: string
      company_name: string
      duration: string
      duration_months: number
      date_from: string
      date_to: string | null
      description: string
      location: string | null
      department: string | null
      management_level: string | null
    }>
    [key: string]: unknown
  }
  fk_job_description_search_id: number
  search_title?: string
  id: number
  created_at: string
  updated_at: string
}

export interface EnrichedCandidatesApiResponse {
  candidates: EnrichedCandidateResponse[]
  excluded_count: number
}

export interface CandidatesByJobDescriptionResponse {
  candidates: EnrichedCandidateResponse[]
  target_candidates_count: number
  current_candidates_count: number
}

export function mapSearchParamsToRequest(searchParams: SearchParams, searchTitle: string = 'Search', jobDescriptionId?: number | null): SearchRequest {
  return {
    number_of_jobs: searchParams.numExperiences ?? 0,
    graduation_year_from: searchParams.graduationYearFrom ?? 0,
    graduation_year_to: searchParams.graduationYearTo ?? 0,
    maximum_years_of_experience: searchParams.maxExperience ?? 0,
    use_experience_fallback: searchParams.useExperienceFallback || false,
    department: searchParams.department === 'none' ? '' : searchParams.department,
    current_job_in_department: searchParams.currentJobInDepartment ?? false,
    minimum_years_in_department: searchParams.deptYears ?? 0,
    management_level: searchParams.managementLevelExclusions,
    job_titles: searchParams.jobTitles.join(','),
    job_titles_lookup_order: searchParams.recency ?? 0,
    minimum_months_in_current_role: searchParams.timeInRole ?? 0,
    locations: searchParams.locations.map(loc => {
      if (loc.type === 'city') {
        return {
          city: loc.city,
          state: loc.state,
          radius: loc.radius
        }
      } else {
        return {
          country: loc.country
        }
      }
    }),
    candidate_experience_location: searchParams.includeWorkLocation,
    number_of_min_connections: searchParams.connections ?? 0,
    industry_exclusions: searchParams.industryExclusions.join(','),
    job_title_exclusions: searchParams.titleExclusions?.length > 0 ? searchParams.titleExclusions.join(',') : '',
    profile_keywords_exclusions: searchParams.keywordExclusions?.length > 0 ? searchParams.keywordExclusions.join(',') : '',
    company_exclusions: searchParams.companyExclusions,
    search_title: searchTitle,
    maximum_years_of_experience_per_role: searchParams.maxJobDuration ?? 0,
    fk_job_description_id: jobDescriptionId,
    job_titles_inclusions: searchParams.jobTitlesInclusions?.length > 0 ? searchParams.jobTitlesInclusions.join(',') : '',
    profile_keywords_inclusions: searchParams.profileKeywordsInclusions?.length > 0 ? searchParams.profileKeywordsInclusions.join(',') : '',
    industry_inclusions: searchParams.industryInclusions?.length > 0 ? searchParams.industryInclusions.join(',') : '',
    language: searchParams.language
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function createSearch(data: SearchRequest, tamOnly: boolean = false): Promise<SearchResponse> {
  const url = tamOnly
    ? `${API_BASE_URL}/job-description-searches/form-builder/create?tam_only=true`
    : `${API_BASE_URL}/job-description-searches/form-builder/create`

  return fetchJson<SearchResponse>(url, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function updateSearchName(searchId: number, searchTitle: string): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/job-description-searches/${searchId}/name`, {
    method: 'PATCH',
    body: JSON.stringify({ search_title: searchTitle })
  })

  if (!response.ok) {
    throw new Error(`Failed to update search name: ${response.status} ${response.statusText}`)
  }
}

export async function updateSearch(searchId: number, data: SearchRequest, tamOnly: boolean = false): Promise<SearchResponse> {
  const url = tamOnly
    ? `${API_BASE_URL}/job-description-searches/form-builder/update/${searchId}?tam_only=true`
    : `${API_BASE_URL}/job-description-searches/form-builder/update/${searchId}`

  return fetchJson<SearchResponse>(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export async function updateQuery(searchId: number, data: SearchRequest): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/job-description-searches/${searchId}/update-query`, {
    method: 'PUT',
    body: JSON.stringify({ ...data, id: searchId })
  })

  if (!response.ok) {
    throw new Error(`Failed to update query: ${response.status} ${response.statusText}`)
  }
}

export async function runSearch(searchId: number): Promise<SearchResponse> {
  return fetchJson<SearchResponse>(`${API_BASE_URL}/job-description-searches/${searchId}/run-search`, {
    method: 'POST'
  })
}

export async function getSavedSearchesByJobDescription(jobDescriptionId: number): Promise<SavedSearch[]> {
  return fetchJson<SavedSearch[]>(`${API_BASE_URL}/job-description-searches/${jobDescriptionId}/searches`, {
    method: 'GET'
  })
}

export function mapSavedSearchToParams(savedSearch: SavedSearch): SearchParams {
  let locations: Array<{
    type: 'city' | 'country'
    city?: string
    state?: string
    radius?: number
    country?: string
  }> = []

  // Check if new locations format exists in the saved search
  if (savedSearch.locations && savedSearch.locations.length > 0) {
    // Use the new locations array directly, adding type field
    locations = savedSearch.locations.map(loc => {
      if (loc.country) {
        return { type: 'country', country: loc.country }
      } else {
        return {
          type: 'city',
          city: loc.city,
          state: loc.state,
          radius: loc.radius
        }
      }
    })
  } else {
    // Fall back to old format for backward compatibility
    let locationCity = ''
    if (savedSearch.candidate_location_city) {
      // Try to match quoted format first: "City, State"
      const quotedMatch = savedSearch.candidate_location_city.match(/"([^"]+)"/)
      if (quotedMatch) {
        const cityState = quotedMatch[1].split(',')
        locationCity = cityState[0]?.trim() || ''
      } else {
        // Otherwise, use the value directly (simple string like "Chicago")
        locationCity = savedSearch.candidate_location_city.trim()
      }
    }

    if (locationCity && savedSearch.candidate_location_state) {
      locations.push({
        type: 'city',
        city: locationCity,
        state: savedSearch.candidate_location_state,
        radius: savedSearch.candidate_location_radius || 25
      })
    }
  }

  return {
    education: '',
    graduationYear: '',
    geography: '',
    radius: savedSearch.candidate_location_radius,
    jobTitles: savedSearch.job_titles ? savedSearch.job_titles.split(',').map(t => t.trim()) : [],
    skills: [],
    exclusions: {
      keywords: [],
      excludeCompanies: [],
      excludePeople: []
    },
    experienceLength: '',
    titleMatch: false,
    profilePhoto: false,
    connections: savedSearch.number_of_min_connections,
    numExperiences: savedSearch.number_of_jobs,
    graduationYearFrom: savedSearch.graduation_year_from,
    graduationYearTo: savedSearch.graduation_year_to,
    maxExperience: savedSearch.maximum_years_of_experience,
    department: savedSearch.department || 'none',
    currentJobInDepartment: savedSearch.current_job_in_department || false,
    deptYears: savedSearch.minimum_years_in_department,
    managementLevelExclusions: savedSearch.management_level,
    recency: savedSearch.job_titles_lookup_order,
    timeInRole: savedSearch.minimum_months_in_current_role,
    locations: locations,
    includeWorkLocation: savedSearch.candidate_experience_location,
    industryExclusions: savedSearch.industry_exclusions ? savedSearch.industry_exclusions.split(',') : [],
    titleExclusions: savedSearch.job_title_exclusions ? savedSearch.job_title_exclusions.split(',') : [],
    keywordExclusions: savedSearch.profile_keywords_exclusions ? savedSearch.profile_keywords_exclusions.split(',') : [],
    companyExclusions: savedSearch.company_exclusions,
    maxJobDuration: savedSearch.maximum_years_of_experience_per_role,
    useExperienceFallback: savedSearch.use_experience_fallback || false,
    // Inclusions
    jobTitlesInclusions: savedSearch.job_titles_inclusions ? savedSearch.job_titles_inclusions.split(',').map(t => t.trim()) : [],
    profileKeywordsInclusions: savedSearch.profile_keywords_inclusions ? savedSearch.profile_keywords_inclusions.split(',').map(k => k.trim()) : [],
    industryInclusions: savedSearch.industry_inclusions ? savedSearch.industry_inclusions.split(',').map(i => i.trim()) : [],
    // Language
    language: savedSearch.language
  }
}

export async function enrichCandidates(searchId: number, limit: number): Promise<EnrichedCandidatesApiResponse> {
  return fetchJson<EnrichedCandidatesApiResponse>(`${API_BASE_URL}/candidate-generation/job-description-searches/${searchId}/limit/${limit}`, {
    method: 'GET'
  })
}

export async function getCandidatesByJobDescription(jobDescriptionId: number): Promise<CandidatesByJobDescriptionResponse> {
  return fetchJson<CandidatesByJobDescriptionResponse>(`${API_BASE_URL}/candidate-generation/job-description/${jobDescriptionId}`, {
    method: 'GET'
  })
}

export async function getCandidatesForReview(
  jobDescriptionId: number,
  offset: number = 0,
  limit: number = 25,
  search?: string
): Promise<PaginatedCandidatesResponse<EnrichedCandidateResponse>> {
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  })
  if (search && search.trim()) {
    params.append('search', search.trim())
  }
  return fetchJson<PaginatedCandidatesResponse<EnrichedCandidateResponse>>(
    `${API_BASE_URL}/candidate-generation/job-description/${jobDescriptionId}/review?${params}`,
    {
      method: 'GET'
    }
  )
}

export interface ApproveRejectCandidateRequest {
  fk_job_description_id: number
  fk_candidate_id: number
}

export async function approveCandidate(data: ApproveRejectCandidateRequest): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/job-description-shortlisted-candidate/`, {
    method: 'POST',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error(`Failed to approve candidate: ${response.status} ${response.statusText}`)
  }
}

export async function rejectCandidate(data: ApproveRejectCandidateRequest): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/job-description-rejected-candidate/`, {
    method: 'POST',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error(`Failed to reject candidate: ${response.status} ${response.statusText}`)
  }
}

export interface ShortlistedCandidate {
  id: number
  fk_job_description_id: number
  fk_candidate_id: number
  created_at: string
  updated_at: string
  fk_candidate: EnrichedCandidateResponse
}

export interface RejectedCandidate {
  id: number
  fk_job_description_id: number
  fk_candidate_id: number
  created_at: string
  updated_at: string
  fk_candidate: EnrichedCandidateResponse
}

export interface PaginatedCandidatesResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export async function getShortlistedCandidates(
  jobDescriptionId: number,
  offset: number = 0,
  limit: number = 25,
  search?: string
): Promise<PaginatedCandidatesResponse<ShortlistedCandidate>> {
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  })
  if (search && search.trim()) {
    params.append('search', search.trim())
  }
  return fetchJson<PaginatedCandidatesResponse<ShortlistedCandidate>>(
    `${API_BASE_URL}/job-description-shortlisted-candidate/${jobDescriptionId}?${params}`,
    {
      method: 'GET'
    }
  )
}

export async function getRejectedCandidates(
  jobDescriptionId: number,
  offset: number = 0,
  limit: number = 25,
  search?: string
): Promise<PaginatedCandidatesResponse<RejectedCandidate>> {
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  })
  if (search && search.trim()) {
    params.append('search', search.trim())
  }
  return fetchJson<PaginatedCandidatesResponse<RejectedCandidate>>(
    `${API_BASE_URL}/job-description-rejected-candidate/${jobDescriptionId}?${params}`,
    {
      method: 'GET'
    }
  )
}

export interface MoveCandidatesRequest {
  target_job_description_id: number
  candidate_ids: number[]
}

export interface MoveCandidatesResponse {
  moved_candidates_count: number
  target_job_description_id: number
}

export async function moveCandidates(data: MoveCandidatesRequest): Promise<MoveCandidatesResponse> {
  return fetchJson<MoveCandidatesResponse>(`${API_BASE_URL}/job-description-searches/move-candidates`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export interface BulkCandidateRequest {
  fk_job_description_id: number
  fk_candidate_ids: number[]
}

export async function approveCandidateFromRejected(data: BulkCandidateRequest): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/job-description-shortlisted-candidate/from-rejected`, {
    method: 'POST',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error(`Failed to approve candidate from rejected: ${response.status} ${response.statusText}`)
  }
}

export async function rejectCandidateFromShortlisted(data: BulkCandidateRequest): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/job-description-rejected-candidate/from-shortlisted`, {
    method: 'POST',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error(`Failed to reject candidate from shortlisted: ${response.status} ${response.statusText}`)
  }
}

export async function bulkDeleteShortlistedCandidates(data: BulkCandidateRequest): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/job-description-shortlisted-candidate/bulk`, {
    method: 'DELETE',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error(`Failed to send shortlisted candidates to review: ${response.status} ${response.statusText}`)
  }
}

export async function bulkDeleteRejectedCandidates(data: BulkCandidateRequest): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/job-description-rejected-candidate/bulk`, {
    method: 'DELETE',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error(`Failed to send rejected candidates to review: ${response.status} ${response.statusText}`)
  }
}

export type CandidateStatus = 'review' | 'shortlisted' | 'rejected'

/**
 * Download candidates CSV for a job description based on status
 * @param jobDescriptionId - ID of the job description
 * @param candidateStatus - Status of candidates ('review', 'shortlisted', or 'rejected')
 * @returns Promise that resolves to a Blob containing the CSV data
 */
export async function downloadCandidatesCSV(
  jobDescriptionId: number,
  candidateStatus: CandidateStatus
): Promise<Blob> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/candidate-generation/job-description/${jobDescriptionId}/${candidateStatus}/csv`,
    {
      method: 'GET'
    }
  )

  if (!response.ok) {
    let errorDetail: string | undefined
    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const errorBody = await response.json()
        errorDetail = errorBody.detail || errorBody.message || errorBody.error
      }
    } catch {
      // If parsing fails, ignore and use default error message
    }

    const errorMessage = errorDetail
      ? `Failed to download CSV: ${response.status} ${response.statusText} - ${errorDetail}`
      : `Failed to download CSV: ${response.status} ${response.statusText}`

    throw new Error(errorMessage)
  }

  return response.blob()
}

export interface CampaignPayload {
  name: string
  status: 'draft' | 'paused' | 'running'
  fk_linkedin_account_id: number
  fk_job_description_id: number
  daily_volume: number
  min_gap_between_scheduling: number
  max_gap_between_scheduling: number
  timezone?: string
  campaign_sending_windows: Array<{
    window_start_time: string
    window_end_time: string
  }>
  action_definitions: Array<{
    id: number
    action_type: string | null
    condition_type?: string | null
    next_step_if_true?: number | null
    next_step_if_false?: number | null
    delay_value: number
    delay_unit: string
    json_metadata?: Record<string, unknown> | null
  }>
}

export interface CampaignResponse {
  id: number
  name: string
  status: string
  fk_linkedin_account_id: number
  fk_job_description_id: number
  daily_volume: number
  min_gap_between_scheduling: number
  max_gap_between_scheduling: number
  created_at: string
  updated_at: string
}

export async function createCampaign(data: CampaignPayload): Promise<CampaignWithDetails> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  return fetchJson<CampaignWithDetails>(`${API_BASE_URL}/campaigns/`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function startCampaign(campaignId: number): Promise<CampaignResponse> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  return fetchJson<CampaignResponse>(`${API_BASE_URL}/campaigns/${campaignId}/start`, {
    method: 'POST'
  })
}

export async function pauseCampaign(campaignId: number): Promise<CampaignResponse> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  return fetchJson<CampaignResponse>(`${API_BASE_URL}/campaigns/${campaignId}/pause`, {
    method: 'POST'
  })
}

export async function resumeCampaign(campaignId: number): Promise<CampaignResponse> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  return fetchJson<CampaignResponse>(`${API_BASE_URL}/campaigns/${campaignId}/resume`, {
    method: 'PATCH'
  })
}

export async function updateCampaign(campaignId: number, data: CampaignPayload): Promise<CampaignWithDetails> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  return fetchJson<CampaignWithDetails>(`${API_BASE_URL}/campaigns/${campaignId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export interface CampaignWithDetails extends CampaignResponse {
  timezone?: string
  campaign_sending_windows: Array<{
    window_start_time: string
    window_end_time: string
    fk_campaign_id: number
    id: number
    created_at: string
    updated_at: string
  }>
  action_definitions: Array<{
    action_type: string | null
    condition_type: string | null
    delay_value: number
    delay_unit: string
    json_metadata: Record<string, unknown> | null
    fk_campaign_id: number
    fk_parent_step_id: number | null
    next_step_if_true: number | null
    next_step_if_false: number | null
    id: number
    created_at: string
    updated_at: string
    custom_message?: {
      message: string
      subject: string
      id: number
      instruction_id: number
      created_at: string
      action_type: string
      campaign_action_definition_id: number
    }
  }>
}

export async function getCampaignByJobDescription(jobDescriptionId: number): Promise<CampaignWithDetails | null> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/campaigns/job_descriptions/${jobDescriptionId}`, {
      method: 'GET'
    })
    
    if (response.status === 404) {
      return null
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch campaign: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null
    }
    throw error
  }
}

export async function deleteCampaign(campaignId: number): Promise<void> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  return fetchJson<void>(`${API_BASE_URL}/campaigns/${campaignId}`, {
    method: 'DELETE'
  })
}
