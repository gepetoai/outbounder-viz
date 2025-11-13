'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface ContentCardProps {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
  onClick?: () => void
  variant?: 'default' | 'elevated' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

export function ContentCard ({
  children,
  header,
  footer,
  onClick,
  variant = 'default',
  padding = 'md',
  className = ''
}: ContentCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return 'shadow-lg border-gray-200'
      case 'flat':
        return 'shadow-none border-gray-300'
      case 'default':
      default:
        return 'shadow-sm border-gray-300'
    }
  }

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return 'p-0'
      case 'sm':
        return 'p-3'
      case 'lg':
        return 'p-8'
      case 'md':
      default:
        return 'p-6'
    }
  }

  return (
    <Card
      className={`
        bg-white overflow-hidden transition-all
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
        ${getVariantStyles()}
        ${className}
      `}
      onClick={onClick}
    >
      {header && (
        <div className="border-b border-gray-200 px-6 py-4">
          {header}
        </div>
      )}
      
      <CardContent className={getPaddingStyles()}>
        {children}
      </CardContent>

      {footer && (
        <div className="border-t border-gray-200 px-6 py-4">
          {footer}
        </div>
      )}
    </Card>
  )
}

