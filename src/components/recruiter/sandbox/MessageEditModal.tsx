'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

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

export function MessageEditModal({
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
      // Only handle arrow keys if the target is not an input/textarea or if user hasn't started typing
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
    <Dialog open={isOpen} onOpenChange={handleClose} modal={false}>
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
                <Sparkles className="h-4 w-4" />
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
