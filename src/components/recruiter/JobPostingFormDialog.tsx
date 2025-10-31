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
import { Loader2 } from 'lucide-react'
import type { JobPosting } from '@/hooks/useJobPostings'

interface JobPostingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job?: JobPosting | null
  onSave: (data: { title: string; url: string; target_candidates_count: number }) => void
  isLoading?: boolean
}

export function JobPostingFormDialog({
  open,
  onOpenChange,
  job,
  onSave,
  isLoading = false
}: JobPostingFormDialogProps) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [targetCandidates, setTargetCandidates] = useState(500)

  // Populate form when editing
  useEffect(() => {
    if (job) {
      setTitle(job.title)
      setUrl(job.url)
      setTargetCandidates(job.target_candidates_count)
    } else {
      setTitle('')
      setUrl('')
      setTargetCandidates(500)
    }
  }, [job, open])

  const handleSave = () => {
    onSave({
      title,
      url,
      target_candidates_count: targetCandidates
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{job ? 'Edit Job Posting' : 'Add New Job Posting'}</DialogTitle>
          <DialogDescription>
            {job ? 'Update the job posting details below.' : 'Fill in the details for the new job posting.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-job-title">Job Title</Label>
            <Input
              id="edit-job-title"
              placeholder="e.g., Senior Software Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-job-url">Application URL</Label>
            <Input
              id="edit-job-url"
              type="url"
              placeholder="Paste application URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-target-candidates">Target Candidates</Label>
            <Input
              id="edit-target-candidates"
              type="number"
              placeholder="500"
              value={targetCandidates}
              onChange={(e) => setTargetCandidates(parseInt(e.target.value) || 500)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title || !url || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
