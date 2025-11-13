export interface SearchParams {
  // Education
  graduationYearFrom: number
  graduationYearTo: number
  
  // Location
  locationCity: string
  locationState: string
  searchRadius: number
  includeWorkLocation: boolean
  
  // Experience
  numExperiences: number
  maxExperience: number
  connections: number
  maxJobDuration: number
  deptYears: number
  timeInRole: number
  department: string
  managementLevelExclusions: string
  recency: number
  
  // Legacy fields (for backwards compatibility)
  education: string
  graduationYear: string
  geography: string
  radius: number
  jobTitles: string[]
  skills: string[]
  exclusions: {
    keywords: string[]
    excludeCompanies: string[]
    excludePeople: string[]
  }
  experienceLength: string
  titleMatch: boolean
  profilePhoto: boolean
  
  // Inclusions
  industryInclusions: string[]
  jobTitleInclusions: string[]
  profileKeywords: string[]
  
  // Exclusions
  industryExclusions: string[]
  titleExclusions: string[]
  keywordExclusions: string[]
  companyExclusions: string
}

export interface ProspectProfile {
  id: string
  name: string
  photo: string
  title: string
  company: string
  location: string
  education: string
  experience: Array<{
    title: string
    company: string
    duration: string
  }>
  linkedinUrl: string
  summary: string
}

export interface SearchFormProps {
  searchParams: SearchParams
  setSearchParams: (params: SearchParams) => void
  resultCount: number
  setResultCount: (count: number) => void
  stagingProfiles: ProspectProfile[]
  setStagingProfiles: (profiles: ProspectProfile[]) => void
  onGoToResults: () => void
  contextId?: number | null
  currentSearchId: number | null
  setCurrentSearchId: (id: number | null) => void
  searchTitle: string
  setSearchTitle: (title: string) => void
  isSearchModified: boolean
  setIsSearchModified: (modified: boolean) => void
  searchType?: 'candidates' | 'prospects'
  contextLabel?: string
}

