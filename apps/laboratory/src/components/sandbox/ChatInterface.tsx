'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, ArrowRight } from 'lucide-react'
import { ChatMessage, ChatMessageProps } from './ChatMessage'

interface ChatInterfaceProps {
  messages: ChatMessageProps[]
  onSendMessage?: (message: string) => void
  placeholder?: string
  disabled?: boolean
  onNext?: () => void
  hasMoreMessages?: boolean
}

export function ChatInterface ({
  messages,
  onSendMessage,
  placeholder = "Type a message...",
  disabled = false,
  onNext,
  hasMoreMessages = false
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
        {messages.map((msg, index) => (
          <ChatMessage key={index} {...msg} />
        ))}
        {hasMoreMessages && onNext && (
          <div className="flex justify-center mt-4">
            <Button
              onClick={onNext}
              variant="ghost"
              size="sm"
              className="gap-2 text-[#40404C] hover:text-[#1C1B20] hover:bg-[#EEEEEE]"
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

