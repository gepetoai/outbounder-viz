'use client'

import { useState, useMemo } from 'react'
import { ChatInterface } from './ChatInterface'
import { FeedbackSection, type FeedbackItem } from './FeedbackSection'
import { SelectionPanel } from './SelectionPanel'
import { CandidateDetailPanel } from '../recruiter/CandidateDetailPanel'
import { ChatMessageProps } from './ChatMessage'
import { useJobPostings } from '@/hooks/useJobPostings'
import { useCandidatesByJobDescription } from '@/hooks/useSearch'
import { mapEnrichedCandidateToCandidate, type Candidate } from '@/lib/utils'

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

export function Sandbox () {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(3) // Show first 3 messages initially
  const [messages, setMessages] = useState<ChatMessageProps[]>(MOCK_ALL_MESSAGES.slice(0, 3))
  const [selectedOpenRoleId, setSelectedOpenRoleId] = useState<string>('')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [selectedResponderId, setSelectedResponderId] = useState<string>('')
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])

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

  // Mock responders data (you can replace this with API data later)
  const respondersData = useMemo(() => [
    { id: '1', name: 'Sarah Johnson - Recruiter' },
    { id: '2', name: 'Mike Chen - Senior Recruiter' },
    { id: '3', name: 'Emily Davis - Talent Manager' },
    { id: '4', name: 'John Smith - HR Lead' }
  ], [])

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

  const handleResponderChange = (responderId: string) => {
    setSelectedResponderId(responderId)
  }

  const handleNext = () => {
    if (currentMessageIndex < MOCK_ALL_MESSAGES.length) {
      setMessages(MOCK_ALL_MESSAGES.slice(0, currentMessageIndex + 1))
      setCurrentMessageIndex(currentMessageIndex + 1)
    }
  }

  const hasMoreMessages = currentMessageIndex < MOCK_ALL_MESSAGES.length

  return (
    <div className="h-[calc(100vh-150px)] max-h-[calc(100vh-150px)] overflow-hidden">
      <div className="grid grid-cols-3 gap-6 h-full">
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
            responders={respondersData}
            selectedResponder={selectedResponderId}
            onResponderChange={handleResponderChange}
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

      {/* Candidate Detail Panel */}
      <CandidateDetailPanel
        candidate={selectedCandidate}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        variant="sheet"
      />
    </div>
  )
}

