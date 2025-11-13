'use client'

import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'

interface StatCardProps {
  value: string | number
  label: string
  icon?: ReactNode
  onClick?: () => void
  isActive?: boolean
  showProgressBar?: boolean
  progressPercent?: number
  variant?: 'default' | 'outlined' | 'filled'
  className?: string
}

export function StatCard ({
  value,
  label,
  icon,
  onClick,
  isActive = false,
  showProgressBar = false,
  progressPercent = 0,
  variant = 'default',
  className = ''
}: StatCardProps) {
  const getVariantStyles = () => {
    if (isActive) {
      return 'bg-gray-100 border-gray-400'
    }
    
    switch (variant) {
      case 'outlined':
        return 'bg-white border-gray-300 hover:border-gray-400'
      case 'filled':
        return 'bg-gray-200 border-gray-300'
      case 'default':
      default:
        return 'bg-white border-gray-300 hover:border-gray-400'
    }
  }

  return (
    <div className="relative">
      <Card
        className={`
          border p-4 rounded-lg transition-all
          ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
          ${getVariantStyles()}
          ${className}
        `}
        onClick={onClick}
      >
        <div className="text-center">
          {icon && (
            <div className="flex justify-center mb-2 opacity-60">
              {icon}
            </div>
          )}
          <div className={`text-3xl font-bold mb-1 ${
            isActive ? 'text-gray-900' : 'text-gray-900'
          }`}>
            {value}
          </div>
          <div className={`text-xs font-medium uppercase tracking-wider ${
            isActive ? 'text-gray-700' : 'text-gray-600'
          }`}>
            {label}
          </div>
        </div>
      </Card>

      {/* Optional Progress Bar */}
      {showProgressBar && (
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-300 rounded-b-lg overflow-hidden">
          <div
            className="h-full transition-all duration-500 ease-out bg-gray-900"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

