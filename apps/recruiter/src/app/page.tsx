'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  MessageSquare, 
  Settings,
  Menu,
  X,
  Search,
  User,
  ChevronDown,
  Briefcase
} from 'lucide-react'

// Import our refactored components
import { JobPostingManager } from '@/components/recruiter/JobPostingManager'
import { SearchTab, type SearchParams } from '@/components/recruiter/SearchTab'
import { CandidateTab } from '@/components/recruiter/CandidateTab'
import { SequencerTab } from '@/components/recruiter/SequencerTab'
import { AnalyticsTab } from '@/components/recruiter/AnalyticsTab'
import { ApprovedRejectedCarousel } from '@/components/recruiter/ApprovedRejectedCarousel'
import { SettingsTab } from '@/components/recruiter/SettingsTab'
import { AuthWrapper } from '@/components/auth/auth-wrapper'
import { useJobPostings } from '@/hooks/useJobPostings'
import { useSavedSearches } from '@/hooks/useSearch'
import { mapSavedSearchToParams } from '@/lib/search-api'
import type { Candidate } from '@/lib/utils'

export default function RecruiterApp () {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [outreachExpanded, setOutreachExpanded] = useState(false)
  
  // Recruiter specific state
  const [recruiterTab, setRecruiterTab] = useState('job-setup')
  const [recruiterSubTab, setRecruiterSubTab] = useState('candidates')
  const [currentJobDescriptionId, setCurrentJobDescriptionId] = useState<number | null>(null)
  const [selectedSavedSearchId, setSelectedSavedSearchId] = useState<string>('')
  const [currentSearchId, setCurrentSearchId] = useState<number | null>(null)
  const [searchTitle, setSearchTitle] = useState('')
  const [isSearchModified, setIsSearchModified] = useState(false)
  
  // Hooks for job postings and saved searches
  const { data: jobPostings, isLoading: isLoadingJobPostings } = useJobPostings()
  const { data: savedSearches, isLoading: isLoadingSavedSearches } = useSavedSearches(currentJobDescriptionId || 0)

  // Handle loading saved search
  const handleLoadSavedSearch = (searchId: string) => {
    if (searchId === 'clear-selection') {
      setSelectedSavedSearchId('')
      setSearchTitle('')
      setCurrentSearchId(null)
      setIsSearchModified(false)
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
        department: 'none',
        deptYears: 2,
        managementLevelExclusions: '',
        recency: 0,
        timeInRole: 6,
        locationCity: '',
        locationState: '',
        searchRadius: 25,
        includeWorkLocation: false,
        industryExclusions: [],
        titleExclusions: [],
        keywordExclusions: [],
        companyExclusions: '',
        maxJobDuration: 5
      })
      return
    }

    const savedSearch = savedSearches?.find(s => s.id.toString() === searchId)
    if (!savedSearch) return

    const mappedParams = mapSavedSearchToParams(savedSearch)

    setSelectedSavedSearchId(searchId)
    setCurrentSearchId(savedSearch.id)
    setSearchTitle(savedSearch.search_title)
    setIsSearchModified(false)

    setSearchParams(mappedParams)
  }

  // Search state
  const [searchParams, setSearchParams] = useState<SearchParams>({
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
    department: 'none',
    deptYears: 2,
    managementLevelExclusions: '',
    recency: 1,
    timeInRole: 6,
    locationCity: '',
    locationState: '',
    searchRadius: 25,
    includeWorkLocation: false,
    industryExclusions: [],
    titleExclusions: [],
    keywordExclusions: [],
    companyExclusions: '',
    maxJobDuration: 5
  })
  
  // Candidate state
  const [candidateYield, setCandidateYield] = useState(0)
  const [totalPopulation, setTotalPopulation] = useState(0)
  const [stagingCandidates, setStagingCandidates] = useState<Candidate[]>([])
  const [approvedCandidatesData, setApprovedCandidatesData] = useState<Candidate[]>([])
  const [rejectedCandidatesData, setRejectedCandidatesData] = useState<Candidate[]>([])

  // Recruiter tabs
  const recruiterTabs = [
    { id: 'job-setup', label: 'Jobs', icon: Briefcase, subItems: [] },
    { id: 'search', label: 'Search', icon: Search, subItems: [] },
    { id: 'candidates', label: 'Candidates', icon: Users, subItems: [] },
    { 
      id: 'outreach', 
      label: 'Outreach', 
      icon: MessageSquare, 
      subItems: [
        { id: 'candidates', label: 'List', icon: Users }
      ]
    },
    { id: 'settings', label: 'Settings', icon: Settings, subItems: [] }
  ]

  const handleSearchClick = (jobId: number) => {
    setCurrentJobDescriptionId(jobId)
    setRecruiterTab('search')
  }

  const renderRecruiterContent = () => {
    switch (recruiterTab) {
      case 'job-setup':
        return (
          <JobPostingManager
            onSearchClick={handleSearchClick}
          />
        )
      case 'search':
        return (
          <SearchTab
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            candidateYield={candidateYield}
            setCandidateYield={setCandidateYield}
            totalPopulation={totalPopulation}
            setTotalPopulation={setTotalPopulation}
            stagingCandidates={stagingCandidates}
            setStagingCandidates={setStagingCandidates}
            onGoToCandidates={() => setRecruiterTab('candidates')}
            jobDescriptionId={currentJobDescriptionId}
            currentSearchId={currentSearchId}
            setCurrentSearchId={setCurrentSearchId}
            searchTitle={searchTitle}
            setSearchTitle={setSearchTitle}
            isSearchModified={isSearchModified}
            setIsSearchModified={setIsSearchModified}
          />
        )
      case 'candidates':
        return (
          <CandidateTab
            jobDescriptionId={currentJobDescriptionId}
          />
        )
      case 'outreach':
        switch (recruiterSubTab) {
          case 'candidates':
            return (
              <ApprovedRejectedCarousel
                approvedCandidatesData={approvedCandidatesData.map(candidate => ({ ...candidate, status: 'approved' as const }))}
                rejectedCandidatesData={rejectedCandidatesData.map(candidate => ({ ...candidate, status: 'rejected' as const }))}
                setApprovedCandidatesData={(candidates) => setApprovedCandidatesData(candidates.map(candidate => ({ ...candidate, status: undefined })))}
                setRejectedCandidatesData={(candidates) => setRejectedCandidatesData(candidates.map(candidate => ({ ...candidate, status: undefined })))}
              />
            )
          case 'analytics':
            return <AnalyticsTab />
          case 'sequencer':
            return <SequencerTab />
          default:
            return null
        }
      case 'settings':
        return <SettingsTab />
      default:
        return null
    }
  }

  return (
    <AuthWrapper>
      <div className="flex h-screen bg-background">
        {/* Recruiter Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-12'} transition-all duration-300 bg-card border-r border-border flex flex-col`}>
          {/* Header */}
          <div className={`${sidebarOpen ? 'p-4' : 'p-2'} border-b border-border min-h-[72px] flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-foreground">Recruiter</h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={sidebarOpen ? 'ml-auto' : ''}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 ${sidebarOpen ? 'p-2 space-y-2' : 'p-2 space-y-2'}`}>
            {recruiterTabs.map((tab) => {
              const Icon = tab.icon
              const isOutreachTab = tab.id === 'outreach'
              const hasSubItems = tab.subItems && tab.subItems.length > 0
              
              return (
                <div key={tab.id} className="space-y-1">
                  <Button
                    variant={recruiterTab === tab.id ? 'default' : 'ghost'}
                    size={sidebarOpen ? 'default' : 'icon'}
                    className={`w-full h-9 flex items-center ${sidebarOpen ? 'justify-start px-3' : 'justify-center px-2'}`}
                    onClick={() => {
                      setRecruiterTab(tab.id)
                      if (isOutreachTab) {
                        setRecruiterSubTab('candidates')
                        setOutreachExpanded(true)
                      } else {
                        setOutreachExpanded(false)
                      }
                    }}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="ml-2 flex items-center">{tab.label}</span>
                        {hasSubItems && (
                          <ChevronDown 
                            className={`h-4 w-4 ml-auto flex-shrink-0 transition-transform duration-200 ${
                              (isOutreachTab && outreachExpanded) ? 'rotate-180' : ''
                            }`} 
                          />
                        )}
                      </>
                    )}
                  </Button>
                  
                  {/* Sub-items for outreach with animation */}
                  {recruiterTab === 'outreach' && isOutreachTab && tab.subItems && sidebarOpen && (
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        outreachExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="ml-6 space-y-1">
                        {tab.subItems.map((subItem) => {
                          const SubIcon = subItem.icon
                          return (
                            <Button
                              key={subItem.id}
                              variant={recruiterSubTab === subItem.id ? 'secondary' : 'ghost'}
                              size="default"
                              className="w-full justify-start px-3 flex items-center h-9"
                              onClick={() => setRecruiterSubTab(subItem.id)}
                            >
                              <SubIcon className="h-4 w-4 flex-shrink-0" />
                              <span className="ml-2 flex items-center">{subItem.label}</span>
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* User Button */}
          <div className="p-2 border-t border-border">
            <div className="flex items-center gap-2 p-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {recruiterTabs.find(tab => tab.id === recruiterTab)?.label}
                </h1>
              </div>
              
              {/* Job Posting and Saved Search Selects - Only show for search tab */}
              {recruiterTab === 'search' && (
                <div className="flex items-start gap-3">
                  <div className="w-64 min-w-64">
                    <div className="space-y-1">
                      <Select value={currentJobDescriptionId?.toString() ?? ''} onValueChange={(value) => {
                        if (value === 'clear-job-selection') {
                          setCurrentJobDescriptionId(null)
                        } else {
                          setCurrentJobDescriptionId(parseInt(value))
                        }
                      }}>
                        <SelectTrigger className={`w-full ${!currentJobDescriptionId ? 'border-red-300 focus:border-red-500' : ''}`}>
                          <SelectValue placeholder="Select job posting..." />
                        </SelectTrigger>
                        <SelectContent>
                          {currentJobDescriptionId && (
                            <SelectItem value="clear-job-selection">
                              <span className="text-muted-foreground italic">Clear selection</span>
                            </SelectItem>
                          )}
                          {isLoadingJobPostings ? (
                            <SelectItem value="loading-jobs" disabled>
                              Loading jobs...
                            </SelectItem>
                          ) : jobPostings && jobPostings.length > 0 ? (
                            jobPostings.map((job) => (
                              <SelectItem key={job.id} value={job.id.toString()}>
                                {job.title}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-jobs-available" disabled>
                              No job postings available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <div className="h-5">
                        {!currentJobDescriptionId && (
                          <p className="text-xs text-red-600">
                            Please select a job posting to continue
                          </p>
                        )}
                      </div>
                    </div>
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
                </div>
              )}
            </div>
            
            {renderRecruiterContent()}
          </main>
        </div>
      </div>
    </AuthWrapper>
  )
}

