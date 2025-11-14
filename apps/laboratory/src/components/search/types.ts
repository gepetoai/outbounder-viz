export interface SearchParams {
  // Education
  graduationYearFrom: number
  graduationYearTo: number
  
  // Location
  locationCity: string
  locationState: string
  searchRadius: number
  
  // Experience
  numExperiences: number
  maxExperience: number
  connections: number
  maxJobDuration: number
  deptYears: number
  timeInRole: number
  managementLevelExclusions: string
  
  // Inclusions
  jobTitleInclusions: string[]
  profileKeywords: string[]
  
  // Exclusions
  titleExclusions: string[]
  keywordExclusions: string[]
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


