'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Eye, 
  Heart, 
  UserPlus, 
  MessageSquare, 
  Reply, 
  ArrowRight
} from 'lucide-react'

export interface SequencerStep {
  id: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  type: 'view-profile' | 'like-post' | 'connection-request' | 'initial-message' | 'respond' | 'follow-up'
}


export function SequencerTab() {
  const [sequence] = useState<SequencerStep[]>([
    { id: 'view-profile', label: 'View Profile', icon: Eye, type: 'view-profile' },
    { id: 'like-post', label: 'Like Post', icon: Heart, type: 'like-post' },
    { id: 'connection-request', label: 'Connection Request', icon: UserPlus, type: 'connection-request' },
    { id: 'initial-message', label: 'Initial Message', icon: MessageSquare, type: 'initial-message' },
    { id: 'respond', label: 'Respond', icon: Reply, type: 'respond' },
    { id: 'follow-up', label: 'Follow Up', icon: ArrowRight, type: 'follow-up' }
  ])


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
            <div className="flex items-center gap-2 overflow-x-auto pb-4">
              {sequence.map((step, index) => {
                const Icon = step.icon
                const isLast = index === sequence.length - 1
                
                return (
                  <div key={`${step.id}-${index}`} className="flex items-center gap-2 flex-shrink-0">
                    {/* Step Block */}
                    <div className="w-20 h-16 border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-colors">
                      <Icon className="h-5 w-5 text-gray-600 mb-1" />
                      <span className="text-[10px] text-gray-600 text-center px-1 leading-tight">
                        {step.label}
                      </span>
                    </div>

                    {/* Arrow */}
                    {!isLast && (
                      <div className="flex items-center justify-center">
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
    </div>
  )
}
