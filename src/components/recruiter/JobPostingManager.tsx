'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Building2, Search, Loader2 } from 'lucide-react'
import { useJobPostings, useCreateJobPosting } from '@/hooks/useJobPostings'

interface JobPostingManagerProps {
  onSearchClick: (jobId: string) => void
}

export function JobPostingManager({ onSearchClick }: JobPostingManagerProps) {
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newJobUrl, setNewJobUrl] = useState('')
  const [newTargetCandidates, setNewTargetCandidates] = useState(500)

  // React Query hooks
  const { data: jobPostings = [], isLoading, error } = useJobPostings()
  const createJobMutation = useCreateJobPosting()

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

  return (
    <div className="space-y-6">
      {/* Add New Job Posting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Job Posting
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
            <Label htmlFor="job-url">Job URL</Label>
            <Input
              id="job-url"
              type="url"
              placeholder="Paste job posting URL here..."
              value={newJobUrl}
              onChange={(e) => setNewJobUrl(e.target.value)}
              className="font-mono text-sm"
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
            <p className="text-sm text-gray-600">
              Number of candidates you need to reach out to for this role
            </p>
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
            {createJobMutation.isPending ? 'Saving...' : 'Save Job Posting'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Job Postings */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading job postings...</span>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-8">
            <p className="text-red-600 text-center">
              Error loading job postings: {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && jobPostings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Job Postings ({jobPostings.length})
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
                      <p className="text-sm text-gray-600">Target: {job.target_candidates_count} candidates</p>
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
                        onClick={() => onSearchClick(job.id)}
                      >
                        <Search className="h-4 w-4 mr-1" />
                        View Candidates
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
