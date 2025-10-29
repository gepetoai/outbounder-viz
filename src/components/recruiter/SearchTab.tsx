'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Modal } from '@/components/ui/modal'
import { Briefcase, MapPin, GraduationCap, X, Search, Target, RefreshCw, Send, Save, Sparkles, ChevronDown } from 'lucide-react'
import { useStates, useCities, useIndustries } from '@/hooks/useDropdowns'
import { useCreateSearch, useUpdateSearchName, useUpdateSearch, useRunSearch, useEnrichCandidates } from '@/hooks/useSearch'
import { useApproveCandidate, useRejectCandidate } from '@/hooks/useCandidates'
import { mapSearchParamsToRequest, SearchResponse } from '@/lib/search-api'
import { mapEnrichedCandidateToCandidate, type Candidate } from '@/lib/utils'
import { CandidateListItem } from './CandidateListItem'
import { CandidateDetailPanel } from './CandidateDetailPanel'

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
  titleExclusions: string[]
  keywordExclusions: string[]
  companyExclusions: string
  maxJobDuration: number
}

interface SearchTabProps {
  searchParams: SearchParams
  setSearchParams: (params: SearchParams) => void
  candidateYield: number
  setCandidateYield: (candidateYield: number) => void
  stagingCandidates: Candidate[]
  setStagingCandidates: (candidates: Candidate[]) => void
  onGoToCandidates: () => void
  jobDescriptionId?: number | null
  currentSearchId: number | null
  setCurrentSearchId: (id: number | null) => void
  searchTitle: string
  setSearchTitle: (title: string) => void
  isSearchModified: boolean
  setIsSearchModified: (modified: boolean) => void
}

