'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { User, Briefcase, MapPin, GraduationCap, X, Search, Target, Code, Upload, RefreshCw, Send, Save, Sparkles } from 'lucide-react'
import { useDepartments, useStates, useCities, useIndustries } from '@/hooks/useDropdowns'
import { useCreateSearch, useUpdateSearchName, useUpdateSearch, useRunSearch, useSavedSearches, useEnrichCandidates } from '@/hooks/useSearch'
import { mapSearchParamsToRequest, mapSavedSearchToParams, SearchResponse, EnrichedCandidateResponse, EnrichedCandidatesApiResponse } from '@/lib/search-api'

export interface SearchParams {
  // Original fields
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
  connections: number
  
  // New fields from UnifiedSearchForm
  numExperiences: number
  graduationYearFrom: number
  graduationYearTo: number
  maxExperience: number
  department: string
  deptYears: number
  managementLevelExclusions: string
  recency: number
  timeInRole: number
  locationCity: string
  locationState: string
  searchRadius: number
  includeWorkLocation: boolean
  industryExclusions: string[]
  titleExclusions: string
  keywordExclusions: string
  companyExclusions: string
  maxJobDuration: number
}

export interface Candidate {
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

interface SearchTabProps {
  searchParams: SearchParams
  setSearchParams: (params: SearchParams) => void
  candidateYield: number
  setCandidateYield: (candidateYield: number) => void
  stagingCandidates: Candidate[]
  setStagingCandidates: (candidates: Candidate[]) => void
  approvedCandidates: string[]
  setApprovedCandidates: (candidates: string[]) => void
  rejectedCandidates: string[]
  setRejectedCandidates: (candidates: string[]) => void
  reviewCandidates: Candidate[]
  setReviewCandidates: (candidates: Candidate[]) => void
  onGoToCandidates: () => void
}

export function SearchTab({
  searchParams,
  setSearchParams,
  candidateYield,
  setCandidateYield,
  stagingCandidates,
  setStagingCandidates,
  approvedCandidates,
  setApprovedCandidates,
  rejectedCandidates,
  setRejectedCandidates,
  reviewCandidates,
  setReviewCandidates,
  onGoToCandidates
}: SearchTabProps) {
  const [tempJobTitleInput, setTempJobTitleInput] = useState('')
  const [tempSkillInput, setTempSkillInput] = useState('')
  const [tempExclusionInput, setTempExclusionInput] = useState('')
  const [inputError, setInputError] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [searchTitle, setSearchTitle] = useState('')
  const [currentSearchId, setCurrentSearchId] = useState<number | null>(null)
  const [selectedSavedSearchId, setSelectedSavedSearchId] = useState<string>('')
  const [isSearchModified, setIsSearchModified] = useState(false)
  const [pendingLocationCity, setPendingLocationCity] = useState<string>('')
  const [enrichLimit, setEnrichLimit] = useState<number>(10)

  // Dropdown data hooks
  const { data: departmentsData, isLoading: isLoadingDepartments } = useDepartments()
  const { data: statesData, isLoading: isLoadingStates } = useStates()
  const { data: citiesData, isLoading: isLoadingCities } = useCities(searchParams.locationState, statesData)
  const { data: industriesData, isLoading: isLoadingIndustries } = useIndustries()

  // Search functionality
  const createSearch = useCreateSearch()
  const updateSearchName = useUpdateSearchName()
  const updateSearchMutation = useUpdateSearch()
  const runSearchMutation = useRunSearch()
  const enrichCandidatesMutation = useEnrichCandidates()
  const { data: savedSearches, isLoading: isLoadingSavedSearches } = useSavedSearches()

  // Track if searchParams has been loaded (to avoid marking as modified on initial load)
  const isInitialLoad = useRef(true)
  const isLoadingSavedSearch = useRef(false)
  const skipNextModificationCheck = useRef(0) // Count of checks to skip

  // Track when search params change after loading a saved search
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return
    }

    // Don't mark as modified if we're currently loading a saved search
    if (isLoadingSavedSearch.current || skipNextModificationCheck.current > 0) {
      console.log('[ModificationCheck] Skipping - currently loading saved search', {
        isLoadingSavedSearch: isLoadingSavedSearch.current,
        skipCount: skipNextModificationCheck.current
      })
      if (skipNextModificationCheck.current > 0) {
        skipNextModificationCheck.current--
      }
      return
    }

