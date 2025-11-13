'use client'

import { ReactNode } from 'react'

interface MetricGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function MetricGrid ({
  children,
  columns = 3,
  gap = 'md',
  className = ''
}: MetricGridProps) {
  const getColumnStyles = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-2'
      case 4:
        return 'grid-cols-4'
      case 3:
      default:
        return 'grid-cols-3'
    }
  }

  const getGapStyles = () => {
    switch (gap) {
      case 'sm':
        return 'gap-4'
      case 'lg':
        return 'gap-8'
      case 'md':
      default:
        return 'gap-6'
    }
  }

  return (
    <div className={`grid ${getColumnStyles()} ${getGapStyles()} ${className}`}>
      {children}
    </div>
  )
}

