'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FeedbackButton } from './FeedbackButton'
import { Plus, Trash2, RefreshCw } from 'lucide-react'

export interface FeedbackItem {
  id: string
  text: string
}

interface FeedbackSectionProps {
  feedbackItems: FeedbackItem[]
  onFeedbackSelect?: (id: string) => void
  selectedFeedbackId?: string | null
  onAddFeedback?: (text: string) => void
  onRemoveFeedback?: (id: string) => void
  feedbackType?: 'initial_message' | 'responder_message' | 'InMail' | 'Send Message' | 'Responder'
  onRegenerate?: () => void
  isRegenerating?: boolean
  showRegenerateButton?: boolean
}

export function FeedbackSection({
  feedbackItems,
  onFeedbackSelect,
  selectedFeedbackId,
  onAddFeedback,
  onRemoveFeedback,
  feedbackType = 'initial_message',
  onRegenerate,
  isRegenerating = false,
  showRegenerateButton = false
}: FeedbackSectionProps) {
  const [customInput, setCustomInput] = useState('')

  const handleAddFeedback = () => {
    if (customInput.trim() && onAddFeedback) {
      onAddFeedback(customInput.trim())
      setCustomInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddFeedback()
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white h-full flex flex-col">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Feedback</Label>
        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
          {feedbackType === 'initial_message' ? 'Initial Message'
            : feedbackType === 'responder_message' ? 'Responder Agent'
            : feedbackType || 'Message'}
        </span>
      </div>
      <div className="flex-1 overflow-auto space-y-2">
        {feedbackItems.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No feedback items yet. Add one below!</p>
        ) : (
          feedbackItems.map((item) => (
            <div key={item.id} className="relative group">
              <FeedbackButton
                text={item.text}
                onClick={() => onFeedbackSelect?.(item.id)}
                selected={selectedFeedbackId === item.id}
              />
              {onRemoveFeedback && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveFeedback(item.id)
                  }}
                  className="absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-900"
                  title="Remove feedback"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
      <div className="border-t pt-3 space-y-3">
        <div className="flex gap-2">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Add custom feedback..."
            className="flex-1"
          />
          <Button
            onClick={handleAddFeedback}
            disabled={!customInput.trim()}
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {showRegenerateButton && (
          <Button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="w-full"
            variant="default"
          >
            {isRegenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
