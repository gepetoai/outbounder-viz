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
import { useCandidatesByJobDescription } from '@/hooks/useSearch'
import { mapEnrichedCandidateToCandidate, type Candidate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MessageSquare, Table as TableIcon } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

const MOCK_ALL_MESSAGES: ChatMessageProps[] = [
  { message: "viewed profile", type: 'system' },
  { message: "liked post", type: 'system' },
  {
    message: `You + SpotOn = Impact your community

Hi! I'm reaching out because I'm very impressed with your overall experience!
I'm a Talent Acquisition Specialist for our Sales division at SpotOn and would love a chance to connect with you about our Territory of Sales Representative position within the Chicago area.

SpotOn is committed to supporting businesses at the heart of our communities. We have been rated the top POS system based on real customer reviews. Our investors helped launch Facebook, Uber, Instacart, and Airbnb.

We offer base salary, uncapped commissions, Restricted Stock Unites, full benefits, Awards for Best Places to Work, and PTO. I understand you probably receive several messages on a daily basis, but I wanted to reach out to see if you were interested in speaking sometime this week or next.

Check out the job posting: https://www.linkedin.com/jobs/view/4315734459/

More information about the role and SpotOn here:
https://drive.google.com/file/d/1m34TyPzz4WAgUTXgDwjib8a_0X9OjhaG/view?usp=drive_link
https://drive.google.com/file/d/1pS9em57PibTRTDB86tPq_BSgxvRvhlGC/view?usp=drive_link`,
    type: 'assistant'
  },
  { message: "sent connection request", type: 'system' },
  {
    message: "Nice, thanks for connecting! Let me know if the job above makes sense for you and we can schedule a call to talk more about it!",
    type: 'assistant'
  }
]

