'use client'

import { useRef } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@248/ui'
import styles from './SandboxTableView.module.css'

interface Candidate {
  id: string
  name: string
  photo: string
  title: string
}

interface SandboxTableViewProps {
  candidates: Candidate[]
  messages: { [candidateId: string]: string[] }
  onCandidateClick: (candidate: Candidate) => void
  onMessageClick: (candidateId: string, messageIndex: number) => void
  selectedCandidateId?: string | null
  selectedMessageIndex?: number
}

export function SandboxTableView ({
  candidates,
  messages,
  onCandidateClick,
  onMessageClick,
  selectedCandidateId,
  selectedMessageIndex
}: SandboxTableViewProps) {
  const selectedCellRef = useRef<HTMLDivElement>(null)

  // Get the maximum number of messages across all candidates to determine column count
  // Default to 2 columns if no messages exist yet
  const maxMessages = Math.max(...Object.values(messages).map(msgs => msgs.length), 2)

  return (
    <div className={styles.tableContainer}>
      <div className={styles.scrollContainer}>
        <Table className="table-fixed">
          <TableHeader className={styles.stickyHeader}>
            <TableRow className={styles.headerRow}>
              <TableHead className={`${styles.headerCell} ${styles.photoHeader}`}></TableHead>
              <TableHead className={`${styles.headerCell} ${styles.headerCellSticky} ${styles.candidateHeader}`}>Candidate</TableHead>
              {Array.from({ length: maxMessages }, (_, i) => (
                <TableHead key={i} className={`${styles.headerCell} ${styles.messageHeader}`}>Message {i + 1}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => {
              const candidateMessages = messages[candidate.id] || []

              return (
                <TableRow
                  key={candidate.id}
                  className={styles.bodyRow}
                  onClick={() => onCandidateClick(candidate)}
                >
                  <TableCell className={styles.photoCell}>
                    <div className={styles.photoWrapper}>
                      <img
                        src={candidate.photo}
                        alt={candidate.name}
                      />
                    </div>
                  </TableCell>
                  <TableCell className={styles.candidateCell}>
                    <div className={styles.candidateInfo}>
                      <span className={styles.candidateName} title={candidate.name}>{candidate.name}</span>
                      <span className={styles.candidateTitle} title={candidate.title}>{candidate.title}</span>
                    </div>
                  </TableCell>
                  {Array.from({ length: maxMessages }, (_, i) => {
                    const isSelected = selectedCandidateId === candidate.id && selectedMessageIndex === i
                    return (
                      <TableCell
                        key={i}
                        className={styles.messageCell}
                        onClick={(e) => {
                          e.stopPropagation()
                          onMessageClick(candidate.id, i)
                        }}
                      >
                        {candidateMessages[i] ? (
                          <div
                            ref={isSelected ? selectedCellRef : null}
                            className={`${styles.messageContent} ${isSelected ? styles.messageContentSelected : ''}`}
                            title={candidateMessages[i]}
                          >
                            {candidateMessages[i]}
                          </div>
                        ) : (
                          <div
                            ref={isSelected ? selectedCellRef : null}
                            className={`${styles.messageEmpty} ${isSelected ? styles.messageEmptySelected : ''}`}
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

