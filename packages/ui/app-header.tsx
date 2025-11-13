'use client'

import { ReactNode } from 'react'
import Image from 'next/image'

interface AppHeaderProps {
  logoSrc?: string
  logoAlt?: string
  children?: ReactNode
  className?: string
}

export function AppHeader ({ 
  logoSrc = '/icons/248ai-logo-light.svg',
  logoAlt = '248.AI',
  children,
  className = ''
}: AppHeaderProps) {
  return (
    <header 
      className={`h-16 border-b px-6 flex items-center justify-between ${className}`}
      style={{ 
        backgroundColor: '#FFFFFF',
        borderColor: '#EEEEEE'
      }}
    >
      <div className="flex items-center gap-4">
        <Image
          src={logoSrc}
          alt={logoAlt}
          width={120}
          height={32}
          className="h-8 w-auto"
        />
      </div>
      
      {children && (
        <div className="flex items-center gap-4">
          {children}
        </div>
      )}
    </header>
  )
}

