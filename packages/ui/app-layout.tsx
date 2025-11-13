'use client'

import { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
  className?: string
}

export function AppLayout ({ children, className = '' }: AppLayoutProps) {
  return (
    <div 
      className={`flex h-screen ${className}`}
      style={{ backgroundColor: '#FAFAFA' }}
    >
      {children}
    </div>
  )
}

interface AppMainProps {
  children: ReactNode
  className?: string
}

export function AppMain ({ children, className = '' }: AppMainProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className={`flex-1 overflow-auto p-6 ${className}`}>
        {children}
      </main>
    </div>
  )
}

