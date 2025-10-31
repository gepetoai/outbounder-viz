'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Loader2, ArrowLeft } from 'lucide-react'
import { useJobPostings, useCreateJobPosting } from '@/hooks/useJobPostings'
import { useToast } from '@/components/ui/toast'

interface JobPostingRequiredModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onJobSelected: (jobId: number) => void
  initialView?: 'select' | 'create'
}

type ModalView = 'select' | 'create'

export function JobPostingRequiredModal({
  open,
  onOpenChange,
  onJobSelected,
  initialView = 'select'
}: JobPostingRequiredModalProps) {
  const [currentView, setCurrentView] = useState<ModalView>(initialView)
  const [selectedJobId, setSelectedJobId] = useState<string>('')

  // Form state for creating new job
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newJobUrl, setNewJobUrl] = useState('')
  const [newTargetCandidates, setNewTargetCandidates] = useState(500)

  // Hooks
  const { data: jobPostings = [], isLoading: isLoadingJobs } = useJobPostings()
  const createJobMutation = useCreateJobPosting()
  const { showToast } = useToast()

  // Reset view when modal opens based on initialView
  useEffect(() => {
    if (open) {
      setCurrentView(initialView)
    }
  }, [open, initialView])

  const handleClose = () => {
    // Reset state when closing
    setCurrentView(initialView)
    setSelectedJobId('')
    setNewJobTitle('')
    setNewJobUrl('')
    setNewTargetCandidates(500)
    onOpenChange(false)
  }

  const handleSelectJob = () => {
    if (selectedJobId) {
      onJobSelected(parseInt(selectedJobId))
      handleClose()
    }
  }

  const handleCreateJob = () => {
    if (!newJobTitle || !newJobUrl) return

    createJobMutation.mutate({
      title: newJobTitle,
      url: newJobUrl,
      target_candidates_count: newTargetCandidates,
      fk_organization_id: 1,
    }, {
      onSuccess: (data) => {
        showToast('Job posting created successfully!', 'success')
        onJobSelected(data.id)
        handleClose()
      },
      onError: (error) => {
        console.error('Failed to create job posting:', error)
        showToast('Failed to create job posting', 'error')
      }
    })
  }

  const renderContent = () => {
    switch (currentView) {
      case 'select':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Job Posting Required</DialogTitle>
              <DialogDescription>
                You don't have a job posting tied to this search. Please select an existing one or create a new one.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-3 flex flex-col items-center justify-center">
                <Label htmlFor="job-select" className="text-center">Select Job Posting</Label>
                {isLoadingJobs ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : jobPostings.length === 0 ? (
                  <div className="text-sm text-gray-500 py-4 text-center border rounded-md p-4 max-w-sm">
                    No job postings available. Please create one to continue.
                  </div>
                ) : (
                  <div className="max-w-xs">
                    <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                      <SelectTrigger id="job-select">
                        <SelectValue placeholder="Select a job posting..." />
                      </SelectTrigger>
                      <SelectContent>
                        {jobPostings.map((job) => (
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
              <Button
                variant="outline"
                onClick={() => setCurrentView('create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Job Posting
              </Button>
              <Button
                onClick={handleSelectJob}
                disabled={!selectedJobId || jobPostings.length === 0}
              >
                Continue with Selected Job
              </Button>
            </DialogFooter>
          </>
        )

      case 'create':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Create Job Posting</DialogTitle>
              <DialogDescription>
                Fill in the details for your new job posting.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-job-title">Job Title</Label>
                <Input
                  id="new-job-title"
                  placeholder="e.g., Senior Software Engineer"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-job-url">Application URL</Label>
                <Input
                  id="new-job-url"
                  type="url"
                  placeholder="Paste application URL here..."
                  value={newJobUrl}
                  onChange={(e) => setNewJobUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-target-candidates">Target Candidates</Label>
                <Input
                  id="new-target-candidates"
                  type="number"
                  placeholder="500"
                  value={newTargetCandidates}
                  onChange={(e) => setNewTargetCandidates(parseInt(e.target.value) || 500)}
                />
              </div>
            </div>
            <DialogFooter>
              {initialView === 'select' && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentView('select')}
                  disabled={createJobMutation.isPending}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleCreateJob}
                disabled={!newJobTitle || !newJobUrl || createJobMutation.isPending}
              >
                {createJobMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {initialView === 'create' ? 'Create Job Posting' : 'Create & Continue'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}
