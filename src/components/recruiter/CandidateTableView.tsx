'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MapPin, GraduationCap, ThumbsUp, ThumbsDown, Download, ArrowRightLeft, RotateCcw } from 'lucide-react'
import type { Candidate } from '@/lib/utils'

interface CandidateTableViewProps {
  candidates: Candidate[]
  onCandidateClick: (candidate: Candidate) => void
  onApprove: (candidateId: string) => Promise<void>
  onReject: (candidateId: string) => Promise<void>
  onSendToReview?: (candidateId: string) => Promise<void>
  onDownloadCSV: () => void
  onMove?: (candidateIds: string[]) => void
  viewMode: 'review' | 'approved' | 'rejected'
  isApproving?: boolean
  isRejecting?: boolean
}

export function CandidateTableView({
  candidates,
  onCandidateClick,
  onApprove,
  onReject,
  onSendToReview,
  onDownloadCSV,
  onMove,
  viewMode,
  isApproving = false,
  isRejecting = false
}: CandidateTableViewProps) {
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set())

  const handleSelectAll = () => {
    if (selectedCandidateIds.size === candidates.length) {
      setSelectedCandidateIds(new Set())
    } else {
      setSelectedCandidateIds(new Set(candidates.map(c => c.id)))
    }
  }

  const handleSelectCandidate = (candidateId: string) => {
    const newSelected = new Set(selectedCandidateIds)
    if (newSelected.has(candidateId)) {
      newSelected.delete(candidateId)
    } else {
      newSelected.add(candidateId)
    }
    setSelectedCandidateIds(newSelected)
  }

  const handleBulkApprove = async () => {
    const approvePromises = Array.from(selectedCandidateIds).map(candidateId =>
      onApprove(candidateId).catch(error => {
        console.error(`Failed to approve candidate ${candidateId}:`, error)
      })
    )

    await Promise.all(approvePromises)
    setSelectedCandidateIds(new Set())
  }

  const handleBulkReject = async () => {
    const rejectPromises = Array.from(selectedCandidateIds).map(candidateId =>
      onReject(candidateId).catch(error => {
        console.error(`Failed to reject candidate ${candidateId}:`, error)
      })
    )

    await Promise.all(rejectPromises)
    setSelectedCandidateIds(new Set())
  }

  const handleBulkSendToReview = async () => {
    if (!onSendToReview) return

    const sendToReviewPromises = Array.from(selectedCandidateIds).map(candidateId =>
      onSendToReview(candidateId).catch(error => {
        console.error(`Failed to send candidate ${candidateId} to review:`, error)
      })
    )

    await Promise.all(sendToReviewPromises)
    setSelectedCandidateIds(new Set())
  }

  const handleMoveClick = () => {
    if (onMove) {
      onMove(Array.from(selectedCandidateIds))
      setSelectedCandidateIds(new Set())
    }
  }

  const handleStatusChange = async (candidateId: string, newStatus: 'approved' | 'rejected' | 'review') => {
    if (newStatus === 'approved') {
      await onApprove(candidateId)
    } else if (newStatus === 'rejected') {
      await onReject(candidateId)
    } else if (newStatus === 'review' && onSendToReview) {
      await onSendToReview(candidateId)
    }
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Toolbar */}
      <Card className="bg-white border-gray-300">
        <CardContent className="py-1 px-0">
          <div className="flex items-center justify-between h-8">
            <div className="text-xs font-medium text-gray-900 pl-3 min-w-[150px]">
              {selectedCandidateIds.size > 0 && (
                <>{selectedCandidateIds.size} candidate{selectedCandidateIds.size !== 1 ? 's' : ''} selected</>
              )}
            </div>
            <div className="flex items-center gap-1 pr-3">
              {/* Bulk status slider - 3-way for approved/rejected, 2-way for review */}
              <div className="inline-flex items-center bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={handleBulkReject}
                  disabled={isRejecting || selectedCandidateIds.size === 0}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                    viewMode === 'rejected'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'
                  }`}
                >
                  <ThumbsDown className="h-3 w-3" />
                  <span>Reject</span>
                </button>
                {(viewMode === 'approved' || viewMode === 'rejected') && onSendToReview && (
                  <button
                    onClick={handleBulkSendToReview}
                    disabled={selectedCandidateIds.size === 0}
                    className="px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Review</span>
                  </button>
                )}
                <button
                  onClick={handleBulkApprove}
                  disabled={isApproving || selectedCandidateIds.size === 0}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                    viewMode === 'approved'
                      ? 'bg-gray-900 shadow-sm text-white'
                      : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'
                  }`}
                >
                  <ThumbsUp className="h-3 w-3" />
                  <span>Approve</span>
                </button>
              </div>
              {onMove && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMoveClick}
                  disabled={selectedCandidateIds.size === 0}
                  className="h-7 px-3 py-0 text-xs bg-white border-gray-300 text-gray-800 hover:bg-gray-100 disabled:opacity-50"
                >
                  <ArrowRightLeft className="h-4 w-4 mr-1" />
                  Move
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={onDownloadCSV}
                disabled={candidates.length === 0}
                className="h-7 px-3 py-0 text-xs bg-white border-gray-300 text-gray-800 hover:bg-gray-100 disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] pl-4">
                    <Checkbox
                      checked={selectedCandidateIds.size === candidates.length && candidates.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[60px] pl-2"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden lg:table-cell">Title</TableHead>
                  <TableHead className="hidden xl:table-cell">Company</TableHead>
                  <TableHead className="hidden xl:table-cell">Location</TableHead>
                  <TableHead className="hidden 2xl:table-cell">Education</TableHead>
                  <TableHead className="w-[180px] text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {candidates.map((candidate) => (
                <TableRow
                  key={candidate.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onCandidateClick(candidate)}
                >
                  <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedCandidateIds.has(candidate.id)}
                      onCheckedChange={() => handleSelectCandidate(candidate.id)}
                    />
                  </TableCell>
                  <TableCell className="pl-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-400 transition-colors">
                      <img
                        src={candidate.photo}
                        alt={candidate.name}
                        className="w-full h-full object-cover grayscale"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px]">
                    <div className="flex flex-col min-w-0">
                      <span className="truncate block" title={candidate.name}>{candidate.name}</span>
                      <span className="text-xs text-gray-500 lg:hidden truncate block" title={candidate.title}>{candidate.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[250px]">
                    <div className="truncate" title={candidate.title}>{candidate.title}</div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell max-w-[200px]">
                    <div className="truncate" title={candidate.company}>{candidate.company}</div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell max-w-[200px]">
                    <div className="flex items-center gap-1 text-sm text-gray-600 min-w-0">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate block min-w-0" title={candidate.location}>{candidate.location}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden 2xl:table-cell max-w-[250px]">
                    <div className="flex items-center gap-1 text-sm text-gray-600 min-w-0">
                      <GraduationCap className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate block min-w-0" title={candidate.education}>{candidate.education}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1 justify-end">
                      {/* Status slider - 3-way for approved/rejected, 2-way for review */}
                      <div className="inline-flex items-center bg-gray-100 rounded-lg p-0.5">
                        <button
                          onClick={() => handleStatusChange(candidate.id, 'rejected')}
                          disabled={isRejecting || isApproving}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            viewMode === 'rejected'
                              ? 'bg-white shadow-sm text-gray-900'
                              : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'
                          }`}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                        {(viewMode === 'approved' || viewMode === 'rejected') && onSendToReview && (
                          <button
                            onClick={() => handleStatusChange(candidate.id, 'review')}
                            disabled={isRejecting || isApproving}
                            className="px-3 py-1.5 text-xs font-medium rounded-md transition-all text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusChange(candidate.id, 'approved')}
                          disabled={isRejecting || isApproving}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            viewMode === 'approved'
                              ? 'bg-gray-900 shadow-sm text-white'
                              : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'
                          }`}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
