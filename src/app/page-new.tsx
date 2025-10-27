
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Search, 
  Users, 
  MessageSquare,
  Building2,
  Plus
} from 'lucide-react'

// Import our new components
import { JobPostingManager, type JobPosting } from '@/components/recruiter/JobPostingManager'
import { SearchTab, type SearchParams, type Candidate } from '@/components/recruiter/SearchTab'
import { CandidateTab } from '@/components/recruiter/CandidateTab'
import { OutreachTab } from '@/components/recruiter/OutreachTab'

export default function HomePage() {
  // Job postings state
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  
  // Search state
  const [searchParams, setSearchParams] = useState<SearchParams>({
    education: '',
    graduationYear: '',
    geography: '',
    radius: 25,
    jobTitles: [],
    lastThreeCompanies: [],
    exclusions: {
      keywords: [],
      industries: [],
      jobTitles: [],
      companies: [],
      pastApplicants: false,
      spotOnEmployees: false
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
  
  // Tab state
  const [recruiterTab, setRecruiterTab] = useState('job-setup')

  const handleSearchClick = (jobId: string) => {
    setRecruiterTab('search')
  }

  const handleGoToReview = () => {
    setRecruiterTab('candidates')
  }

  const recruiterTabs = [
    { id: 'job-setup', label: 'Jobs', icon: Settings },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'outreach', label: 'Outreach', icon: MessageSquare }
  ]

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold">Outbounder</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Campaign
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={recruiterTab} onValueChange={setRecruiterTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            {recruiterTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value={recruiterTab} className="space-y-6">
            {renderRecruiterContent()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