    // Only mark as modified if we have a saved search loaded AND params changed
    if (selectedSavedSearchId && currentSearchId) {
      console.log('[ModificationCheck] Marking search as modified', {
        selectedSavedSearchId,
        currentSearchId
      })
      setIsSearchModified(true)
    }
  }, [searchParams, selectedSavedSearchId, currentSearchId])

  // Set city when cities data loads and we have a pending city
  useEffect(() => {
    if (pendingLocationCity && citiesData && citiesData.length > 0) {
      const cityExists = citiesData.find(c => c.city === pendingLocationCity)
      if (cityExists) {
        console.log('[CityLoad] Setting pending city:', pendingLocationCity)
        // This will trigger one more modification check, so skip it
        skipNextModificationCheck.current++
        setSearchParams({ ...searchParams, locationCity: pendingLocationCity })
      }
      setPendingLocationCity('')
      isLoadingSavedSearch.current = false
      console.log('[CityLoad] Loading complete')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citiesData, pendingLocationCity])

  const isValidLinkedInUrl = (url: string): boolean => {
    return url.includes('linkedin.com/company/') || url.includes('linkedin.com/in/')
  }

  const validateAndProcessUrls = (urls: string[]): { valid: string[], invalid: string[] } => {
    const valid: string[] = []
    const invalid: string[] = []
    
    urls.forEach(url => {
      if (isValidLinkedInUrl(url)) {
        valid.push(url)
      } else {
        invalid.push(url)
      }
    })
    
    return { valid, invalid }
  }

  const addJobTitle = () => {
    if (tempJobTitleInput.trim()) {
      setSearchParams({
        ...searchParams,
        jobTitles: [...searchParams.jobTitles, tempJobTitleInput.trim()]
      })
      setTempJobTitleInput('')
    }
  }

  const removeJobTitle = (index: number) => {
    const newTitles = searchParams.jobTitles.filter((_, i) => i !== index)
    setSearchParams({ ...searchParams, jobTitles: newTitles })
  }

  const addSkill = () => {
    if (tempSkillInput.trim()) {
      setSearchParams({
        ...searchParams,
        skills: [...searchParams.skills, tempSkillInput.trim()]
      })
      setTempSkillInput('')
    }
  }

  const removeSkill = (index: number) => {
    const newSkills = searchParams.skills.filter((_, i) => i !== index)
    setSearchParams({ ...searchParams, skills: newSkills })
  }

  const addExclusionKeyword = () => {
    if (tempExclusionInput.trim()) {
      setSearchParams({
        ...searchParams,
        exclusions: {
          ...searchParams.exclusions,
          keywords: [...searchParams.exclusions.keywords, tempExclusionInput.trim()]
        }
      })
      setTempExclusionInput('')
    }
  }

  const removeExclusionKeyword = (index: number) => {
    const newKeywords = searchParams.exclusions.keywords.filter((_, i) => i !== index)
    setSearchParams({
      ...searchParams,
      exclusions: { ...searchParams.exclusions, keywords: newKeywords }
    })
  }

  const handleCompanyCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        const urls = lines.map(line => line.trim()).filter(url => url)
        const { valid, invalid } = validateAndProcessUrls(urls)
        
        if (invalid.length > 0) {
          setInputError(`Invalid LinkedIn URLs found: ${invalid.join(', ')}`)
          setTimeout(() => setInputError(''), 5000)
        } else {
          setInputError('')
        }
        
        if (valid.length > 0) {
          setSearchParams({
            ...searchParams,
            exclusions: {
              ...searchParams.exclusions,
              excludeCompanies: [...searchParams.exclusions.excludeCompanies, ...valid]
            }
          })
        }
      }
      reader.readAsText(file)
    }
  }

  const removeExcludeCompany = (index: number) => {
    const newCompanies = searchParams.exclusions.excludeCompanies.filter((_, i) => i !== index)
    setSearchParams({
      ...searchParams,
      exclusions: { ...searchParams.exclusions, excludeCompanies: newCompanies }
    })
  }

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        const urls = lines.map(line => line.trim()).filter(url => url)
        const { valid, invalid } = validateAndProcessUrls(urls)
        
        if (invalid.length > 0) {
          setInputError(`Invalid LinkedIn URLs found: ${invalid.join(', ')}`)
          setTimeout(() => setInputError(''), 5000)
        } else {
          setInputError('')
        }
        
        if (valid.length > 0) {
          setSearchParams({
            ...searchParams,
            exclusions: {
              ...searchParams.exclusions,
              excludePeople: [...searchParams.exclusions.excludePeople, ...valid]
            }
          })
        }
      }
      reader.readAsText(file)
    }
  }

  const removeExcludePerson = (index: number) => {
    const newPeople = searchParams.exclusions.excludePeople.filter((_, i) => i !== index)
    setSearchParams({
      ...searchParams,
      exclusions: { ...searchParams.exclusions, excludePeople: newPeople }
    })
  }

  const generateMockCandidates = (count: number, startIndex: number = 0): Candidate[] => {
    const names = [
      'Sarah Chen', 'Marcus Rodriguez', 'Emily Johnson', 'David Kim', 'Jessica Martinez',
      'Alex Thompson', 'Rachel Green', 'Michael Brown', 'Lisa Wang', 'James Wilson',
      'Amanda Davis', 'Christopher Lee', 'Jennifer Taylor', 'Robert Garcia', 'Michelle Anderson',
      'Daniel White', 'Ashley Thomas', 'Matthew Jackson', 'Stephanie Harris', 'Andrew Clark',
      'Nicole Adams', 'Kevin Park', 'Samantha Lee', 'Brandon Wright', 'Olivia Torres',
      'Ryan Murphy', 'Isabella Chen', 'Tyler Johnson', 'Maya Patel', 'Ethan Davis'
    ]
    
    const companies = [
      'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Uber', 'Airbnb',
      'Tesla', 'SpaceX', 'Stripe', 'Shopify', 'Slack', 'Zoom', 'Salesforce',
      'Oracle', 'IBM', 'Intel', 'NVIDIA', 'Adobe', 'PayPal', 'Square', 'Twilio'
    ]
    
    const locations = [
      'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA',
      'Los Angeles, CA', 'Chicago, IL', 'Denver, CO', 'Portland, OR', 'Miami, FL'
    ]
    
    const educationLevels = [
      'Bachelor of Computer Science', 'Master of Computer Science', 'PhD in Computer Science',
      'Bachelor of Software Engineering', 'Master of Software Engineering', 'Bachelor of Information Technology'
    ]
    
    // Shuffle the arrays to get random selection
    const shuffledNames = [...names].sort(() => Math.random() - 0.5)
    const shuffledCompanies = [...companies].sort(() => Math.random() - 0.5)
    const shuffledLocations = [...locations].sort(() => Math.random() - 0.5)
    const shuffledEducation = [...educationLevels].sort(() => Math.random() - 0.5)
    
    return Array.from({ length: count }, (_, i) => {
      // Use selected job titles if available, otherwise use default
      const selectedTitle = searchParams.jobTitles.length > 0 
        ? searchParams.jobTitles[i % searchParams.jobTitles.length]
        : 'Software Engineer'
      
      // Use selected skills if available, otherwise use default
      const selectedSkills = searchParams.skills.length > 0 
        ? searchParams.skills.join(', ')
        : 'React, Node.js, TypeScript'
      
      return {
        id: `candidate-${startIndex + i}`,
        name: shuffledNames[i % shuffledNames.length],
        photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${startIndex + i}`,
        title: selectedTitle,
        company: shuffledCompanies[i % shuffledCompanies.length],
        location: shuffledLocations[i % shuffledLocations.length],
        education: shuffledEducation[i % shuffledEducation.length],
        experience: [
          { title: selectedTitle, company: shuffledCompanies[i % shuffledCompanies.length], duration: '2 years' },
          { title: `Junior ${selectedTitle}`, company: 'Startup Inc', duration: '1 year' }
        ],
        linkedinUrl: `https://linkedin.com/in/candidate-${startIndex + i}`,
        summary: `Experienced ${selectedTitle.toLowerCase()} with expertise in ${selectedSkills}`
      }
    })
  }

  const handleSearch = async () => {
    console.log('[HandleSearch] Called with state:', {
      selectedSavedSearchId,
      isSearchModified,
      currentSearchId,
      willRunExisting: selectedSavedSearchId && !isSearchModified && currentSearchId
    })

    try {
      let response: SearchResponse

      // If we have a loaded search that hasn't been modified, just run it
      if (selectedSavedSearchId && !isSearchModified && currentSearchId) {
        console.log('[HandleSearch] Running existing search:', currentSearchId)
        response = await runSearchMutation.mutateAsync(currentSearchId)
      } else {
        console.log('[HandleSearch] Creating new search')
        // Otherwise create a new search
        const searchRequest = mapSearchParamsToRequest(searchParams, searchTitle || 'Candidate Search')
        response = await createSearch.mutateAsync(searchRequest)

        // Store the search ID for later use
        setCurrentSearchId(response.search_id)
        setIsSearchModified(false)
      }

      // Update candidate yield with real results
      setCandidateYield(response.total_results)

      // Clear staging candidates - users must click "Enrich Candidates" to see actual profiles
      setStagingCandidates([])

      console.log('Search completed:', response)
    } catch (error) {
      console.error('Search failed:', error)
      // Clear candidates on error
      setCandidateYield(0)
      setStagingCandidates([])
    }
  }

  const handleUpdateSearch = async () => {
    if (!currentSearchId || !selectedSavedSearchId) {
      console.error('No search ID available for update')
      return
    }

    try {
      const searchRequest = mapSearchParamsToRequest(searchParams, searchTitle)
      await updateSearchMutation.mutateAsync({
        searchId: currentSearchId,
        data: searchRequest
      })
      setIsSearchModified(false)
      console.log('Search updated successfully')
    } catch (error) {
      console.error('Failed to update search:', error)
    }
  }

  const handleSaveSearch = async () => {
    if (!currentSearchId) {
      console.error('No search ID available')
      return
    }

    if (!searchTitle.trim()) {
      console.error('Search title is required')
      return
    }

    try {
      // Save as new search (just update the name)
      await updateSearchName.mutateAsync({
        searchId: currentSearchId,
        searchTitle: searchTitle.trim()
      })
      setIsSaveDialogOpen(false)
      setSearchTitle('')
    } catch (error) {
      console.error('Failed to save search:', error)
    }
  }

  const mapEnrichedCandidateToCandidate = (enriched: EnrichedCandidateResponse): Candidate => {
    const fullName = `${enriched.first_name} ${enriched.last_name}`
    const location = enriched.city && enriched.state ? `${enriched.city}, ${enriched.state}` : enriched.city || enriched.state || 'Location not available'

    // Use actual LinkedIn URL from raw_data or construct from slug
    const linkedinUrl = enriched.raw_data.websites_linkedin
      || (enriched.linkedin_canonical_slug ? `https://linkedin.com/in/${enriched.linkedin_canonical_slug}` : '')
      || (enriched.linkedin_shorthand_slug ? `https://linkedin.com/in/${enriched.linkedin_shorthand_slug}` : '')

    // Use actual profile picture or fallback to avatar
    const photo = enriched.raw_data.picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${enriched.id}`

    // Extract education from raw_data
    let education = 'Education details not available'
    if (enriched.raw_data.education && enriched.raw_data.education.length > 0) {
      const edu = enriched.raw_data.education[0]
      if (edu.major && edu.title) {
        education = `${edu.major} at ${edu.title}`
      } else if (edu.major) {
        education = edu.major
      } else if (edu.title) {
        education = edu.title
      }
    }

    // Extract experience from raw_data
    const experience = enriched.raw_data.experience && enriched.raw_data.experience.length > 0
      ? enriched.raw_data.experience.slice(0, 5).map(exp => ({
          title: exp.title,
          company: exp.company_name,
          duration: exp.duration
        }))
      : [{
          title: enriched.job_title || 'Position not specified',
          company: enriched.company_name || 'Company not specified',
          duration: 'Current'
        }]

    // Use description from raw_data or construct summary
    const summary = enriched.raw_data.description
      || enriched.raw_data.headline
      || enriched.raw_data.generated_headline
      || `${enriched.job_title || 'Professional'} at ${enriched.company_name || 'current company'} located in ${location}`

    return {
      id: enriched.id.toString(),
      name: fullName,
      photo: photo,
      title: enriched.job_title || 'Position not specified',
      company: enriched.company_name || 'Company not specified',
      location: location,
      education: education,
      experience: experience,
      linkedinUrl: linkedinUrl,
      summary: summary
    }
  }

  const handleEnrichCandidates = async () => {
    if (!currentSearchId) {
      console.error('No search ID available for enrichment')
      return
    }

    if (!enrichLimit || enrichLimit < 1) {
      console.error('Invalid enrichment limit')
      return
    }

    try {
      console.log('[EnrichCandidates] Enriching with search ID:', currentSearchId, 'limit:', enrichLimit)
      const enrichedResponse = await enrichCandidatesMutation.mutateAsync({
        searchId: currentSearchId,
        limit: enrichLimit
      })

      // Unwrap the response to get the candidates array
      const enrichedData = enrichedResponse.candidates

      // Map the enriched data to Candidate format
      const mappedCandidates = enrichedData.map(mapEnrichedCandidateToCandidate)

      // Update staging candidates with enriched data
      setStagingCandidates(mappedCandidates)

      // Update candidate yield to match the enriched count
      setCandidateYield(enrichedData.length)

      console.log('[EnrichCandidates] Successfully enriched', mappedCandidates.length, 'candidates')
      console.log('[EnrichCandidates] Excluded count:', enrichedResponse.excluded_count)
    } catch (error) {
      console.error('Failed to enrich candidates:', error)
    }
  }

  const handleRefreshCandidates = () => {
    // Generate 5 new candidates from the same pool (different IDs)
    const currentCount = stagingCandidates.length
    const newCandidates = generateMockCandidates(5, currentCount)
    setStagingCandidates(newCandidates)
  }

  const handleSendToReview = () => {
    // Generate the full number of candidates for review (same as candidateYield)
    const fullCandidateList = generateMockCandidates(candidateYield)
    
    // Set the review candidates to the full list
    setReviewCandidates(fullCandidateList)
    
    // Clear staging candidates
    setStagingCandidates([])
    
    // Redirect to candidates tab
    onGoToCandidates()
  }

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsPanelOpen(true)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    setSelectedCandidate(null)
  }

  const handleLoadSavedSearch = (searchId: string) => {
    if (searchId === 'clear-selection') {
      setSelectedSavedSearchId('')
      setSearchTitle('')
      setCurrentSearchId(null)
      setIsSearchModified(false)
      // Reset form to initial state
      setSearchParams({
        education: '',
        graduationYear: '',
        geography: '',
        radius: 25,
        jobTitles: [],
        skills: [],
        exclusions: {
          keywords: [],
          excludeCompanies: [],
          excludePeople: []
        },
        experienceLength: '',
        titleMatch: false,
        profilePhoto: false,
        connections: 0,
        numExperiences: 0,
        graduationYearFrom: 0,
        graduationYearTo: 0,
        maxExperience: 5,
        department: '',
        deptYears: 0,
        managementLevelExclusions: '',
        recency: 0,
        timeInRole: 6,
        locationCity: '',
        locationState: '',
        searchRadius: 25,
        includeWorkLocation: false,
        industryExclusions: [],
        titleExclusions: '',
        keywordExclusions: '',
        companyExclusions: '',
        maxJobDuration: 5
      })
      return
    }

    const savedSearch = savedSearches?.find(s => s.id.toString() === searchId)
    if (!savedSearch) return

    const mappedParams = mapSavedSearchToParams(savedSearch)

    // Mark that we're loading a saved search to prevent marking as modified
    isLoadingSavedSearch.current = true

    // Set these FIRST before setting searchParams to avoid race conditions
    setSelectedSavedSearchId(searchId)
    setCurrentSearchId(savedSearch.id)
    setSearchTitle(savedSearch.search_title)
    setIsSearchModified(false)

    console.log('[LoadSavedSearch] Loading search:', {
      searchId,
      savedSearchId: savedSearch.id,
      isSearchModified: false,
      hasCity: !!mappedParams.locationCity
    })

    // If there's a location city, we need to set state first, then city after cities load
    if (mappedParams.locationCity && mappedParams.locationState) {
      // Store the city to set it after cities load
      setPendingLocationCity(mappedParams.locationCity)
      // Set params without city first - this will trigger one modification check, skip it
      skipNextModificationCheck.current++
      setSearchParams({ ...mappedParams, locationCity: '' })
      // Note: isLoadingSavedSearch.current will be set to false in the city effect
    } else {
      // No city to load, skip the next modification check for this setSearchParams call
      skipNextModificationCheck.current++
      setSearchParams(mappedParams)
      // Mark loading as complete immediately if there's no pending city
      isLoadingSavedSearch.current = false
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Search Candidates</CardTitle>
            <CardDescription>Configure your search parameters</CardDescription>
          </div>
          <div className="w-64 min-w-64">
            <Select value={selectedSavedSearchId} onValueChange={handleLoadSavedSearch}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Load saved search..." />
              </SelectTrigger>
              <SelectContent>
                {selectedSavedSearchId && (
                  <SelectItem value="clear-selection">
                    <span className="text-muted-foreground italic">Clear selection</span>
                  </SelectItem>
                )}
                {isLoadingSavedSearches ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : savedSearches && savedSearches.length > 0 ? (
                  savedSearches.map((search) => (
                    <SelectItem key={search.id} value={search.id.toString()}>
                      {search.search_title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-searches" disabled>
                    No saved searches
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {/* Education Section */}
          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Education</h3>
            </div>
            <div className="space-y-4">
              
              {/* Graduation Year Range */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">From year</Label>
                    <Input
                      type="number"
                      value={searchParams.graduationYearFrom || ''}
                      onChange={(e) => setSearchParams({ ...searchParams, graduationYearFrom: parseInt(e.target.value) || 0 })}
                      min="1980"
                      max="2025"
                      placeholder="2018"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">To year</Label>
                    <Input
                      type="number"
                      value={searchParams.graduationYearTo || ''}
                      onChange={(e) => setSearchParams({ ...searchParams, graduationYearTo: parseInt(e.target.value) || 0 })}
                      min="1980"
                      max="2025"
                      placeholder="2022"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Location</h3>
            </div>
            <div className="space-y-4"> 
              {/* Location Details */}
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">State</Label>
                    <Select
                      value={searchParams.locationState}
                      onValueChange={(value) => setSearchParams({ ...searchParams, locationState: value, locationCity: '' })}
                    >
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Select state..." />
                      </SelectTrigger>
                      <SelectContent>
                        {statesData?.map((state) => (
                          <SelectItem key={state.state_abbrev} value={state.state_abbrev}>
                            {state.state_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">City</Label>
                    <Select
                      value={searchParams.locationCity}
                      onValueChange={(value) => setSearchParams({ ...searchParams, locationCity: value })}
                      disabled={!searchParams.locationState}
                    >
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Select city..." />
                      </SelectTrigger>
                      <SelectContent>
                        {citiesData?.map((city, index) => (
                          <SelectItem key={`${city.city}-${index}`} value={city.city}>
                            {city.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Radius (miles)</Label>
                    <Input
                      type="number"
                      value={searchParams.searchRadius || 25}
                      onChange={(e) => setSearchParams({ ...searchParams, searchRadius: parseInt(e.target.value) || 25 })}
                      min="1"
                      max="500"
                      className="h-10"
                      placeholder="25"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Requirements Section - New Fields from UnifiedSearchForm */}
          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Experience</h3>
            </div>
            
            <div className="space-y-4">
              {/* Experience Fields in Same Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    How many jobs should the candidate have had?
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={searchParams.numExperiences || ''}
                      onChange={(e) => setSearchParams({ ...searchParams, numExperiences: parseInt(e.target.value) || 0 })}
                      min="1"
                      max="10"
                      className="w-20"
                      placeholder="3"
                    />
                    <span className="text-xs text-gray-500">Minimum number of past positions</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Maximum total years of experience:</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={searchParams.maxExperience || 5}
                      onChange={(e) => setSearchParams({ ...searchParams, maxExperience: parseInt(e.target.value) || 5 })}
                      min="1"
                      max="30"
                      className="w-20"
                    />
                    <span className="text-xs text-gray-500">Avoid overqualified candidates</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Maximum time at one job:</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={searchParams.maxJobDuration || 5}
                      onChange={(e) => setSearchParams({ ...searchParams, maxJobDuration: parseInt(e.target.value) || 5 })}
                      min="1"
                      max="20"
                      className="w-20"
                    />
                    <span className="text-xs text-gray-500">Filters out candidates who may be less adaptable</span>
                  </div>
                </div>
              </div>

              {/* Department and Management Level in Same Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Which department experience is required?</Label>
                  <Select
                    value={searchParams.department}
                    onValueChange={(value) => setSearchParams({ ...searchParams, department: value })}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select department..." />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentsData?.departments?.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Job Titles Section */}
          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Job Titles</h3>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-3">
                {searchParams.jobTitles.map((title, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {title}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeJobTitle(index)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Add job title</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add job title..."
                      value={tempJobTitleInput}
                      onChange={(e) => setTempJobTitleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addJobTitle()
                        }
                      }}
                    />
                    <Button onClick={addJobTitle} variant="outline" className="mt-auto">
                      Add
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Minimum time in current role (months)</Label>
                  <Input
                    type="number"
                    value={searchParams.timeInRole || 6}
                    onChange={(e) => setSearchParams({ ...searchParams, timeInRole: parseInt(e.target.value) || 6 })}
                    min="0"
                    max="60"
                    placeholder="6"
                  />
                </div>
              </div>
                  {/* Connections */}
                  <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Minimum professional connections required:
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={searchParams.connections}
                    onChange={(e) => setSearchParams({ ...searchParams, connections: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="500"
                    className="w-20"
                  />
                  <span className="text-xs text-gray-500">connections</span>
                </div>
              </div>
            </div>
          </div>

          {/* Refinements Section - New Fields from Step3 */}
          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <X className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Exclusions</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 text-sm mb-4">
                Fine-tune your search by excluding specific industries, roles, or keywords.
              </p>

              {/* Industry Exclusions */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Industry Exclusions</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Exclude candidates with recent experience in these industries:
                </p>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !searchParams.industryExclusions.includes(value)) {
                      setSearchParams({ 
                        ...searchParams, 
                        industryExclusions: [...searchParams.industryExclusions, value] 
                      })
                    }
                  }}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select industry to exclude..." />
                  </SelectTrigger>
                  <SelectContent>
                    {industriesData?.industries?.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {searchParams.industryExclusions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {searchParams.industryExclusions.map((industry, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1 bg-black text-white border-black hover:bg-gray-800">
                        {industry}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => setSearchParams({
                            ...searchParams,
                            industryExclusions: searchParams.industryExclusions.filter((_, i) => i !== index)
                          })}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Title Exclusions */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Job Title Exclusions</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Exclude candidates with these roles (comma-separated):
                </p>
                <Input
                  value={searchParams.titleExclusions}
                  onChange={(e) => setSearchParams({ ...searchParams, titleExclusions: e.target.value })}
                  placeholder="e.g., CEO, CFO, Manager, Director..."
                />
              </div>

              {/* Keyword Exclusions */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Profile Keyword Exclusions</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Exclude candidates whose profile mentions (comma-separated):
                </p>
                <Input
                  value={searchParams.keywordExclusions}
                  onChange={(e) => setSearchParams({ ...searchParams, keywordExclusions: e.target.value })}
                  placeholder="e.g., healthcare, medical, finance, banking..."
                />
              </div>

              <div className="space-y-2">
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      checked={searchParams.managementLevelExclusions === 'C-Level, Director, Manager, VP, Owner, Founder'}
                      onCheckedChange={(checked) => {
                        const exclusions = checked 
                          ? 'C-Level, Director, Manager, VP, Owner, Founder'
                          : ''
                        setSearchParams({ ...searchParams, managementLevelExclusions: exclusions })
                      }}
                    />
                    <Label className="text-sm">Exclude Current or Previous Managers & Executives</Label>
                  </div>
                  <p className="text-xs text-gray-500">
                    {searchParams.managementLevelExclusions 
                      ? `Excludes: ${searchParams.managementLevelExclusions}`
                      : 'All management levels will be included in results'
                    }
                  </p>
                </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5" />
                <div>
                  <span className="text-2xl font-bold">
                    {candidateYield.toLocaleString()}
                  </span>
                  <span className="text-2xl font-bold"> candidates found</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  className="flex items-center gap-2"
                  onClick={handleSearch}
                  disabled={createSearch.isPending}
                >
                  {createSearch.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Search Candidates
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Sample Candidates */}
          {stagingCandidates.length > 0 && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {stagingCandidates.slice(0, 5).map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleCandidateClick(candidate)}
                  >
                    <img
                      src={candidate.photo}
                      alt={candidate.name}
                      className="w-12 h-12 rounded-full object-cover grayscale"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{candidate.name}</h4>
                        <Badge variant="outline">{candidate.title}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{candidate.company} • {candidate.location}</p>
                      <p className="text-sm text-gray-500">{candidate.education}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons - Always show after search */}
          {currentSearchId && (
            <div className="flex items-center gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleRefreshCandidates}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button
                  className="flex items-center gap-2"
                  onClick={handleSendToReview}
                >
                  <Send className="h-4 w-4" />
                  Send All {candidateYield.toLocaleString()} to Review
                </Button>
                {selectedSavedSearchId && isSearchModified ? (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handleUpdateSearch}
                    disabled={updateSearchMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                    {updateSearchMutation.isPending ? 'Updating...' : 'Update Search'}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setIsSaveDialogOpen(true)}
                    disabled={!currentSearchId || !!selectedSavedSearchId}
                  >
                    <Save className="h-4 w-4" />
                    Save Search
                  </Button>
                )}

                {/* Enrich Controls - Right side */}
                <div className="flex items-center gap-2 ml-auto">
                  <Label className="text-sm font-medium whitespace-nowrap">Limit:</Label>
                  <Input
                    type="number"
                    value={enrichLimit}
                    onChange={(e) => setEnrichLimit(parseInt(e.target.value) || 1)}
                    min="1"
                    max="100"
                    className="w-20"
                    placeholder="10"
                  />
                  <Button
                    className="flex items-center gap-2"
                    onClick={handleEnrichCandidates}
                    disabled={!currentSearchId || enrichCandidatesMutation.isPending}
                  >
                    {enrichCandidatesMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Enriching...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Enrich Candidates
                      </>
                    )}
                  </Button>
                </div>
              </div>
          )}
        </CardContent>
      </Card>

      {/* Candidate Detail Panel */}
      <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <SheetContent side="right" className="w-[312px] sm:max-w-[312px]">
          <SheetHeader className="sr-only">
            <SheetTitle>Candidate Profile</SheetTitle>
          </SheetHeader>
          
          {selectedCandidate && (
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-4">
                {/* Profile Header */}
                <div className="flex items-start gap-3">
                  <img 
                    src={selectedCandidate.photo} 
                    alt={selectedCandidate.name}
                    className="w-16 h-16 rounded-full object-cover grayscale"
                  />
                  <div className="flex-1">
                    <h2 className="text-lg font-bold">{selectedCandidate.name}</h2>
                    <p className="text-sm text-gray-600">{selectedCandidate.title}</p>
                    <p className="text-xs text-gray-500">{selectedCandidate.company} • {selectedCandidate.location}</p>
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => selectedCandidate.linkedinUrl && window.open(selectedCandidate.linkedinUrl, '_blank')}
                        disabled={!selectedCandidate.linkedinUrl}
                      >
                        View LinkedIn Profile
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Summary</h3>
                  <p className="text-xs text-gray-700">{selectedCandidate.summary}</p>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Education</h3>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs font-medium">{selectedCandidate.education}</p>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Experience</h3>
                  <div className="space-y-2">
                    {selectedCandidate.experience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-blue-500 pl-3">
                        <h4 className="text-xs font-medium">{exp.title}</h4>
                        <p className="text-xs text-gray-600">{exp.company}</p>
                        <p className="text-xs text-gray-500">{exp.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Save Search Modal */}
      <Modal
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        title="Save Search"
        description="Enter a name for this search to save it for future use."
        confirmText="Save"
        onConfirm={handleSaveSearch}
        onCancel={() => {
          setIsSaveDialogOpen(false)
          setSearchTitle('')
        }}
        isLoading={updateSearchName.isPending}
        confirmDisabled={!searchTitle.trim()}
      >
        <div className="space-y-2">
          <Label htmlFor="search-title">Search Title</Label>
          <Input
            id="search-title"
            placeholder="e.g., Senior Software Engineers in SF"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTitle.trim()) {
                handleSaveSearch()
              }
            }}
          />
        </div>
      </Modal>
    </div>
  )
}
