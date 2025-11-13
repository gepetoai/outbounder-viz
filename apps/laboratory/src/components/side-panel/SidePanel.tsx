'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface SidePanelProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
}

export function SidePanel ({ isOpen, onClose, title, children, footer }: SidePanelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Mount and start animation
      setIsVisible(true)
      // Small delay to trigger CSS transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
    } else {
      // Start closing animation
      setIsAnimating(false)
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop with fade animation */}
      <div 
        className={`fixed inset-0 z-50 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-30' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Side panel with slide animation */}
      <div 
        className={`fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl border-l h-full z-50 transform transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold" style={{ color: '#1C1B20' }}>
              {title || 'Side Panel'}
            </h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="p-4 border-t">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

