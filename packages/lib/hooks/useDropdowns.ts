import { useQuery } from '@tanstack/react-query'
import { fetchJson } from '../api-client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export interface DepartmentsResponse {
  departments: string[]
}

export interface State {
  state_abbrev: string
  state_name: string
}

export type StatesResponse = State[]

export interface City {
  city: string
}

export type CitiesResponse = City[]

export interface IndustriesResponse {
  industries: string[]
}

// Departments hook
export function useDepartments() {
  return useQuery<DepartmentsResponse>({
    queryKey: ['departments'],
    queryFn: () => fetchJson<DepartmentsResponse>(`${API_BASE_URL}/job-description-searches/linkedin-terms/departments`),
  })
}

// States hook
export function useStates() {
  return useQuery<StatesResponse>({
    queryKey: ['states'],
    queryFn: () => fetchJson<StatesResponse>(`${API_BASE_URL}/job-description-searches-locations/location/states`),
  })
}

// Cities hook (depends on state)
export function useCities(stateAbbrev: string | undefined, statesData: StatesResponse | undefined) {
  // Find the full state name from the abbreviation
  const stateName = stateAbbrev ? statesData?.find(state => state.state_abbrev === stateAbbrev)?.state_name : undefined

  return useQuery<CitiesResponse>({
    queryKey: ['cities', stateName],
    queryFn: () => {
      if (!stateName) throw new Error('State name is required')
      return fetchJson<CitiesResponse>(`${API_BASE_URL}/job-description-searches-locations/location/cities/${stateName}`)
    },
    enabled: !!stateName,
  })
}

// Industries hook
export function useIndustries() {
  return useQuery<IndustriesResponse>({
    queryKey: ['industries'],
    queryFn: () => fetchJson<IndustriesResponse>(`${API_BASE_URL}/job-description-searches/linkedin-terms/industries`),
  })
}
