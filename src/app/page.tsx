"use client";

<<<<<<< HEAD
import { useState, useMemo } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
=======
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
>>>>>>> 4bea209 (made titleExclusions and keywordExclusions as lists)
import { 
  Users, 
  Play, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Upload,
  Eye,
  Download,
  Trash2,
  Edit,
  Link,
  Copy,
  CheckCircle,
  AlertCircle,
  Activity,
  Zap,
  Globe,
  ChevronDown,
  Briefcase
} from 'lucide-react'

// Import our refactored components
import { JobPostingManager } from '@/components/recruiter/JobPostingManager'
import { SearchTab, type SearchParams, type Candidate } from '@/components/recruiter/SearchTab'
import { CandidateTab } from '@/components/recruiter/CandidateTab'
import { SequencerTab } from '@/components/recruiter/SequencerTab'
import { AnalyticsTab } from '@/components/recruiter/AnalyticsTab'
import { ApprovedRejectedCarousel } from '@/components/recruiter/ApprovedRejectedCarousel'
import { SettingsTab } from '@/components/recruiter/SettingsTab'
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { UserButton } from '@clerk/nextjs';
import { useJobPostings } from '@/hooks/useJobPostings'
import { useSavedSearches } from '@/hooks/useSearch'
import { mapSavedSearchToParams } from '@/lib/search-api'

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
        department: 'sales',
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
    department: 'sales',
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
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@innovate.com",
      phone: "+1 (555) 234-5678",
      company: "Innovate Solutions",
      title: "CEO",
      status: "Contacted",
      lastContact: "2024-01-14"
    },
    {
      id: 3,
      name: "Mike Chen",
      email: "mike.chen@startup.io",
      phone: "+1 (555) 345-6789",
      company: "StartupIO",
      title: "CTO",
      status: "Qualified",
      lastContact: "2024-01-13"
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@enterprise.com",
      phone: "+1 (555) 456-7890",
      company: "Enterprise Corp",
      title: "Head of Sales",
      status: "New",
      lastContact: "2024-01-12"
    },
    {
      id: 5,
      name: "David Wilson",
      email: "david.w@growth.com",
      phone: "+1 (555) 567-8901",
      company: "Growth Labs",
      title: "Founder",
      status: "Contacted",
      lastContact: "2024-01-11"
    }
  ];

  // Main applications
  const applications = [
    { 
      id: "outbounder", 
      label: "Outbounder", 
      icon: Users,
      description: "Sales outreach automation",
      color: "blue"
    },
    { 
      id: "inbounder", 
      label: "Inbounder", 
      icon: Globe,
      description: "Lead capture and qualification",
      color: "green"
    },
    { 
      id: "researcher", 
      label: "Researcher", 
      icon: Search,
      description: "Lead research and enrichment",
      color: "purple"
    },
    { 
      id: "recruiter", 
      label: "Recruiter", 
      icon: User,
      description: "Talent acquisition tools",
      color: "orange"
    },
    { 
      id: "reporter", 
      label: "Reporter", 
      icon: BarChart3,
      description: "Analytics and reporting",
      color: "indigo"
    },
  ];

  // Outbounder tabs
  const tabs = [
    { 
      id: "leads", 
      label: "Leads", 
      icon: Users,
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
      case "outbounder":
        return renderOutbounderContent();
      case "inbounder":
        return renderOutbounderContent();
      case "researcher":
        return (
          <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                  <Search className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Researcher</CardTitle>
                <CardDescription>Lead research and enrichment tools</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">Coming soon...</p>
                <Button disabled>Under Development</Button>
              </CardContent>
            </Card>
          </div>
        );
      case "recruiter":
        return renderRecruiterContent();
      case "reporter":
        return (
          <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-indigo-100 rounded-full w-fit">
                  <BarChart3 className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle>Reporter</CardTitle>
                <CardDescription>Advanced analytics and reporting</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">Coming soon...</p>
                <Button disabled>Under Development</Button>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  const renderOutbounderContent = () => {
    switch (activeTab) {
      case "leads":
  return (
          <div className="space-y-6">
            {activeSubTab === "upload" && (
              <div className="space-y-6">
                {/* CSV Upload Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      CSV Upload
                    </CardTitle>
                    <CardDescription>
                      Upload a CSV file with your prospect data. Include columns for name, email, phone, company, and title.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Drop your CSV file here</h3>
                        <p className="text-muted-foreground">or click to browse files</p>
                        <Input
                          type="file"
                          accept=".csv"
                          onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                    </div>
                    
                    {uploadedFile && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-800">
                          <Upload className="h-4 w-4" />
                          <span className="font-medium">File ready for upload:</span>
                          <span>{uploadedFile.name}</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          Size: {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button disabled={!uploadedFile} className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload CSV
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Webhook Integration Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Live Lead Pipeline
                    </CardTitle>
                    <CardDescription>
                      Set up webhook endpoints to receive leads in real-time from external sources like CRM systems, forms, and APIs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Webhook Toggle */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Link className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Webhook Integration</h3>
                          <p className="text-sm text-muted-foreground">Enable real-time lead ingestion</p>
                        </div>
                      </div>
                      <Switch
                        checked={webhookEnabled}
                        onCheckedChange={setWebhookEnabled}
                      />
        </div>

                    {webhookEnabled && (
                      <div className="space-y-4">
                        {/* Webhook URL */}
                        <div className="space-y-2">
                          <Label htmlFor="webhook-url">Webhook Endpoint</Label>
                          <div className="flex gap-2">
                            <Input
                              id="webhook-url"
                              value={webhookUrl}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <Copy className="h-4 w-4" />
                              Copy
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Send POST requests to this endpoint with lead data
                          </p>
                        </div>

                        {/* Webhook Status */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">Webhook Active</span>
                          </div>
                          <Badge variant="secondary" className="ml-auto">
                            <Activity className="h-3 w-3 mr-1" />
                            Live
                          </Badge>
                        </div>

                        {/* Recent Activity */}
                        <div className="space-y-3">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Recent Activity
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {recentWebhookActivity.map((activity) => (
                              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${
                                    activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                                  }`}></div>
                                  <div>
                                    <p className="text-sm font-medium">{activity.source}</p>
                                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {activity.status === 'success' ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <Badge variant={activity.status === 'success' ? 'default' : 'destructive'}>
                                    {activity.leads} leads
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Webhook Documentation */}
                        <Alert>
                          <Globe className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Integration Guide:</strong> Send POST requests with JSON payload containing lead data. 
                            Expected fields: name, email, phone, company, title. 
                            <a href="#" className="text-blue-600 hover:underline ml-1">View full documentation →</a>
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeSubTab === "view" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Lead Database</CardTitle>
                      <CardDescription>
                        View and manage your prospect database ({dummyLeads.length} leads)
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                      <Button size="sm" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Add Leads
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Contact</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dummyLeads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell>{lead.email}</TableCell>
                            <TableCell>{lead.phone}</TableCell>
                            <TableCell>{lead.company}</TableCell>
                            <TableCell>{lead.title}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                                lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {lead.status}
                              </span>
                            </TableCell>
                            <TableCell>{lead.lastContact}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      case "sequencer":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Sales Playbook
                    </CardTitle>
                    <CardDescription>
                      Pre-built sales plays with proven sequences and templates
                    </CardDescription>
                  </div>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create New Play
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesPlays.map((play) => (
                    <div key={play.id} className="border rounded-lg">
                      <div 
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          setExpandedPlays(prev => 
                            prev.includes(play.id) 
                              ? prev.filter(id => id !== play.id)
                              : [...prev, play.id]
                          );
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {play.category === "Email" && <Mail className="h-4 w-4 text-blue-600" />}
                              {play.category === "SMS" && <MessageCircle className="h-4 w-4 text-purple-600" />}
                              {play.category === "Voice" && <Phone className="h-4 w-4 text-green-600" />}
                              <span className="font-medium">{play.name}</span>
                            </div>
                            <Badge variant={play.status === "Active" ? "default" : "secondary"}>
                              {play.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Success: {play.successRate}</span>
                            <span>Runs: {play.totalRuns}</span>
                            <span>Last: {play.lastUsed}</span>
                            <ChevronDown 
                              className={`h-4 w-4 transition-transform ${
                                expandedPlays.includes(play.id) ? 'rotate-180' : ''
                              }`} 
                            />
                          </div>
                        </div>
                      </div>
                      
                      {expandedPlays.includes(play.id) && (
                        <div className="border-t p-4 space-y-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold mb-2">Description</h4>
                              <p className="text-muted-foreground">{play.description}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Performance</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Success Rate:</span>
                                  <span className="ml-2 font-medium">{play.successRate}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Total Runs:</span>
                                  <span className="ml-2 font-medium">{play.totalRuns}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Last Used:</span>
                                  <span className="ml-2 font-medium">{play.lastUsed}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Category:</span>
                                  <span className="ml-2 font-medium">{play.category}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-3">Sequence Flow</h4>
                            <div className="h-[300px] border rounded-lg">
                              <ReactFlow
                                nodes={play.sequence.map(node => ({
                                  id: node.id,
                                  type: node.type,
                                  position: node.position,
                                  data: { label: node.label }
                                }))}
                                edges={play.edges}
                                nodeTypes={nodeTypes}
                                fitView
                                className="bg-gray-50"
                                nodesDraggable={false}
                                nodesConnectable={false}
                                elementsSelectable={false}
                              >
                                <Background variant={BackgroundVariant.Dots} />
                              </ReactFlow>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Play
                            </Button>
                            <Button variant="outline" size="sm">
                              <Play className="h-4 w-4 mr-2" />
                              Run Play
                            </Button>
                            <Button variant="outline" size="sm">
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "messaging":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messaging Center
                </CardTitle>
                <CardDescription>
                  Create and manage your communication templates across email, voice, and SMS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Email Messaging */}
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Mail className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Email</CardTitle>
                          <CardDescription>Create email templates and sequences</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>• Email templates</div>
                        <div>• A/B testing</div>
                        <div>• Personalization</div>
                        <div>• Analytics</div>
                      </div>
                      <Button className="w-full mt-4">
                        <Mail className="h-4 w-4 mr-2" />
                        Manage Email
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Voice Messaging */}
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Phone className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Voice</CardTitle>
                          <CardDescription>Create call scripts and recordings</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>• Call scripts</div>
                        <div>• Voice recordings</div>
                        <div>• Call analytics</div>
                        <div>• Training</div>
                      </div>
                      <Button className="w-full mt-4">
                        <Phone className="h-4 w-4 mr-2" />
                        Manage Voice
                      </Button>
                    </CardContent>
                  </Card>

                  {/* SMS Messaging */}
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <MessageCircle className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">SMS</CardTitle>
                          <CardDescription>Create SMS templates and campaigns</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>• SMS templates</div>
                        <div>• Quick responses</div>
                        <div>• Delivery tracking</div>
                        <div>• Compliance</div>
                      </div>
                      <Button className="w-full mt-4">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Manage SMS
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "reporting":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Track your outbound performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Reporting content will go here...</p>
              </CardContent>
            </Card>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            {/* User Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Profile
                </CardTitle>
                <CardDescription>
                  Manage your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={userProfile.firstName}
                        onChange={(e) => setUserProfile({...userProfile, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={userProfile.lastName}
                        onChange={(e) => setUserProfile({...userProfile, lastName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userProfile.email}
                        onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={userProfile.company}
                        onChange={(e) => setUserProfile({...userProfile, company: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={userProfile.title}
                        onChange={(e) => setUserProfile({...userProfile, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <select
                        id="timezone"
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                        value={userProfile.timezone}
                        onChange={(e) => setUserProfile({...userProfile, timezone: e.target.value})}
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Communication Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Voice Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Voice Configuration
                  </CardTitle>
                  <CardDescription>
                    Set up your phone number for voice calls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="voice-phone">Phone Number</Label>
                    <Input
                      id="voice-phone"
                      value={voicePhoneNumber}
                      onChange={(e) => setVoicePhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Voice Provider</Label>
                    <select className="w-full px-3 py-2 border border-input bg-background rounded-md">
                      <option value="twilio">Twilio</option>
                      <option value="vonage">Vonage</option>
                      <option value="ringcentral">RingCentral</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="voice-enabled" defaultChecked />
                    <Label htmlFor="voice-enabled">Enable voice calls</Label>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Test Voice Connection
                  </Button>
                </CardContent>
              </Card>

              {/* SMS Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    SMS Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your SMS phone number
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sms-phone">Phone Number</Label>
                    <Input
                      id="sms-phone"
                      value={smsPhoneNumber}
                      onChange={(e) => setSmsPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SMS Provider</Label>
                    <select className="w-full px-3 py-2 border border-input bg-background rounded-md">
                      <option value="twilio">Twilio</option>
                      <option value="messagebird">MessageBird</option>
                      <option value="sendgrid">SendGrid</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="sms-enabled" defaultChecked />
                    <Label htmlFor="sms-enabled">Enable SMS</Label>
                  </div>
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Test SMS Connection
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Email Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Accounts
                </CardTitle>
                <CardDescription>
                  Manage your connected email accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {emailAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{account.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {account.provider} • {account.status}
                            {account.isPrimary && (
                              <Badge variant="secondary" className="ml-2">Primary</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Add New Email */}
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Enter email address"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                      <select
                        className="px-3 py-2 border border-input bg-background rounded-md"
                        value={newEmailProvider}
                        onChange={(e) => setNewEmailProvider(e.target.value)}
                      >
                        <option value="Gmail">Gmail</option>
                        <option value="Outlook">Outlook</option>
                        <option value="Yahoo">Yahoo</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <Button disabled={!newEmail}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LinkedIn Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Linkedin className="h-5 w-5" />
                  LinkedIn Integration
                </CardTitle>
                <CardDescription>
                  Connect your LinkedIn account for enhanced lead research
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {linkedinConnected ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-800">LinkedIn Connected</div>
                        <div className="text-sm text-green-600">
                          {linkedinProfile.name} • {linkedinProfile.title} at {linkedinProfile.company}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View Profile
                      </Button>
                      <Button variant="outline" className="text-red-600">
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Linkedin className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Connect LinkedIn</h3>
                    <p className="text-muted-foreground mb-4">
                      Connect your LinkedIn account to automatically enrich lead data and improve personalization
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Linkedin className="h-4 w-4 mr-2" />
                      Connect LinkedIn
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Manage your billing and payment information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {method.type} •••• {method.last4}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {method.brand}
                            {method.isDefault && (
                              <Badge variant="secondary" className="ml-2">Default</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </div>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive email updates about your account
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Update Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  const renderRecruiterContent = () => {
    switch (recruiterTab) {
      case "job-setup":
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="job-url">Job URL</Label>
                  <Input
                    id="job-url"
                    type="url"
                    placeholder="Paste job posting URL here..."
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <Button disabled={!jobUrl} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Generate Checklist
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      case "checklist":
        return (
          <SearchTab
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            candidateYield={candidateYield}
            setCandidateYield={setCandidateYield}
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
              <CardContent>
                <p className="text-muted-foreground">Analytics content coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AuthWrapper>
    <div className="flex h-screen bg-background">
      {/* Main Applications Sidebar */}
      <div className={`${appSidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-card border-r border-border flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {appSidebarOpen && (
              <h1 className="text-xl font-bold text-foreground">248</h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAppSidebarOpen(!appSidebarOpen)}
              className="ml-auto"
            >
              {appSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Applications Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {applications.map((app) => {
            const Icon = app.icon;
            return (
              <Button
                key={app.id}
                variant={activeApp === app.id ? "default" : "ghost"}
                className={`w-full justify-start ${appSidebarOpen ? 'px-3' : 'px-2'}`}
                onClick={() => setActiveApp(app.id)}
              >
                <Icon className="h-4 w-4" />
                {appSidebarOpen && (
                  <span className="ml-2 font-medium">{app.label}</span>
                )}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Outbounder/Inbounder/Recruiter Sidebar - Only show when these apps are active */}
      {(activeApp === "outbounder" || activeApp === "inbounder" || activeApp === "recruiter") && (
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-card border-r border-border flex flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <h1 className="text-xl font-bold text-foreground">
                  {activeApp === "outbounder" ? "Outbounder" : activeApp === "inbounder" ? "Inbounder" : "Recruiter"}
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
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {(activeApp === "recruiter" ? recruiterTabs : tabs).map((tab) => {
              const Icon = tab.icon;
              const isLeadsTab = tab.id === "leads";
              const isSequencerTab = tab.id === "sequencer";
              const isMessagingTab = tab.id === "messaging";
              const hasSubItems = tab.subItems && tab.subItems.length > 0;
              
              return (
                <div key={tab.id} className="space-y-1">
                  <Button
                    variant={activeApp === "recruiter" ? (recruiterTab === tab.id ? "default" : "ghost") : (activeTab === tab.id ? "default" : "ghost")}
                    className={`w-full justify-start ${sidebarOpen ? 'px-3' : 'px-2'}`}
                    onClick={() => {
                      if (activeApp === "recruiter") {
                        setRecruiterTab(tab.id);
                      } else {
                        setActiveTab(tab.id);
                        if (isLeadsTab) {
                          setActiveSubTab("upload");
                          setLeadsExpanded(!leadsExpanded);
                        } else if (isSequencerTab) {
                          setActiveSubTab("email");
                          setSequencerExpanded(!sequencerExpanded);
                        } else if (isMessagingTab) {
                          setActiveSubTab("email");
                          setMessagingExpanded(!messagingExpanded);
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
                  {activeTab === "leads" && isLeadsTab && tab.subItems && sidebarOpen && (
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        leadsExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="ml-6 space-y-1">
                        {tab.subItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <Button
                              key={subItem.id}
                              variant={activeSubTab === subItem.id ? "secondary" : "ghost"}
                              size="sm"
                              className="w-full justify-start px-3 text-sm"
                              onClick={() => setActiveSubTab(subItem.id)}
                            >
                              <SubIcon className="h-3 w-3" />
                              <span className="ml-2">{subItem.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sub-items for sequencer with animation */}
                  {activeTab === "sequencer" && isSequencerTab && tab.subItems && sidebarOpen && (
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        sequencerExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="ml-6 space-y-1">
                        {tab.subItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <Button
                              key={subItem.id}
                              variant={activeSubTab === subItem.id ? "secondary" : "ghost"}
                              size="sm"
                              className="w-full justify-start px-3 text-sm"
                              onClick={() => setActiveSubTab(subItem.id)}
                            >
                              <SubIcon className="h-3 w-3" />
                              <span className="ml-2">{subItem.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sub-items for messaging with animation */}
                  {activeTab === "messaging" && isMessagingTab && tab.subItems && sidebarOpen && (
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        messagingExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="ml-6 space-y-1">
                        {tab.subItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <Button
                              key={subItem.id}
                              variant={activeSubTab === subItem.id ? "secondary" : "ghost"}
                              size="sm"
                              className="w-full justify-start px-3 text-sm"
                              onClick={() => setActiveSubTab(subItem.id)}
                            >
                              <SubIcon className="h-3 w-3" />
                              <span className="ml-2">{subItem.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
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
<<<<<<< HEAD
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              {(activeApp === "outbounder" || activeApp === "inbounder")
                ? tabs.find(tab => tab.id === activeTab)?.label
                : activeApp === "recruiter"
                ? recruiterTabs.find(tab => tab.id === recruiterTab)?.label
                : applications.find(app => app.id === activeApp)?.label
              }
            </h1>
            {activeApp !== "outbounder" && activeApp !== "inbounder" && activeApp !== "recruiter" && (
              <p className="text-muted-foreground mt-2 text-lg">
                {applications.find(app => app.id === activeApp)?.description}
              </p>
=======
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
>>>>>>> 4bea209 (made titleExclusions and keywordExclusions as lists)
            )}
          </div>
          {renderAppContent()}
        </main>
      </div>
    </div>
    </AuthWrapper>
  )
}

