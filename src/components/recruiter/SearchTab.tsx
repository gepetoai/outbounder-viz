'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Modal } from '@/components/ui/modal'
import { SearchableMultiSelect } from '@/components/ui/searchable-multi-select'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { RemovableBadge } from '@/components/ui/removable-badge'
import { Briefcase, MapPin, GraduationCap, X, Search, Target, RefreshCw, Send, Save, Sparkles, ChevronDown } from 'lucide-react'
import { useStates, useCities, useIndustries, useDepartments } from '@/hooks/useDropdowns'
import { useCreateSearch, useUpdateSearchName, useUpdateSearch, useUpdateQuery, useEnrichCandidates } from '@/hooks/useSearch'
import { useApproveCandidate, useRejectCandidate } from '@/hooks/useCandidates'
import { mapSearchParamsToRequest, SearchResponse } from '@/lib/search-api'
import { mapEnrichedCandidateToCandidate, type Candidate } from '@/lib/utils'
import { parseCommaSeparatedList, isCommaSeparatedList } from '@/lib/parse-utils'
import { CandidateListItem } from './CandidateListItem'
import { CandidateDetailPanel } from './CandidateDetailPanel'
import { useToast } from '@/components/ui/toast'
import { JobPostingRequiredModal } from './JobPostingRequiredModal'

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
  connections?: number

  // New fields from UnifiedSearchForm
  numExperiences?: number
  graduationYearFrom?: number
  graduationYearTo?: number
  maxExperience?: number
  department: string
  deptYears?: number
  managementLevelExclusions: string
  recency?: number
  timeInRole?: number
  locationCity: string
  locationState: string
  searchRadius?: number
  includeWorkLocation: boolean
  industryExclusions: string[]
  titleExclusions: string[]
  keywordExclusions: string[]
  companyExclusions: string
  maxJobDuration?: number
  useExperienceFallback: boolean
}

