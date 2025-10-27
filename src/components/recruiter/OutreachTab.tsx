'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, MessageSquare, Check, X, ChevronLeft, ChevronRight, ExternalLink, MapPin, GraduationCap, Briefcase } from 'lucide-react'

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

interface OutreachTabProps {
  approvedCandidates: string[]
  setApprovedCandidates: (candidates: string[]) => void
  rejectedCandidates: string[]
  setRejectedCandidates: (candidates: string[]) => void
  stagingCandidates: Candidate[]
  reviewCandidates: Candidate[]
  approvedCandidatesData: Candidate[]
  rejectedCandidatesData: Candidate[]
  connectionRequestsSent: number
  setConnectionRequestsSent: (count: number) => void
  initialMessagesSent: number
  setInitialMessagesSent: (count: number) => void
  positiveReplies: number
  setPositiveReplies: (count: number) => void
  applicants: number
  setApplicants: (count: number) => void
}

export function OutreachTab({
  approvedCandidates,
  setApprovedCandidates,
  rejectedCandidates,
  setRejectedCandidates,
  stagingCandidates,
  reviewCandidates,
  approvedCandidatesData,
  rejectedCandidatesData,
  connectionRequestsSent,
  setConnectionRequestsSent,
  initialMessagesSent,
  setInitialMessagesSent,
  positiveReplies,
  setPositiveReplies,
  applicants,
  setApplicants
}: OutreachTabProps) {
  const [filterStatus, setFilterStatus] = useState<'approved' | 'rejected'>('approved')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false)
  
  const getFilteredCandidates = () => {
    switch (filterStatus) {
      case 'approved':
        return approvedCandidatesData
      case 'rejected':
        return rejectedCandidatesData
      default:
        return approvedCandidatesData
    }
  }
  
  const filteredCandidates = getFilteredCandidates()
  
  const getVisibleCandidates = () => {
    const candidates = []
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % filteredCandidates.length
      candidates.push(filteredCandidates[index])
    }
    return candidates
  }
  
  const visibleCandidates = getVisibleCandidates()
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredCandidates.length - 1))
  }
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev < filteredCandidates.length - 1 ? prev + 1 : 0))
  }
  
  const handleFilterChange = (newFilter: 'approved' | 'rejected') => {
    setFilterStatus(newFilter)
    setCurrentIndex(0)
  }

  return (
    <div className="space-y-6">
      {/* Approved Candidates Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Candidates
            </CardTitle>
            <div className="flex gap-1">
                <Button
                  variant={filterStatus === 'approved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('approved')}
                  className="flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  Approved
                </Button>
                <Button
                  variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('rejected')}
                  className="flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Rejected
                </Button>
              </div>
            </div>
        </CardHeader>
        <CardContent>
          {filteredCandidates.length > 0 ? (
            <div className="space-y-4">
              {/* Carousel Container */}
              <div className="flex items-center justify-center gap-4">
                {/* Left Arrow */}
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={filteredCandidates.length <= 3}
                  className="h-24 w-12 rounded-lg border-2 border-black bg-white hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                {/* Three Candidate Cards */}
                <div className="flex gap-3">
                  {visibleCandidates.map((candidate, index) => (
                    <div 
                      key={`${candidate.id}-${index}`}
                      className="border-2 border-black rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors w-64"
                      onClick={() => {
                        setSelectedCandidate(candidate)
                        setIsProfilePanelOpen(true)
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-black">
                          <AvatarImage 
                            src={candidate.photo} 
                            alt={candidate.name}
                            className="grayscale"
                          />
                          <AvatarFallback className="bg-black text-white font-bold text-xs">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm truncate">{candidate.name}</h3>
                          <div className="w-8 h-0.5 bg-black my-1"></div>
                          <p className="text-xs font-medium text-gray-700 truncate">{candidate.title}</p>
                          <p className="text-xs text-gray-600 truncate">{candidate.company}</p>
                          <p className="text-xs text-gray-500 truncate">{candidate.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Arrow */}
                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={filteredCandidates.length <= 3}
                  className="h-24 w-12 rounded-lg border-2 border-black bg-white hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>

            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <p>No {filterStatus} candidates found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Demo values for demonstration */}
            {(() => {
              const demoValues = {
                approvedCandidates: 500,
                connectionRequests: 175,
                initialMessages: 140,
                positiveReplies: 25,
                approvedApplicants: 10
              }
              
              const maxValue = demoValues.approvedCandidates
              
              return (
                <>
                  {/* Approved Candidates */}
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-muted-foreground">
                      <div>Approved</div>
                      <div>Candidates</div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div 
                        className="bg-gray-800 h-full rounded-full flex items-center px-3 transition-all duration-500"
                        style={{ width: `${(demoValues.approvedCandidates / maxValue) * 100}%` }}
                      >
                        <div className="text-sm font-bold text-white">{demoValues.approvedCandidates}</div>
                      </div>
                    </div>
                  </div>

                  {/* Connection Requests Sent */}
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-muted-foreground">
                      <div>Connection</div>
                      <div>Request Sent</div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div 
                        className="bg-gray-800 h-full rounded-full flex items-center px-3 transition-all duration-500"
                        style={{ width: `${(demoValues.connectionRequests / maxValue) * 100}%` }}
                      >
                        <div className="text-sm font-bold text-white">{demoValues.connectionRequests}</div>
                      </div>
                    </div>
                  </div>

                  {/* Initial Messages Sent */}
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-muted-foreground">
                      <div>Initial Message</div>
                      <div>Sent</div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div 
                        className="bg-gray-800 h-full rounded-full flex items-center px-3 transition-all duration-500"
                        style={{ width: `${(demoValues.initialMessages / maxValue) * 100}%` }}
                      >
                        <div className="text-sm font-bold text-white">{demoValues.initialMessages}</div>
                      </div>
                    </div>
                  </div>

                  {/* Positive Replies */}
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-muted-foreground">
                      <div>Positive</div>
                      <div>Replies</div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div 
                        className="bg-gray-800 h-full rounded-full flex items-center px-3 transition-all duration-500"
                        style={{ 
                          width: `${Math.max((demoValues.positiveReplies / maxValue) * 100, 8)}%`,
                          minWidth: '60px'
                        }}
                      >
                        <div className="text-sm font-bold text-white">{demoValues.positiveReplies}</div>
                      </div>
                    </div>
                  </div>

                  {/* Approved Applicants */}
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-muted-foreground">
                      <div>Approved</div>
                      <div>Applicants</div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div 
                        className="bg-gray-800 h-full rounded-full flex items-center px-2 transition-all duration-500"
                        style={{ 
                          width: `${Math.max((demoValues.approvedApplicants / maxValue) * 100, 6)}%`,
                          minWidth: '40px'
                        }}
                      >
                        <div className="text-sm font-bold text-white">{demoValues.approvedApplicants}</div>
                      </div>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </CardContent>
      </Card>

      {/* LinkedIn Profile Slide-in Panel */}
      {isProfilePanelOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50" onClick={() => setIsProfilePanelOpen(false)}>
          <div 
            className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl border-l h-full transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">LinkedIn Profile</h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsProfilePanelOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Profile Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="text-center">
                  <img
                    src={selectedCandidate.photo}
                    alt={selectedCandidate.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 grayscale"
                  />
                  <h3 className="text-xl font-bold">{selectedCandidate.name}</h3>
                  <p className="text-gray-600">{selectedCandidate.title}</p>
                  <p className="text-sm text-gray-500">{selectedCandidate.company}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">About</h4>
                    <p className="text-sm text-gray-600">{selectedCandidate.summary}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Experience</h4>
                    <div className="space-y-3">
                      {selectedCandidate.experience.map((exp, index) => (
                        <div key={index} className="border-l-2 border-blue-200 pl-3">
                          <div className="font-medium text-sm">{exp.title}</div>
                          <div className="text-sm text-gray-600">{exp.company}</div>
                          <div className="text-xs text-gray-500">{exp.duration}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Education</h4>
                    <p className="text-sm text-gray-600">{selectedCandidate.education}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Location</h4>
                    <p className="text-sm text-gray-600">{selectedCandidate.location}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t">
                <Button
                  className="w-full"
                  onClick={() => {
                    window.open(selectedCandidate.linkedinUrl, '_blank')
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on LinkedIn
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
