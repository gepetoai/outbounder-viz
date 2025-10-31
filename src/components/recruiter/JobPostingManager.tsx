'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, Building2, Search, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useJobPostings, useCreateJobPosting, useUpdateJobPosting, useDeleteJobPosting, type JobPosting } from '@/hooks/useJobPostings'
import { JobPostingFormDialog } from './JobPostingFormDialog'
import { useToast } from '@/components/ui/toast'

interface JobPostingManagerProps {
  onSearchClick: (jobId: number) => void
}

export function JobPostingManager({ onSearchClick }: JobPostingManagerProps) {
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newJobUrl, setNewJobUrl] = useState('')
  const [newTargetCandidates, setNewTargetCandidates] = useState(500)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingJobId, setDeletingJobId] = useState<number | null>(null)

  // React Query hooks
  const { data: jobPostings = [], isLoading, error } = useJobPostings()
  const createJobMutation = useCreateJobPosting()
  const updateJobMutation = useUpdateJobPosting()
  const deleteJobMutation = useDeleteJobPosting()

  // Toast notifications
  const { showToast } = useToast()

  const handleSaveJob = () => {
    if (!newJobTitle || !newJobUrl) return

    createJobMutation.mutate({
      title: newJobTitle,
      url: newJobUrl,
      target_candidates_count: newTargetCandidates,
      fk_organization_id: 1, // As specified by user
    }, {
      onSuccess: () => {
        // Reset form on success
        setNewJobTitle('')
        setNewJobUrl('')
        setNewTargetCandidates(500)
      }
    })
  }

  const handleEditJob = (job: JobPosting) => {
    setEditingJob(job)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = (data: { title: string; url: string; target_candidates_count: number }) => {
    if (!editingJob) return

    updateJobMutation.mutate({
      id: editingJob.id,
      data: {
        title: data.title,
        url: data.url,
        target_candidates_count: data.target_candidates_count,
      }
    }, {
      onSuccess: () => {
        setEditDialogOpen(false)
        setEditingJob(null)
        showToast('Job posting updated successfully!', 'success')
      },
      onError: (error) => {
        console.error('Failed to update job posting:', error)
        showToast('Failed to update job posting', 'error')
      }
    })
  }

  const handleDeleteClick = (jobId: number) => {
    setDeletingJobId(jobId)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!deletingJobId) return

    deleteJobMutation.mutate(deletingJobId, {
      onSuccess: () => {
        setDeleteConfirmOpen(false)
        setDeletingJobId(null)
        showToast('Job posting deleted successfully!', 'success')
      },
      onError: (error) => {
        console.error('Failed to delete job posting:', error)
        showToast('Failed to delete job posting', 'error')
      }
    })
  }

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false)
    setDeletingJobId(null)
  }

  return (
    <div className="space-y-6">
      {/* Add New Open Role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Open Role
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title</Label>
            <Input
              id="job-title"
              placeholder="e.g., Senior Software Engineer"
              value={newJobTitle}
              onChange={(e) => setNewJobTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-url">Application URL</Label>
            <Input
              id="job-url"
              type="url"
              placeholder="Paste application URL here..."
              value={newJobUrl}
              onChange={(e) => setNewJobUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-candidates">Target Candidates</Label>
            <Input
              id="target-candidates"
              type="number"
              placeholder="500"
              value={newTargetCandidates}
              onChange={(e) => setNewTargetCandidates(parseInt(e.target.value) || 500)}
            />
          </div>
          <Button 
            disabled={!newJobTitle || !newJobUrl || createJobMutation.isPending} 
            className="flex items-center gap-2"
            onClick={handleSaveJob}
          >
            {createJobMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {createJobMutation.isPending ? 'Saving...' : 'Save Open Role'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Open Roles */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading open roles...</span>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-8">
            <p className="text-red-600 text-center">
              Error loading open roles: {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && jobPostings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Open Roles ({jobPostings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobPostings.slice().reverse().map((job) => (
                <div
                  key={job.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.target_candidates_count} candidates</p>
                      <p className="text-xs text-gray-500">{job.url}</p>
                      {job.created_at && (
                        <p className="text-xs text-gray-400">
                          Created: {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditJob(job)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(job.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSearchClick(job.id)}
                      >
                        <Search className="h-4 w-4 mr-1" />
                        Search
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Job Dialog */}
      <JobPostingFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        job={editingJob}
        onSave={handleSaveEdit}
        isLoading={updateJobMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent showCloseButton={false} aria-describedby="delete-dialog-description">
          <DialogHeader>
            <DialogTitle>Delete Job Posting</DialogTitle>
            <DialogDescription id="delete-dialog-description">
              Are you sure you want to delete this job posting? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={deleteJobMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteJobMutation.isPending}
              autoFocus
            >
              {deleteJobMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
