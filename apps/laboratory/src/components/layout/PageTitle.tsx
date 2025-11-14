'use client'

import { ReactNode } from 'react'

interface PageTitleProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export function PageTitle ({ title, subtitle, actions, className = '' }: PageTitleProps) {
  return (
    <div className={`flex items-start justify-between mb-6 ${className}`}>
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#1C1B20' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1" style={{ color: '#777D8D' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}


