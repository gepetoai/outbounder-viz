import { cn } from '@/lib/utils'
import { Eye, Heart, UserPlus, MessageSquare } from 'lucide-react'

export interface ChatMessageProps {
  message: string
  type: 'user' | 'assistant' | 'system'
  timestamp?: string
  messageIndex?: number
  isInitialMessage?: boolean
  isActiveFeedbackTarget?: boolean
  onFeedbackTargetSelect?: (messageIndex: number) => void
  actionType?: string | null
}

const getSystemIcon = (message: string) => {
  const lowerMessage = message.toLowerCase()
  if (lowerMessage.includes('viewed profile')) {
    return <Eye className="h-4 w-4 text-gray-500" />
  }
  if (lowerMessage.includes('liked post')) {
    return <Heart className="h-4 w-4 text-gray-500" />
  }
  if (lowerMessage.includes('connection request')) {
    return <UserPlus className="h-4 w-4 text-gray-500" />
  }
  return null
}

export function ChatMessage({
  message,
  type,
  timestamp,
  messageIndex,
  isInitialMessage = false,
  isActiveFeedbackTarget = false,
  onFeedbackTargetSelect,
  actionType
}: ChatMessageProps) {
  // Helper to get feedback label based on action type
  const getFeedbackLabel = () => {
    if (!actionType) return 'Responder'

    // InMail actions (both send_inmail and send_inmail_message)
    if (actionType === 'send_inmail') {
      return 'InMail'
    }

    // Regular message actions
    if (actionType === 'send_message') {
      return 'Send Message'
    }

    // Everything else defaults to Responder
    return 'Responder'
  }
  // System messages are just plain text with icon
  if (type === 'system') {
    const icon = getSystemIcon(message)
    return (
      <div className="flex justify-center mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-sm text-gray-500 italic">{message}</p>
        </div>
      </div>
    )
  }

  // Function to render message with proper formatting
  const renderMessage = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, index) => {
      // Check if line contains URLs
      const urlRegex = /(https?:\/\/[^\s]+)/g
      const parts = line.split(urlRegex)

      const formattedLine = parts.map((part, partIndex) => {
        if (/https?:\/\/[^\s]+/.test(part)) {
          return (
            <a
              key={partIndex}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
            >
              {part}
            </a>
          )
        }
        return part
      })

      // Empty lines create spacing
      if (!line.trim()) {
        return <br key={index} />
      }

      return (
        <div key={index}>
          {formattedLine}
        </div>
      )
    })
  }

  return (
    <div className={cn(
      "flex mb-3",
      type === 'user' ? 'justify-end' : 'justify-start'
    )}>
      <div className="flex flex-col gap-1">
        <div className={cn(
          "max-w-[70%] px-4 py-2 rounded-lg",
          type === 'user' && 'bg-gray-100 text-gray-900 border border-gray-200',
          type === 'assistant' && 'bg-blue-50 text-gray-900 border border-blue-100'
        )}>
          <div className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
            {renderMessage(message)}
          </div>
          {timestamp && (
            <span className="text-xs opacity-70 mt-1 block">{timestamp}</span>
          )}
        </div>

        {/* Feedback type indicator for assistant messages */}
        {type === 'assistant' && onFeedbackTargetSelect !== undefined && messageIndex !== undefined && (
          <button
            onClick={() => onFeedbackTargetSelect(messageIndex)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors self-start",
              isActiveFeedbackTarget
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
            title={`Feedback for ${getFeedbackLabel()}`}
          >
            <MessageSquare className="h-3 w-3" />
            <span className="font-medium">
              {getFeedbackLabel()}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
