'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Check, Briefcase, Download, ThumbsUp, ThumbsDown, User, Table as TableIcon, RotateCcw } from 'lucide-react'
import { useMoveCandidates, useCandidatesForReview } from '@/hooks/useSearch'
import {
  useApproveCandidate,
  useRejectCandidate,
  useShortlistedCandidates,
  useRejectedCandidates,
  useApproveCandidateFromRejected,
  useRejectCandidateFromShortlisted,
  useSendToReviewFromShortlisted,
  useSendToReviewFromRejected
} from '@/hooks/useCandidates'
import { usePaginatedCandidates } from '@/hooks/usePaginatedCandidates'
import { useJobPostings } from '@/hooks/useJobPostings'
import { type Candidate } from '@/lib/utils'
import { CandidateCard } from './CandidateCard'
import { CandidateDetailPanel } from './CandidateDetailPanel'
import { CandidateTableView } from './CandidateTableView'
import { MoveCandidatesModal } from './MoveCandidatesModal'
import { useToast } from '@/components/ui/toast'
import { Pagination } from '@/components/ui/pagination'

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
  const [viewType, setViewType] = useState<'single' | 'table'>('single')
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0)
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false)
  const [candidatesToMove, setCandidatesToMove] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const { showToast } = useToast()

  // Reset pagination when job or view mode changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedJobId, viewMode])

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

  // Calculate offset for pagination
  const offset = (currentPage - 1) * pageSize

  // Fetch paginated candidates for current view mode
  const {
    candidates,
    totalCount,
    isLoading: isFetchingCandidates,
    error: candidatesError,
    rawCandidates
  } = usePaginatedCandidates({
    viewMode,
    jobDescriptionId: isValidJobId(selectedJobId) ? parseInt(selectedJobId) : null,
    offset,
    limit: pageSize
  })

  // API mutation hooks
  const approveCandidateMutation = useApproveCandidate()
  const rejectCandidateMutation = useRejectCandidate()
  const moveCandidatesMutation = useMoveCandidates()
  const approveCandidateFromRejectedMutation = useApproveCandidateFromRejected()
  const rejectCandidateFromShortlistedMutation = useRejectCandidateFromShortlisted()
  const sendToReviewFromShortlistedMutation = useSendToReviewFromShortlisted()
  const sendToReviewFromRejectedMutation = useSendToReviewFromRejected()

  // Get total counts for progress indicators (fetch separately to show all counts)
  const { data: allReviewResponse } = useCandidatesForReview(
    isValidJobId(selectedJobId) ? parseInt(selectedJobId) : null,
    0,
    1 // Just need count, so limit to 1
  )
  const { data: allShortlistedResponse } = useShortlistedCandidates(
    isValidJobId(selectedJobId) ? parseInt(selectedJobId) : null,
    0,
    1
  )
  const { data: allRejectedResponse } = useRejectedCandidates(
    isValidJobId(selectedJobId) ? parseInt(selectedJobId) : null,
    0,
    1
  )

  const reviewTotalCount = allReviewResponse?.total || 0
  const shortlistedTotalCount = allShortlistedResponse?.total || 0
  const rejectedTotalCount = allRejectedResponse?.total || 0

  const moveToNextCandidate = () => {
    // Don't increment the index - when the candidate is removed from the list by React Query,
    // the same index will automatically show the next candidate
    // Only decrement if we were at the last candidate and it's being removed
    if (currentCandidateIndex >= candidates.length - 1 && currentCandidateIndex > 0) {
      // We're removing the last candidate, so go back one to show the new last candidate
      setCurrentCandidateIndex(currentCandidateIndex - 1)
    }
    // Otherwise, stay at the same index - the list will update and show the next candidate
  }

  // Reset index if it's out of bounds after a candidate is removed
  useEffect(() => {
    if (candidates.length > 0 && currentCandidateIndex >= candidates.length) {
      setCurrentCandidateIndex(Math.max(0, candidates.length - 1))
    }
  }, [candidates, currentCandidateIndex])

  const handleApprove = async (candidateId: string) => {
    if (!selectedJobId) return

    try {
      // Use different mutation based on current view mode
      if (viewMode === 'rejected') {
        await approveCandidateFromRejectedMutation.mutateAsync({
          fk_job_description_id: parseInt(selectedJobId),
          fk_candidate_ids: [parseInt(candidateId)]
        })
      } else {
        await approveCandidateMutation.mutateAsync({
          fk_job_description_id: parseInt(selectedJobId),
          fk_candidate_id: parseInt(candidateId)
        })
      }
      // Move to next candidate after successful approval (only in review mode)
      if (viewMode === 'review') {
        moveToNextCandidate()
      }
    } catch (error) {
      console.error('Failed to approve candidate:', error)
    }
  }

  const handleReject = async (candidateId: string) => {
    if (!selectedJobId) return

    try {
      // Use different mutation based on current view mode
      if (viewMode === 'approved') {
        await rejectCandidateFromShortlistedMutation.mutateAsync({
          fk_job_description_id: parseInt(selectedJobId),
          fk_candidate_ids: [parseInt(candidateId)]
        })
      } else {
        await rejectCandidateMutation.mutateAsync({
          fk_job_description_id: parseInt(selectedJobId),
          fk_candidate_id: parseInt(candidateId)
        })
      }
      // Move to next candidate after successful rejection (only in review mode)
      if (viewMode === 'review') {
        moveToNextCandidate()
      }
    } catch (error) {
      console.error('Failed to reject candidate:', error)
    }
  }

  const handleSendToReview = async (candidateId: string) => {
    if (!selectedJobId) return

    try {
      if (viewMode === 'approved') {
        await sendToReviewFromShortlistedMutation.mutateAsync({
          fk_job_description_id: parseInt(selectedJobId),
          fk_candidate_ids: [parseInt(candidateId)]
        })
      } else if (viewMode === 'rejected') {
        await sendToReviewFromRejectedMutation.mutateAsync({
          fk_job_description_id: parseInt(selectedJobId),
          fk_candidate_ids: [parseInt(candidateId)]
        })
      }
    } catch (error) {
      console.error('Failed to send candidate to review:', error)
    }
  }

  const handleSkip = () => {
    // Loop back to the beginning if we're at the last candidate
    if (currentCandidateIndex >= candidates.length - 1) {
      setCurrentCandidateIndex(0)
    } else {
      setCurrentCandidateIndex(currentCandidateIndex + 1)
    }
  }

  const handleMoveClick = (candidateIds: string[]) => {
    setCandidatesToMove(candidateIds)
    setIsMoveModalOpen(true)
  }

  const handleMoveCandidates = async (targetJobDescriptionId: number) => {
    if (!selectedJobId || candidatesToMove.length === 0) return

    try {
      const result = await moveCandidatesMutation.mutateAsync({
        target_job_description_id: targetJobDescriptionId,
        candidate_ids: candidatesToMove.map(id => parseInt(id))
      })

      showToast(`Successfully moved ${result.moved_candidates_count} candidate${result.moved_candidates_count !== 1 ? 's' : ''}`, 'success')
      setCandidatesToMove([])
    } catch (error) {
      console.error('Failed to move candidates:', error)
      showToast('Failed to move candidates', 'error')
    }
  }

  const downloadCandidatesCSV = () => {
    // Get the appropriate data based on view mode using rawCandidates
    const getCandidatesData = () => {
      if (!rawCandidates || rawCandidates.length === 0) {
        return []
      }

      switch (viewMode) {
        case 'approved':
        case 'rejected':
          // For approved/rejected, rawCandidates contains items with fk_candidate
          return rawCandidates.map((item: any) => ({
            firstName: item.fk_candidate.first_name || '',
            lastName: item.fk_candidate.last_name || '',
            linkedinUrl: item.fk_candidate.raw_data.websites_linkedin
              || (item.fk_candidate.linkedin_canonical_slug ? `https://linkedin.com/in/${item.fk_candidate.linkedin_canonical_slug}` : '')
              || (item.fk_candidate.linkedin_shorthand_slug ? `https://linkedin.com/in/${item.fk_candidate.linkedin_shorthand_slug}` : ''),
            createdAt: item.created_at || ''
          }))
        case 'review':
        default:
          // For review, rawCandidates contains EnrichedCandidateResponse directly
          return rawCandidates.map((item: any) => ({
            firstName: item.first_name || '',
            lastName: item.last_name || '',
            linkedinUrl: item.raw_data.websites_linkedin
              || (item.linkedin_canonical_slug ? `https://linkedin.com/in/${item.linkedin_canonical_slug}` : '')
              || (item.linkedin_shorthand_slug ? `https://linkedin.com/in/${item.linkedin_shorthand_slug}` : ''),
            createdAt: item.created_at || ''
          }))
      }
    }

    const candidatesData = getCandidatesData()

    if (candidatesData.length === 0) {
      console.log('No candidates to download')
      return
    }

    // Escape commas and quotes in CSV
    const escapeCSV = (str: string) => {
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    // Create CSV content
    const headers = ['First Name', 'Last Name', 'LinkedIn Profile URL', 'Created At']
    const csvContent = [
      headers.join(','),
      ...candidatesData.map(candidate => {
        return [
          escapeCSV(candidate.firstName),
          escapeCSV(candidate.lastName),
          escapeCSV(candidate.linkedinUrl),
          escapeCSV(candidate.createdAt)
        ].join(',')
      })
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)

    // Get job title and status prefix for filename
    const jobTitle = jobPostings?.find(job => job.id.toString() === selectedJobId)?.title || 'candidates'
    const statusPrefix = viewMode === 'approved' ? 'approved' : viewMode === 'rejected' ? 'rejected' : 'to_review'
    const filename = `${statusPrefix}_${jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`

    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const startIndex = offset
  const endIndex = Math.min(offset + candidates.length, totalCount)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
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
                      <div className="flex flex-col w-full">
                        <span className="font-medium truncate">{job.title}</span>
                        <span className="text-xs text-gray-500 truncate">
                          Target: {job.target_candidates_count} candidates
                        </span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-jobs-available" disabled>
                    No job postings available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {selectedJobId && selectedJobId !== 'loading-jobs' && selectedJobId !== 'no-jobs-available' && (
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
          className={`border p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${viewMode === 'review'
              ? 'bg-blue-50 border-blue-300'
              : 'bg-white border-gray-300 hover:border-gray-400'
            }`}
          onClick={() => setViewMode('review')}
        >
          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${viewMode === 'review' ? 'text-blue-900' : 'text-gray-900'
              }`}>
              {reviewTotalCount}
            </div>
            <div className={`text-xs font-medium uppercase tracking-wider ${viewMode === 'review' ? 'text-blue-700' : 'text-gray-600'
              }`}>
              To Review
            </div>
          </div>
        </div>

        {/* Approved Progress */}
        <div
          className={`p-4 relative overflow-hidden rounded-lg cursor-pointer transition-all hover:shadow-md ${viewMode === 'approved'
              ? 'bg-green-50 border-green-300 border'
              : 'bg-gray-200 border-gray-300 border'
            }`}
          onClick={() => setViewMode('approved')}
        >
          <div className="relative z-10 text-center">
            <div className={`text-3xl font-bold mb-1 ${viewMode === 'approved' ? 'text-green-900' : 'text-gray-900'
              }`}>
              {shortlistedTotalCount}/{jobPostings?.find(job => job.id.toString() === selectedJobId)?.target_candidates_count ?? 500}
            </div>
            <div className={`text-xs font-medium uppercase tracking-wider ${viewMode === 'approved' ? 'text-green-700' : 'text-gray-600'
              }`}>
              Approved
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-300 rounded-b-lg">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-b-lg ${viewMode === 'approved' ? 'bg-green-600' : 'bg-gray-900'
                }`}
              style={{ width: `${Math.min((shortlistedTotalCount / (jobPostings?.find(job => job.id.toString() === selectedJobId)?.target_candidates_count ?? 500)) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Rejected Candidates */}
        <div
          className={`border p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${viewMode === 'rejected'
              ? 'bg-red-50 border-red-300'
              : 'bg-white border-gray-300 hover:border-gray-400'
            }`}
          onClick={() => setViewMode('rejected')}
        >
          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${viewMode === 'rejected' ? 'text-red-900' : 'text-gray-900'
              }`}>
              {rejectedTotalCount}
            </div>
            <div className={`text-xs font-medium uppercase tracking-wider ${viewMode === 'rejected' ? 'text-red-700' : 'text-gray-600'
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
            {viewType === 'table' && (
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {endIndex} of {totalCount} candidate{totalCount !== 1 ? 's' : ''}
              </div>
            )}
            {viewType === 'single' && (
              <div className="text-sm text-gray-600">
                {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
              </div>
            )}

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

            {candidates.length > 0 && viewType === 'single' && (
              <Button
                size="sm"
                variant="outline"
                onClick={downloadCandidatesCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
            )}
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
      ) : candidates.length > 0 && (candidates[currentCandidateIndex] || viewType === 'table') ? (
        viewType === 'table' ? (
          /* Table View for All Modes */
          <>
            <CandidateTableView
              candidates={candidates}
              onCandidateClick={(candidate) => {
                setSelectedCandidate(candidate)
                setIsProfilePanelOpen(true)
              }}
              onApprove={handleApprove}
              onReject={handleReject}
              onSendToReview={handleSendToReview}
              onDownloadCSV={downloadCandidatesCSV}
              onMove={handleMoveClick}
              viewMode={viewMode}
              isApproving={approveCandidateMutation.isPending || approveCandidateFromRejectedMutation.isPending}
              isRejecting={rejectCandidateMutation.isPending || rejectCandidateFromShortlistedMutation.isPending}
            />
            {/* Pagination Controls - Show for all modes */}
            {totalCount > 0 && candidates.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalCount={totalCount}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </>
        ) : viewMode === 'review' ? (
          /* Single Card Review Mode */
          <div className="space-y-6">
            {/* Single Candidate Card */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <CandidateCard
                  key={candidates[currentCandidateIndex].id}
                  candidate={candidates[currentCandidateIndex]}
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
                onClick={() => handleReject(candidates[currentCandidateIndex].id)}
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
                onClick={() => handleApprove(candidates[currentCandidateIndex].id)}
                disabled={approveCandidateMutation.isPending || rejectCandidateMutation.isPending}
                className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                {approveCandidateMutation.isPending ? 'Approving...' : 'Approve'}
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="text-center text-sm text-gray-600 font-medium">
              Candidate {currentCandidateIndex + 1} of {candidates.length}
            </div>
          </div>
        ) : (
          /* Grid View for Approved/Rejected */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="space-y-2">
                  <CandidateCard
                    candidate={candidate}
                    variant="detailed"
                    showActions={false}
                    onClick={(candidate) => {
                      setSelectedCandidate(candidate)
                      setIsProfilePanelOpen(true)
                    }}
                  />
                  {/* Action buttons for approved/rejected candidates */}
                  <div className="flex justify-center gap-2">
                    {viewMode === 'approved' ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(candidate.id)}
                          disabled={rejectCandidateFromShortlistedMutation.isPending}
                          className="h-7 text-xs flex-1"
                        >
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendToReview(candidate.id)}
                          disabled={sendToReviewFromShortlistedMutation.isPending}
                          className="h-7 text-xs flex-1"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(candidate.id)}
                          disabled={approveCandidateFromRejectedMutation.isPending}
                          className="h-7 text-xs flex-1"
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendToReview(candidate.id)}
                          disabled={sendToReviewFromRejectedMutation.isPending}
                          className="h-7 text-xs flex-1"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                      </>
                    )}
                  </div>
                </div>
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

      {/* Move Candidates Modal */}
      <MoveCandidatesModal
        open={isMoveModalOpen}
        onOpenChange={(open) => {
          setIsMoveModalOpen(open)
          if (!open) {
            setCandidatesToMove([])
          }
        }}
        onJobSelected={handleMoveCandidates}
        candidateCount={candidatesToMove.length}
        currentJobDescriptionId={selectedJobId ? parseInt(selectedJobId) : undefined}
      />
    </div>
  )
}
