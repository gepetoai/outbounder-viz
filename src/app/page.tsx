'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
  Database,
  Upload,
  Sparkles,
  ExternalLink,
  Folder,
  FolderOpen,
  ChevronRight,
  Home,
  Plus,
  Table as TableIcon,
  MoreVertical
} from 'lucide-react'

// Import our refactored components
import { JobPostingManager } from '@/components/recruiter/JobPostingManager'
import { SearchTab, type SearchParams } from '@/components/recruiter/SearchTab'
import { CandidateTab } from '@/components/recruiter/CandidateTab'
import { SequencerTab } from '@/components/recruiter/SequencerTab'
import { AnalyticsTab } from '@/components/recruiter/AnalyticsTab'
import { ApprovedRejectedCarousel } from '@/components/recruiter/ApprovedRejectedCarousel'
import { SettingsTab } from '@/components/recruiter/SettingsTab'
import { AuthWrapper } from '@/components/auth/auth-wrapper';
// import { UserButton } from '@clerk/nextjs'; // Temporarily disabled for mock data testing
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

  // Researcher Finder state
  const [finderSource, setFinderSource] = useState<'crm' | 'upload' | 'generate'>('crm')
  const [finderCrmQuery, setFinderCrmQuery] = useState('')
  const [finderGenerateQuery, setFinderGenerateQuery] = useState('')
  const [finderLeads, setFinderLeads] = useState<Array<{ id: number; name: string; url: string }>>([])
  const [isGeneratingLeads, setIsGeneratingLeads] = useState(false)

  // Researcher Lists state
  const [currentPath, setCurrentPath] = useState<string[]>([])
  const [folderStructure, setFolderStructure] = useState<any>({
    folders: [
      { 
        id: 1, 
        name: 'Manufacturing Companies in Texas', 
        folders: [
          { id: 4, name: 'Automotive', folders: [], tables: [] },
          { id: 5, name: 'Aerospace & Defense', folders: [], tables: [] }
        ], 
        tables: [
          { id: 1, name: 'Houston Manufacturing Plants', rows: 45 }
        ] 
      },
      { 
        id: 2, 
        name: 'Grocery Stores in Austin', 
        folders: [], 
        tables: [
          { id: 2, name: 'HEB Locations', rows: 12 },
          { id: 3, name: 'Whole Foods', rows: 8 }
        ] 
      },
      { 
        id: 3, 
        name: 'SaaS Companies in San Francisco', 
        folders: [], 
        tables: [
          { id: 4, name: 'Series A Startups', rows: 67 }
        ] 
      }
    ],
    tables: [
      { id: 5, name: 'Uncategorized Leads', rows: 23 }
    ]
  })
  const [newFolderName, setNewFolderName] = useState('')
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)

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
        maxJobDuration: 5
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
    switch (researcherTab) {
      case 'finder':
        return renderFinderContent()
      case 'lists':
        return renderListsContent()
      default:
        return null
    }
  }

  const renderFinderContent = () => {
    const handleGenerate = () => {
      setIsGeneratingLeads(true)
      
      // Mock lead generation
      setTimeout(() => {
        const mockLeads = [
          { id: 1, name: 'Acme Corp', url: 'https://acmecorp.com' },
          { id: 2, name: 'TechStart Inc', url: 'https://techstart.io' },
          { id: 3, name: 'John Smith', url: 'https://linkedin.com/in/johnsmith' },
          { id: 4, name: 'Sarah Johnson', url: 'https://linkedin.com/in/sarahjohnson' },
          { id: 5, name: 'Global Solutions LLC', url: 'https://globalsolutions.com' }
        ]
        setFinderLeads(mockLeads)
        setIsGeneratingLeads(false)
      }, 1500)
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        setIsGeneratingLeads(true)
        // Mock file processing
        setTimeout(() => {
          const mockLeads = [
            { id: 1, name: 'Uploaded Lead 1', url: 'https://company1.com' },
            { id: 2, name: 'Uploaded Lead 2', url: 'https://linkedin.com/in/lead2' },
            { id: 3, name: 'Uploaded Lead 3', url: 'https://company2.com' }
          ]
          setFinderLeads(mockLeads)
          setIsGeneratingLeads(false)
        }, 1000)
      }
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Finder</CardTitle>
            <CardDescription>
              Create a starting point for your lead lists
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Source Selection */}
            <div className="space-y-3">
              <Label>Lead Source</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={finderSource === 'crm' ? 'default' : 'outline'}
                  onClick={() => setFinderSource('crm')}
                  className="h-auto py-4 flex flex-col items-center gap-2"
                >
                  <Database className="h-5 w-5" />
                  <span className="text-sm">Pull from CRM</span>
                </Button>
                <Button
                  variant={finderSource === 'upload' ? 'default' : 'outline'}
                  onClick={() => setFinderSource('upload')}
                  className="h-auto py-4 flex flex-col items-center gap-2"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-sm">Upload Leads</span>
                </Button>
                <Button
                  variant={finderSource === 'generate' ? 'default' : 'outline'}
                  onClick={() => setFinderSource('generate')}
                  className="h-auto py-4 flex flex-col items-center gap-2"
                >
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm">Generate Leads</span>
                </Button>
              </div>
            </div>

            {/* CRM Option */}
            {finderSource === 'crm' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="crm-query">Query your CRM</Label>
                  <Textarea
                    id="crm-query"
                    placeholder="Examples:&#10;• All leads in the database&#10;• Leads from TechCorp Industries&#10;• All VP-level contacts in healthcare&#10;• Leads in Florida with no activity in 90 days"
                    value={finderCrmQuery}
                    onChange={(e) => setFinderCrmQuery(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={handleGenerate} 
                  disabled={!finderCrmQuery.trim() || isGeneratingLeads}
                  className="w-full"
                >
                  {isGeneratingLeads ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            )}

            {/* Upload Option */}
            {finderSource === 'upload' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload CSV or Excel file</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={isGeneratingLeads}
                  />
                  <p className="text-xs text-muted-foreground">
                    File should contain columns: Name, URL (website or LinkedIn)
                  </p>
                </div>
              </div>
            )}

            {/* Generate Option */}
            {finderSource === 'generate' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="generate-query">Describe the leads you want</Label>
                  <Textarea
                    id="generate-query"
                    placeholder="Examples:&#10;• All pharmacies in San Francisco&#10;• B2B SaaS companies in healthcare with $10M-$50M revenue&#10;• VP of Sales at tech companies in California"
                    value={finderGenerateQuery}
                    onChange={(e) => setFinderGenerateQuery(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={handleGenerate} 
                  disabled={!finderGenerateQuery.trim() || isGeneratingLeads}
                  className="w-full"
                >
                  {isGeneratingLeads ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Table */}
        {finderLeads.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Leads ({finderLeads.length})</CardTitle>
              <CardDescription>
                Starting point for your list
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>URL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {finderLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>
                          <a
                            href={lead.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                          >
                            {lead.url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-center mt-4">
                <Button size="lg">
                  Save as List
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderListsContent = () => {
    // Helper function to get current folder based on path
    // Force recompile
    const getCurrentFolder = () => {
      let current = folderStructure
      for (const folderName of currentPath) {
        const folder = current.folders.find((f: any) => f.name === folderName)
        if (folder) {
          current = folder
        }
      }
      return current
    }

    const currentFolder = getCurrentFolder()

    const navigateToFolder = (folderName: string) => {
      setCurrentPath([...currentPath, folderName])
    }

    const navigateToPath = (index: number) => {
      setCurrentPath(currentPath.slice(0, index))
    }

    const createFolder = () => {
      if (!newFolderName.trim()) return
      
      const newFolder = {
        id: Date.now(),
        name: newFolderName,
        folders: [],
        tables: []
      }

      // Add to current location
      const current = getCurrentFolder()
      current.folders.push(newFolder)
      setFolderStructure({ ...folderStructure })
      setNewFolderName('')
      setIsCreatingFolder(false)
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-end">
              <Button onClick={() => setIsCreatingFolder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm py-2 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPath([])}
                className="h-8 px-2"
              >
                <Home className="h-4 w-4" />
              </Button>
              {currentPath.map((folder, index) => (
                <div key={index} className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToPath(index + 1)}
                    className="h-8 px-2"
                  >
                    {folder}
                  </Button>
                </div>
              ))}
            </div>

            {/* New Folder Input */}
            {isCreatingFolder && (
              <div className="flex gap-2 p-3 border rounded-lg bg-muted/50">
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') createFolder()
                    if (e.key === 'Escape') {
                      setIsCreatingFolder(false)
                      setNewFolderName('')
                    }
                  }}
                  autoFocus
                />
                <Button onClick={createFolder} disabled={!newFolderName.trim()}>
                  Create
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreatingFolder(false)
                    setNewFolderName('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Folders */}
            {currentFolder.folders.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Folders</Label>
                <div className="grid gap-2">
                  {currentFolder.folders.map((folder: any) => (
                    <div
                      key={folder.id}
                      onClick={() => navigateToFolder(folder.name)}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <Folder className="h-5 w-5 text-blue-600" />
                      <span className="font-medium flex-1">{folder.name}</span>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{folder.folders.length} folders</span>
                        <span>•</span>
                        <span>{folder.tables.length} tables</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tables */}
            {currentFolder.tables.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tables</Label>
                <div className="grid gap-2">
                  {currentFolder.tables.map((table: any) => (
                    <div
                      key={table.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <TableIcon className="h-5 w-5 text-green-600" />
                      <span className="font-medium flex-1">{table.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {table.rows} rows
                      </span>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {currentFolder.folders.length === 0 && currentFolder.tables.length === 0 && !isCreatingFolder && (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
                <p className="text-muted-foreground mb-2">This folder is empty</p>
                <p className="text-sm text-muted-foreground">
                  Create a new folder or add tables from the Finder
                </p>
              </div>
            )}
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
            {/* <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            /> */}
            <div className="flex items-center gap-2 p-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
            </div>
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
          
          {renderMainContent()}
        </main>
      </div>
    </div>
    </AuthWrapper>
  )
}