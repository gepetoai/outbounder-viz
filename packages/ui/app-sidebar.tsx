'use client'

import { useState, ReactNode } from 'react'
import { Button } from './button'
import Image from 'next/image'

interface AppSidebarProps {
  appName: string
  children: ReactNode
  defaultOpen?: boolean
  userIcon?: string
  showUser?: boolean
  onToggle?: (isOpen: boolean) => void
}

export function AppSidebar ({
  appName,
  children,
  defaultOpen = true,
  userIcon = '/icons/user-dark.svg',
  showUser = true,
  onToggle
}: AppSidebarProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const handleToggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onToggle?.(newState)
  }

  return (
    <div 
      className={`${isOpen ? 'w-64' : 'w-12'} transition-all duration-300 border-r flex flex-col`}
      style={{ 
        backgroundColor: '#FFFFFF',
        borderColor: '#EEEEEE'
      }}
    >
      {/* Header */}
      <div 
        className={`${isOpen ? 'p-4' : 'p-2'} border-b min-h-[72px] flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}
        style={{ borderColor: '#EEEEEE' }}
      >
        {isOpen && (
          <h1 
            className="text-xl font-bold"
            style={{ color: '#1C1B20' }}
          >
            {appName}
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className={isOpen ? 'ml-auto' : ''}
        >
          <Image
            src={isOpen ? '/icons/xmark-dark.svg' : '/icons/bars-dark.svg'}
            alt={isOpen ? 'Close sidebar' : 'Open sidebar'}
            width={16}
            height={16}
          />
        </Button>
      </div>

      {/* Navigation Content */}
      <nav className={`flex-1 ${isOpen ? 'p-2 space-y-2' : 'p-2 space-y-2'} overflow-y-auto`}>
        {children}
      </nav>

      {/* User Section */}
      {showUser && (
        <div 
          className="mt-auto p-2 border-t"
          style={{ borderColor: '#EEEEEE' }}
        >
          <div className="flex items-center gap-2 p-2">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#EEEEEE' }}
            >
              <Image
                src={userIcon}
                alt="User"
                width={20}
                height={20}
              />
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p 
                  className="text-sm font-medium truncate"
                  style={{ color: '#1C1B20' }}
                >
                  User
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

