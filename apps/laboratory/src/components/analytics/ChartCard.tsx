'use client'

import { ReactNode } from 'react'
import Image from 'next/image'

interface ChartCardProps {
  title: string
  description?: string
  icon?: string
  children: ReactNode
  className?: string
}

export function ChartCard ({
  title,
  description,
  icon,
  children,
  className = ''
}: ChartCardProps) {
  return (
    <div 
      className={`bg-white rounded-2xl p-8 ${className}`}
      style={{
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #EEEEEE'
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {icon && (
            <div className="relative w-5 h-5 opacity-60">
              <Image
                src={icon}
                alt={title}
                width={20}
                height={20}
                className="w-full h-full"
              />
            </div>
          )}
          <h3 
            className="text-xl font-bold"
            style={{ color: '#1C1B20' }}
          >
            {title}
          </h3>
        </div>
        {description && (
          <p 
            className="text-sm"
            style={{ color: '#777D8D' }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Chart Content */}
      <div>
        {children}
      </div>
    </div>
  )
}

