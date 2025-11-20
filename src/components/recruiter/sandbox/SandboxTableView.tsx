'use client'

import { useEffect, useRef } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Candidate } from '@/lib/utils'
import type { CampaignCandidateWithCustomMessage } from '@/hooks/useCustomMessages'
import type { CampaignWithDetails } from '@/lib/search-api'

type ActionDefinition = CampaignWithDetails['action_definitions'][number]

interface SandboxTableViewProps {
  candidates: Candidate[]
  messages: { [candidateId: string]: string[] }
  candidatesWithMessages: CampaignCandidateWithCustomMessage[]
  onCandidateClick: (candidate: Candidate) => void
  onMessageClick: (candidateId: string, messageIndex: number) => void
  selectedCandidateId?: string | null
  selectedMessageIndex?: number
  actionDefinitions?: ActionDefinition[]
}

// Helper function to format action type for display
const formatActionType = (actionType: string): string => {
  const typeMap: { [key: string]: string } = {
    'send_connection_request': 'Connection Request',
    'send_message': 'Send Message',
    'send_inmail': 'Send InMail',
    'send_inmail_message': 'Send InMail',
    'view_profile': 'View Profile',
    'follow': 'Follow',
    'like_post': 'Like Post',
    'comment_post': 'Comment',
  }
  return typeMap[actionType] || actionType.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export function SandboxTableView({
  candidates,
  messages,
  candidatesWithMessages,
  onCandidateClick,
  onMessageClick,
  selectedCandidateId,
  selectedMessageIndex,
  actionDefinitions = []
}: SandboxTableViewProps) {
  const selectedCellRef = useRef<HTMLDivElement>(null)

  // Filter action definitions to only message types (send_message, send_inmail, and send_inmail_message)
  const messageActionDefinitions = actionDefinitions.filter(
    actionDef => actionDef.action_type && (
      actionDef.action_type === 'send_message' ||
      actionDef.action_type === 'send_inmail'
    )
  )

  // Use filtered action definitions to build column headers, or fallback to old behavior
  const columnHeaders: string[] = messageActionDefinitions.length > 0
    ? messageActionDefinitions.map(actionDef => formatActionType(actionDef.action_type!))
    : (() => {
        // Fallback: Get the maximum number of messages across all candidates
        const maxMessages = Math.max(...Object.values(messages).map(msgs => msgs.length), 1)
        const headers: string[] = []
        for (let i = 0; i < maxMessages; i++) {
          // Get action types for this message index across all candidates
          const actionTypes = candidatesWithMessages
            .map(cc => cc.custom_messages?.[i]?.action_type)
            .filter(Boolean)

          // Use the first action type found, or default to "Message {i+1}"
          const actionType = actionTypes[0]
          headers.push(actionType ? formatActionType(actionType) : `Message ${i + 1}`)
        }
        return headers
      })()

  const maxMessages = columnHeaders.length

  // Auto-scroll to selected cell when selection changes
  useEffect(() => {
    if (selectedCellRef.current && selectedCandidateId) {
      selectedCellRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      })
    }
  }, [selectedCandidateId, selectedMessageIndex])

  return (
    <div className="h-full border rounded-lg bg-white overflow-hidden">
      <div className="h-full overflow-auto">
        <Table className="table-fixed">
          <TableHeader className="sticky top-0 z-20 bg-white border-b shadow-sm">
            <TableRow className="h-12">
              <TableHead className="w-[250px] sticky left-0 bg-white z-30 border-r pl-4">Candidate</TableHead>
              {columnHeaders.map((header, i) => (
                <TableHead key={i} className="w-[300px] bg-white border-r last:border-r-0">{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
            <TableBody>
              {candidates.map((candidate) => {
                const candidateMessages = messages[candidate.id] || []

                return (
                  <TableRow
                    key={candidate.id}
                    className="hover:bg-gray-50 cursor-pointer h-16"
                    onClick={() => onCandidateClick(candidate)}
                  >
                    <TableCell className="align-middle font-medium sticky left-0 bg-white z-10 border-r pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-400 transition-colors flex-shrink-0">
                          <img
                            src={candidate.photo}
                            alt={candidate.name}
                            className="w-full h-full object-cover grayscale"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate" title={candidate.name}>{candidate.name}</span>
                          <span className="text-xs text-gray-500 truncate" title={candidate.title}>{candidate.title}</span>
                        </div>
                      </div>
                    </TableCell>
                    {Array.from({ length: maxMessages }, (_, i) => {
                      const isSelected = selectedCandidateId === candidate.id && selectedMessageIndex === i
                      const isLastColumn = i === maxMessages - 1
                      return (
                        <TableCell
                          key={i}
                          className={`align-top max-w-[300px] border-r ${isLastColumn ? 'border-r-0' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            onMessageClick(candidate.id, i)
                          }}
                        >
                          {candidateMessages[i] ? (
                            <div
                              ref={isSelected ? selectedCellRef : null}
                              className={`text-sm text-gray-700 cursor-pointer p-1.5 rounded transition-all overflow-hidden text-ellipsis whitespace-nowrap ${isSelected ? 'border-2 border-blue-500' : 'border-2 border-transparent hover:bg-gray-100'}`}
                              title={candidateMessages[i]}
                            >
                              {candidateMessages[i]}
                            </div>
                          ) : (
                            <div
                              ref={isSelected ? selectedCellRef : null}
                              className={`text-gray-400 text-sm italic cursor-pointer p-1.5 rounded transition-all ${isSelected ? 'border-2 border-blue-500' : 'border-2 border-transparent hover:bg-gray-100'}`}
                            >
                              No message
                            </div>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
      </div>
    </div>
  )
}
