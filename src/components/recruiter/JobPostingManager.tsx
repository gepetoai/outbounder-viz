'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Building2, Search, Trash2 } from 'lucide-react'

export interface JobPosting {
  id: string
  title: string
  url: string
  targetCandidates: number
  createdAt: Date
}

interface JobPostingManagerProps {
  jobPostings: JobPosting[]
  setJobPostings: (jobs: JobPosting[]) => void
  onSearchClick: (jobId: string) => void
}

export function JobPostingManager({ jobPostings, setJobPostings, onSearchClick }: JobPostingManagerProps) {
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newJobUrl, setNewJobUrl] = useState('')
  const [newTargetCandidates, setNewTargetCandidates] = useState(500)

  const handleSaveJob = () => {
    const newJob: JobPosting = {
      id: Date.now().toString(),
      title: newJobTitle,
      url: newJobUrl,
      targetCandidates: newTargetCandidates,
      createdAt: new Date()
    }
    setJobPostings([...jobPostings, newJob])
    setNewJobTitle('')
    setNewJobUrl('')
    setNewTargetCandidates(500)
  }

  const handleDeleteJob = (jobId: string) => {
    setJobPostings(jobPostings.filter(j => j.id !== jobId))
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
            disabled={!newJobTitle || !newJobUrl} 
            className="flex items-center gap-2"
            onClick={handleSaveJob}
          >
            <Plus className="h-4 w-4" />
            Save Job Posting
          </Button>
        </CardContent>
      </Card>

      {/* Existing Job Postings */}
      {jobPostings.length > 0 && (
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
                      <p className="text-sm text-gray-600">Target: {job.targetCandidates} candidates</p>
                      <p className="text-xs text-gray-500">{job.url}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSearchClick(job.id)}
                      >
                        <Search className="h-4 w-4 mr-1" />
                        Search
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
