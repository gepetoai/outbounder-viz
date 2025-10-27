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
  Plus,
  X
} from 'lucide-react'

export interface SequencerStep {
  id: string
  label: string
  icon: any
  type: 'view-profile' | 'like-post' | 'connection-request' | 'initial-message' | 'respond' | 'follow-up'
}

export interface SequencerTabProps {
  // Add any props you might need in the future
}

const availableSteps: SequencerStep[] = [
  { id: 'view-profile', label: 'View Profile', icon: Eye, type: 'view-profile' },
  { id: 'like-post', label: 'Like Post', icon: Heart, type: 'like-post' },
  { id: 'connection-request', label: 'Connection Request', icon: UserPlus, type: 'connection-request' },
  { id: 'initial-message', label: 'Initial Message', icon: MessageSquare, type: 'initial-message' },
  { id: 'respond', label: 'Respond', icon: Reply, type: 'respond' },
  { id: 'follow-up', label: 'Follow Up', icon: ArrowRight, type: 'follow-up' }
]

export function SequencerTab({}: SequencerTabProps) {
  const [sequence, setSequence] = useState<SequencerStep[]>([])

  const addStep = (step: SequencerStep) => {
    setSequence([...sequence, step])
  }

  const removeStep = (index: number) => {
    setSequence(sequence.filter((_, i) => i !== index))
  }

  const moveStep = (fromIndex: number, toIndex: number) => {
    const newSequence = [...sequence]
    const [movedStep] = newSequence.splice(fromIndex, 1)
    newSequence.splice(toIndex, 0, movedStep)
    setSequence(newSequence)
  }

  return (
    <div className="space-y-6">
      {/* Available Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableSteps.map((step) => {
              const Icon = step.icon
              return (
                <Button
                  key={step.id}
                  variant="outline"
                  size="sm"
                  className="h-10 px-3 flex items-center gap-2"
                  onClick={() => addStep(step)}
                >
                  <Icon className="h-4 w-4" />
                  {step.label}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

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
                    <div className="relative group">
                      <div className="w-32 h-20 border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-colors">
                        <Icon className="h-6 w-6 text-gray-600 mb-1" />
                        <span className="text-xs text-gray-600 text-center px-2 leading-tight">
                          {step.label}
                        </span>
                      </div>
                      
                      {/* Remove Button */}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeStep(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
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

      {/* Sequence Actions */}
      {sequence.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="default">
                Save Sequence
              </Button>
              <Button variant="outline">
                Test Sequence
              </Button>
              <Button variant="outline" onClick={() => setSequence([])}>
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
