'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Check, ThumbsUp, ThumbsDown, ExternalLink, MapPin, GraduationCap, Briefcase } from 'lucide-react'
import Image from 'next/image'
import { useCandidatesForReview } from '@/hooks/useSearch'
import { useApproveCandidate, useRejectCandidate, useShortlistedCandidates, useRejectedCandidates } from '@/hooks/useCandidates'
import { useJobPostings } from '@/hooks/useJobPostings'
import type { EnrichedCandidateResponse } from '@/lib/search-api'

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
  jobDescriptionId?: number | null
}

export function CandidateTab({
  jobDescriptionId
}: CandidateTabProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string>(jobDescriptionId?.toString() || '')
  const [viewMode, setViewMode] = useState<'review' | 'approved' | 'rejected'>('review')

  // Fetch job postings for dropdown
  const { data: jobPostings, isLoading: isLoadingJobs } = useJobPostings()

  // Fetch candidates from API if we have a job description ID
  const { data: enrichedCandidates, isLoading: isFetchingCandidates, error: candidatesError } = useCandidatesForReview(
    selectedJobId ? parseInt(selectedJobId) : null
  )

  // API mutation hooks
  const approveCandidateMutation = useApproveCandidate()
  const rejectCandidateMutation = useRejectCandidate()

  // Fetch approved and rejected candidates for counts
  const { data: shortlistedCandidates } = useShortlistedCandidates(
    selectedJobId ? parseInt(selectedJobId) : null
  )
  const { data: rejectedCandidatesFromAPI } = useRejectedCandidates(
    selectedJobId ? parseInt(selectedJobId) : null
  )

  const handleApprove = async (candidateId: string) => {
    if (!selectedJobId) return
    
    try {
      await approveCandidateMutation.mutateAsync({
        fk_job_description_id: parseInt(selectedJobId),
        fk_candidate_id: parseInt(candidateId)
      })
    } catch (error) {
      console.error('Failed to approve candidate:', error)
    }
  }

  const handleReject = async (candidateId: string) => {
    if (!selectedJobId) return
    
    try {
      await rejectCandidateMutation.mutateAsync({
        fk_job_description_id: parseInt(selectedJobId),
        fk_candidate_id: parseInt(candidateId)
      })
    } catch (error) {
      console.error('Failed to reject candidate:', error)
    }
  }

  const mapEnrichedCandidateToCandidate = (enriched: EnrichedCandidateResponse): Candidate => {
    const fullName = `${enriched.first_name} ${enriched.last_name}`
    const location = enriched.city && enriched.state ? `${enriched.city}, ${enriched.state}` : enriched.city || enriched.state || 'Location not available'

    // Use actual LinkedIn URL from raw_data or construct from slug
    const linkedinUrl = enriched.raw_data.websites_linkedin
      || (enriched.linkedin_canonical_slug ? `https://linkedin.com/in/${enriched.linkedin_canonical_slug}` : '')
      || (enriched.linkedin_shorthand_slug ? `https://linkedin.com/in/${enriched.linkedin_shorthand_slug}` : '')

    // Use actual profile picture or fallback to avatar
    const photo = enriched.raw_data.picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${enriched.id}`

    // Extract education from raw_data
    let education = 'Education details not available'
    if (enriched.raw_data.education && enriched.raw_data.education.length > 0) {
      const edu = enriched.raw_data.education[0]
      if (edu.major && edu.title) {
        education = `${edu.major} at ${edu.title}`
      } else if (edu.major) {
        education = edu.major
      } else if (edu.title) {
        education = edu.title
      }
    }

    // Extract experience from raw_data
    const experience = enriched.raw_data.experience && enriched.raw_data.experience.length > 0
      ? enriched.raw_data.experience.slice(0, 5).map(exp => ({
          title: exp.title,
          company: exp.company_name,
          duration: exp.duration
        }))
      : [{
          title: enriched.job_title || 'Position not specified',
          company: enriched.company_name || 'Company not specified',
          duration: 'Current'
        }]

    // Use description from raw_data or construct summary
    const summary = enriched.raw_data.description
      || enriched.raw_data.headline
      || enriched.raw_data.generated_headline
      || `${enriched.job_title || 'Professional'} at ${enriched.company_name || 'current company'} located in ${location}`

    return {
      id: enriched.id.toString(),
      name: fullName,
      photo: photo,
      title: enriched.job_title || 'Position not specified',
      company: enriched.company_name || 'Company not specified',
      location: location,
      education: education,
      experience: experience,
      linkedinUrl: linkedinUrl,
      summary: summary
    }
  }

  // Helper function to get current candidates based on view mode
  const getCurrentCandidates = () => {
    switch (viewMode) {
      case 'approved':
        return [] // We'll need to fetch actual candidate data for approved/rejected
      case 'rejected':
        return [] // We'll need to fetch actual candidate data for approved/rejected
      case 'review':
      default:
        return (enrichedCandidates || []).map(mapEnrichedCandidateToCandidate)
    }
  }

  // Helper function to get the title for current view
  const getViewTitle = () => {
    switch (viewMode) {
      case 'approved':
        return 'Approved Candidates'
      case 'rejected':
        return 'Rejected Candidates'
      case 'review':
      default:
        return 'Candidates to Review'
    }
  }

  return (
    <div className="space-y-6">
      {/* Job Selection Dropdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Select Job Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-4xl">
            <Select
              value={selectedJobId}
              onValueChange={(value) => {
                setSelectedJobId(value)
              }}
            >
              <SelectTrigger className="h-16 text-base w-full py-4" style={{ height: '4rem' }}>
                <SelectValue placeholder="Select a job role to view candidates" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {isLoadingJobs ? (
                  <SelectItem value="" disabled>
                    Loading job postings...
                  </SelectItem>
                ) : jobPostings && jobPostings.length > 0 ? (
                  jobPostings.map((job) => (
                    <SelectItem key={job.id} value={job.id.toString()} className="w-full">
                      <div className="flex flex-col w-full">
                        <span className="font-medium truncate">{job.title}</span>
                        <span className="text-xs text-gray-500 truncate">
                          Target: {job.target_candidates_count} candidates
                        </span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No job postings available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {selectedJobId && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {jobPostings?.find(job => job.id.toString() === selectedJobId)?.title}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicators */}
      <div className="grid grid-cols-3 gap-6">
        {/* Remaining Candidates */}
        <div 
          className={`border p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
            viewMode === 'review' 
              ? 'bg-blue-50 border-blue-300' 
              : 'bg-white border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => setViewMode('review')}
        >
          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${
              viewMode === 'review' ? 'text-blue-900' : 'text-gray-900'
            }`}>
              {enrichedCandidates?.length || 0}
            </div>
            <div className={`text-xs font-medium uppercase tracking-wider ${
              viewMode === 'review' ? 'text-blue-700' : 'text-gray-600'
            }`}>
              To Review
            </div>
          </div>
        </div>

        {/* Approved Progress */}
        <div 
          className={`p-4 relative overflow-hidden rounded-lg cursor-pointer transition-all hover:shadow-md ${
            viewMode === 'approved' 
              ? 'bg-green-50 border-green-300 border' 
              : 'bg-gray-200 border-gray-300 border'
          }`}
          onClick={() => setViewMode('approved')}
        >
          <div className="relative z-10 text-center">
            <div className={`text-3xl font-bold mb-1 ${
              viewMode === 'approved' ? 'text-green-900' : 'text-gray-900'
            }`}>
              {shortlistedCandidates?.length ?? 0}/{jobPostings?.find(job => job.id.toString() === selectedJobId)?.target_candidates_count ?? 500}
            </div>
            <div className={`text-xs font-medium uppercase tracking-wider ${
              viewMode === 'approved' ? 'text-green-700' : 'text-gray-600'
            }`}>
              Approved
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-300 rounded-b-lg">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-b-lg ${
                viewMode === 'approved' ? 'bg-green-600' : 'bg-gray-900'
              }`}
              style={{ width: `${Math.min(((shortlistedCandidates?.length ?? 0) / (jobPostings?.find(job => job.id.toString() === selectedJobId)?.target_candidates_count ?? 500)) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Rejected Candidates */}
        <div 
          className={`border p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
            viewMode === 'rejected' 
              ? 'bg-red-50 border-red-300' 
              : 'bg-white border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => setViewMode('rejected')}
        >
          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${
              viewMode === 'rejected' ? 'text-red-900' : 'text-gray-900'
            }`}>
              {rejectedCandidatesFromAPI?.length ?? 0}
            </div>
            <div className={`text-xs font-medium uppercase tracking-wider ${
              viewMode === 'rejected' ? 'text-red-700' : 'text-gray-600'
            }`}>
              Rejected
            </div>
          </div>
        </div>
      </div>

      {/* View Title */}
      {selectedJobId && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{getViewTitle()}</h2>
          <div className="text-sm text-gray-600">
            {getCurrentCandidates().length} candidate{getCurrentCandidates().length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Candidates Grid */}
      {!selectedJobId ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <Briefcase className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Select a Job Role</h3>
            <p className="text-sm">Choose a job posting from the dropdown above to start reviewing candidates.</p>
          </div>
        </div>
      ) : getCurrentCandidates().length > 0 ? (
        <div className="space-y-6">
          {/* Candidates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {getCurrentCandidates().map((candidate) => (
              <Card key={candidate.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Candidate Photo and Basic Info */}
                    <div className="flex items-center gap-3">
                      {/* <Image
                        src={candidate.photo}
                        alt={candidate.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 grayscale cursor-pointer hover:border-gray-400 transition-colors"
                        onClick={() => {
                          setSelectedCandidate(candidate)
                          setIsProfilePanelOpen(true)
                        }}
                      /> */}
                      <img
                        src={candidate.photo}
                        alt={candidate.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 grayscale cursor-pointer hover:border-gray-400 transition-colors"
                        onClick={() => {
                          setSelectedCandidate(candidate)
                          setIsProfilePanelOpen(true)
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{candidate.name}</h3>
                        <p className="text-xs text-gray-600 truncate">{candidate.title}</p>
                        <p className="text-xs text-gray-500 truncate">{candidate.company}</p>
                      </div>
                    </div>

                    {/* Location and Education */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{candidate.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <GraduationCap className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{candidate.education}</span>
                      </div>
                    </div>

                    {/* Experience Preview */}
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Briefcase className="h-3 w-3" />
                        <span className="text-xs font-medium">Experience</span>
                      </div>
                      <div className="space-y-1">
                        {candidate.experience.slice(0, 2).map((exp, index) => (
                          <div key={index} className="text-xs">
                            <div className="font-medium truncate">{exp.title}</div>
                            <div className="text-gray-600 truncate">{exp.company}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary Preview */}
                    <div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {candidate.summary}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {viewMode === 'review' ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(candidate.id)}
                            className="flex-1 h-8 text-xs"
                            disabled={rejectCandidateMutation.isPending}
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            {rejectCandidateMutation.isPending ? 'Rejecting...' : 'Reject'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(candidate.id)}
                            className="flex-1 h-8 text-xs"
                            disabled={approveCandidateMutation.isPending}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {approveCandidateMutation.isPending ? 'Approving...' : 'Approve'}
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : isFetchingCandidates ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold">Loading candidates...</h3>
            <p className="text-sm">Fetching candidates for the selected job role.</p>
          </div>
        </div>
      ) : candidatesError ? (
        <div className="text-center py-12">
          <div className="text-red-500">
            <X className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Error Loading Candidates</h3>
            <p className="text-sm">Failed to fetch candidates: {candidatesError.message}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <Check className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">
              {viewMode === 'review' ? 'All candidates reviewed!' : 
               viewMode === 'approved' ? 'No approved candidates yet' :
               'No rejected candidates yet'}
            </h3>
            <p className="text-sm">
              {viewMode === 'review' ? 'You\'ve reviewed all candidates in your queue.' :
               viewMode === 'approved' ? 'Approved candidates will appear here.' :
               'Rejected candidates will appear here.'}
            </p>
          </div>
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
                  <Image
                    src={selectedCandidate.photo}
                    alt={selectedCandidate.name}
                    width={96}
                    height={96}
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
