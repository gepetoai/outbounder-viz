'use client'

import { Badge } from './badge'
import { X } from 'lucide-react'

interface RemovableBadgeProps {
  label: string
  onRemove: () => void
  variant?: 'default' | 'secondary'
  className?: string
}

export function RemovableBadge({ label, onRemove, variant = 'default', className = '' }: RemovableBadgeProps) {
  const variantClasses = variant === 'secondary'
    ? 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
    : 'bg-black text-white border-black hover:bg-gray-800'

  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 cursor-pointer ${variantClasses} ${className}`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onRemove()
      }}
    >
      {label}
      <X className="h-3 w-3" />
    </Badge>
  )
}

