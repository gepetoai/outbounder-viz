'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Check, ThumbsUp, ThumbsDown, ExternalLink, MapPin, GraduationCap, Briefcase, Download, Table as TableIcon, ArrowRight, RotateCcw, ChevronLeft, ChevronRight, SkipForward, User } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { useCandidatesForReview } from '@/hooks/useSearch'
import { useApproveCandidate, useRejectCandidate, useShortlistedCandidates, useRejectedCandidates, useMoveCandidateToReview } from '@/hooks/useCandidates'
import { useJobPostings } from '@/hooks/useJobPostings'
import type { EnrichedCandidateResponse } from '@/lib/search-api'
import { useQueryClient } from '@tanstack/react-query'

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
  const [viewType, setViewType] = useState<'single' | 'table'>('single')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set())
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [targetJobId, setTargetJobId] = useState<string>('')

  // Query client for manual cache invalidation
  const queryClient = useQueryClient()

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

  const handleMoveToReview = async (candidateId: string) => {
    if (!selectedJobId) return
    
    try {
      await moveToReviewMutation.mutateAsync({
        fk_job_description_id: parseInt(selectedJobId),
        fk_candidate_id: parseInt(candidateId)
      })
    } catch (error) {
      console.error('Failed to move candidate to review:', error)
    }
  }

  const getCandidateStatus = (candidateId: string): 'review' | 'approved' | 'rejected' => {
    if (shortlistedCandidates?.some(item => item.fk_candidate.id.toString() === candidateId)) {
      return 'approved'
    }
    if (rejectedCandidatesFromAPI?.some(item => item.fk_candidate.id.toString() === candidateId)) {
      return 'rejected'
    }
    return 'review'
  }

  const handleStatusChange = async (candidateId: string, newStatus: 'review' | 'approved' | 'rejected') => {
    const currentStatus = getCandidateStatus(candidateId)
    if (currentStatus === newStatus) return

    if (newStatus === 'approved') {
      await handleApprove(candidateId)
    } else if (newStatus === 'rejected') {
      await handleReject(candidateId)
    } else {
      await handleMoveToReview(candidateId)
    }
  }

  // Single card view handlers
  const handleApproveAndNext = async () => {
    const candidates = getCurrentCandidates()
    if (currentCardIndex >= candidates.length) return
    
    const candidate = candidates[currentCardIndex]
    await handleApprove(candidate.id)
    
    // Move to next candidate
    if (currentCardIndex < candidates.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
    }
  }

  const handleRejectAndNext = async () => {
    const candidates = getCurrentCandidates()
    if (currentCardIndex >= candidates.length) return
    
    const candidate = candidates[currentCardIndex]
    await handleReject(candidate.id)
    
    // Move to next candidate
    if (currentCardIndex < candidates.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
    }
  }

  const handleSkip = () => {
    const candidates = getCurrentCandidates()
    if (currentCardIndex < candidates.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
    }
  }

  // Reset card index when view mode or job changes
  useEffect(() => {
    setCurrentCardIndex(0)
  }, [viewMode, selectedJobId])

  const downloadCandidatesCSV = () => {
    let candidatesList: any[] = []
    let filePrefix = 'candidates'
    
    // Get the appropriate candidate list based on view mode
    switch (viewMode) {
      case 'approved':
        if (!shortlistedCandidates || shortlistedCandidates.length === 0) {
          console.log('No approved candidates to download')
          return
        }
        candidatesList = shortlistedCandidates.map(item => item.fk_candidate)
        filePrefix = 'approved'
        break
      case 'rejected':
        if (!rejectedCandidatesFromAPI || rejectedCandidatesFromAPI.length === 0) {
          console.log('No rejected candidates to download')
          return
        }
        candidatesList = rejectedCandidatesFromAPI.map(item => item.fk_candidate)
        filePrefix = 'rejected'
        break
      case 'review':
      default:
        if (!enrichedCandidates || enrichedCandidates.length === 0) {
          console.log('No candidates to download')
          return
        }
        candidatesList = enrichedCandidates
        filePrefix = 'to_review'
        break
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

  // Bulk selection handlers
  const handleSelectAll = () => {
    const currentCandidates = getCurrentCandidates()
    if (selectedCandidateIds.size === currentCandidates.length) {
      setSelectedCandidateIds(new Set())
    } else {
      setSelectedCandidateIds(new Set(currentCandidates.map(c => c.id)))
    }
  }

  const handleSelectCandidate = (candidateId: string) => {
    const newSelected = new Set(selectedCandidateIds)
    if (newSelected.has(candidateId)) {
      newSelected.delete(candidateId)
    } else {
      newSelected.add(candidateId)
    }
    setSelectedCandidateIds(newSelected)
  }

  const handleBulkApprove = async () => {
    if (!selectedJobId) return
    
    const approvePromises = Array.from(selectedCandidateIds).map(candidateId =>
      approveCandidateMutation.mutateAsync({
        fk_job_description_id: parseInt(selectedJobId),
        fk_candidate_id: parseInt(candidateId)
      }).catch(error => {
        console.error(`Failed to approve candidate ${candidateId}:`, error)
      })
    )
    
    await Promise.all(approvePromises)
    
    // Invalidate all candidate queries to refresh the UI
    queryClient.invalidateQueries({ queryKey: ['candidates'] })
    queryClient.invalidateQueries({ queryKey: ['shortlistedCandidates'] })
    queryClient.invalidateQueries({ queryKey: ['rejectedCandidates'] })
    
    setSelectedCandidateIds(new Set())
  }

  const handleBulkReject = async () => {
    if (!selectedJobId) return
    
    const rejectPromises = Array.from(selectedCandidateIds).map(candidateId =>
      rejectCandidateMutation.mutateAsync({
        fk_job_description_id: parseInt(selectedJobId),
        fk_candidate_id: parseInt(candidateId)
      }).catch(error => {
        console.error(`Failed to reject candidate ${candidateId}:`, error)
      })
    )
    
    await Promise.all(rejectPromises)
    
    // Invalidate all candidate queries to refresh the UI
    queryClient.invalidateQueries({ queryKey: ['candidates'] })
    queryClient.invalidateQueries({ queryKey: ['shortlistedCandidates'] })
    queryClient.invalidateQueries({ queryKey: ['rejectedCandidates'] })
    
    setSelectedCandidateIds(new Set())
  }

  const handleBulkMoveToReview = async () => {
    if (!selectedJobId) return
    
    const movePromises = Array.from(selectedCandidateIds).map(candidateId =>
      moveToReviewMutation.mutateAsync({
        fk_job_description_id: parseInt(selectedJobId),
        fk_candidate_id: parseInt(candidateId)
      }).catch(error => {
        console.error(`Failed to move candidate ${candidateId} to review:`, error)
      })
    )
    
    await Promise.all(movePromises)
    
    // Invalidate all candidate queries to refresh the UI
    queryClient.invalidateQueries({ queryKey: ['candidates'] })
    queryClient.invalidateQueries({ queryKey: ['shortlistedCandidates'] })
    queryClient.invalidateQueries({ queryKey: ['rejectedCandidates'] })
    
    setSelectedCandidateIds(new Set())
  }

  const handleMoveToJob = async () => {
    if (!targetJobId) return
    
    // For now, we'll approve them on the current job and log the move
    // In a real implementation, you'd have a separate endpoint for moving candidates
    console.log(`Moving ${selectedCandidateIds.size} candidates to job ${targetJobId}`)
    
    // You could implement this by creating a new candidate_job_mapping or similar
    setShowMoveDialog(false)
    setSelectedCandidateIds(new Set())
    setTargetJobId('')
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
              <SelectTrigger className="h-16 text-base w-full py-4" style={{ height: '4rem' }}>
                <SelectValue placeholder="Select a job role to view candidates" />
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
            <div className="text-sm text-gray-600">
              {getCurrentCandidates().length} candidate{getCurrentCandidates().length !== 1 ? 's' : ''}
            </div>
            
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

      {/* Bulk Actions Toolbar - Permanent header in table view */}
      {selectedJobId && viewType === 'table' && (
        <Card className="bg-white border-gray-300">
          <CardContent className="py-1 px-0">
            <div className="flex items-center justify-between h-8">
              <div className="text-xs font-medium text-gray-900 pl-3 min-w-[150px]">
                {selectedCandidateIds.size > 0 && (
                  <>{selectedCandidateIds.size} candidate{selectedCandidateIds.size !== 1 ? 's' : ''} selected</>
                )}
              </div>
              <div className="flex items-center gap-1 pr-3">
                {/* Three-position bulk status slider */}
                <div className="inline-flex items-center bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={handleBulkReject}
                    disabled={rejectCandidateMutation.isPending || selectedCandidateIds.size === 0}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                      viewMode === 'rejected'
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'
                    }`}
                  >
                    <ThumbsDown className="h-3 w-3" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={handleBulkMoveToReview}
                    disabled={moveToReviewMutation.isPending || selectedCandidateIds.size === 0}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                      viewMode === 'review'
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'
                    }`}
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Review</span>
                  </button>
                  <button
                    onClick={handleBulkApprove}
                    disabled={approveCandidateMutation.isPending || selectedCandidateIds.size === 0}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                      viewMode === 'approved'
                        ? 'bg-gray-900 shadow-sm text-white'
                        : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'
                    }`}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>Approve</span>
                  </button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowMoveDialog(true)}
                  disabled={selectedCandidateIds.size === 0}
                  className="h-7 px-3 py-0 text-xs bg-white border-gray-300 text-gray-800 hover:bg-gray-100 disabled:opacity-50"
                >
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Move
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadCandidatesCSV}
                  disabled={getCurrentCandidates().length === 0}
                  className="h-7 px-3 py-0 text-xs bg-white border-gray-300 text-gray-800 hover:bg-gray-100 disabled:opacity-50"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
          {/* Single Card View */}
          {viewType === 'single' && (() => {
            const candidates = getCurrentCandidates()
            const currentCandidate = candidates[currentCardIndex]
            
            if (!currentCandidate) return null
            
            return (
              <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                {/* Progress Indicator */}
                <div className="text-sm text-gray-600 font-medium">
                  {currentCardIndex + 1} of {candidates.length}
                </div>

                {/* Compact Candidate Card */}
                <Card className="w-full max-w-md overflow-hidden shadow-lg">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Candidate Photo and Basic Info */}
                      <div className="flex flex-col items-center text-center space-y-3">
                        <img
                          src={currentCandidate.photo}
                          alt={currentCandidate.name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 grayscale cursor-pointer hover:border-gray-400 transition-colors"
                          onClick={() => {
                            setSelectedCandidate(currentCandidate)
                            setIsProfilePanelOpen(true)
                          }}
                        />
                        <div>
                          <h2 className="text-xl font-bold mb-1">{currentCandidate.name}</h2>
                          <p className="text-sm text-gray-700">{currentCandidate.title}</p>
                          <p className="text-sm text-gray-600">{currentCandidate.company}</p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{currentCandidate.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons - Three-position slider matching table view */}
                <div className="flex items-center justify-center gap-3">
                  <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={handleRejectAndNext}
                      disabled={rejectCandidateMutation.isPending}
                      className={`px-6 py-3 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                        viewMode === 'rejected'
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={handleSkip}
                      className="px-6 py-3 text-sm font-medium rounded-md transition-all flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <SkipForward className="h-4 w-4" />
                      <span>Skip</span>
                    </button>
                    <button
                      onClick={handleApproveAndNext}
                      disabled={approveCandidateMutation.isPending}
                      className={`px-6 py-3 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                        viewMode === 'approved'
                          ? 'bg-gray-900 shadow-sm text-white'
                          : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={currentCardIndex === 0}
                    className="h-8 px-3"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSkip}
                    disabled={currentCardIndex === candidates.length - 1}
                    className="h-8 px-3"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )
          })()}

          {/* Table View */}
          {viewType === 'table' && (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px] pl-4">
                        <Checkbox
                          checked={selectedCandidateIds.size === getCurrentCandidates().length && getCurrentCandidates().length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="w-[60px] pl-2"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Education</TableHead>
                      <TableHead className="w-[200px] text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentCandidates().map((candidate) => (
                      <TableRow key={candidate.id} className="hover:bg-gray-50">
                        <TableCell className="pl-4">
                          <Checkbox
                            checked={selectedCandidateIds.has(candidate.id)}
                            onCheckedChange={() => handleSelectCandidate(candidate.id)}
                          />
                        </TableCell>
                        <TableCell className="pl-2">
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-colors"
                            onClick={() => {
                              setSelectedCandidate(candidate)
                              setIsProfilePanelOpen(true)
                            }}
                          >
                            <img
                              src={candidate.photo}
                              alt={candidate.name}
                              className="w-full h-full object-cover grayscale"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <button
                            className="text-left hover:text-gray-700 transition-colors"
                            onClick={() => {
                              setSelectedCandidate(candidate)
                              setIsProfilePanelOpen(true)
                            }}
                          >
                            {candidate.name}
                          </button>
                        </TableCell>
                        <TableCell>{candidate.title}</TableCell>
                        <TableCell>{candidate.company}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span>{candidate.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <GraduationCap className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate max-w-[200px]">{candidate.education}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            {/* Three-position status slider */}
                            <div className="inline-flex items-center bg-gray-100 rounded-lg p-0.5">
                              <button
                                onClick={() => handleStatusChange(candidate.id, 'rejected')}
                                disabled={rejectCandidateMutation.isPending || approveCandidateMutation.isPending || moveToReviewMutation.isPending}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                  viewMode === 'rejected'
                                    ? 'bg-white shadow-sm text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(candidate.id, 'review')}
                                disabled={rejectCandidateMutation.isPending || approveCandidateMutation.isPending || moveToReviewMutation.isPending}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                  viewMode === 'review'
                                    ? 'bg-white shadow-sm text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                <RotateCcw className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(candidate.id, 'approved')}
                                disabled={rejectCandidateMutation.isPending || approveCandidateMutation.isPending || moveToReviewMutation.isPending}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                  viewMode === 'approved'
                                    ? 'bg-gray-900 shadow-sm text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
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
                  <img src={selectedCandidate.photo} alt={selectedCandidate.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4 grayscale" />
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
                        <div key={index} className="border-l-2 border-gray-300 pl-3">
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

      {/* Move to Job Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Candidates to Another Job</DialogTitle>
            <DialogDescription>
              Select a job posting to move the {selectedCandidateIds.size} selected candidate{selectedCandidateIds.size !== 1 ? 's' : ''} to.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={targetJobId} onValueChange={setTargetJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Select target job posting" />
              </SelectTrigger>
              <SelectContent>
                {jobPostings
                  ?.filter(job => job.id.toString() !== selectedJobId)
                  .map((job) => (
                    <SelectItem key={job.id} value={job.id.toString()}>
                      {job.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveToJob} disabled={!targetJobId}>
              Move Candidates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
