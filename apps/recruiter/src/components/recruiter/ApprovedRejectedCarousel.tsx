'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, ExternalLink, MapPin, GraduationCap, Briefcase, X } from 'lucide-react'

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
  status: 'approved' | 'rejected'
}

interface ApprovedRejectedCarouselProps {
  approvedCandidatesData: Candidate[]
  rejectedCandidatesData: Candidate[]
  setApprovedCandidatesData: (candidates: Candidate[]) => void
  setRejectedCandidatesData: (candidates: Candidate[]) => void
}

export function ApprovedRejectedCarousel({
  approvedCandidatesData,
  rejectedCandidatesData,
  setApprovedCandidatesData,
  setRejectedCandidatesData
}: ApprovedRejectedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'approved' | 'rejected'>('approved')
  const [testInput, setTestInput] = useState('')

  // Get candidates based on active filter
  const currentCandidates = activeFilter === 'approved' ? approvedCandidatesData : rejectedCandidatesData

  const nextCandidate = () => {
    setCurrentIndex((prev) => (prev + 1) % currentCandidates.length)
  }

  const prevCandidate = () => {
    setCurrentIndex((prev) => (prev - 1 + currentCandidates.length) % currentCandidates.length)
  }

  const handleFilterClick = (filter: 'approved' | 'rejected') => {
    setActiveFilter(filter)
    setCurrentIndex(0) // Reset to first candidate when switching filters
  }

  const moveToRejected = (candidateId: string) => {
    const candidate = approvedCandidatesData.find(c => c.id === candidateId)
    if (candidate) {
      setApprovedCandidatesData(approvedCandidatesData.filter(c => c.id !== candidateId))
      setRejectedCandidatesData([...rejectedCandidatesData, { ...candidate, status: 'rejected' }])
    }
  }

  const moveToApproved = (candidateId: string) => {
    const candidate = rejectedCandidatesData.find(c => c.id === candidateId)
    if (candidate) {
      setRejectedCandidatesData(rejectedCandidatesData.filter(c => c.id !== candidateId))
      setApprovedCandidatesData([...approvedCandidatesData, { ...candidate, status: 'approved' }])
    }
  }

  if (currentCandidates.length === 0) {
    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-6">
          <div 
            className={`border border-gray-300 p-4 rounded-lg cursor-pointer transition-colors ${
              activeFilter === 'approved' ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => handleFilterClick('approved')}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {approvedCandidatesData.length}
              </div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Approved
              </div>
            </div>
          </div>

          <div 
            className={`border border-gray-300 p-4 rounded-lg cursor-pointer transition-colors ${
              activeFilter === 'rejected' ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => handleFilterClick('rejected')}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {rejectedCandidatesData.length}
              </div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Rejected
              </div>
            </div>
          </div>
        </div>

        {/* Saad's Input */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-4">
              <label htmlFor="saad-input" className="block text-sm font-medium mb-2">
                Saad's Input (For Testing Purposes)
              </label>
              <Input
                id="saad-input"
                type="text"
                placeholder="Enter text here..."
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
              />
              {testInput && (
                <p className="mt-2 text-sm text-gray-600">
                  You typed: <span className="font-semibold">{testInput}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center py-12">
          <div className="text-gray-500">
            <X className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No {activeFilter} candidates</h3>
            <p className="text-sm">You haven&apos;t {activeFilter} any candidates yet.</p>
          </div>
        </div>
      </div>
    )
  }

  const currentCandidate = currentCandidates[currentIndex]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-6">
        <div 
          className={`border border-gray-300 p-4 rounded-lg cursor-pointer transition-colors ${
            activeFilter === 'approved' ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
          }`}
          onClick={() => handleFilterClick('approved')}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {approvedCandidatesData.length}
            </div>
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">
              Approved
            </div>
          </div>
        </div>

        <div 
          className={`border border-gray-300 p-4 rounded-lg cursor-pointer transition-colors ${
            activeFilter === 'rejected' ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
          }`}
          onClick={() => handleFilterClick('rejected')}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {rejectedCandidatesData.length}
            </div>
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">
              Rejected
            </div>
          </div>
        </div>
      </div>

        {/* Saad's Input */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-4">
              <label htmlFor="saad-input" className="block text-sm font-medium mb-2">
                Saad's Input (For Testing Purposes)
              </label>
              <Input
                id="saad-input"
                type="text"
                placeholder="Enter text here..."
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
              />
              {testInput && (
                <p className="mt-2 text-sm text-gray-600">
                  You typed: <span className="font-semibold">{testInput}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>

      {/* Carousel */}
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
                      src={currentCandidate.photo}
                      alt={currentCandidate.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 grayscale cursor-pointer hover:border-gray-400 transition-colors"
                      draggable={false}
                      onClick={() => {
                        setSelectedCandidate(currentCandidate)
                        setIsProfilePanelOpen(true)
                      }}
                    />
                  </div>

                  {/* Candidate Info */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold">{currentCandidate.name}</h3>
                    <p className="text-gray-600">{currentCandidate.title}</p>
                    <p className="text-sm text-gray-500">{currentCandidate.company}</p>
                    <p className="text-sm text-gray-500">{currentCandidate.location}</p>
                    <p className="text-sm text-gray-500">{currentCandidate.education}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Arrows */}
          <div className="absolute inset-y-0 left-0 flex items-center -ml-12">
            <Button
              variant="outline"
              size="icon"
              onClick={prevCandidate}
              disabled={currentCandidates.length <= 1}
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center -mr-12">
            <Button
              variant="outline"
              size="icon"
              onClick={nextCandidate}
              disabled={currentCandidates.length <= 1}
              className="h-10 w-10 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>


        {/* Candidate Counter */}
        <div className="text-center mt-4 text-sm text-gray-500">
          {currentIndex + 1} of {currentCandidates.length}
        </div>
      </div>

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
                    draggable={false}
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
