'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users,
  Play,
  MessageSquare,
  BarChart3,
  Settings,
  Menu,
  X,
  Search,
  User,
  Globe,
  Zap,
  ChevronDown,
  Briefcase,
  Plus
} from 'lucide-react'

// Import our refactored components
import { JobPostingManager } from '@/components/recruiter/JobPostingManager'
import { SearchTab, type SearchParams } from '@/components/recruiter/SearchTab'
import { CandidateTab } from '@/components/recruiter/CandidateTab'
import { SequencerTab } from '@/components/recruiter/SequencerTab'
import { AnalyticsTab } from '@/components/recruiter/AnalyticsTab'
import { ApprovedRejectedCarousel } from '@/components/recruiter/ApprovedRejectedCarousel'
import { SettingsTab } from '@/components/recruiter/SettingsTab'
import { JobPostingRequiredModal } from '@/components/recruiter/JobPostingRequiredModal'
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { UserButton } from '@clerk/nextjs';
import { useJobPostings } from '@/hooks/useJobPostings'
import { useSavedSearches } from '@/hooks/useSearch'
import { mapSavedSearchToParams } from '@/lib/search-api'
import type { Candidate } from '@/lib/utils'

export default function HomePage() {
  // Main app navigation
  const [activeApp, setActiveApp] = useState('outbounder')
  const [activeTab, setActiveTab] = useState('leads')
  const [activeSubTab, setActiveSubTab] = useState('upload')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [leadsExpanded, setLeadsExpanded] = useState(true)
  const [sequencerExpanded, setSequencerExpanded] = useState(false)
  const [messagingExpanded, setMessagingExpanded] = useState(false)
  const [outreachExpanded, setOutreachExpanded] = useState(false)
  
  // Recruiter specific state
  const [recruiterTab, setRecruiterTab] = useState('job-setup')
  const [recruiterSubTab, setRecruiterSubTab] = useState('candidates')
  const [researcherTab, setResearcherTab] = useState('finder')
  const [currentJobDescriptionId, setCurrentJobDescriptionId] = useState<number | null>(null)
  const [selectedSavedSearchId, setSelectedSavedSearchId] = useState<string>('')
  const [currentSearchId, setCurrentSearchId] = useState<number | null>(null)
  const [searchTitle, setSearchTitle] = useState('')
  const [isSearchModified, setIsSearchModified] = useState(false)
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false)

  // Reset search state when job description changes (role switch)
  useEffect(() => {
    setCurrentSearchId(null)
    setSelectedSavedSearchId('')
    setSearchTitle('')
    setIsSearchModified(false)
  }, [currentJobDescriptionId])

  // Job postings state removed - now handled by React Query
  
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
        maxJobDuration: 5,
        useExperienceFallback: false
      })
      return
    }

    const savedSearch = savedSearches?.find(s => s.id.toString() === searchId)
    if (!savedSearch) return

    const mappedParams = mapSavedSearchToParams(savedSearch)

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

    // Set the search parameters
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
    // New fields from UnifiedSearchForm
    numExperiences: 0,
    graduationYearFrom: 0,
    graduationYearTo: 0,
    maxExperience: 0,
    department: 'none',
    deptYears: 0,
    managementLevelExclusions: '',
    recency: 0,
    timeInRole: 0,
    locationCity: '',
    locationState: '',
    searchRadius: 0,
    includeWorkLocation: false,
    industryExclusions: [],
    titleExclusions: [],
    keywordExclusions: [],
    companyExclusions: '',
    maxJobDuration: 0,
    useExperienceFallback: false
  })
  
  // Candidate state
  const [candidateYield, setCandidateYield] = useState(0)
  const [totalPopulation, setTotalPopulation] = useState(0)
  const [stagingCandidates, setStagingCandidates] = useState<Candidate[]>([])
  const [approvedCandidates, setApprovedCandidates] = useState<string[]>([])
  const [rejectedCandidates, setRejectedCandidates] = useState<string[]>([])
  const [reviewCandidates, setReviewCandidates] = useState<Candidate[]>([])
  const [approvedCandidatesData, setApprovedCandidatesData] = useState<Candidate[]>([])
  const [rejectedCandidatesData, setRejectedCandidatesData] = useState<Candidate[]>([])
  
  // Outreach metrics state - removed unused variables

  // Applications configuration
  const applications = [
    { 
      id: 'outbounder', 
      label: 'Outbounder', 
      icon: MessageSquare, 
      description: 'Outbound sales automation',
      color: 'blue'
    },
    { 
      id: 'inbounder', 
      label: 'Inbounder', 
      icon: Globe,
      description: 'Lead capture and qualification',
      color: 'green'
    },
    { 
      id: 'researcher', 
      label: 'Researcher', 
      icon: Search,
      description: 'Lead research and enrichment',
      color: 'purple'
    },
    { 
      id: 'recruiter', 
      label: 'Recruiter', 
      icon: User,
      description: 'Talent acquisition tools',
      color: 'orange'
    }
  ]

  // Navigation tabs for outbounder/inbounder
  const tabs = [
    { 
      id: 'leads', 
      label: 'Leads', 
      icon: Users, 
      subItems: [
        { id: 'upload', label: 'Upload', icon: Settings },
        { id: 'manage', label: 'Manage', icon: Users }
      ]
    },
    { 
      id: 'sequencer', 
      label: 'Sequencer', 
      icon: Play, 
      subItems: [
        { id: 'email', label: 'Email', icon: MessageSquare },
        { id: 'linkedin', label: 'LinkedIn', icon: MessageSquare },
        { id: 'phone', label: 'Phone', icon: MessageSquare }
      ]
    },
    { 
      id: 'messaging', 
      label: 'Messaging', 
      icon: MessageSquare, 
      subItems: [
        { id: 'email', label: 'Email', icon: MessageSquare },
        { id: 'linkedin', label: 'LinkedIn', icon: MessageSquare },
        { id: 'phone', label: 'Phone', icon: MessageSquare }
      ]
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, subItems: [] }
  ]

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
        { id: 'candidates', label: 'List', icon: Users },
        // { id: 'sequencer', label: 'Sequencer', icon: Play },
        // { id: 'analytics', label: 'Analytics', icon: BarChart3 }
      ]
    },
    { id: 'settings', label: 'Settings', icon: Settings, subItems: [] }
  ]

  // Researcher tabs
  const researcherTabs = [
    { id: 'finder', label: 'Finder', icon: Search, subItems: [] },
    { id: 'enricher', label: 'Enricher', icon: Zap, subItems: [] },
    { id: 'lists', label: 'Lists', icon: Users, subItems: [] }
  ]

  const handleSearchClick = (jobId: number) => {
    setCurrentJobDescriptionId(jobId)
    setRecruiterTab('search')
  }


  const renderMainContent = () => {
    switch (activeApp) {
      case 'outbounder':
        return renderOutbounderContent()
      case 'inbounder':
        return renderOutbounderContent()
      case 'researcher':
        return renderResearcherContent()
      case 'recruiter':
        return renderRecruiterContent()
      default:
        return null
    }
  }

  const renderOutbounderContent = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Outbounder Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is the outbounder/inbounder content area. The full functionality would be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderResearcherContent = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Researcher Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is the researcher content area. The full functionality would be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    )
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
            setJobDescriptionId={setCurrentJobDescriptionId}
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
      case 'analytics':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Analytics content will be implemented here.</p>
              </CardContent>
            </Card>
          </div>
        )
      case 'sequencer':
        return <SequencerTab />
      case 'settings':
        return <SettingsTab />
      default:
        return null
    }
  }

  return (
    <AuthWrapper>
    <div className="flex h-screen bg-background">
      {/* Main App Sidebar */}
      <div className="w-12 bg-card border-r border-border flex flex-col">
        <div className="p-2 border-b border-border min-h-[72px] flex items-center justify-center">
          <h1 className="text-xl font-bold text-foreground">248</h1>
        </div>

        {/* Applications Navigation */}
        <nav className="flex-1 p-2 space-y-2">
          {applications.map((app) => {
            const Icon = app.icon
            return (
              <Button
                key={app.id}
                variant={activeApp === app.id ? 'default' : 'ghost'}
                size="icon"
                className="w-full h-9 flex items-center justify-center"
                onClick={() => setActiveApp(app.id)}
              >
                <Icon className="h-4 w-4" />
              </Button>
            )
          })}
        </nav>
      </div>

      {/* Outbounder/Inbounder/Recruiter/Researcher Sidebar - Only show when these apps are active */}
      {(activeApp === 'outbounder' || activeApp === 'inbounder' || activeApp === 'recruiter' || activeApp === 'researcher') && (
        <div className={`${sidebarOpen ? 'w-64' : 'w-12'} transition-all duration-300 bg-card border-r border-border flex flex-col`}>
          {/* Header */}
          <div className={`${sidebarOpen ? 'p-4' : 'p-2'} border-b border-border min-h-[72px] flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-foreground">
                {activeApp === 'outbounder' ? 'Outbounder' : activeApp === 'inbounder' ? 'Inbounder' : activeApp === 'researcher' ? 'Researcher' : 'Recruiter'}
              </h1>
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
            {(activeApp === 'recruiter' ? recruiterTabs : activeApp === 'researcher' ? researcherTabs : tabs).map((tab) => {
              const Icon = tab.icon
              const isLeadsTab = tab.id === 'leads'
              const isSequencerTab = tab.id === 'sequencer'
              const isMessagingTab = tab.id === 'messaging'
              const isOutreachTab = tab.id === 'outreach'
              const hasSubItems = tab.subItems && tab.subItems.length > 0
              
              return (
                <div key={tab.id} className="space-y-1">
                  <Button
                    variant={activeApp === 'recruiter' ? (recruiterTab === tab.id ? 'default' : 'ghost') : activeApp === 'researcher' ? (researcherTab === tab.id ? 'default' : 'ghost') : (activeTab === tab.id ? 'default' : 'ghost')}
                    size={sidebarOpen ? 'default' : 'icon'}
                    className={`w-full h-9 flex items-center ${sidebarOpen ? 'justify-start px-3' : 'justify-center px-2'}`}
                    onClick={() => {
                      if (activeApp === 'recruiter') {
                        setRecruiterTab(tab.id)
                        if (isOutreachTab) {
                          setRecruiterSubTab('candidates')
                          setOutreachExpanded(true)
                        } else {
                          setOutreachExpanded(false)
                        }
                      } else if (activeApp === 'researcher') {
                        setResearcherTab(tab.id)
                      } else {
                        setActiveTab(tab.id)
                        if (isLeadsTab) {
                          setActiveSubTab('upload')
                          setLeadsExpanded(!leadsExpanded)
                        } else if (isSequencerTab) {
                          setActiveSubTab('email')
                          setSequencerExpanded(!sequencerExpanded)
                        } else if (isMessagingTab) {
                          setActiveSubTab('email')
                          setMessagingExpanded(!messagingExpanded)
                        }
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
                              (isLeadsTab && leadsExpanded) || (isSequencerTab && sequencerExpanded) || (isMessagingTab && messagingExpanded) || (isOutreachTab && outreachExpanded) ? 'rotate-180' : ''
                            }`} 
                          />
                        )}
                      </>
                    )}
                  </Button>
                  
                  {/* Sub-items for leads with animation */}
                  {activeTab === 'leads' && isLeadsTab && tab.subItems && sidebarOpen && (
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        leadsExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="ml-6 space-y-1">
                        {tab.subItems.map((subItem) => {
                          const SubIcon = subItem.icon
                          return (
                            <Button
                              key={subItem.id}
                              variant={activeSubTab === subItem.id ? 'secondary' : 'ghost'}
                              size="default"
                              className="w-full justify-start px-3 flex items-center h-9"
                              onClick={() => setActiveSubTab(subItem.id)}
                            >
                              <SubIcon className="h-4 w-4 flex-shrink-0" />
                              <span className="ml-2 flex items-center">{subItem.label}</span>
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sub-items for sequencer with animation */}
                  {activeTab === 'sequencer' && isSequencerTab && tab.subItems && sidebarOpen && (
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        sequencerExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="ml-6 space-y-1">
                        {tab.subItems.map((subItem) => {
                          const SubIcon = subItem.icon
                          return (
                            <Button
                              key={subItem.id}
                              variant={activeSubTab === subItem.id ? 'secondary' : 'ghost'}
                              size="default"
                              className="w-full justify-start px-3 flex items-center h-9"
                              onClick={() => setActiveSubTab(subItem.id)}
                            >
                              <SubIcon className="h-4 w-4 flex-shrink-0" />
                              <span className="ml-2 flex items-center">{subItem.label}</span>
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sub-items for messaging with animation */}
                  {activeTab === 'messaging' && isMessagingTab && tab.subItems && sidebarOpen && (
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        messagingExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="ml-6 space-y-1">
                        {tab.subItems.map((subItem) => {
                          const SubIcon = subItem.icon
                          return (
                            <Button
                              key={subItem.id}
                              variant={activeSubTab === subItem.id ? 'secondary' : 'ghost'}
                              size="default"
                              className="w-full justify-start px-3 flex items-center h-9"
                              onClick={() => setActiveSubTab(subItem.id)}
                            >
                              <SubIcon className="h-4 w-4 flex-shrink-0" />
                              <span className="ml-2 flex items-center">{subItem.label}</span>
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  )}

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
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {(activeApp === 'outbounder' || activeApp === 'inbounder')
                  ? tabs.find(tab => tab.id === activeTab)?.label
                  : activeApp === 'recruiter'
                  ? recruiterTabs.find(tab => tab.id === recruiterTab)?.label
                  : activeApp === 'researcher'
                  ? researcherTabs.find(tab => tab.id === researcherTab)?.label
                  : applications.find(app => app.id === activeApp)?.label
                }
              </h1>
              {activeApp !== 'outbounder' && activeApp !== 'inbounder' && activeApp !== 'recruiter' && activeApp !== 'researcher' && (
                <p className="text-muted-foreground mt-2 text-lg">
                  {applications.find(app => app.id === activeApp)?.description}
                </p>
              )}
            </div>
            
            {/* Job Posting and Saved Search Selects - Only show for recruiter search tab */}
            {activeApp === 'recruiter' && recruiterTab === 'search' && (
              <div className="flex items-start gap-3">
                <div className="w-64 min-w-64">
                  <div className="space-y-1">
                    <Select value={currentJobDescriptionId?.toString() ?? ''} onValueChange={(value) => {
                      if (value === 'clear-job-selection') {
                        setCurrentJobDescriptionId(null)
                      } else if (value === 'create-new-job') {
                        setIsCreateJobModalOpen(true)
                      } else {
                        setCurrentJobDescriptionId(parseInt(value))
                      }
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select job posting..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="create-new-job">
                          <span className="flex items-center gap-2 text-primary font-medium">
                            <Plus className="h-4 w-4" />
                            Create Job Posting
                          </span>
                        </SelectItem>
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
          
          {renderMainContent()}
        </main>
      </div>
    </div>

    {/* Job Posting Creation Modal */}
    <JobPostingRequiredModal
      open={isCreateJobModalOpen}
      onOpenChange={setIsCreateJobModalOpen}
      onJobSelected={(jobId) => {
        setCurrentJobDescriptionId(jobId)
      }}
      initialView="create"
    />
    </AuthWrapper>
  )
}