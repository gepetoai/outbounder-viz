'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Eye, 
  Heart, 
  UserPlus, 
  MessageSquare, 
  Reply, 
  ArrowRight,
  Play,
  Pause,
  Send,
  ChevronDown
} from 'lucide-react'

export interface SequencerStep {
  id: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  type: 'view-profile' | 'like-post' | 'connection-request' | 'initial-message' | 'respond' | 'follow-up'
}


export function SequencerTab() {
  const [sequence, setSequence] = useState<SequencerStep[]>([
    { id: 'view-profile', label: 'View Profile', icon: Eye, type: 'view-profile' },
    { id: 'like-post', label: 'Like Post', icon: Heart, type: 'like-post' },
    { id: 'connection-request', label: 'Connection Request', icon: UserPlus, type: 'connection-request' },
    { id: 'initial-message', label: 'Initial Message', icon: MessageSquare, type: 'initial-message' },
    { id: 'respond', label: 'Respond', icon: Reply, type: 'respond' },
    { id: 'follow-up', label: 'Follow Up', icon: ArrowRight, type: 'follow-up' }
  ])

  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; isUser: boolean }>>([
    { id: '1', text: 'Hello! I\'m here to help you test your sequence. What would you like to try?', isUser: false }
  ])
  const [chatInput, setChatInput] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('v1.0')
  const [campaignStatus, setCampaignStatus] = useState<'active' | 'paused'>('paused')


  return (
    <div className="space-y-6">
      {/* Sequence Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sequence Flow</CardTitle>
        </CardHeader>
        <CardContent>
          {sequence.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No steps added yet. Click on a step above to add it to your sequence.</p>
            </div>
          ) : (
            <div className="flex items-center gap-4 overflow-x-auto pb-4">
              {sequence.map((step, index) => {
                const Icon = step.icon
                const isLast = index === sequence.length - 1
                
                return (
                  <div key={`${step.id}-${index}`} className="flex items-center gap-4 flex-shrink-0">
                    {/* Step Block */}
                    <div className="w-32 h-20 border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-colors">
                      <Icon className="h-6 w-6 text-gray-600 mb-1" />
                      <span className="text-xs text-gray-600 text-center px-2 leading-tight">
                        {step.label}
                      </span>
                    </div>

                    {/* Arrow */}
                    {!isLast && (
                      <div className="flex items-center">
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status */}
      {sequence.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="bg-white hover:bg-gray-50"
                  onClick={() => setCampaignStatus('active')}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Active
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-white hover:bg-gray-50"
                  onClick={() => setCampaignStatus('paused')}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Campaign Status:</span>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  campaignStatus === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {campaignStatus === 'active' ? 'Active' : 'Paused'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Playground Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Playground</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chat Interface */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Chat Interface</h3>
              <div className="border rounded-lg h-80 flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.isUser
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Chat Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          if (chatInput.trim()) {
                            setChatMessages([...chatMessages, { id: Date.now().toString(), text: chatInput, isUser: true }])
                            setChatInput('')
                          }
                        }
                      }}
                    />
                    <Button size="sm" className="bg-white hover:bg-gray-50">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt Version Control */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Prompt Version Control</h3>
              <div className="border rounded-lg h-80 flex flex-col">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Version</span>
                    <div className="relative">
                      <select
                        value={selectedVersion}
                        onChange={(e) => setSelectedVersion(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="v1.0">v1.0 - Initial</option>
                        <option value="v1.1">v1.1 - Updated</option>
                        <option value="v1.2">v1.2 - Enhanced</option>
                        <option value="v2.0">v2.0 - Major Update</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 p-4">
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <strong>Version {selectedVersion}</strong>
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedVersion === 'v1.0' && 'Initial prompt version with basic sequence handling.'}
                      {selectedVersion === 'v1.1' && 'Updated with improved response timing and better context awareness.'}
                      {selectedVersion === 'v1.2' && 'Enhanced with personalization features and dynamic content generation.'}
                      {selectedVersion === 'v2.0' && 'Major update with AI-powered optimization and advanced analytics.'}
                    </div>
                    <div className="pt-4">
                      <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
                        Edit Prompt
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
