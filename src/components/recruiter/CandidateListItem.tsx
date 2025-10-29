'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import type { Candidate } from '@/lib/utils'

interface CandidateListItemProps {
  candidate: Candidate
  onClick?: (candidate: Candidate) => void
  onApprove?: (candidateId: string) => void
  onReject?: (candidateId: string) => void
  showActions?: boolean
  isApproving?: boolean
  isRejecting?: boolean
}

export function CandidateListItem({
  candidate,
  onClick,
  onApprove,
  onReject,
  showActions = true,
  isApproving = false,
  isRejecting = false
}: CandidateListItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <img
        src={candidate.photo}
        alt={candidate.name}
        className="w-12 h-12 rounded-full object-cover grayscale cursor-pointer"
        onClick={() => onClick?.(candidate)}
      />
      <div className="flex-1 cursor-pointer" onClick={() => onClick?.(candidate)}>
        <div className="flex items-center gap-2">
          <h4 className="font-semibold">{candidate.name}</h4>
          <Badge variant="outline">{candidate.title}</Badge>
        </div>
        <p className="text-sm text-gray-600">{candidate.company} • {candidate.location}</p>
        <p className="text-sm text-gray-500">{candidate.education}</p>
      </div>
      {showActions && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReject?.(candidate.id)}
            className="h-8 text-xs"
            disabled={isRejecting || isApproving}
          >
            <ThumbsDown className="h-3 w-3 mr-1" />
            {isRejecting ? 'Rejecting...' : 'Reject'}
          </Button>
          <Button
            size="sm"
            onClick={() => onApprove?.(candidate.id)}
            className="h-8 text-xs"
            disabled={isApproving || isRejecting}
          >
            <ThumbsUp className="h-3 w-3 mr-1" />
            {isApproving ? 'Approving...' : 'Approve'}
          </Button>
        </div>
      )}
    </div>
  )
}

