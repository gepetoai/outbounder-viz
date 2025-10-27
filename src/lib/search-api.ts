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

export interface SavedSearch {
  id: number
  search_title: string
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
  candidate_location_city_expanded: string
  candidate_location_state: string
  candidate_location_radius: number
  candidate_experience_location: boolean
  number_of_min_connections: number
  industry_exclusions: string
  job_title_exclusions: string
  profile_keywords_exclusions: string
  company_exclusions: string
  total_addressable_market: number
  fk_job_description_id: number | null
  created_at: string
  updated_at: string
  candidates: unknown[]
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

export async function updateSearch(searchId: number, data: SearchRequest): Promise<SearchResponse> {
  const response = await fetch(`${API_BASE_URL}/job-description-searches/form-builder/update/${searchId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error(`Failed to update search: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function runSearch(searchId: number): Promise<SearchResponse> {
  const response = await fetch(`${API_BASE_URL}/job-description-searches/${searchId}/run-search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to run search: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function getSavedSearches(): Promise<SavedSearch[]> {
  const response = await fetch(`${API_BASE_URL}/job-description-searches/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch saved searches: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export function mapSavedSearchToParams(savedSearch: SavedSearch): SearchParams {
  // Extract city from location string
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
    deptYears: savedSearch.minimum_years_in_department,
    managementLevelExclusions: savedSearch.management_level,
    recency: savedSearch.job_titles_lookup_order,
    timeInRole: savedSearch.minimum_months_in_current_role,
    locationCity: locationCity,
    locationState: savedSearch.candidate_location_state,
    searchRadius: savedSearch.candidate_location_radius,
    includeWorkLocation: savedSearch.candidate_experience_location,
    industryExclusions: savedSearch.industry_exclusions ? savedSearch.industry_exclusions.split(',').map(i => i.trim()) : [],
    titleExclusions: savedSearch.job_title_exclusions,
    keywordExclusions: savedSearch.profile_keywords_exclusions,
    companyExclusions: savedSearch.company_exclusions,
    maxJobDuration: 5
  }
}
