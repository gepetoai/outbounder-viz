'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Building2
} from 'lucide-react'

// Import our refactored components
import { JobPostingManager, type JobPosting } from '@/components/recruiter/JobPostingManager'
import { SearchTab, type SearchParams, type Candidate } from '@/components/recruiter/SearchTab'
import { CandidateTab } from '@/components/recruiter/CandidateTab'
import { OutreachTab } from '@/components/recruiter/OutreachTab'

export default function HomePage() {
  // Main app navigation
  const [activeApp, setActiveApp] = useState('outbounder')
  const [activeTab, setActiveTab] = useState('leads')
  const [activeSubTab, setActiveSubTab] = useState('upload')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [leadsExpanded, setLeadsExpanded] = useState(true)
  const [sequencerExpanded, setSequencerExpanded] = useState(false)
  const [messagingExpanded, setMessagingExpanded] = useState(false)
  
  // Recruiter specific state
  const [recruiterTab, setRecruiterTab] = useState('job-setup')
  const [researcherTab, setResearcherTab] = useState('finder')
  
  // Job postings state
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  
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
    connections: { min: 0, max: 500 }
  })
  
  // Candidate state
  const [candidateYield, setCandidateYield] = useState(0)
  const [stagingCandidates, setStagingCandidates] = useState<Candidate[]>([])
  const [approvedCandidates, setApprovedCandidates] = useState<string[]>([])
  const [rejectedCandidates, setRejectedCandidates] = useState<string[]>([])

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
    { id: 'job-setup', label: 'Job Setup', icon: Settings, subItems: [] },
    { id: 'search', label: 'Search', icon: Search, subItems: [] },
    { id: 'candidates', label: 'Candidates', icon: Users, subItems: [] },
    { id: 'outreach', label: 'Outreach', icon: MessageSquare, subItems: [] }
  ]

  // Researcher tabs
  const researcherTabs = [
    { id: 'finder', label: 'Finder', icon: Search, subItems: [] },
    { id: 'enricher', label: 'Enricher', icon: Zap, subItems: [] },
    { id: 'lists', label: 'Lists', icon: Users, subItems: [] }
  ]

  const handleSearchClick = (jobId: string) => {
    setRecruiterTab('search')
  }

  const handleGoToReview = () => {
    setRecruiterTab('candidates')
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
            jobPostings={jobPostings}
            setJobPostings={setJobPostings}
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
            stagingCandidates={stagingCandidates}
            setStagingCandidates={setStagingCandidates}
            approvedCandidates={approvedCandidates}
            setApprovedCandidates={setApprovedCandidates}
            rejectedCandidates={rejectedCandidates}
            setRejectedCandidates={setRejectedCandidates}
          />
        )
      case 'candidates':
        return (
          <CandidateTab
            candidateYield={candidateYield}
            stagingCandidates={stagingCandidates}
            setStagingCandidates={setStagingCandidates}
            approvedCandidates={approvedCandidates}
            setApprovedCandidates={setApprovedCandidates}
            rejectedCandidates={rejectedCandidates}
            setRejectedCandidates={setRejectedCandidates}
            onGoToReview={handleGoToReview}
          />
        )
      case 'outreach':
        return (
          <OutreachTab
            approvedCandidates={approvedCandidates}
            setApprovedCandidates={setApprovedCandidates}
            rejectedCandidates={rejectedCandidates}
            setRejectedCandidates={setRejectedCandidates}
            stagingCandidates={stagingCandidates}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Main App Sidebar */}
      <div className="w-16 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border min-h-[72px] flex items-center justify-center">
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
                className="w-full"
                onClick={() => setActiveApp(app.id)}
              >
                <Icon className="h-5 w-5" />
              </Button>
            )
          })}
        </nav>
      </div>

      {/* Outbounder/Inbounder/Recruiter/Researcher Sidebar - Only show when these apps are active */}
      {(activeApp === 'outbounder' || activeApp === 'inbounder' || activeApp === 'recruiter' || activeApp === 'researcher') && (
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-card border-r border-border flex flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-border min-h-[72px] flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-foreground">
                {activeApp === 'outbounder' ? 'Outbounder' : activeApp === 'inbounder' ? 'Inbounder' : activeApp === 'researcher' ? 'Researcher' : 'Recruiter'}
              </h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-auto"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-2">
            {(activeApp === 'recruiter' ? recruiterTabs : activeApp === 'researcher' ? researcherTabs : tabs).map((tab) => {
              const Icon = tab.icon
              const isLeadsTab = tab.id === 'leads'
              const isSequencerTab = tab.id === 'sequencer'
              const isMessagingTab = tab.id === 'messaging'
              const hasSubItems = tab.subItems && tab.subItems.length > 0
              
              return (
                <div key={tab.id} className="space-y-1">
                  <Button
                    variant={activeApp === 'recruiter' ? (recruiterTab === tab.id ? 'default' : 'ghost') : activeApp === 'researcher' ? (researcherTab === tab.id ? 'default' : 'ghost') : (activeTab === tab.id ? 'default' : 'ghost')}
                    size={sidebarOpen ? 'default' : 'icon'}
                    className={`w-full justify-start ${sidebarOpen ? 'px-3' : 'px-2'}`}
                    onClick={() => {
                      if (activeApp === 'recruiter') {
                        setRecruiterTab(tab.id)
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
                    <Icon className="h-4 w-4" />
                    {sidebarOpen && (
                      <>
                        <span className="ml-2">{tab.label}</span>
                        {hasSubItems && (
                          <ChevronDown 
                            className={`h-4 w-4 ml-auto transition-transform duration-200 ${
                              (isLeadsTab && leadsExpanded) || (isSequencerTab && sequencerExpanded) || (isMessagingTab && messagingExpanded) ? 'rotate-180' : ''
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
                              className="w-full justify-start px-3"
                              onClick={() => setActiveSubTab(subItem.id)}
                            >
                              <SubIcon className="h-4 w-4" />
                              <span className="ml-2">{subItem.label}</span>
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
                              className="w-full justify-start px-3"
                              onClick={() => setActiveSubTab(subItem.id)}
                            >
                              <SubIcon className="h-4 w-4" />
                              <span className="ml-2">{subItem.label}</span>
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
                              className="w-full justify-start px-3"
                              onClick={() => setActiveSubTab(subItem.id)}
                            >
                              <SubIcon className="h-4 w-4" />
                              <span className="ml-2">{subItem.label}</span>
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
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">
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
          
          {renderMainContent()}
        </main>
      </div>
    </div>
  )
}