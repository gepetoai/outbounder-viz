'use client'

import { useState } from 'react'
import { SearchForm } from './SearchForm'
import { SearchParams, ProspectProfile } from './types'

const defaultSearchParams: SearchParams = {
  // Education
  graduationYearFrom: 0,
  graduationYearTo: 0,
  
  // Location
  locationCity: '',
  locationState: '',
  searchRadius: 0,
  
  // Experience
  numExperiences: 0,
  maxExperience: 0,
  connections: 0,
  maxJobDuration: 0,
  deptYears: 0,
  timeInRole: 0,
  managementLevelExclusions: '',
  
  // Inclusions
  jobTitleInclusions: [],
  profileKeywords: [],
  
  // Exclusions
  titleExclusions: [],
  keywordExclusions: []
}

export function SearchView () {
  const [searchParams, setSearchParams] = useState<SearchParams>(defaultSearchParams)
  const [resultCount, setResultCount] = useState(0)
  const [stagingProfiles, setStagingProfiles] = useState<ProspectProfile[]>([])
  const [currentSearchId, setCurrentSearchId] = useState<number | null>(null)
  const [searchTitle, setSearchTitle] = useState('')
  const [isSearchModified, setIsSearchModified] = useState(false)
  const [contextId, setContextId] = useState<number | null>(1) // Mock context ID for demo

  const handleGoToResults = () => {
    console.log('Navigate to results view')
    // In a real app, this would navigate to a results page
  }

  return (
    <div className="w-full">
      <SearchForm
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        resultCount={resultCount}
        setResultCount={setResultCount}
        stagingProfiles={stagingProfiles}
        setStagingProfiles={setStagingProfiles}
        onGoToResults={handleGoToResults}
        contextId={contextId}
        currentSearchId={currentSearchId}
        setCurrentSearchId={setCurrentSearchId}
        searchTitle={searchTitle}
        setSearchTitle={setSearchTitle}
        isSearchModified={isSearchModified}
        setIsSearchModified={setIsSearchModified}
        searchType="prospects"
        contextLabel="Target Market"
      />
    </div>
  )
}
