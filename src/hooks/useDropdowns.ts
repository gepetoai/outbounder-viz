import { useQuery } from '@tanstack/react-query'

const API_BASE_URL = 'http://localhost:8096/api/v1' // Using your port 8096

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
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/job-description-searches/linkedin-terms/departments`)
      if (!response.ok) {
        throw new Error(`Failed to fetch departments: ${response.status} ${response.statusText}`)
      }
      return response.json()
    },
  })
}

// States hook
export function useStates() {
  return useQuery<StatesResponse>({
    queryKey: ['states'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/job-description-searches-locations/location/states`)
      if (!response.ok) {
        throw new Error(`Failed to fetch states: ${response.status} ${response.statusText}`)
      }
      return response.json()
    },
  })
}

// Cities hook (depends on state)
export function useCities(stateAbbrev: string | undefined, statesData: StatesResponse | undefined) {
  // Find the full state name from the abbreviation
  const stateName = stateAbbrev ? statesData?.find(state => state.state_abbrev === stateAbbrev)?.state_name : undefined
  
  return useQuery<CitiesResponse>({
    queryKey: ['cities', stateName],
    queryFn: async () => {
      if (!stateName) throw new Error('State name is required')
      const response = await fetch(`${API_BASE_URL}/job-description-searches-locations/location/cities/${stateName}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch cities: ${response.status} ${response.statusText}`)
      }
      return response.json()
    },
    enabled: !!stateName,
  })
}

// Industries hook
export function useIndustries() {
  return useQuery<IndustriesResponse>({
    queryKey: ['industries'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/job-description-searches/linkedin-terms/industries`)
      if (!response.ok) {
        throw new Error(`Failed to fetch industries: ${response.status} ${response.statusText}`)
      }
      return response.json()
    },
  })
}