interface SearchTabProps {
  searchParams: SearchParams
  setSearchParams: (params: SearchParams) => void
  candidateYield: number
  setCandidateYield: (candidateYield: number) => void
  totalPopulation: number
  setTotalPopulation: (totalPopulation: number) => void
  stagingCandidates: Candidate[]
  setStagingCandidates: (candidates: Candidate[]) => void
  onGoToCandidates: () => void
  jobDescriptionId?: number | null
  setJobDescriptionId?: (id: number | null) => void
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
  totalPopulation,
  setTotalPopulation,
  stagingCandidates,
  setStagingCandidates,
  onGoToCandidates,
  jobDescriptionId,
  setJobDescriptionId,
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
  const [approvedCandidateIds, setApprovedCandidateIds] = useState<Set<string>>(new Set())
  const [rejectedCandidateIds, setRejectedCandidateIds] = useState<Set<string>>(new Set())
  const [processingCandidateId, setProcessingCandidateId] = useState<string | null>(null)
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null)
  const [isJobPostingModalOpen, setIsJobPostingModalOpen] = useState(false)

  // Dropdown data hooks
  const { data: statesData } = useStates()
  const { data: citiesData } = useCities(searchParams.locationState, statesData)
  const { data: industriesData } = useIndustries()
  const { data: departmentsData } = useDepartments()

  // Search functionality
  const createSearch = useCreateSearch()
  const updateSearchName = useUpdateSearchName()
  const updateSearchMutation = useUpdateSearch()
  const updateQueryMutation = useUpdateQuery()
  const enrichCandidatesMutation = useEnrichCandidates()
  
  // Candidate approval/rejection
  const approveCandidateMutation = useApproveCandidate()
  const rejectCandidateMutation = useRejectCandidate()

  // Toast notifications
  const { showToast } = useToast()

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
      // Check if input contains comma-separated values
      if (isCommaSeparatedList(tempJobTitleInput)) {
        const parsedTitles = parseCommaSeparatedList(tempJobTitleInput)
        setSearchParams({
          ...searchParams,
          jobTitles: [...searchParams.jobTitles, ...parsedTitles]
        })
      } else {
        setSearchParams({
          ...searchParams,
          jobTitles: [...searchParams.jobTitles, tempJobTitleInput.trim()]
        })
      }
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
      // Check if input contains comma-separated values
      if (isCommaSeparatedList(tempTitleExclusionInput)) {
        const parsedExclusions = parseCommaSeparatedList(tempTitleExclusionInput)
        setSearchParams({
          ...searchParams,
          titleExclusions: [...searchParams.titleExclusions, ...parsedExclusions]
        })
      } else {
        setSearchParams({
          ...searchParams,
          titleExclusions: [...searchParams.titleExclusions, tempTitleExclusionInput.trim()]
        })
      }
      setTempTitleExclusionInput('')
    }
  }

  const removeTitleExclusion = (index: number) => {
    const newExclusions = searchParams.titleExclusions.filter((_, i) => i !== index)
    setSearchParams({ ...searchParams, titleExclusions: newExclusions })
  }

  const addKeywordExclusion = () => {
    if (tempKeywordExclusionInput.trim()) {
      // Check if input contains comma-separated values
      if (isCommaSeparatedList(tempKeywordExclusionInput)) {
        const parsedKeywords = parseCommaSeparatedList(tempKeywordExclusionInput)
        setSearchParams({
          ...searchParams,
          keywordExclusions: [...searchParams.keywordExclusions, ...parsedKeywords]
        })
      } else {
        setSearchParams({
          ...searchParams,
          keywordExclusions: [...searchParams.keywordExclusions, tempKeywordExclusionInput.trim()]
        })
      }
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
      currentSearchId,
      searchParams,
      jobDescriptionId
    })

    // Check if we need a job posting - show modal if not selected
    if (!jobDescriptionId) {
      console.log('[HandleSearch] No job posting selected, showing modal')
      setIsJobPostingModalOpen(true)
      return
    }

    try {
      let response: SearchResponse
      const jobIdToUse = jobDescriptionId
      const searchRequest = mapSearchParamsToRequest(searchParams, searchTitle || 'Candidate Search', jobIdToUse)

      if (currentSearchId) {
        // We have an existing search - update it (which also runs the search)
        console.log('[HandleSearch] Updating existing search:', currentSearchId)
        console.log('[HandleSearch] Update payload:', searchRequest)

        response = await updateSearchMutation.mutateAsync({
          searchId: currentSearchId,
          data: searchRequest
        })
        console.log('[HandleSearch] Update response:', response)
        setIsSearchModified(false)
      } else {
        // No existing search, create a new one
        console.log('[HandleSearch] Creating new search')
        console.log('[HandleSearch] Create payload:', searchRequest)
        response = await createSearch.mutateAsync(searchRequest)
        console.log('[HandleSearch] Create response:', response)

        // Store the search ID for later use
        setCurrentSearchId(response.search_id)
        setIsSearchModified(false)
      }

      // Update candidate yield with real results
      setCandidateYield(response.total_results)
      setTotalPopulation(response.total_results_from_search || 0)

      // Clear staging candidates - users must click "Enrich Candidates" to see actual profiles
      setStagingCandidates([])

      console.log('[HandleSearch] Search completed successfully')
      showToast('Search completed successfully!', 'success')
    } catch (error) {
      console.error('[HandleSearch] Search failed:', error)
      showToast('Search failed: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error')
      // Clear candidates on error
      setCandidateYield(0)
      setTotalPopulation(0)
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
        data: {
          ...searchRequest,
          search_id: currentSearchId
        }
      })
      setIsSearchModified(false)
      console.log('Search updated successfully')
      showToast('Search updated successfully!', 'success')
    } catch (error) {
      console.error('Failed to update search:', error)
      showToast('Failed to update search', 'error')
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
      showToast('Search saved successfully!', 'success')
    } catch (error) {
      console.error('Failed to update search:', error)
      showToast('Failed to save search', 'error')
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

      console.log('New search saved successfully:', response)
      showToast('New search saved successfully!', 'success')
    } catch (error) {
      console.error('Failed to saved new search:', error)
      showToast('Failed to saved new search', 'error')
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
      console.log('[EnrichCandidates] Updating query for search ID:', currentSearchId)
      // First, update the query with current search parameters
      const jobIdToUse = jobDescriptionId
      const searchRequest = mapSearchParamsToRequest(searchParams, searchTitle || 'Candidate Search', jobIdToUse)
      await updateQueryMutation.mutateAsync({
        searchId: currentSearchId,
        data: searchRequest
      })
      
      console.log('[EnrichCandidates] Enriching with search ID:', currentSearchId, 'limit:', enrichLimit)
      // Then enrich candidates
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
      
      // Clear approved/rejected tracking for new batch
      setApprovedCandidateIds(new Set())
      setRejectedCandidateIds(new Set())
      setProcessingCandidateId(null)
      setProcessingAction(null)

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

  const handleApprove = async (candidateId: string) => {
    if (!jobDescriptionId) return
    
    // Set loading state for this specific candidate
    setProcessingCandidateId(candidateId)
    setProcessingAction('approve')
    
    try {
      await approveCandidateMutation.mutateAsync({
        fk_job_description_id: jobDescriptionId,
        fk_candidate_id: parseInt(candidateId)
      })
      
      // Mark as approved after successful API call
      const newApproved = new Set(approvedCandidateIds)
      newApproved.add(candidateId)
      setApprovedCandidateIds(newApproved)
      
      // Remove from rejected if it was there
      const newRejected = new Set(rejectedCandidateIds)
      newRejected.delete(candidateId)
      setRejectedCandidateIds(newRejected)
    } catch (error) {
      console.error('Failed to approve candidate:', error)
    } finally {
      // Clear processing state
      setProcessingCandidateId(null)
      setProcessingAction(null)
    }
  }

  const handleReject = async (candidateId: string) => {
    if (!jobDescriptionId) return
    
    // Set loading state for this specific candidate
    setProcessingCandidateId(candidateId)
    setProcessingAction('reject')
    
    try {
      await rejectCandidateMutation.mutateAsync({
        fk_job_description_id: jobDescriptionId,
        fk_candidate_id: parseInt(candidateId)
      })
      
      // Mark as rejected after successful API call
      const newRejected = new Set(rejectedCandidateIds)
      newRejected.add(candidateId)
      setRejectedCandidateIds(newRejected)
      
      // Remove from approved if it was there
      const newApproved = new Set(approvedCandidateIds)
      newApproved.delete(candidateId)
      setApprovedCandidateIds(newApproved)
    } catch (error) {
      console.error('Failed to reject candidate:', error)
    } finally {
      // Clear processing state
      setProcessingCandidateId(null)
      setProcessingAction(null)
    }
  }

  const handleJobPostingSelected = async (jobId: number) => {
    if (setJobDescriptionId) {
      setJobDescriptionId(jobId)
      setIsJobPostingModalOpen(false)

      // Wait for next tick to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 0))

      // Now run the search with the updated jobId
      try {
        let response: SearchResponse
        const searchRequest = mapSearchParamsToRequest(searchParams, searchTitle || 'Candidate Search', jobId)

        if (currentSearchId) {
          console.log('[HandleSearch] Updating existing search:', currentSearchId)
          response = await updateSearchMutation.mutateAsync({
            searchId: currentSearchId,
            data: searchRequest
          })
          setIsSearchModified(false)
        } else {
          console.log('[HandleSearch] Creating new search')
          response = await createSearch.mutateAsync(searchRequest)
          setCurrentSearchId(response.search_id)
          setIsSearchModified(false)
        }

        setCandidateYield(response.total_results)
        setTotalPopulation(response.total_results_from_search || 0)
        setStagingCandidates([])

        console.log('[HandleSearch] Search completed successfully')
        showToast('Search completed successfully!', 'success')
      } catch (error) {
        console.error('[HandleSearch] Search failed:', error)
        showToast('Search failed: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error')
        setCandidateYield(0)
        setTotalPopulation(0)
        setStagingCandidates([])
      }
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
                      value={searchParams.graduationYearFrom ?? ''}
                      onChange={(e) => setSearchParams({ ...searchParams, graduationYearFrom: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                      min="1980"
                      max="2025"
                      placeholder="2002"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">To year</Label>
                    <Input
                      type="number"
                      value={searchParams.graduationYearTo ?? ''}
                      onChange={(e) => setSearchParams({ ...searchParams, graduationYearTo: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                      min="1980"
                      max="2025"
                      placeholder="2022"
                    />
                  </div>
                </div>
              </div>

              {/* Use Experience Fallback Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={searchParams.useExperienceFallback || false}
                  onCheckedChange={(checked) => {
                    setSearchParams({ ...searchParams, useExperienceFallback: checked })
                  }}
                />
                <Label className="text-sm">Use Maximum Experience as Fallback if No Graduation Date</Label>
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
                    <SearchableSelect
                      placeholder="Select state..."
                      options={statesData?.map(state => ({
                        label: state.state_name,
                        value: state.state_abbrev
                      })) || []}
                      value={searchParams.locationState}
                      onValueChange={(value) => setSearchParams({ ...searchParams, locationState: value, locationCity: '' })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">City</Label>
                    <SearchableSelect
                      placeholder="Select city..."
                      options={citiesData?.map((city) => ({
                        label: city.city,
                        value: city.city
                      })) || []}
                      value={searchParams.locationCity}
                      onValueChange={(value) => setSearchParams({ ...searchParams, locationCity: value })}
                      disabled={!searchParams.locationState}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Radius (miles)</Label>
                    <Input
                      type="number"
                      value={searchParams.searchRadius ?? ''}
                      onChange={(e) => setSearchParams({ ...searchParams, searchRadius: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                      min="0"
                      max="500"
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
              {/* Department Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Department</Label>
                <Select
                  value={searchParams.department}
                  onValueChange={(value) => setSearchParams({ ...searchParams, department: value })}
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Select department..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {departmentsData?.departments?.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* First Row of Experience Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Minimum number of past positions</Label>
                  <Input
                    type="number"
                    value={searchParams.numExperiences ?? ''}
                    onChange={(e) => setSearchParams({ ...searchParams, numExperiences: e.target.value === '' ? undefined : parseInt(e.target.value) })}
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
                    value={searchParams.maxExperience ?? ''}
                    onChange={(e) => setSearchParams({ ...searchParams, maxExperience: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                    min="0"
                    className="w-20"
                    placeholder="240"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Maximum months at one job</Label>
                  <Input
                    type="number"
                    value={searchParams.maxJobDuration ?? ''}
                    onChange={(e) => setSearchParams({ ...searchParams, maxJobDuration: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                    min="0"
                    className="w-20"
                    placeholder="120"
                  />
                </div>
              </div>

              {/* Second Row of Experience Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Minimum number of professional connections</Label>
                  <Input
                    type="number"
                    value={searchParams.connections ?? ''}
                    onChange={(e) => setSearchParams({ ...searchParams, connections: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                    min="0"
                    max="500"
                    className="w-20"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Minimum months of relevant experience</Label>
                  <Input
                    type="number"
                    value={searchParams.deptYears ?? ''}
                    onChange={(e) => setSearchParams({ ...searchParams, deptYears: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                    min="0"
                    className="w-20"
                    placeholder="24"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Minimum months in current role</Label>
                  <Input
                    type="number"
                    value={searchParams.timeInRole ?? ''}
                    onChange={(e) => setSearchParams({ ...searchParams, timeInRole: e.target.value === '' ? undefined : parseInt(e.target.value) })}
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
                      placeholder="Add job title (comma-separated for multiple)..."
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
                  <RemovableBadge
                    key={index}
                    label={title}
                    onRemove={() => removeJobTitle(index)}
                    variant="secondary"
                  />
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
                <SearchableMultiSelect
                  placeholder="Select industry to exclude..."
                  options={industriesData?.industries || []}
                  selectedValues={searchParams.industryExclusions}
                  onSelect={(industry) => {
                    setSearchParams({ 
                      ...searchParams, 
                      industryExclusions: [...searchParams.industryExclusions, industry] 
                    })
                  }}
                />
                {searchParams.industryExclusions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {searchParams.industryExclusions.map((industry, index) => (
                      <RemovableBadge
                        key={index}
                        label={industry}
                        onRemove={() => {
                          setSearchParams({
                            ...searchParams,
                            industryExclusions: searchParams.industryExclusions.filter((_, i) => i !== index)
                          })
                        }}
                      />
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
                      placeholder="e.g., CEO, CFO, Manager (comma-separated)..."
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
                              <RemovableBadge
                                key={index}
                                label={exclusion}
                                onRemove={() => removeTitleExclusion(index)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Profile Keyword Exclusions</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., healthcare, medical (comma-separated)..."
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
                              <RemovableBadge
                                key={index}
                                label={exclusion}
                                onRemove={() => removeKeywordExclusion(index)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                </div>
                
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Number of experiences to look for */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Number of experiences to look for</Label>
                  <Input
                    type="number"
                    value={searchParams.recency ?? ''}
                    onChange={(e) => setSearchParams({ ...searchParams, recency: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                    min="0"
                    className="w-20"
                    placeholder="3"
                  />
                </div>

                {/* Management Level Exclusions Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={searchParams.managementLevelExclusions === 'C-Level, Director, Manager, VP, Owner, Founder, President/Vice President'}
                      onCheckedChange={(checked) => {
                        const exclusions = checked
                          ? 'C-Level, Director, Manager, VP, Owner, Founder, President/Vice President'
                          : ''
                        setSearchParams({ ...searchParams, managementLevelExclusions: exclusions })
                      }}
                    />
                    <Label className="text-sm">Exclude Current or Previous Managers & Executives</Label>
                  </div>
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
                      No results yet
                    </span>
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
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5" />
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-2xl font-bold">
                        {candidateYield.toLocaleString()}
                      </span>
                      <span className="text-2xl font-bold"> new candidates found</span>
                    </div>
                    {totalPopulation > 0 && (
                      <span className="text-sm text-gray-500">
                        (Total Population: {totalPopulation.toLocaleString()})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 min-w-[140px]"
                        disabled={updateSearchMutation.isPending}
                      >
                        <Save className="h-4 w-4" />
                        Save Search
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-36 p-0">
                      <div className="py-1">
                        <button
                          className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors"
                          onClick={() => setIsSaveNewDialogOpen(true)}
                          disabled={updateSearchMutation.isPending}
                        >
                          Save New
                        </button>
                        <button
                          className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleUpdateSearch}
                          disabled={updateSearchMutation.isPending}
                        >
                          <span className="flex items-center gap-2">
                            {updateSearchMutation.isPending && (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            )}
                            <span className="flex-1">
                              {updateSearchMutation.isPending ? 'Updating...' : 'Update Existing'}
                            </span>
                          </span>
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    className="flex items-center gap-2"
                    onClick={handleSearch}
                    disabled={createSearch.isPending || updateSearchMutation.isPending}
                  >
                    {(createSearch.isPending || updateSearchMutation.isPending) ? (
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
                {stagingCandidates.map((candidate) => (
                  <CandidateListItem
                    key={candidate.id}
                    candidate={candidate}
                    onClick={handleCandidateClick}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    showActions={true}
                    isApproved={approvedCandidateIds.has(candidate.id)}
                    isRejected={rejectedCandidateIds.has(candidate.id)}
                    processingCandidateId={processingCandidateId}
                    processingAction={processingAction}
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
                  disabled={stagingCandidates.length === 0}
                >
                  <Send className="h-4 w-4" />
                  Send {stagingCandidates.length > 0 ? stagingCandidates.length : 'All'} to Review
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

      {/* Job Posting Required Modal */}
      <JobPostingRequiredModal
        open={isJobPostingModalOpen}
        onOpenChange={setIsJobPostingModalOpen}
        onJobSelected={handleJobPostingSelected}
      />
    </div>
  )
}
