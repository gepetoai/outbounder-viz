'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FeedbackButton } from './FeedbackButton'
import { Plus, Trash2 } from 'lucide-react'

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
}

export function FeedbackSection ({
  feedbackItems,
  onFeedbackSelect,
  selectedFeedbackId,
  onAddFeedback,
  onRemoveFeedback
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
      <Label className="text-sm font-medium">Feedback</Label>
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
      <div className="border-t pt-3">
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
      </div>
    </div>
  )
}

