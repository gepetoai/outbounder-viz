'use client'

import { useState, useMemo } from 'react'
import { ChatInterface } from './ChatInterface'
import { FeedbackSection, type FeedbackItem } from './FeedbackSection'
import { SelectionPanel } from './SelectionPanel'
import { SandboxTableView } from './SandboxTableView'
import { MessageEditModal } from './MessageEditModal'
import { AgentPanel } from './AgentPanel'
import { CandidateDetailPanel } from '../CandidateDetailPanel'
import { ChatMessageProps } from './ChatMessage'
import { useJobPostings } from '@/hooks/useJobPostings'
import { useCampaignCandidates } from '@/hooks/useCampaigns'
import {
  useCandidatesWithMessages,
  useAddFeedbackAndRegenerate,
  useUpdateCustomMessage,
  type CampaignCandidateWithCustomMessage
} from '@/hooks/useCustomMessages'
import { type CampaignCandidateWithDetails } from '@/hooks/useCampaigns'
import { type Candidate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MessageSquare, Table as TableIcon } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'



// Helper function to map campaign candidate data to Candidate type
const mapCampaignCandidateToCandidate = (
  cc: CampaignCandidateWithDetails | CampaignCandidateWithCustomMessage
): Candidate => {
  const candidate = cc.candidate
  const rawData = candidate.raw_data || {}

  return {
    id: cc.id.toString(), // Use campaign_candidate_id
    name: `${candidate.first_name} ${candidate.last_name}`,
    title: candidate.job_title,
    company: candidate.company_name,
    location: `${candidate.city}, ${candidate.state}`,
    photo: rawData.picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.first_name + ' ' + candidate.last_name)}&background=random`,
    education: rawData.education?.[0]?.school_name || 'N/A',
    experience: (rawData.experience || []).slice(0, 3).map((exp: { title?: string; company_name?: string; duration?: string }) => ({
      title: exp.title || '',
      company: exp.company_name || '',
      duration: exp.duration || ''
    })),
    linkedinUrl: `https://linkedin.com/in/${candidate.linkedin_shorthand_slug}`,
    summary: rawData.headline || candidate.job_title,
  }
}

