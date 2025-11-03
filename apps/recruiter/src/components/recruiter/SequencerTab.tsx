'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  Eye, 
  Heart, 
  UserPlus, 
  MessageSquare, 
  Reply, 
  ArrowRight,
  Send,
  ChevronDown
} from 'lucide-react'
import { useJobPostings } from '@/hooks/useJobPostings'
import { useCandidates } from '@/hooks/useCandidates'

export interface SequencerStep {
  id: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  type: 'view-profile' | 'like-post' | 'connection-request' | 'initial-message' | 'respond' | 'follow-up'
}

interface SimplifiedCandidate {
  id: string
  name: string
  title: string
  company: string
  currentStep: number // Which step in the sequence (0-based index)
}

interface SequencerTabProps {
  jobDescriptionId?: number | null
}

export function SequencerTab({ jobDescriptionId: initialJobId }: SequencerTabProps) {
  // Job selection state
  const [selectedJobId, setSelectedJobId] = useState<number | null>(initialJobId || null)
  const { data: jobPostings, isLoading: isLoadingJobPostings } = useJobPostings()
  
  // Candidate data
  const { data: candidatesData } = useCandidates(selectedJobId || 0)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  
  // Get approved candidates count
  const approvedCount = candidatesData?.approved_candidates?.length || 0
  
  // Create 5 sample candidates with minimal details - use state to prevent re-randomizing on clicks
  const [sampleCandidates, setSampleCandidates] = useState<SimplifiedCandidate[]>([])
  
  // Update sample candidates only when job selection changes
  useEffect(() => {
    if (candidatesData?.approved_candidates) {
      const candidates: SimplifiedCandidate[] = candidatesData.approved_candidates.slice(0, 5).map((c: any, index: number) => ({
        id: c.id?.toString() || `sample-${index}`,
        name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unknown',
        title: c.job_title || c.raw_data?.headline || 'N/A',
        company: c.company_name || 'N/A',
        currentStep: Math.floor(Math.random() * 6) // Random step for demo (0-5)
      }))
      setSampleCandidates(candidates)
    } else {
      setSampleCandidates([])
    }
  }, [selectedJobId]) // Only re-run when job changes, not on every candidatesData update

  // Sequence state
  const [sequence, setSequence] = useState<SequencerStep[]>([
    { id: 'view-profile', label: 'View Profile', icon: Eye, type: 'view-profile' },
    { id: 'like-post', label: 'Like Post', icon: Heart, type: 'like-post' },
    { id: 'connection-request', label: 'Connection Request', icon: UserPlus, type: 'connection-request' },
    { id: 'initial-message', label: 'Initial Message', icon: MessageSquare, type: 'initial-message' },
    { id: 'respond', label: 'Respond', icon: Reply, type: 'respond' },
    { id: 'follow-up', label: 'Follow Up', icon: ArrowRight, type: 'follow-up' }
  ])

  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; isUser: boolean }>>([
    { id: '1', text: 'Hello! I\'m here to help you test your sequence. What would you like to try?', isUser: false }
  ])
  const [chatInput, setChatInput] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('v1.0')
  const [campaignStatus, setCampaignStatus] = useState<'active' | 'paused'>('paused')

  // Find the current step for the selected candidate
  const selectedCandidate = sampleCandidates.find(c => c.id === selectedCandidateId)
  const highlightedStepIndex = selectedCandidate?.currentStep ?? null

  return (
    <div className="space-y-6">
      {/* Job Posting Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Open Role</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedJobId?.toString() || ''} 
            onValueChange={(value) => {
              setSelectedJobId(value === 'clear-selection' ? null : parseInt(value))
              setSelectedCandidateId(null)
            }}
          >
            <SelectTrigger className={`w-full ${!selectedJobId ? 'border-gray-400 focus:border-gray-600' : ''}`}>
              <SelectValue placeholder="Select a job posting..." />
            </SelectTrigger>
            <SelectContent>
              {selectedJobId && (
                <SelectItem value="clear-selection">
                  <span className="text-muted-foreground italic">Clear selection</span>
                </SelectItem>
              )}
              {isLoadingJobPostings ? (
                <SelectItem value="loading" disabled>
                  Loading jobs...
                </SelectItem>
              ) : jobPostings && jobPostings.length > 0 ? (
                jobPostings.map((job) => (
                  <SelectItem key={job.id} value={job.id.toString()}>
                    {job.title}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-jobs" disabled>
                  No job postings available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {!selectedJobId && (
            <p className="text-xs text-gray-600 mt-2">
              Please select a job posting to view campaign details
            </p>
          )}
        </CardContent>
      </Card>

      {/* Candidates Summary & Table - Only show if job selected */}
      {selectedJobId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{approvedCount} Approved Candidates</CardTitle>
              <div className="flex items-center gap-4">
                <span className="text-base font-semibold text-gray-900">
                  {campaignStatus === 'active' ? 'Active' : 'Paused'}
                </span>
                <Switch
                  checked={campaignStatus === 'active'}
                  onCheckedChange={(checked) => setCampaignStatus(checked ? 'active' : 'paused')}
                  className="scale-125"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sampleCandidates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Company</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Current Step</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleCandidates.map((candidate) => (
                      <tr 
                        key={candidate.id}
                        className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedCandidateId === candidate.id ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => setSelectedCandidateId(candidate.id)}
                      >
                        <td className="py-3 px-4 text-sm">{candidate.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{candidate.title}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{candidate.company}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-900">
                            {sequence[candidate.currentStep]?.label || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No approved candidates for this role yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sequence Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Sequence
            {selectedCandidate && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                - {selectedCandidate.name}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sequence.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No steps added yet. Click on a step above to add it to your sequence.</p>
            </div>
          ) : (
            <div className="flex items-center gap-4 overflow-x-auto pb-4">
              {sequence.map((step, index) => {
                const Icon = step.icon
                const isLast = index === sequence.length - 1
                const isHighlighted = highlightedStepIndex === index
                
                return (
                  <div key={`${step.id}-${index}`} className="flex items-center gap-4 flex-shrink-0">
                    {/* Step Block */}
                    <div 
                      className={`w-32 h-20 border-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                        isHighlighted 
                          ? 'border-black bg-gray-100 shadow-lg scale-105' 
                          : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-6 w-6 mb-1 ${isHighlighted ? 'text-black' : 'text-gray-600'}`} />
                      <span className={`text-xs text-center px-2 leading-tight ${
                        isHighlighted ? 'text-black font-semibold' : 'text-gray-600'
                      }`}>
                        {step.label}
                      </span>
                    </div>

                    {/* Arrow */}
                    {!isLast && (
                      <div className="flex items-center">
                        <ArrowRight className={`h-4 w-4 ${
                          isHighlighted || (highlightedStepIndex !== null && index < highlightedStepIndex)
                            ? 'text-black' 
                            : 'text-gray-400'
                        }`} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Playground Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Playground</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chat Interface */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Chat Interface</h3>
              <div className="border rounded-lg h-80 flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.isUser
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Chat Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          if (chatInput.trim()) {
                            setChatMessages([...chatMessages, { id: Date.now().toString(), text: chatInput, isUser: true }])
                            setChatInput('')
                          }
                        }
                      }}
                    />
                    <Button size="sm" className="bg-white hover:bg-gray-50">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt Version Control */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Prompt Version Control</h3>
              <div className="border rounded-lg h-80 flex flex-col">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Version</span>
                    <div className="relative">
                      <select
                        value={selectedVersion}
                        onChange={(e) => setSelectedVersion(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      >
                        <option value="v1.0">v1.0 - Initial</option>
                        <option value="v1.1">v1.1 - Updated</option>
                        <option value="v1.2">v1.2 - Enhanced</option>
                        <option value="v2.0">v2.0 - Major Update</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 p-4">
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <strong>Version {selectedVersion}</strong>
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedVersion === 'v1.0' && 'Initial prompt version with basic sequence handling.'}
                      {selectedVersion === 'v1.1' && 'Updated with improved response timing and better context awareness.'}
                      {selectedVersion === 'v1.2' && 'Enhanced with personalization features and dynamic content generation.'}
                      {selectedVersion === 'v2.0' && 'Major update with AI-powered optimization and advanced analytics.'}
                    </div>
                    <div className="pt-4">
                      <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
                        Edit Prompt
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
