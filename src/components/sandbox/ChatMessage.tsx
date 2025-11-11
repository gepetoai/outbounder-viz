import { cn } from '@/lib/utils'
import { Eye, Heart, UserPlus } from 'lucide-react'

export interface ChatMessageProps {
  message: string
  type: 'user' | 'assistant' | 'system'
  timestamp?: string
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

export function ChatMessage ({ message, type, timestamp }: ChatMessageProps) {
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
        if (urlRegex.test(part)) {
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
    </div>
  )
}

