'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Check, ThumbsUp, ThumbsDown, ExternalLink, MapPin, GraduationCap, Briefcase, Play } from 'lucide-react'

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

interface CandidateTabProps {
  candidateYield: number
  stagingCandidates: Candidate[]
  setStagingCandidates: (candidates: Candidate[]) => void
  approvedCandidates: string[]
  setApprovedCandidates: (candidates: string[]) => void
  rejectedCandidates: string[]
  setRejectedCandidates: (candidates: string[]) => void
  approvedCandidatesData: Candidate[]
  setApprovedCandidatesData: (candidates: Candidate[]) => void
  rejectedCandidatesData: Candidate[]
  setRejectedCandidatesData: (candidates: Candidate[]) => void
  onGoToReview: () => void
}

export function CandidateTab({
  candidateYield,
  stagingCandidates,
  setStagingCandidates,
  approvedCandidates,
  setApprovedCandidates,
  rejectedCandidates,
  setRejectedCandidates,
  approvedCandidatesData,
  setApprovedCandidatesData,
  rejectedCandidatesData,
  setRejectedCandidatesData,
  onGoToReview
}: CandidateTabProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false)

  const handleApprove = (candidateId: string) => {
    const candidate = stagingCandidates.find(c => c.id === candidateId)
    if (candidate) {
      setApprovedCandidates([...approvedCandidates, candidateId])
      setApprovedCandidatesData([...approvedCandidatesData, candidate])
      setStagingCandidates(stagingCandidates.filter(c => c.id !== candidateId))
    }
  }

  const handleReject = (candidateId: string) => {
    const candidate = stagingCandidates.find(c => c.id === candidateId)
    if (candidate) {
      setRejectedCandidates([...rejectedCandidates, candidateId])
      setRejectedCandidatesData([...rejectedCandidatesData, candidate])
      setStagingCandidates(stagingCandidates.filter(c => c.id !== candidateId))
    }
  }

  const handleSkip = (candidateId: string) => {
    // Move to end of queue
    const candidate = stagingCandidates.find(c => c.id === candidateId)
    if (candidate) {
      setStagingCandidates([
        ...stagingCandidates.filter(c => c.id !== candidateId),
        candidate
      ])
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicators */}
      <div className="grid grid-cols-3 gap-6">
        {/* Remaining Candidates */}
        <div className="bg-white border-2 border-gray-900 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stagingCandidates.length}
            </div>
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">
              To Review
            </div>
          </div>
        </div>

        {/* Approved Progress */}
        <div className="bg-gray-200 text-gray-900 p-4 relative overflow-hidden rounded-lg">
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold mb-1">
              {approvedCandidates.length}/500
            </div>
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">
              Approved
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-300 rounded-b-lg">
            <div 
              className="h-full bg-gray-900 transition-all duration-500 ease-out rounded-b-lg"
              style={{ width: `${Math.min((approvedCandidates.length / 500) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Rejected Candidates */}
        <div className="bg-white border-2 border-gray-900 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {rejectedCandidates.length}
            </div>
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">
              Rejected
            </div>
          </div>
        </div>
      </div>

      {/* Card Stack Interface */}
      {stagingCandidates.length > 0 ? (
        <div className="max-w-md mx-auto">
          <div className="relative">
            {/* Main Card */}
            <div className="relative z-10">
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="relative">
                    {/* Candidate Photo */}
                    <div className="flex justify-center mb-6">
                      <img
                        src={stagingCandidates[0].photo}
                        alt={stagingCandidates[0].name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 grayscale cursor-pointer hover:border-gray-400 transition-colors"
                        onClick={() => {
                          setSelectedCandidate(stagingCandidates[0])
                          setIsProfilePanelOpen(true)
                        }}
                      />
                    </div>

                    {/* Candidate Info */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold">{stagingCandidates[0].name}</h3>
                        <p className="text-gray-600">{stagingCandidates[0].title}</p>
                        <p className="text-sm text-gray-500">{stagingCandidates[0].company}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {stagingCandidates[0].location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <GraduationCap className="h-4 w-4" />
                          {stagingCandidates[0].education}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Experience
                        </h4>
                        <div className="space-y-2">
                          {stagingCandidates[0].experience.slice(0, 3).map((exp, index) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium">{exp.title}</div>
                              <div className="text-gray-600">{exp.company} • {exp.duration}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Summary</h4>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {stagingCandidates[0].summary}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Background Cards */}
            {stagingCandidates.slice(1, 3).map((candidate, index) => (
              <div
                key={candidate.id}
                className="absolute inset-0 z-0"
                style={{
                  transform: `translate(${(index + 1) * 4}px, ${(index + 1) * 4}px) scale(${1 - (index + 1) * 0.02})`,
                  opacity: 0.7 - index * 0.2
                }}
              >
                <Card className="overflow-hidden h-full">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      <img
                        src={candidate.photo}
                        alt={candidate.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 grayscale"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{candidate.name}</h3>
                      <p className="text-gray-600 text-xs">{candidate.title}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleReject(stagingCandidates[0].id)}
              className="flex items-center gap-2"
            >
              <ThumbsDown className="h-5 w-5" />
              Reject
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleSkip(stagingCandidates[0].id)}
              className="flex items-center gap-2"
            >
              <X className="h-5 w-5" />
              Skip
            </Button>
            <Button
              size="lg"
              onClick={() => handleApprove(stagingCandidates[0].id)}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="h-5 w-5" />
              Approve
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Check className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">All candidates reviewed!</h3>
            <p className="text-sm">You've reviewed all candidates in your queue.</p>
          </div>
          <Button onClick={onGoToReview} className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Go to Review
          </Button>
        </div>
      )}

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
