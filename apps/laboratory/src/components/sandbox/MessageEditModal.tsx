'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@248/ui'
import { Textarea } from '@248/ui'
import { Button } from '@248/ui'

interface MessageEditModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
  onSave: (newMessage: string) => void
  candidateName?: string
  messageNumber?: number
  onNavigate: (direction: 'up' | 'down') => void
  onClearSelection?: () => void
  onOpenAgentPanel?: () => void
}

export function MessageEditModal ({
  isOpen,
  onClose,
  message,
  onSave,
  candidateName,
  messageNumber,
  onNavigate,
  onClearSelection,
  onOpenAgentPanel
}: MessageEditModalProps) {
  const [editedMessage, setEditedMessage] = useState(message)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Update edited message when the message prop changes
  useEffect(() => {
    setEditedMessage(message)
  }, [message])

  // Reset interaction flag when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasInteracted(false)
    }
  }, [isOpen])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isTextarea = target.tagName === 'TEXTAREA'

      if (e.key === 'ArrowUp' && (!isTextarea || !hasInteracted)) {
        e.preventDefault()
        onNavigate('up')
      } else if (e.key === 'ArrowDown' && (!isTextarea || !hasInteracted)) {
        e.preventDefault()
        onNavigate('down')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onNavigate, hasInteracted])

  const handleSave = () => {
    onSave(editedMessage)
    onClose()
  }

  const handleClose = () => {
    onClearSelection?.()
    onClose()
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!hasInteracted) {
      setHasInteracted(true)
      onClearSelection?.()
    }
    setEditedMessage(e.target.value)
  }

  const handleTextareaClick = () => {
    if (!hasInteracted) {
      setHasInteracted(true)
      onClearSelection?.()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Edit Message {messageNumber} {candidateName && `- ${candidateName}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            value={editedMessage}
            onChange={handleTextareaChange}
            onClick={handleTextareaClick}
            className="min-h-[200px] resize-none"
            placeholder="Enter message..."
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenAgentPanel}
                className="gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Regenerate
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}



