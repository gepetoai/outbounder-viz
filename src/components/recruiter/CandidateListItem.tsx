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
  isApproved?: boolean
  isRejected?: boolean
  processingCandidateId?: string | null
  processingAction?: 'approve' | 'reject' | null
}

export function CandidateListItem({
  candidate,
  onClick,
  onApprove,
  onReject,
  showActions = true,
  isApproved = false,
  isRejected = false,
  processingCandidateId = null,
  processingAction = null
}: CandidateListItemProps) {
  const isThisCandidateProcessing = processingCandidateId === candidate.id
  const isApproving = isThisCandidateProcessing && processingAction === 'approve'
  const isRejecting = isThisCandidateProcessing && processingAction === 'reject'
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
        {candidate.searchTitle && (
          <p className="text-xs text-gray-500 mt-1">{candidate.searchTitle}</p>
        )}
      </div>
      {showActions && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isRejected ? "default" : "outline"}
            onClick={() => onReject?.(candidate.id)}
            className={`h-8 text-xs ${isRejected ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
            disabled={isRejecting || isApproving}
          >
            <ThumbsDown className="h-3 w-3 mr-1" />
            {isRejecting ? 'Rejecting...' : isRejected ? 'Rejected' : 'Reject'}
          </Button>
          <Button
            size="sm"
            variant={isApproved ? "default" : "outline"}
            onClick={() => onApprove?.(candidate.id)}
            className={`h-8 text-xs ${isApproved ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
            disabled={isApproving || isRejecting}
          >
            <ThumbsUp className="h-3 w-3 mr-1" />
            {isApproving ? 'Approving...' : isApproved ? 'Approved' : 'Approve'}
          </Button>
        </div>
      )}
    </div>
  )
}

