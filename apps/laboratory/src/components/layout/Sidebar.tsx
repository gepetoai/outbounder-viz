'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface SidebarProps {
  children: ReactNode
  isOpen: boolean
  onToggle: () => void
  header?: ReactNode
  footer?: ReactNode
  width?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Sidebar ({
  children,
  isOpen,
  onToggle,
  header,
  footer,
  width = 'md',
  className = ''
}: SidebarProps) {
  const getWidth = () => {
    if (!isOpen) return 'w-12'
    switch (width) {
      case 'sm':
        return 'w-56'
      case 'lg':
        return 'w-80'
      case 'md':
      default:
        return 'w-64'
    }
  }

  return (
    <aside
      className={`
        ${getWidth()} 
        transition-all duration-300 
        bg-white border-r 
        flex flex-col
        ${className}
      `}
      style={{ borderColor: '#E5E7EB' }}
    >
      {/* Header with toggle */}
      <div
        className={`
          ${isOpen ? 'p-4' : 'p-2'} 
          border-b 
          min-h-[72px] 
          flex items-center 
          ${isOpen ? 'justify-between' : 'justify-center'}
        `}
        style={{ borderColor: '#E5E7EB' }}
      >
        {isOpen && header && <div className="flex-1">{header}</div>}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={isOpen ? 'ml-auto' : ''}
        >
          <Image
            src={isOpen ? '/icons/xmark-light.svg' : '/icons/bars-dark.svg'}
            alt={isOpen ? 'Close' : 'Open'}
            width={16}
            height={16}
          />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-auto p-2 border-t" style={{ borderColor: '#E5E7EB' }}>
          {footer}
        </div>
      )}
    </aside>
  )
}