export function SandBoxTab() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [messages, setMessages] = useState<ChatMessageProps[]>([])
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isAgentPanelOpen, setIsAgentPanelOpen] = useState(false)
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
  const [viewType, setViewType] = useState<'chat' | 'table'>('chat')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [currentMessageId, setCurrentMessageId] = useState<number | null>(null)
  const [agentPanelCandidateId, setAgentPanelCandidateId] = useState<string | null>(null)

  // Message edit modal state
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [selectedMessageCandidateId, setSelectedMessageCandidateId] = useState<string | null>(null)
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number>(0)
  const [currentEditingMessage, setCurrentEditingMessage] = useState<string>('')
  const [editedMessages, setEditedMessages] = useState<{ [candidateId: string]: string[] }>({})

  // Feedback type selection state
  const [activeFeedbackMessageIndex, setActiveFeedbackMessageIndex] = useState<number>(0)

  // Fetch open roles (job postings) from API - filter only those with campaign_id
  const { data: allJobPostings = [] } = useJobPostings()
  const jobPostings = useMemo(
    () => allJobPostings.filter(job => job.campaign_id),
    [allJobPostings]
  )

  // Fetch candidates from campaign using campaign_id (for chat view)
  const campaignId = selectedCampaignId ? parseInt(selectedCampaignId) : null
  const { data: campaignCandidates = [] } = useCampaignCandidates(campaignId)

  // Fetch candidates with their custom messages from campaign (for table view)
  const { data: candidatesWithMessages = [], refetch: refetchCandidatesWithMessages } = useCandidatesWithMessages(campaignId)

  // Mutation hook for regenerating with feedback
  const { mutate: regenerateWithFeedback, isPending: isRegeneratingMutation } = useAddFeedbackAndRegenerate()

  // Mutation hook for updating custom messages
  const { mutate: updateCustomMessage } = useUpdateCustomMessage()

  // Map campaign candidates to Candidate type (for chat view selection)
  const candidatesData = useMemo(() => {
    return campaignCandidates.map(mapCampaignCandidateToCandidate)
  }, [campaignCandidates])

  // Map candidates with messages to Candidate type (for table view)
  const tableViewCandidates = useMemo(() => {
    return candidatesWithMessages.map(mapCampaignCandidateToCandidate)
  }, [candidatesWithMessages])

  // Map custom messages from API to candidateMessages structure
  const candidateMessages = useMemo(() => {
    const messages: { [candidateId: string]: string[] } = {}

    // Initialize with API messages from the new endpoint
    candidatesWithMessages.forEach((cc) => {
      const candidateId = cc.id.toString()
      if (!messages[candidateId]) {
        messages[candidateId] = []
      }
      // Add the latest custom message if it exists
      if (cc.latest_custom_message) {
        messages[candidateId].push(cc.latest_custom_message)
      }
    })

    // Apply edited messages on top of API messages
    // Get all unique candidate IDs from both chat view and table view
    const allCandidateIds = new Set([
      ...candidatesData.map(c => c.id),
      ...tableViewCandidates.map(c => c.id)
    ])

    allCandidateIds.forEach((candidateId) => {
      if (!messages[candidateId]) {
        messages[candidateId] = []
      }

      // If there are edited messages for this candidate, use them
      if (editedMessages[candidateId]) {
        messages[candidateId] = editedMessages[candidateId].map((msg, idx) =>
          msg || messages[candidateId]?.[idx] || ''
        )
      }
    })

    return messages
  }, [candidatesWithMessages, candidatesData, tableViewCandidates, editedMessages])

  const handleSendMessage = (message: string) => {
    // Add user message
    setMessages((prev) => [...prev, { message, type: 'user' as const }])

    // Mock AI response after a short delay
    setTimeout(() => {
      setMessages((prev) => {
        const newMessages: ChatMessageProps[] = [
          ...prev,
          { message: 'This is a mock response. Connect to your AI service for real responses.', type: 'assistant' as const }
        ]
        // Switch to responder feedback for the newly added assistant message
        // Since there are now multiple messages, default to responder (last message)
        setActiveFeedbackMessageIndex(newMessages.length - 1)
        return newMessages
      })
    }, 1000)
  }

  const handleFeedbackSelect = (id: string) => {
    setSelectedFeedbackId(id === selectedFeedbackId ? null : id)
    console.log('Selected feedback:', id)
  }

  const handleAddFeedback = (text: string) => {
    const newFeedback: FeedbackItem = {
      id: Date.now().toString(),
      text
    }
    setFeedbackItems((prev) => [...prev, newFeedback])
  }

  const handleRemoveFeedback = (id: string) => {
    setFeedbackItems((prev) => prev.filter((item) => item.id !== id))
    // Deselect if the removed item was selected
    if (selectedFeedbackId === id) {
      setSelectedFeedbackId(null)
    }
  }

  const handleCandidateChange = (candidateId: string) => {
    const candidate = candidatesData.find((c: Candidate) => c.id === candidateId)
    setSelectedCandidate(candidate || null)

    // Reset feedback items when changing candidates
    setFeedbackItems([])

    // If candidate has messages, replace the mock messages with real ones
    if (candidate && candidateMessages[candidate.id] && candidateMessages[candidate.id].length > 0) {
      // Start by showing just the first message
      const firstMessage: ChatMessageProps = {
        message: candidateMessages[candidate.id][0],
        type: 'assistant' as const
      }
      setMessages([firstMessage])
      setCurrentMessageIndex(1)
      // Default to initial message feedback when only one message is shown
      setActiveFeedbackMessageIndex(0)

      // Find the custom message ID for this candidate
      const candidateData = candidatesWithMessages.find(cc => cc.id.toString() === candidate.id)
      setCurrentMessageId(candidateData?.custom_message_id || null)
    } else {
      // Reset to empty if no real messages
      setMessages([])
      setCurrentMessageIndex(0)
      setActiveFeedbackMessageIndex(0)
      setCurrentMessageId(null)
    }
  }

  const handleCandidatePhotoClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsPanelOpen(true)
  }

  const handleCampaignChange = (campaignId: string) => {
    setSelectedCampaignId(campaignId)
    // Reset selected candidate when campaign changes
    setSelectedCandidate(null)
    // Reset chat to empty
    setMessages([])
    setCurrentMessageIndex(0)
    // Reset feedback items
    setFeedbackItems([])
    setCurrentMessageId(null)
  }

  const handleNext = () => {
    // If showing real messages from a selected candidate
    if (selectedCandidate && candidateMessages[selectedCandidate.id]?.length > 0) {
      const candidateMsgs = candidateMessages[selectedCandidate.id]
      if (currentMessageIndex < candidateMsgs.length) {
        const realMessages: ChatMessageProps[] = candidateMsgs.slice(0, currentMessageIndex + 1).map((msg) => ({
          message: msg,
          type: 'assistant' as const
        }))
        setMessages(realMessages)
        setCurrentMessageIndex(currentMessageIndex + 1)
        // When showing more than one message, default to responder feedback
        if (currentMessageIndex + 1 > 1) {
          setActiveFeedbackMessageIndex(currentMessageIndex)
        }
      }
    }
  }

  const handleFeedbackTargetSelect = (messageIndex: number) => {
    setActiveFeedbackMessageIndex(messageIndex)
    // Clear feedback items when switching between initial and responder messages
    setFeedbackItems([])
  }

  const handleMessageClick = (candidateId: string, messageIndex: number) => {
    const message = candidateMessages[candidateId]?.[messageIndex] || ''
    setSelectedMessageCandidateId(candidateId)
    setSelectedMessageIndex(messageIndex)
    setCurrentEditingMessage(message)
    setIsMessageModalOpen(true)
  }

  const handleMessageSave = (newMessage: string) => {
    if (!selectedMessageCandidateId) return

    // Find the candidate data to get custom message ID
    const candidateData = candidatesWithMessages.find(
      cc => cc.id.toString() === selectedMessageCandidateId
    )

    // Update local state immediately for optimistic UI
    setEditedMessages((prev) => {
      const currentMessages = prev[selectedMessageCandidateId] || []
      const updated = [...currentMessages]

      // Ensure array is large enough
      while (updated.length <= selectedMessageIndex) {
        updated.push('')
      }
      updated[selectedMessageIndex] = newMessage

      return {
        ...prev,
        [selectedMessageCandidateId]: updated
      }
    })

    // If we have a custom message ID, call the API to persist the change
    if (candidateData?.custom_message_id && candidateData?.custom_message_instruction_id) {
      updateCustomMessage(
        {
          customMessageId: candidateData.custom_message_id,
          data: {
            id: candidateData.custom_message_id,
            fk_custom_messages_instruction_id: candidateData.custom_message_instruction_id,
            fk_campaign_candidate_id: candidateData.id,
            generated_message: newMessage
          }
        },
        {
          onSuccess: () => {
            console.log('Custom message updated successfully')
            // Refetch to get the latest data from the server
            refetchCandidatesWithMessages()
          },
          onError: (error) => {
            console.error('Failed to update custom message:', error)
          }
        }
      )
    }
  }

  const handleMessageNavigate = (direction: 'up' | 'down') => {
    if (!selectedMessageCandidateId) return

    const currentCandidateIndex = tableViewCandidates.findIndex(c => c.id === selectedMessageCandidateId)
    if (currentCandidateIndex === -1) return

    let newCandidateIndex = currentCandidateIndex
    if (direction === 'up' && currentCandidateIndex > 0) {
      newCandidateIndex = currentCandidateIndex - 1
    } else if (direction === 'down' && currentCandidateIndex < tableViewCandidates.length - 1) {
      newCandidateIndex = currentCandidateIndex + 1
    }

    if (newCandidateIndex !== currentCandidateIndex) {
      const newCandidate = tableViewCandidates[newCandidateIndex]
      const newMessage = candidateMessages[newCandidate.id]?.[selectedMessageIndex] || ''
      setSelectedMessageCandidateId(newCandidate.id)
      setCurrentEditingMessage(newMessage)
      // Keep the same message index
    }
  }

  const handleRegenerate = () => {
    if (!currentMessageId || feedbackItems.length === 0) {
      console.warn('Cannot regenerate: missing message ID or no feedback items')
      return
    }

    setIsRegenerating(true)

    regenerateWithFeedback(
      {
        custom_messages_candidate_id: currentMessageId,
        feedbacks: feedbackItems.map(item => ({
          content: item.text
        }))
      },
      {
        onSuccess: (data) => {
          console.log('Message regenerated successfully:', data)

          // Update the current message ID to the new one
          setCurrentMessageId(data.id)

          // Update the displayed message with the new generated message
          setMessages([
            {
              message: data.generated_message,
              type: 'assistant' as const
            }
          ])

          // Clear feedback items after successful regeneration
          setFeedbackItems([])

          // Refetch candidates with messages to get the latest data
          refetchCandidatesWithMessages()

          setIsRegenerating(false)
        },
        onError: (error) => {
          console.error('Failed to regenerate message:', error)
          setIsRegenerating(false)
        }
      }
    )
  }

  const handleClearSelection = () => {
    setSelectedMessageCandidateId(null)
    setSelectedMessageIndex(0)
  }

  // Determine if there are more messages to show
  // If we have a selected candidate with real messages, use their message count
  // Otherwise, use the mock messages count
  const totalAvailableMessages = selectedCandidate && candidateMessages[selectedCandidate.id]?.length > 0
    ? candidateMessages[selectedCandidate.id].length
    : 0

  const hasMoreMessages = currentMessageIndex < totalAvailableMessages

  return (
    <div className="h-[calc(100vh-150px)] max-h-[calc(100vh-150px)] overflow-hidden flex flex-col gap-6">
      {/* Top Bar: Select Job Posting + View Toggle */}
      <div className="flex justify-between items-center">
        {/* Left: Select Job Posting */}
        <div className="w-64">
          <Select value={selectedCampaignId} onValueChange={handleCampaignChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a job posting..." />
            </SelectTrigger>
            <SelectContent>
              {jobPostings && jobPostings.length > 0 ? (
                jobPostings.map((job) => (
                  <SelectItem key={job.campaign_id} value={job.campaign_id!.toString()}>
                    {job.title}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-jobs" disabled>
                  No job postings available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Right: View Type Toggle */}
        <div className="flex items-center border rounded-lg overflow-hidden">
          <Button
            size="sm"
            variant={viewType === 'chat' ? 'default' : 'ghost'}
            onClick={() => setViewType('chat')}
            className="rounded-none h-8 px-3"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={viewType === 'table' ? 'default' : 'ghost'}
            onClick={() => setViewType('table')}
            className="rounded-none h-8 px-3"
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewType === 'chat' ? (
        <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left side - Chat Interface (2/3 width) */}
        <div className="col-span-2 h-full min-h-0">
          {!selectedCampaignId ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Please select a Job Posting from the drop-down
            </div>
          ) : (
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              placeholder="Type your message..."
              onNext={handleNext}
              hasMoreMessages={hasMoreMessages}
              activeFeedbackMessageIndex={activeFeedbackMessageIndex}
              onFeedbackTargetSelect={handleFeedbackTargetSelect}
            />
          )}
        </div>

        {/* Right side - Selection Panel + Feedback Section (1/3 width) */}
        <div className="col-span-1 h-full flex flex-col gap-4">
          {/* Selection Panel */}
          <SelectionPanel
            openRoles={jobPostings}
            selectedOpenRole={selectedCampaignId}
            onOpenRoleChange={handleCampaignChange}
            candidates={candidatesData}
            selectedCandidate={selectedCandidate}
            onCandidateChange={handleCandidateChange}
            onCandidatePhotoClick={handleCandidatePhotoClick}
          />

          {/* Feedback Section */}
          <div className="flex-1 min-h-0 overflow-auto">
            <FeedbackSection
              feedbackItems={feedbackItems}
              onFeedbackSelect={handleFeedbackSelect}
              selectedFeedbackId={selectedFeedbackId}
              onAddFeedback={handleAddFeedback}
              onRemoveFeedback={handleRemoveFeedback}
              feedbackType={activeFeedbackMessageIndex === 0 ? 'initial_message' : 'responder_message'}
              onRegenerate={handleRegenerate}
              isRegenerating={isRegenerating || isRegeneratingMutation}
              showRegenerateButton={
                activeFeedbackMessageIndex === 0 &&
                feedbackItems.length > 0 &&
                !!currentMessageId
              }
            />
          </div>
        </div>
        </div>
      ) : (
        /* Table View */
        <div className="flex-1 min-h-0">
          {tableViewCandidates.length > 0 ? (
            <SandboxTableView
              candidates={tableViewCandidates}
              messages={candidateMessages}
              onCandidateClick={handleCandidatePhotoClick}
              onMessageClick={handleMessageClick}
              selectedCandidateId={selectedMessageCandidateId}
              selectedMessageIndex={selectedMessageIndex}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-lg font-semibold mb-2">No candidates available</p>
                <p className="text-sm">Select a Job Posting to view candidates and their messages</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Candidate Detail Panel */}
      <CandidateDetailPanel
        candidate={selectedCandidate}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        variant="sheet"
      />

      {/* Message Edit Modal */}
      <MessageEditModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        message={currentEditingMessage}
        onSave={handleMessageSave}
        candidateName={
          selectedMessageCandidateId
            ? tableViewCandidates.find(c => c.id === selectedMessageCandidateId)?.name
            : undefined
        }
        messageNumber={selectedMessageIndex + 1}
        onNavigate={handleMessageNavigate}
        onClearSelection={handleClearSelection}
        onOpenAgentPanel={() => {
          setAgentPanelCandidateId(selectedMessageCandidateId)
          setIsAgentPanelOpen(true)
        }}
      />

      {/* Agent Panel Sheet */}
      <Sheet open={isAgentPanelOpen} onOpenChange={(open) => {
        setIsAgentPanelOpen(open)
        if (!open) {
          setAgentPanelCandidateId(null)
        }
      }}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col">
          <SheetHeader>
            <SheetTitle>AI Message Generator</SheetTitle>
          </SheetHeader>
          <div className="flex-1 min-h-0 mt-6">
            {agentPanelCandidateId ? (
              <AgentPanel
                initialMessage={currentEditingMessage}
                campaignCandidateId={agentPanelCandidateId}
                onMessageGenerated={(message) => {
                  setCurrentEditingMessage(message)
                  // Also save to edited messages
                  if (selectedMessageCandidateId) {
                    handleMessageSave(message)
                  }
                }}
              />
            ) : (
              <div className="p-4 text-center text-gray-500">
                No candidate selected. Please select a message from the table first.
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
