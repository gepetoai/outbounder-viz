'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useJobPostings } from '@/hooks/useJobPostings'

interface MoveCandidatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onJobSelected: (targetJobDescriptionId: number) => void
  candidateCount: number
  currentJobDescriptionId?: number
}

export function MoveCandidatesModal({
  open,
  onOpenChange,
  onJobSelected,
  candidateCount,
  currentJobDescriptionId
}: MoveCandidatesModalProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const { data: jobPostings = [], isLoading: isLoadingJobs } = useJobPostings()

  const handleClose = () => {
    setSelectedJobId('')
    onOpenChange(false)
  }

  const handleMoveClick = () => {
    if (selectedJobId) {
      onJobSelected(parseInt(selectedJobId))
      handleClose()
    }
  }

  // Filter out the current job description
  const availableJobs = jobPostings.filter(
    job => job.id !== currentJobDescriptionId
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move Candidates</DialogTitle>
          <DialogDescription>
            Select the job posting to move {candidateCount} candidate{candidateCount !== 1 ? 's' : ''} to.
            This will duplicate the search and link it to the target job posting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-3 flex flex-col items-center justify-center">
            <Label htmlFor="job-select" className="text-center">Target Job Posting</Label>
            {isLoadingJobs ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
              </div>
            ) : availableJobs.length === 0 ? (
              <div className="text-sm text-gray-500 py-4 text-center border rounded-md p-4 max-w-sm">
                No other job postings available to move candidates to.
              </div>
            ) : (
              <div className="max-w-xs">
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger id="job-select">
                    <SelectValue placeholder="Select a job posting..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableJobs.map((job) => (
                      <SelectItem key={job.id} value={job.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{job.title}</span>
                          <span className="text-xs text-gray-500">
                            Target: {job.target_candidates_count} candidates
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleMoveClick}
            disabled={!selectedJobId || isLoadingJobs}
          >
            Move Candidates
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