export function SearchTab({
  searchParams,
  setSearchParams,
  candidateYield,
  setCandidateYield,
  stagingCandidates,
  setStagingCandidates,
  onGoToCandidates,
  jobDescriptionId,
  currentSearchId,
  setCurrentSearchId,
  searchTitle,
  setSearchTitle,
  isSearchModified,
  setIsSearchModified
}: SearchTabProps) {
  const [tempJobTitleInput, setTempJobTitleInput] = useState('')
  const [tempSkillInput, setTempSkillInput] = useState('')
  const [tempExclusionInput, setTempExclusionInput] = useState('')
  const [tempTitleExclusionInput, setTempTitleExclusionInput] = useState('')
  const [tempKeywordExclusionInput, setTempKeywordExclusionInput] = useState('')
  const [inputError, setInputError] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isSaveNewDialogOpen, setIsSaveNewDialogOpen] = useState(false)
  const [pendingLocationCity, setPendingLocationCity] = useState<string>('')
  const [enrichLimit, setEnrichLimit] = useState<number>(10)

  // Dropdown data hooks
  const { data: statesData } = useStates()
  const { data: citiesData } = useCities(searchParams.locationState, statesData)
  const { data: industriesData } = useIndustries()

  // Search functionality
  const createSearch = useCreateSearch()
  const updateSearchName = useUpdateSearchName()
  const updateSearchMutation = useUpdateSearch()
  const runSearchMutation = useRunSearch()
  const enrichCandidatesMutation = useEnrichCandidates()
  
  // Candidate approval/rejection
  const approveCandidateMutation = useApproveCandidate()
  const rejectCandidateMutation = useRejectCandidate()

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
    if (currentSearchId) {
      console.log('[ModificationCheck] Marking search as modified', {
        currentSearchId
      })
      setIsSearchModified(true)
    }
  }, [searchParams, currentSearchId])

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
    console.log('removeJobTitle called with index:', index)
    console.log('Current jobTitles:', searchParams.jobTitles)
    const newTitles = searchParams.jobTitles.filter((_, i) => i !== index)
    console.log('New jobTitles:', newTitles)
    setSearchParams({ ...searchParams, jobTitles: newTitles })
  }

  const addTitleExclusion = () => {
    if (tempTitleExclusionInput.trim()) {
      setSearchParams({
        ...searchParams,
        titleExclusions: [...searchParams.titleExclusions, tempTitleExclusionInput.trim()]
      })
      setTempTitleExclusionInput('')
    }
  }

  const removeTitleExclusion = (index: number) => {
    const newExclusions = searchParams.titleExclusions.filter((_, i) => i !== index)
    setSearchParams({ ...searchParams, titleExclusions: newExclusions })
  }

  const addKeywordExclusion = () => {
    if (tempKeywordExclusionInput.trim()) {
      setSearchParams({
        ...searchParams,
        keywordExclusions: [...searchParams.keywordExclusions, tempKeywordExclusionInput.trim()]
      })
      setTempKeywordExclusionInput('')
    }
  }

  const removeKeywordExclusion = (index: number) => {
    const newExclusions = searchParams.keywordExclusions.filter((_, i) => i !== index)
    setSearchParams({ ...searchParams, keywordExclusions: newExclusions })
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
          console.log(inputError)
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
      isSearchModified,
      currentSearchId,
      willRunExisting: !isSearchModified && currentSearchId
    })

    try {
      let response: SearchResponse

      // If we have a loaded search that hasn't been modified, just run it
      if (!isSearchModified && currentSearchId) {
        console.log('[HandleSearch] Running existing search:', currentSearchId)
        response = await runSearchMutation.mutateAsync(currentSearchId)
      } else {
        console.log('[HandleSearch] Creating new search')
        // Otherwise create a new search
        // Use jobDescriptionId prop
        const jobIdToUse = jobDescriptionId
        const searchRequest = mapSearchParamsToRequest(searchParams, 'Candidate Search', jobIdToUse)
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
    if (!currentSearchId) {
      console.error('No search ID available for update')
      return
    }

    try {
      const jobIdToUse = jobDescriptionId
      const searchRequest = mapSearchParamsToRequest(searchParams, searchTitle, jobIdToUse)
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
      // First update the search parameters if they've been modified
      if (isSearchModified) {
        const jobIdToUse = jobDescriptionId
        const searchRequest = mapSearchParamsToRequest(searchParams, searchTitle.trim(), jobIdToUse)
        await updateSearchMutation.mutateAsync({
          searchId: currentSearchId,
          data: searchRequest
        })
        setIsSearchModified(false)
      }

      // Then update the search name
      await updateSearchName.mutateAsync({
        searchId: currentSearchId,
        searchTitle: searchTitle.trim()
      })
      
      setIsSaveDialogOpen(false)
      setSearchTitle('')
      console.log('Search updated successfully')
    } catch (error) {
      console.error('Failed to update search:', error)
    }
  }

  const handleSaveNewSearch = async () => {
    if (!searchTitle.trim()) {
      console.error('Search title is required')
      return
    }

    if (!jobDescriptionId) {
      console.error('Job description ID is required')
      return
    }

    try {
      // Map search params to API request format
      const searchRequest = mapSearchParamsToRequest(searchParams, searchTitle.trim(), jobDescriptionId)
      
      // Create new search
      const response = await createSearch.mutateAsync(searchRequest)
      
      // Update current search ID and title
      setCurrentSearchId(response.search_id)
      setSearchTitle(searchTitle.trim())
      setIsSearchModified(false)
      setIsSaveNewDialogOpen(false)
      
      console.log('New search created successfully:', response)
    } catch (error) {
      console.error('Failed to create new search:', error)
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
    // If we have a job description ID, candidates will be fetched in CandidateTab
    // Otherwise, generate mock candidates
    const jobIdToUse = jobDescriptionId
    if (jobIdToUse) {
      console.log('[SendToReview] Job description ID:', jobIdToUse, '- candidates will be fetched in CandidateTab')
      // Candidates will be fetched in CandidateTab
    } else {
      // Generate the full number of candidates for review (same as candidateYield)
      // Note: Review candidates are now handled by the parent component
    }

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

  const handleApprove = async (candidateId: string) => {
    if (!jobDescriptionId) return
    
    try {
      await approveCandidateMutation.mutateAsync({
        fk_job_description_id: jobDescriptionId,
        fk_candidate_id: parseInt(candidateId)
      })
      // Remove the approved candidate from staging
      setStagingCandidates(stagingCandidates.filter(c => c.id !== candidateId))
    } catch (error) {
      console.error('Failed to approve candidate:', error)
    }
  }

  const handleReject = async (candidateId: string) => {
    if (!jobDescriptionId) return
    
    try {
      await rejectCandidateMutation.mutateAsync({
        fk_job_description_id: jobDescriptionId,
        fk_candidate_id: parseInt(candidateId)
      })
      // Remove the rejected candidate from staging
      setStagingCandidates(stagingCandidates.filter(c => c.id !== candidateId))
    } catch (error) {
      console.error('Failed to reject candidate:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-8 pt-2">

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
                      value={searchParams.searchRadius || 0}
                      onChange={(e) => setSearchParams({ ...searchParams, searchRadius: parseInt(e.target.value) || 0 })}
                      min="0"
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
              {/* First Row of Experience Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Minimum number of past positions</Label>
                  <Input
                    type="number"
                    value={searchParams.numExperiences || 0}
                    onChange={(e) => setSearchParams({ ...searchParams, numExperiences: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="20"
                    className="w-20"
                    placeholder="3"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Maximum months of experience</Label>
                  <Input
                    type="number"
                    value={searchParams.maxExperience || 0}
                    onChange={(e) => setSearchParams({ ...searchParams, maxExperience: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Maximum months at one job</Label>
                  <Input
                    type="number"
                    value={searchParams.maxJobDuration || 0}
                    onChange={(e) => setSearchParams({ ...searchParams, maxJobDuration: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-20"
                  />
                </div>
              </div>

              {/* Second Row of Experience Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Minimum number of professional connections</Label>
                  <Input
                    type="number"
                    value={searchParams.connections}
                    onChange={(e) => setSearchParams({ ...searchParams, connections: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="500"
                    className="w-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Minimum months of relevant experience</Label>
                  <Input
                    type="number"
                    value={searchParams.deptYears || 0}
                    onChange={(e) => setSearchParams({ ...searchParams, deptYears: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Minimum months in current role</Label>
                  <Input
                    type="number"
                    value={searchParams.timeInRole || 0}
                    onChange={(e) => setSearchParams({ ...searchParams, timeInRole: parseInt(e.target.value) || 0 })}
                    min="0"
                    placeholder="6"
                    className="w-20"
                  />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
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
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {searchParams.jobTitles.map((title, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
                    <span className="text-sm">{title}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${title}`}
                      className="inline-flex items-center justify-center rounded p-0.5 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeJobTitle(index)
                      }}
                    >
                      <X className="h-4 w-4 text-gray-700 hover:text-red-600" />
                    </button>
                  </Badge>
                ))}
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

              {/* Industry Exclusions */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Industry Exclusions</Label>
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
                        <button
                          type="button"
                          aria-label={`Remove ${industry}`}
                          className="inline-flex items-center justify-center rounded p-0.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setSearchParams({
                              ...searchParams,
                              industryExclusions: searchParams.industryExclusions.filter((_, i) => i !== index)
                            })
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Title and Keyword Exclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Job Title Exclusions</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., CEO, CFO, Manager, Director..."
                      value={tempTitleExclusionInput}
                      onChange={(e) => setTempTitleExclusionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addTitleExclusion()
                        }
                      }}
                    />
                    <Button onClick={addTitleExclusion} variant="outline" className="mt-auto">
                      Add
                    </Button>
                  </div>
                      {/* Display Title Exclusions */}
                      {searchParams.titleExclusions.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <div className="flex flex-wrap gap-2">
                            {searchParams.titleExclusions.map((exclusion, index) => (
                             <Badge key={index} variant="outline" className="flex items-center gap-1 bg-black text-white border-black hover:bg-gray-800">
                                {exclusion}
                                <button
                                  type="button"
                                  aria-label={`Remove ${exclusion}`}
                                  className="inline-flex items-center justify-center rounded p-0.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    removeTitleExclusion(index)
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Profile Keyword Exclusions</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., healthcare, medical, finance, banking..."
                      value={tempKeywordExclusionInput}
                      onChange={(e) => setTempKeywordExclusionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addKeywordExclusion()
                        }
                      }}
                    />
                    <Button onClick={addKeywordExclusion} variant="outline" className="mt-auto">
                      Add
                    </Button>
                  </div>
                      {/* Display Keyword Exclusions */}
                      {searchParams.keywordExclusions.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <div className="flex flex-wrap gap-2">
                            {searchParams.keywordExclusions.map((exclusion, index) => (
                               <Badge key={index} variant="outline" className="flex items-center gap-1 bg-black text-white border-black hover:bg-gray-800">
                                {exclusion}
                                <button
                                  type="button"
                                  aria-label={`Remove ${exclusion}`}
                                  className="inline-flex items-center justify-center rounded p-0.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    removeKeywordExclusion(index)
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                </div>
                
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
                </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="space-y-4">
            {!jobDescriptionId ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-gray-400" />
                  <div>
                    <span className="text-2xl font-bold text-gray-400">
                      Select a job posting first
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    className="flex items-center gap-2"
                    onClick={handleSearch}
                    disabled={true}
                  >
                    <Search className="h-4 w-4" />
                    Search Candidates
                  </Button>
                </div>
              </div>
            ) : (
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={updateSearchMutation.isPending}
                      >
                        <Save className="h-4 w-4" />
                        {updateSearchMutation.isPending ? 'Saving...' : 'Save Search'}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-36 p-0">
                      <div className="py-1">
                        <button
                          className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors"
                          onClick={() => setIsSaveNewDialogOpen(true)}
                        >
                          Save New
                        </button>
                        <button
                          className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors"
                          onClick={handleUpdateSearch}
                        >
                          Update Existing
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={handleSearch}
                    disabled={createSearch.isPending || !jobDescriptionId}
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
            )}
          </div>

          {/* Sample Candidates */}
          {stagingCandidates.length > 0 && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {stagingCandidates.slice(0, 5).map((candidate) => (
                  <CandidateListItem
                    key={candidate.id}
                    candidate={candidate}
                    onClick={handleCandidateClick}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    showActions={true}
                    isApproving={approveCandidateMutation.isPending}
                    isRejecting={rejectCandidateMutation.isPending}
                  />
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
                {/* {isSearchModified ? (
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
                    disabled={!currentSearchId}
                  >
                    <Save className="h-4 w-4" />
                    Save Search
                  </Button>
                )} */}

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
      <CandidateDetailPanel
        candidate={selectedCandidate}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        variant="sheet"
      />

      {/* Save Search Modal */}
      <Modal
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        title="Update Search"
        description="Update the name and parameters for this existing search."
        confirmText="Update"
        onConfirm={handleSaveSearch}
        onCancel={() => {
          setIsSaveDialogOpen(false)
          setSearchTitle('')
        }}
        isLoading={updateSearchName.isPending || updateSearchMutation.isPending}
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

      {/* Save New Search Modal */}
      <Modal
        open={isSaveNewDialogOpen}
        onOpenChange={setIsSaveNewDialogOpen}
        title="Save New Search"
        description="Enter a name for this new search to save it for future use."
        confirmText="Create Search"
        onConfirm={handleSaveNewSearch}
        onCancel={() => {
          setIsSaveNewDialogOpen(false)
          setSearchTitle('')
        }}
        isLoading={createSearch.isPending}
        confirmDisabled={!searchTitle.trim()}
      >
        <div className="space-y-2">
          <Label htmlFor="new-search-title">Search Title</Label>
          <Input
            id="new-search-title"
            placeholder="e.g., Senior Software Engineers in SF"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTitle.trim()) {
                handleSaveNewSearch()
              }
            }}
          />
        </div>
      </Modal>
    </div>
  )
}
