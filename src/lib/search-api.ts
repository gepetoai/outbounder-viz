import { SearchParams } from '@/components/recruiter/SearchTab'

export interface SearchRequest {
  number_of_jobs: number
  graduation_year_from: number
  graduation_year_to: number
  maximum_years_of_experience: number
  use_experience_fallback: boolean
  department: string
  minimum_years_in_department: number
  management_level: string
  job_titles: string
  job_titles_lookup_order: number
  minimum_months_in_current_role: number
  candidate_location_city: string
  candidate_location_state: string
  candidate_location_radius: number
  candidate_experience_location: boolean
  number_of_min_connections: number
  industry_exclusions: string
  job_title_exclusions: string
  profile_keywords_exclusions: string
  company_exclusions: string
  search_title: string
}

export interface SearchResponse {
  total_results: number
  search_id: number
  query_json: Record<string, unknown>
}

export function mapSearchParamsToRequest(searchParams: SearchParams, searchTitle: string = 'Search'): SearchRequest {
  return {
    number_of_jobs: searchParams.numExperiences,
    graduation_year_from: searchParams.graduationYearFrom,
    graduation_year_to: searchParams.graduationYearTo,
    maximum_years_of_experience: searchParams.maxExperience,
    use_experience_fallback: true,
    department: searchParams.department === 'none' ? '' : searchParams.department,
    minimum_years_in_department: searchParams.deptYears,
    management_level: searchParams.managementLevelExclusions,
    job_titles: searchParams.jobTitles.join(','),
    job_titles_lookup_order: searchParams.recency,
    minimum_months_in_current_role: searchParams.timeInRole,
    candidate_location_city: searchParams.locationCity,
    candidate_location_state: searchParams.locationState,
    candidate_location_radius: searchParams.searchRadius,
    candidate_experience_location: searchParams.includeWorkLocation,
    number_of_min_connections: searchParams.connections,
    industry_exclusions: searchParams.industryExclusions.join(','),
    job_title_exclusions: searchParams.titleExclusions,
    profile_keywords_exclusions: searchParams.keywordExclusions,
    company_exclusions: searchParams.companyExclusions,
    search_title: searchTitle
  }
}

const API_BASE_URL = 'http://localhost:8096/api/v1'

export async function createSearch(data: SearchRequest): Promise<SearchResponse> {
  const response = await fetch(`${API_BASE_URL}/job-description-searches/form-builder/create/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error(`Failed to create search: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function updateSearchName(searchId: number, searchTitle: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/job-description-searches/${searchId}/name`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ search_title: searchTitle })
  })

  if (!response.ok) {
    throw new Error(`Failed to update search name: ${response.status} ${response.statusText}`)
  }
}
