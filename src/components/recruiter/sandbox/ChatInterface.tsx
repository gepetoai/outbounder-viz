'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, ArrowRight, UserPlus, Eye, MessageSquare, Mail, CheckCircle } from 'lucide-react'
import { ChatMessage, ChatMessageProps } from './ChatMessage'
import type { CampaignWithDetails } from '@/lib/search-api'

type ActionDefinition = CampaignWithDetails['action_definitions'][number]

interface ChatInterfaceProps {
  messages: ChatMessageProps[]
  onSendMessage?: (message: string) => void
  placeholder?: string
  disabled?: boolean
  onNext?: () => void
  hasMoreMessages?: boolean
  activeFeedbackMessageIndex?: number
  onFeedbackTargetSelect?: (messageIndex: number) => void
  actionDefinitions?: ActionDefinition[]
}

export function ChatInterface({
  messages,
  onSendMessage,
  placeholder = "Type a message...",
  disabled = false,
  onNext,
  hasMoreMessages = false,
  activeFeedbackMessageIndex,
  onFeedbackTargetSelect,
  actionDefinitions = []
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Helper function to get icon for action/condition type
  const getStepIcon = (def: ActionDefinition) => {
    const iconProps = { className: "h-4 w-4" }

    // Check if it's a condition
    if (def.condition_type) {
      // All conditions use CheckCircle icon
      return <CheckCircle {...iconProps} />
    }

    // Otherwise it's an action
    switch (def.action_type) {
      case 'send_connection_request':
        return <UserPlus {...iconProps} />
      case 'view_profile':
        return <Eye {...iconProps} />
      case 'send_message':
        return <MessageSquare {...iconProps} />
      case 'send_inmail':
        return <Send {...iconProps} />
      default:
        return null
    }
  }

  // Helper function to format delay time
  const formatDelay = (value: number, unit: string): string => {
    if (value === 0) return ''
    const unitLabel = value === 1 ? unit.slice(0, -1) : unit // Remove 's' for singular
    return `wait ${value} ${unitLabel}`
  }

  // Helper function to format step label
  const getStepLabel = (def: ActionDefinition): { label: string; delay: string } => {
    const delay = formatDelay(def.delay_value, def.delay_unit)

    // Check if it's a condition
    if (def.condition_type) {
      if (def.condition_type === 'connection_accepted') {
        return { label: 'If Connection Accepted', delay }
      }
      if (def.condition_type === 'connection_not_accepted') {
        return { label: 'If Connection Not Accepted', delay }
      }
    }

    // Otherwise it's an action
    if (!def.action_type) return { label: 'Unknown Action', delay }

    const typeMap: { [key: string]: string } = {
      'send_connection_request': 'Send Connection Request',
      'send_message': 'Send Message',
      'send_inmail': 'Send InMail',
      'view_profile': 'View Profile',
      'like_post': 'Like Post',
      'withdraw_connection': 'Withdraw Connection',
    }

    const label = typeMap[def.action_type] || def.action_type
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return { label, delay }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim())
      setInputValue('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full border rounded-lg">
      {/* Messages Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
        {actionDefinitions.length > 0 ? (
          // When we have action definitions, show steps and messages together
          actionDefinitions.map((actionDef, index) => {
            // Find the corresponding message index for message-type actions
            // Count how many message-type actions we've seen before this one
            const messageTypesBefore = actionDefinitions
              .slice(0, index)
              .filter(def =>
                def.action_type === 'send_message' ||
                def.action_type === 'send_inmail'
              )
              .length

            const isMessageAction =
              actionDef.action_type === 'send_message' ||
              actionDef.action_type === 'send_inmail'
            const correspondingMessage = isMessageAction ? messages[messageTypesBefore] : null

            // Only show this step if:
            // 1. It's not a message action (show all non-message actions that come before current messages)
            // 2. It's a message action and we have a corresponding message
            const totalMessagesSoFar = actionDefinitions
              .slice(0, index + 1)
              .filter(def =>
                def.action_type === 'send_message' ||
                def.action_type === 'send_inmail'
              )
              .length

            // Don't show steps that are ahead of our current messages
            if (isMessageAction && !correspondingMessage) {
              return null
            }

            // Don't show non-message actions that come after our last message
            if (!isMessageAction && totalMessagesSoFar > messages.length) {
              return null
            }

            return (
              <div key={index}>
                {/* Step indicator - shown for ALL action types */}
                <div className="flex justify-center mb-3">
                  <div className="flex items-center gap-2">
                    {getStepIcon(actionDef)}
                    <p className="text-sm text-gray-500 italic">
                      {getStepLabel(actionDef).label}
                      {getStepLabel(actionDef).delay && (
                        <span className="text-xs ml-1">({getStepLabel(actionDef).delay})</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Only show ChatMessage component for message-type actions */}
                {correspondingMessage && (
                  <ChatMessage
                    {...correspondingMessage}
                    messageIndex={messageTypesBefore}
                    isInitialMessage={messageTypesBefore === 0}
                    isActiveFeedbackTarget={activeFeedbackMessageIndex === messageTypesBefore}
                    onFeedbackTargetSelect={onFeedbackTargetSelect}
                    actionType={actionDef.action_type}
                  />
                )}
              </div>
            )
          })
        ) : (
          // Fallback: when no action definitions, just show messages
          messages.map((msg, index) => (
            <ChatMessage
              key={index}
              {...msg}
              messageIndex={index}
              isInitialMessage={index === 0}
              isActiveFeedbackTarget={activeFeedbackMessageIndex === index}
              onFeedbackTargetSelect={onFeedbackTargetSelect}
            />
          ))
        )}
        {hasMoreMessages && onNext && (
          <div className="flex justify-center mt-4">
            <Button
              onClick={onNext}
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-600 hover:text-gray-900"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={disabled || !inputValue.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
