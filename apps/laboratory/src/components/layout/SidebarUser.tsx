'use client'

import { ReactNode } from 'react'
import Image from 'next/image'

interface SidebarUserProps {
  name?: string
  email?: string
  avatar?: string | ReactNode
  isCollapsed?: boolean
  onClick?: () => void
  className?: string
}

export function SidebarUser ({
  name,
  email,
  avatar,
  isCollapsed = false,
  onClick,
  className = ''
}: SidebarUserProps) {
  const renderAvatar = () => {
    if (typeof avatar === 'string') {
      return (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
          <Image
            src={avatar}
            alt={name || 'User'}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
      )
    }
    
    if (avatar) {
      return avatar
    }
    
    // Default avatar
    return (
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#EEEEEE' }}
      >
        <Image
          src="/icons/user-dark.svg"
          alt="User"
          width={20}
          height={20}
        />
      </div>
    )
  }

  return (
    <div
      className={`
        flex items-center gap-3 p-2
        ${onClick ? 'cursor-pointer hover:bg-gray-50 rounded-lg transition-colors' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {renderAvatar()}
      {!isCollapsed && name && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: '#1C1B20' }}>
            {name}
          </p>
          {email && (
            <p className="text-xs truncate" style={{ color: '#777D8D' }}>
              {email}
            </p>
          )}
        </div>
      )}
    </div>
  )
}