export function SandBoxTab() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(3) // Show first 3 messages initially
  const [messages, setMessages] = useState<ChatMessageProps[]>(MOCK_ALL_MESSAGES.slice(0, 3))
  const [selectedOpenRoleId, setSelectedOpenRoleId] = useState<string>('')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isAgentPanelOpen, setIsAgentPanelOpen] = useState(false)
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
  const [viewType, setViewType] = useState<'chat' | 'table'>('chat')

  // Message edit modal state
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [selectedMessageCandidateId, setSelectedMessageCandidateId] = useState<string | null>(null)
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number>(0)
  const [currentEditingMessage, setCurrentEditingMessage] = useState<string>('')
  const [editedMessages, setEditedMessages] = useState<{ [candidateId: string]: string[] }>({})

  // Fetch open roles (job postings) from API
  const { data: jobPostings = [] } = useJobPostings()

  // Fetch candidates from API based on selected role
  const jobDescriptionId = selectedOpenRoleId ? parseInt(selectedOpenRoleId) : null
  const { data: candidatesByJobResponse } = useCandidatesByJobDescription(jobDescriptionId)

  // Map enriched candidates to Candidate type
  const candidatesData = useMemo(
    () => (candidatesByJobResponse?.candidates || []).map(mapEnrichedCandidateToCandidate),
    [candidatesByJobResponse]
  )

  // Generate mock messages for each candidate (use edited messages if they exist)
  const candidateMessages = useMemo(() => {
    const messages: { [candidateId: string]: string[] } = {}
    candidatesData.forEach((candidate) => {
      // Default messages
      const defaultMessages = [
        `Hi ${candidate.name.split(' ')[0]}, I'm reaching out because I'm impressed with your experience at ${candidate.company}. Would love to connect!`,
        `Thanks for connecting! I wanted to share an opportunity that might interest you based on your background in ${candidate.title}.`
      ]

      // Merge edited messages with defaults
      if (editedMessages[candidate.id]) {
        messages[candidate.id] = editedMessages[candidate.id].map((msg, idx) =>
          msg || defaultMessages[idx] || ''
        )
        // Ensure we have at least the default messages length
        while (messages[candidate.id].length < defaultMessages.length) {
          messages[candidate.id].push(defaultMessages[messages[candidate.id].length])
        }
      } else {
        messages[candidate.id] = defaultMessages
      }
    })
    return messages
  }, [candidatesData, editedMessages])

  const handleSendMessage = (message: string) => {
    // Add user message
    setMessages((prev) => [...prev, { message, type: 'user' }])

    // Mock AI response after a short delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { message: 'This is a mock response. Connect to your AI service for real responses.', type: 'assistant' }
      ])
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
  }

  const handleCandidatePhotoClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsPanelOpen(true)
  }

  const handleOpenRoleChange = (roleId: string) => {
    setSelectedOpenRoleId(roleId)
    // Reset selected candidate when role changes
    setSelectedCandidate(null)
  }

  const handleNext = () => {
    if (currentMessageIndex < MOCK_ALL_MESSAGES.length) {
      setMessages(MOCK_ALL_MESSAGES.slice(0, currentMessageIndex + 1))
      setCurrentMessageIndex(currentMessageIndex + 1)
    }
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
  }

  const handleMessageNavigate = (direction: 'up' | 'down') => {
    if (!selectedMessageCandidateId) return

    const currentCandidateIndex = candidatesData.findIndex(c => c.id === selectedMessageCandidateId)
    if (currentCandidateIndex === -1) return

    let newCandidateIndex = currentCandidateIndex
    if (direction === 'up' && currentCandidateIndex > 0) {
      newCandidateIndex = currentCandidateIndex - 1
    } else if (direction === 'down' && currentCandidateIndex < candidatesData.length - 1) {
      newCandidateIndex = currentCandidateIndex + 1
    }

    if (newCandidateIndex !== currentCandidateIndex) {
      const newCandidate = candidatesData[newCandidateIndex]
      const newMessage = candidateMessages[newCandidate.id]?.[selectedMessageIndex] || ''
      setSelectedMessageCandidateId(newCandidate.id)
      setCurrentEditingMessage(newMessage)
      // Keep the same message index
    }
  }

  const handleClearSelection = () => {
    setSelectedMessageCandidateId(null)
  }

  const hasMoreMessages = currentMessageIndex < MOCK_ALL_MESSAGES.length

  return (
    <div className="h-[calc(100vh-150px)] max-h-[calc(100vh-150px)] overflow-hidden flex flex-col gap-6">
      {/* Top Bar: Select Open Role + View Toggle */}
      <div className="flex justify-between items-center">
        {/* Left: Select Open Role */}
        <div className="w-64">
          <Select value={selectedOpenRoleId} onValueChange={handleOpenRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an open role..." />
            </SelectTrigger>
            <SelectContent>
              {jobPostings && jobPostings.length > 0 ? (
                jobPostings.map((job) => (
                  <SelectItem key={job.id} value={job.id.toString()}>
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
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            placeholder="Type your message..."
            onNext={handleNext}
            hasMoreMessages={hasMoreMessages}
          />
        </div>

        {/* Right side - Selection Panel + Feedback Section (1/3 width) */}
        <div className="col-span-1 h-full flex flex-col gap-4">
          {/* Selection Panel */}
          <SelectionPanel
            openRoles={jobPostings}
            selectedOpenRole={selectedOpenRoleId}
            onOpenRoleChange={handleOpenRoleChange}
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
            />
          </div>
        </div>
        </div>
      ) : (
        /* Table View */
        <div className="flex-1 min-h-0">
          {candidatesData.length > 0 ? (
            <SandboxTableView
              candidates={candidatesData}
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
                <p className="text-sm">Select an Open Role to view candidates and their messages</p>
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
            ? candidatesData.find(c => c.id === selectedMessageCandidateId)?.name
            : undefined
        }
        messageNumber={selectedMessageIndex + 1}
        onNavigate={handleMessageNavigate}
        onClearSelection={handleClearSelection}
        onOpenAgentPanel={() => setIsAgentPanelOpen(true)}
      />

      {/* Agent Panel Sheet */}
      <Sheet open={isAgentPanelOpen} onOpenChange={setIsAgentPanelOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>AI Message Generator</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <AgentPanel initialMessage={currentEditingMessage} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
