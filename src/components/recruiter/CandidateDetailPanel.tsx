'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { X, ExternalLink, MapPin, GraduationCap } from 'lucide-react'
import type { Candidate } from '@/lib/utils'

interface CandidateDetailPanelProps {
  candidate: Candidate | null
  isOpen: boolean
  onClose: () => void
  variant?: 'sheet' | 'slide'
}

export function CandidateDetailPanel({
  candidate,
  isOpen,
  onClose,
  variant = 'sheet'
}: CandidateDetailPanelProps) {
  // Prevent body scroll and layout shift when slide panel is open
  useEffect(() => {
    if (variant === 'slide' && isOpen) {
      // Get the current scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      
      // Store original values
      const originalOverflow = document.body.style.overflow
      const originalPaddingRight = document.body.style.paddingRight
      
      // Lock scroll and add padding to prevent layout shift
      document.body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
      
      return () => {
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = originalPaddingRight
      }
    }
  }, [isOpen, variant])

  if (!candidate) return null

  // Sheet variant - used in SearchTab with shadcn Sheet component
  if (variant === 'sheet') {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-[312px] sm:max-w-[312px]">
          <SheetHeader className="sr-only">
            <SheetTitle>Candidate Profile</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 p-4">
              {/* Profile Header */}
              <div className="flex items-start gap-3">
                <img 
                  src={candidate.photo} 
                  alt={candidate.name}
                  className="w-16 h-16 rounded-full object-cover grayscale"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-bold">{candidate.name}</h2>
                  <p className="text-sm text-gray-600">{candidate.title}</p>
                  <p className="text-xs text-gray-500">{candidate.company} • {candidate.location}</p>
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => candidate.linkedinUrl && window.open(candidate.linkedinUrl, '_blank')}
                      disabled={!candidate.linkedinUrl}
                    >
                      View LinkedIn Profile
                    </Button>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Summary</h3>
                <p className="text-xs text-gray-700">{candidate.summary}</p>
              </div>

              {/* Education */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Education</h3>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs font-medium">{candidate.education}</p>
                </div>
              </div>

              {/* Experience */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Experience</h3>
                <div className="space-y-2">
                  {candidate.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-500 pl-3">
                      <h4 className="text-xs font-medium">{exp.title}</h4>
                      <p className="text-xs text-gray-600">{exp.company}</p>
                      <p className="text-xs text-gray-500">{exp.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // Slide variant - used in CandidateTab with custom slide-in panel
  if (!isOpen) return null

  const panelContent = (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div 
        className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl border-l h-full transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">LinkedIn Profile</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClose()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Profile Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="text-center">
              <img 
                src={candidate.photo} 
                alt={candidate.name} 
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4 grayscale" 
              />
              <h3 className="text-xl font-bold">{candidate.name}</h3>
              <p className="text-gray-600">{candidate.title}</p>
              <p className="text-sm text-gray-500">{candidate.company}</p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">About</h4>
                <p className="text-sm text-gray-600">{candidate.summary}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Experience</h4>
                <div className="space-y-3">
                  {candidate.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-3">
                      <div className="font-medium text-sm">{exp.title}</div>
                      <div className="text-sm text-gray-600">{exp.company}</div>
                      <div className="text-xs text-gray-500">{exp.duration}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Location</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{candidate.location}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Education</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GraduationCap className="h-4 w-4" />
                  <span>{candidate.education}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with LinkedIn Button */}
          <div className="p-4 border-t">
            <Button 
              className="w-full" 
              onClick={() => candidate.linkedinUrl && window.open(candidate.linkedinUrl, '_blank')}
              disabled={!candidate.linkedinUrl}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open LinkedIn Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(panelContent, document.body)
}

