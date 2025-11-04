'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, GraduationCap, Briefcase, ThumbsUp, ThumbsDown } from 'lucide-react'
import type { Candidate } from '@/lib/utils'

interface CandidateCardProps {
  candidate: Candidate
  variant?: 'simple' | 'detailed'
  showActions?: boolean
  onApprove?: (candidateId: string) => void
  onReject?: (candidateId: string) => void
  onClick?: (candidate: Candidate) => void
  isApproving?: boolean
  isRejecting?: boolean
}

export function CandidateCard({
  candidate,
  variant = 'simple',
  showActions = false,
  onApprove,
  onReject,
  onClick,
  isApproving = false,
  isRejecting = false
}: CandidateCardProps) {
  // Simple variant - used in SearchTab
  if (variant === 'simple') {
    return (
      <div
        className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => onClick?.(candidate)}
      >
        <img
          src={candidate.photo}
          alt={candidate.name}
          className="w-12 h-12 rounded-full object-cover grayscale"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{candidate.name}</h4>
            <Badge variant="outline">{candidate.title}</Badge>
          </div>
          <p className="text-sm text-gray-600">{candidate.company} • {candidate.location}</p>
          <p className="text-sm text-gray-500">{candidate.education}</p>
        </div>
      </div>
    )
  }

  // Detailed variant - used in CandidateTab
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-[360px] flex flex-col">
      <CardContent className="py-1 px-4 flex-1 flex flex-col overflow-hidden">
        {/* Scrollable content area */}
        <div className="space-y-2 flex-1 overflow-y-auto">
          {/* Candidate Photo and Basic Info */}
          <div className="flex items-center gap-3">
            <img
              src={candidate.photo}
              alt={candidate.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 grayscale cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => onClick?.(candidate)}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{candidate.name}</h3>
              <p className="text-xs text-gray-600 truncate">{candidate.title}</p>
              <p className="text-xs text-gray-500 truncate">{candidate.company}</p>
            </div>
          </div>

          {/* Location and Education */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{candidate.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <GraduationCap className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{candidate.education}</span>
            </div>
          </div>

          {/* Experience Preview */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Briefcase className="h-3 w-3" />
              <span className="text-xs font-medium">Experience</span>
            </div>
            <div className="space-y-1">
              {candidate.experience.slice(0, 2).map((exp, index) => (
                <div key={index} className="text-xs">
                  <div className="font-medium truncate">{exp.title}</div>
                  <div className="text-gray-600 truncate">{exp.company}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Preview */}
          <div>
            <p className="text-xs text-gray-600 line-clamp-4">
              {candidate.summary}
            </p>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject?.(candidate.id)}
                className="flex-1 h-8 text-xs"
                disabled={isRejecting}
              >
                <ThumbsDown className="h-3 w-3 mr-1" />
                {isRejecting ? 'Rejecting...' : 'Reject'}
              </Button>
              <Button
                size="sm"
                onClick={() => onApprove?.(candidate.id)}
                className="flex-1 h-8 text-xs"
                disabled={isApproving}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                {isApproving ? 'Approving...' : 'Approve'}
              </Button>
            </div>
          )}
        </div>

        {/* Search Title - Fixed at bottom, always visible. Uses non-breaking space to preserve height when empty. */}
        <div className="pt-2 mt-2 border-t border-gray-100 flex-shrink-0">
          <p className="text-xs text-gray-500 truncate">
            {candidate.searchTitle || '\u00A0'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

