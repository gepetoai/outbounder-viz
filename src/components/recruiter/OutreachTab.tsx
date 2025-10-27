'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Send, Users, MessageSquare, Mail, Phone, Calendar, Clock } from 'lucide-react'

export interface Candidate {
  id: string
  name: string
  photo: string
  title: string
  company: string
  location: string
  education: string
  experience: Array<{
    title: string
    company: string
    duration: string
  }>
  linkedinUrl: string
  summary: string
}

interface OutreachTabProps {
  approvedCandidates: string[]
  setApprovedCandidates: (candidates: string[]) => void
  rejectedCandidates: string[]
  setRejectedCandidates: (candidates: string[]) => void
  stagingCandidates: Candidate[]
}

export function OutreachTab({
  approvedCandidates,
  setApprovedCandidates,
  rejectedCandidates,
  setRejectedCandidates,
  stagingCandidates
}: OutreachTabProps) {
  const [outreachMethod, setOutreachMethod] = useState<'linkedin' | 'email' | 'phone'>('linkedin')
  const [messageTemplate, setMessageTemplate] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [phoneScript, setPhoneScript] = useState('')
  const [scheduledCalls, setScheduledCalls] = useState<Array<{
    id: string
    candidateId: string
    candidateName: string
    scheduledTime: string
    notes: string
  }>>([])

  const approvedCandidatesData = stagingCandidates.filter(c => approvedCandidates.includes(c.id))

  const handleSendOutreach = (candidateId: string) => {
    // Simulate sending outreach
    console.log(`Sending ${outreachMethod} outreach to candidate ${candidateId}`)
    // In a real app, this would trigger the actual outreach
  }

  const handleScheduleCall = (candidateId: string, candidateName: string) => {
    const scheduledTime = new Date()
    scheduledTime.setDate(scheduledTime.getDate() + 1) // Tomorrow
    
    const newCall = {
      id: Date.now().toString(),
      candidateId,
      candidateName,
      scheduledTime: scheduledTime.toISOString(),
      notes: ''
    }
    
    setScheduledCalls([...scheduledCalls, newCall])
  }

  const handleRemoveScheduledCall = (callId: string) => {
    setScheduledCalls(scheduledCalls.filter(call => call.id !== callId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Outreach Campaign</h2>
          <p className="text-gray-600">
            {approvedCandidatesData.length} approved candidates ready for outreach
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {approvedCandidatesData.length} candidates
        </Badge>
      </div>

      <Tabs defaultValue="outreach" className="space-y-6">
        <TabsList>
          <TabsTrigger value="outreach">Outreach</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Calls</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="outreach" className="space-y-6">
          {/* Outreach Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Outreach Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={outreachMethod === 'linkedin' ? 'default' : 'outline'}
                  onClick={() => setOutreachMethod('linkedin')}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  LinkedIn
                </Button>
                <Button
                  variant={outreachMethod === 'email' ? 'default' : 'outline'}
                  onClick={() => setOutreachMethod('email')}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
                <Button
                  variant={outreachMethod === 'phone' ? 'default' : 'outline'}
                  onClick={() => setOutreachMethod('phone')}
                  className="flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Phone
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Approved Candidates List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Approved Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvedCandidatesData.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={candidate.photo}
                        alt={candidate.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{candidate.name}</h3>
                        <p className="text-sm text-gray-600">{candidate.title} at {candidate.company}</p>
                        <p className="text-xs text-gray-500">{candidate.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {outreachMethod === 'phone' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleScheduleCall(candidate.id, candidate.name)}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule Call
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleSendOutreach(candidate.id)}
                        className="flex items-center gap-1"
                      >
                        <Send className="h-4 w-4" />
                        Send {outreachMethod === 'linkedin' ? 'Message' : outreachMethod === 'email' ? 'Email' : 'Call'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scheduledCalls.length > 0 ? (
                <div className="space-y-4">
                  {scheduledCalls.map((call) => (
                    <div
                      key={call.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Phone className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{call.candidateName}</h3>
                          <p className="text-sm text-gray-600">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {new Date(call.scheduledTime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveScheduledCall(call.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>No scheduled calls yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Message Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* LinkedIn Template */}
              <div className="space-y-2">
                <Label htmlFor="linkedin-template">LinkedIn Message Template</Label>
                <Textarea
                  id="linkedin-template"
                  placeholder="Hi [Name], I noticed your experience in [Role] at [Company]. I have an exciting opportunity that might be a great fit..."
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Email Template */}
              <div className="space-y-2">
                <Label htmlFor="email-subject">Email Subject</Label>
                <Input
                  id="email-subject"
                  placeholder="Exciting opportunity at [Company] - [Role]"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-body">Email Body</Label>
                <Textarea
                  id="email-body"
                  placeholder="Dear [Name], I hope this email finds you well..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={6}
                />
              </div>

              {/* Phone Script */}
              <div className="space-y-2">
                <Label htmlFor="phone-script">Phone Call Script</Label>
                <Textarea
                  id="phone-script"
                  placeholder="Hi [Name], this is [Your Name] from [Company]. I'm reaching out because..."
                  value={phoneScript}
                  onChange={(e) => setPhoneScript(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
