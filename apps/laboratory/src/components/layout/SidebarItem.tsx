'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface SidebarItemProps {
  label: string
  icon?: string | ReactNode
  isActive?: boolean
  isCollapsed?: boolean
  onClick?: () => void
  badge?: string | number
  className?: string
}

export function SidebarItem ({
  label,
  icon,
  isActive = false,
  isCollapsed = false,
  onClick,
  badge,
  className = ''
}: SidebarItemProps) {
  const renderIcon = () => {
    if (!icon) return null
    
    if (typeof icon === 'string') {
      return (
        <Image
          src={icon}
          alt={label}
          width={16}
          height={16}
          className="flex-shrink-0"
        />
      )
    }
    
    return icon
  }

  return (
    <Button
      variant={isActive ? 'default' : 'ghost'}
      size={isCollapsed ? 'icon' : 'default'}
      className={`
        w-full h-9 
        flex items-center 
        ${isCollapsed ? 'justify-center px-2' : 'justify-start px-3'}
        ${className}
      `}
      onClick={onClick}
    >
      {renderIcon()}
      {!isCollapsed && (
        <span className="ml-2 flex-1 text-left">{label}</span>
      )}
      {!isCollapsed && badge !== undefined && (
        <span
          className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: isActive ? '#FFFFFF' : '#EEEEEE',
            color: isActive ? '#1C1B20' : '#777D8D'
          }}
        >
          {badge}
        </span>
      )}
    </Button>
  )
}

