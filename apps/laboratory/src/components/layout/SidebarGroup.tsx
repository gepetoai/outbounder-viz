'use client'

import { ReactNode } from 'react'

interface SidebarGroupProps {
  title?: string
  children: ReactNode
  isCollapsed?: boolean
  className?: string
}

export function SidebarGroup ({
  title,
  children,
  isCollapsed = false,
  className = ''
}: SidebarGroupProps) {
  return (
    <div className={`${isCollapsed ? 'p-2 space-y-2' : 'p-2 space-y-2'} ${className}`}>
      {title && !isCollapsed && (
        <div className="px-3 py-2">
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: '#777D8D' }}
          >
            {title}
          </p>
        </div>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  )
}

