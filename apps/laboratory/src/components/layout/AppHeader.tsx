'use client'

import { ReactNode } from 'react'

interface AppHeaderProps {
  title: string
  logo?: ReactNode
  actions?: ReactNode
  className?: string
}

export function AppHeader ({ title, logo, actions, className = '' }: AppHeaderProps) {
  return (
    <header
      className={`border-b px-6 py-4 bg-white ${className}`}
      style={{ borderColor: '#E5E7EB' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logo && <div className="flex-shrink-0">{logo}</div>}
          <h1 className="text-2xl font-bold" style={{ color: '#1C1B20' }}>
            {title}
          </h1>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}


