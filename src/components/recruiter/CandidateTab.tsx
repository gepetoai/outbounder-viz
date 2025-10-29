'use client'

import { useState, useEffect } from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Check, Briefcase, Download, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useCandidatesForReview } from '@/hooks/useSearch'
import { useApproveCandidate, useRejectCandidate, useShortlistedCandidates, useRejectedCandidates, useMoveCandidateToReview } from '@/hooks/useCandidates'
import { useJobPostings } from '@/hooks/useJobPostings'
import { mapEnrichedCandidateToCandidate, type Candidate } from '@/lib/utils'
import { CandidateCard } from './CandidateCard'
import { CandidateDetailPanel } from './CandidateDetailPanel'

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
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0)

  // Reset candidate index when job or view mode changes
  useEffect(() => {
    setCurrentCandidateIndex(0)
  }, [selectedJobId, viewMode])

  // Helper function to check if selectedJobId is a valid job ID
  const isValidJobId = (jobId: string) => {
    return jobId && jobId !== 'loading-jobs' && jobId !== 'no-jobs-available' && !isNaN(parseInt(jobId))
  }

  // Fetch job postings for dropdown
  const { data: jobPostings, isLoading: isLoadingJobs } = useJobPostings()

  // Fetch candidates from API if we have a job description ID
  const { data: enrichedCandidates, isLoading: isFetchingCandidates, error: candidatesError } = useCandidatesForReview(
    isValidJobId(selectedJobId) ? parseInt(selectedJobId) : null
  )

  // API mutation hooks
  const approveCandidateMutation = useApproveCandidate()
  const rejectCandidateMutation = useRejectCandidate()
  const moveToReviewMutation = useMoveCandidateToReview()

  // Fetch approved and rejected candidates for counts
  const { data: shortlistedCandidates } = useShortlistedCandidates(
    selectedJobId ? parseInt(selectedJobId) : null
  )
  const { data: rejectedCandidatesFromAPI } = useRejectedCandidates(
    selectedJobId ? parseInt(selectedJobId) : null
  )

  const moveToNextCandidate = () => {
    const reviewCandidates = (enrichedCandidates || []).map(mapEnrichedCandidateToCandidate)
    // Don't increment if we're at the last candidate, stay at current index
    // The list will refresh and remove the approved/rejected candidate
    if (currentCandidateIndex < reviewCandidates.length - 1) {
      setCurrentCandidateIndex(currentCandidateIndex + 1)
    }
  }

  // Reset index if it's out of bounds after a candidate is removed
  useEffect(() => {
    if (viewMode === 'review') {
      const reviewCandidates = (enrichedCandidates || []).map(mapEnrichedCandidateToCandidate)
      if (reviewCandidates.length > 0 && currentCandidateIndex >= reviewCandidates.length) {
        setCurrentCandidateIndex(Math.max(0, reviewCandidates.length - 1))
      }
    }
  }, [enrichedCandidates, currentCandidateIndex, viewMode])

  const handleApprove = async (candidateId: string) => {
    if (!selectedJobId) return
    
    try {
      await approveCandidateMutation.mutateAsync({
        fk_job_description_id: parseInt(selectedJobId),
        fk_candidate_id: parseInt(candidateId)
      })
      // Move to next candidate after successful approval
      moveToNextCandidate()
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
      // Move to next candidate after successful rejection
      moveToNextCandidate()
    } catch (error) {
      console.error('Failed to reject candidate:', error)
    }
  }

  const handleSkip = () => {
    const reviewCandidates = (enrichedCandidates || []).map(mapEnrichedCandidateToCandidate)
    // Loop back to the beginning if we're at the last candidate
    if (currentCandidateIndex >= reviewCandidates.length - 1) {
      setCurrentCandidateIndex(0)
    } else {
      setCurrentCandidateIndex(currentCandidateIndex + 1)
    }
  }

  const downloadApprovedCandidatesCSV = () => {
    if (!shortlistedCandidates || shortlistedCandidates.length === 0) {
      console.log('No approved candidates to download')
      return
    }

    // Create CSV content
    const headers = ['First Name', 'Last Name', 'LinkedIn Profile URL']
    const csvContent = [
      headers.join(','),
      ...candidatesList.map(candidate => {
        const firstName = candidate.first_name || ''
        const lastName = candidate.last_name || ''
        const linkedinUrl = candidate.raw_data.websites_linkedin
          || (candidate.linkedin_canonical_slug ? `https://linkedin.com/in/${candidate.linkedin_canonical_slug}` : '')
          || (candidate.linkedin_shorthand_slug ? `https://linkedin.com/in/${candidate.linkedin_shorthand_slug}` : '')
        
        // Escape commas and quotes in CSV
        const escapeCSV = (str: string) => {
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        }
        
        return [
          escapeCSV(firstName),
          escapeCSV(lastName),
          escapeCSV(linkedinUrl)
        ].join(',')
      })
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    
    // Get job title for filename
    const jobTitle = jobPostings?.find(job => job.id.toString() === selectedJobId)?.title || 'candidates'
    const filename = `${filePrefix}_${jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Helper function to get current candidates based on view mode
  const getCurrentCandidates = () => {
    switch (viewMode) {
      case 'approved':
        return (shortlistedCandidates || []).map(item => mapEnrichedCandidateToCandidate(item.fk_candidate))
      case 'rejected':
        return (rejectedCandidatesFromAPI || []).map(item => mapEnrichedCandidateToCandidate(item.fk_candidate))
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
            Select Open Role
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
              <SelectTrigger className="h-16 text-base w-full py-4 gap-0" style={{ height: '4rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
                {selectedJobId && jobPostings?.find(job => job.id.toString() === selectedJobId) ? (
                  <div className="flex flex-col w-full text-left">
                    <span className="font-medium truncate">{jobPostings.find(job => job.id.toString() === selectedJobId)?.title}</span>
                    <span className="text-xs text-gray-500 truncate">
                      Target: {jobPostings.find(job => job.id.toString() === selectedJobId)?.target_candidates_count} candidates
                    </span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select a job role to view candidates" />
                )}
              </SelectTrigger>
              <SelectContent className="w-full">
                {isLoadingJobs ? (
                  <SelectItem value="loading-jobs" disabled>
                    Loading job postings...
                  </SelectItem>
                ) : jobPostings && jobPostings.length > 0 ? (
                  jobPostings.map((job) => (
                    <SelectItem key={job.id} value={job.id.toString()} className="w-full">
                      <span className="font-medium truncate">{job.title}</span>
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
        </CardContent>
      </Card>

      {/* Progress Indicators */}
      <div className="grid grid-cols-3 gap-6">
        {/* Remaining Candidates */}
        <div 
          className={`border p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
            viewMode === 'review' 
              ? 'bg-gray-100 border-gray-400' 
              : 'bg-white border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => setViewMode('review')}
        >
          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${
              viewMode === 'review' ? 'text-gray-900' : 'text-gray-900'
            }`}>
              {enrichedCandidates?.length || 0}
            </div>
            <div className={`text-xs font-medium uppercase tracking-wider ${
              viewMode === 'review' ? 'text-gray-700' : 'text-gray-600'
            }`}>
              To Review
            </div>
          </div>
        </div>

        {/* Approved Progress */}
        <div 
          className={`p-4 relative overflow-hidden rounded-lg cursor-pointer transition-all hover:shadow-md ${
            viewMode === 'approved' 
              ? 'bg-gray-100 border-gray-400 border' 
              : 'bg-gray-200 border-gray-300 border'
          }`}
          onClick={() => setViewMode('approved')}
        >
          <div className="relative z-10 text-center">
            <div className={`text-3xl font-bold mb-1 ${
              viewMode === 'approved' ? 'text-gray-900' : 'text-gray-900'
            }`}>
              {shortlistedCandidates?.length ?? 0}/{jobPostings?.find(job => job.id.toString() === selectedJobId)?.target_candidates_count ?? 500}
            </div>
            <div className={`text-xs font-medium uppercase tracking-wider ${
              viewMode === 'approved' ? 'text-gray-700' : 'text-gray-600'
            }`}>
              Approved
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-300 rounded-b-lg">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-b-lg ${
                viewMode === 'approved' ? 'bg-gray-900' : 'bg-gray-900'
              }`}
              style={{ width: `${Math.min(((shortlistedCandidates?.length ?? 0) / (jobPostings?.find(job => job.id.toString() === selectedJobId)?.target_candidates_count ?? 500)) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Rejected Candidates */}
        <div 
          className={`border p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
            viewMode === 'rejected' 
              ? 'bg-gray-100 border-gray-400' 
              : 'bg-white border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => setViewMode('rejected')}
        >
          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${
              viewMode === 'rejected' ? 'text-gray-900' : 'text-gray-900'
            }`}>
              {rejectedCandidatesFromAPI?.length ?? 0}
            </div>
            <div className={`text-xs font-medium uppercase tracking-wider ${
              viewMode === 'rejected' ? 'text-gray-700' : 'text-gray-600'
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
          <div className="flex items-center gap-4">
            {/* View Type Toggle */}
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                size="sm"
                variant={viewType === 'single' ? 'default' : 'ghost'}
                onClick={() => setViewType('single')}
                className="rounded-none h-8 px-3"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewType === 'table' ? 'default' : 'ghost'}
                onClick={() => setViewType('table')}
                className="rounded-none h-8 px-3"
              >
                <TableIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Candidates Display */}
      {!selectedJobId ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <Briefcase className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Select a Job Role</h3>
            <p className="text-sm">Choose a job posting from the dropdown above to start reviewing candidates.</p>
          </div>
        </div>
      ) : getCurrentCandidates().length > 0 && getCurrentCandidates()[currentCandidateIndex] ? (
        viewMode === 'review' ? (
          /* Single Card Review Mode */
          <div className="space-y-6">
            {/* Single Candidate Card */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <CandidateCard
                  key={getCurrentCandidates()[currentCandidateIndex].id}
                  candidate={getCurrentCandidates()[currentCandidateIndex]}
                  variant="detailed"
                  showActions={false}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onClick={(candidate) => {
                    setSelectedCandidate(candidate)
                    setIsProfilePanelOpen(true)
                  }}
                  isApproving={approveCandidateMutation.isPending}
                  isRejecting={rejectCandidateMutation.isPending}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(getCurrentCandidates()[currentCandidateIndex].id)}
                disabled={rejectCandidateMutation.isPending || approveCandidateMutation.isPending}
                className="h-8 text-xs"
              >
                <ThumbsDown className="h-3 w-3 mr-1" />
                {rejectCandidateMutation.isPending ? 'Rejecting...' : 'Reject'}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleSkip}
                disabled={rejectCandidateMutation.isPending || approveCandidateMutation.isPending}
                className="h-8 text-xs"
              >
                Skip
              </Button>
              
              <Button
                size="sm"
                onClick={() => handleApprove(getCurrentCandidates()[currentCandidateIndex].id)}
                disabled={approveCandidateMutation.isPending || rejectCandidateMutation.isPending}
                className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                {approveCandidateMutation.isPending ? 'Approving...' : 'Approve'}
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="text-center text-sm text-gray-600 font-medium">
              Candidate {currentCandidateIndex + 1} of {getCurrentCandidates().length}
            </div>
          </div>
        ) : (
          /* Grid View for Approved/Rejected */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getCurrentCandidates().map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  variant="detailed"
                  showActions={false}
                  onClick={(candidate) => {
                    setSelectedCandidate(candidate)
                    setIsProfilePanelOpen(true)
                  }}
                />
              ))}
            </div>
          </div>
        )
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
      <CandidateDetailPanel
        key={selectedCandidate?.id}
        candidate={selectedCandidate}
        isOpen={isProfilePanelOpen}
        onClose={() => {
          setIsProfilePanelOpen(false)
          setSelectedCandidate(null)
        }}
        variant="slide"
      />
    </div>
  )
}
