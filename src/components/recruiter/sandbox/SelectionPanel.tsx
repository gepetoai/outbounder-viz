'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Candidate } from '@/lib/utils'
import type { JobPosting } from '@/hooks/useJobPostings'

interface SelectionPanelProps {
  openRoles: JobPosting[]
  selectedOpenRole?: string
  onOpenRoleChange?: (roleId: string) => void
  candidates: Candidate[]
  selectedCandidate?: Candidate | null
  onCandidateChange?: (candidateId: string) => void
  onCandidatePhotoClick?: (candidate: Candidate) => void
}

export function SelectionPanel({
  openRoles,
  selectedOpenRole,
  onOpenRoleChange,
  candidates,
  selectedCandidate,
  onCandidateChange,
  onCandidatePhotoClick
}: SelectionPanelProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4 bg-white">
      {/* Select Candidate */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Select Candidate</Label>
        <div className="flex gap-2 items-end">
          <div className="flex-1 min-w-0">
            <Select
              value={selectedCandidate?.id || ''}
              onValueChange={onCandidateChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a candidate..." />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedCandidate && (
            <button
              onClick={() => onCandidatePhotoClick?.(selectedCandidate)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors flex-shrink-0"
              title="View candidate profile"
            >
              <img
                src={selectedCandidate.photo}
                alt={selectedCandidate.name}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
