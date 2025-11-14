'use client'

import { useState } from 'react'
import { SandboxTableView } from './SandboxTableView'
import { MessageEditModal } from './MessageEditModal'
import { AgentPanel } from './AgentPanel'

// Mock data
const MOCK_CANDIDATES = [
  {
    id: '1',
    name: 'Sarah Johnson',
    photo: 'https://i.pravatar.cc/150?img=1',
    title: 'Senior Sales Manager at TechCorp'
  },
  {
    id: '2',
    name: 'Michael Chen',
    photo: 'https://i.pravatar.cc/150?img=2',
    title: 'Territory Sales Rep at CloudSoft'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    photo: 'https://i.pravatar.cc/150?img=3',
    title: 'Account Executive at DataFlow'
  },
  {
    id: '4',
    name: 'David Park',
    photo: 'https://i.pravatar.cc/150?img=4',
    title: 'Sales Director at MarketPro'
  },
  {
    id: '5',
    name: 'Jessica Williams',
    photo: 'https://i.pravatar.cc/150?img=5',
    title: 'Business Development Lead at SalesTech'
  }
]

const INITIAL_MESSAGES = {
  '1': [
    'Hi Sarah, I came across your profile and was impressed by your sales experience at TechCorp.',
    'Following up on my previous message. Would you be interested in discussing a new opportunity?'
  ],
  '2': [
    'Hi Michael, your background in cloud software sales is exactly what we\'re looking for.',
    'I\'d love to schedule a quick call to discuss how your skills align with our open position.'
  ],
  '3': [
    'Emily, I noticed you\'ve been excelling in account management. We have an exciting role that might interest you.',
    ''
  ],
  '4': [
    'David, your leadership in sales is impressive. I have a senior opportunity I\'d like to share with you.',
    'Would you be available for a brief conversation this week?'
  ],
  '5': [
    'Jessica, your expertise in business development caught my attention. Let\'s connect!',
    ''
  ]
}

export function SandboxTableDemo () {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number>(-1)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAgentPanelOpen, setIsAgentPanelOpen] = useState(false)

  const handleCandidateClick = (candidate: any) => {
    setSelectedCandidateId(candidate.id)
    console.log('Candidate clicked:', candidate.name)
  }

  const handleMessageClick = (candidateId: string, messageIndex: number) => {
    setSelectedCandidateId(candidateId)
    setSelectedMessageIndex(messageIndex)
    setIsEditModalOpen(true)
  }

  const handleSaveMessage = (newMessage: string) => {
    if (selectedCandidateId !== null) {
      setMessages(prev => ({
        ...prev,
        [selectedCandidateId]: [
          ...(prev[selectedCandidateId] || []).slice(0, selectedMessageIndex),
          newMessage,
          ...(prev[selectedCandidateId] || []).slice(selectedMessageIndex + 1)
        ]
      }))
    }
  }

  const handleNavigate = (direction: 'up' | 'down') => {
    const candidateIds = MOCK_CANDIDATES.map(c => c.id)
    const currentCandidateIndex = candidateIds.indexOf(selectedCandidateId || '')

    if (direction === 'up' && currentCandidateIndex > 0) {
      setSelectedCandidateId(candidateIds[currentCandidateIndex - 1])
    } else if (direction === 'down' && currentCandidateIndex < candidateIds.length - 1) {
      setSelectedCandidateId(candidateIds[currentCandidateIndex + 1])
    }
  }

  const currentMessage = selectedCandidateId && selectedMessageIndex >= 0
    ? (messages[selectedCandidateId]?.[selectedMessageIndex] || '')
    : ''

  const currentCandidateName = MOCK_CANDIDATES.find(c => c.id === selectedCandidateId)?.name

  return (
    <div className="h-[calc(100vh-150px)] flex gap-6">
      {/* Table View - 2/3 width */}
      <div className="flex-1">
        <SandboxTableView
          candidates={MOCK_CANDIDATES}
          messages={messages}
          onCandidateClick={handleCandidateClick}
          onMessageClick={handleMessageClick}
          selectedCandidateId={selectedCandidateId}
          selectedMessageIndex={selectedMessageIndex}
        />
      </div>

      {/* Agent Panel - 1/3 width */}
      <div className="w-[400px] border rounded-lg bg-white overflow-hidden">
        <div className="p-4 border-b bg-[#1C1B20] text-white">
          <h3 className="text-lg font-semibold">AI Message Generator</h3>
        </div>
        <AgentPanel initialMessage={currentMessage} />
      </div>

      {/* Edit Modal */}
      <MessageEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        message={currentMessage}
        onSave={handleSaveMessage}
        candidateName={currentCandidateName}
        messageNumber={selectedMessageIndex + 1}
        onNavigate={handleNavigate}
        onClearSelection={() => setSelectedMessageIndex(-1)}
        onOpenAgentPanel={() => setIsAgentPanelOpen(true)}
      />
    </div>
  )
}

