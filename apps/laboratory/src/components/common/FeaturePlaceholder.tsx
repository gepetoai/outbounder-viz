'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface FeaturePlaceholderProps {
  title: string
  icon: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function FeaturePlaceholder ({
  title,
  icon,
  description = 'Under Development',
  action
}: FeaturePlaceholderProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="p-12 max-w-md text-center bg-white shadow-sm">
        <div className="flex flex-col items-center gap-6">
          {/* Icon */}
          <div className="relative w-24 h-24 opacity-40">
            <Image
              src={icon}
              alt={title}
              width={96}
              height={96}
              className="w-full h-full"
            />
          </div>

          {/* Title and Description */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold" style={{ color: '#1C1B20' }}>
              {title}
            </h2>
            <p className="text-base" style={{ color: '#777D8D' }}>
              {description}
            </p>
          </div>

          {/* Separator */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

          {/* Action or Status */}
          {action ? (
            <Button
              onClick={action.onClick}
              className="px-8 py-2 bg-[#1C1B20] hover:bg-[#40404C] text-white"
            >
              {action.label}
            </Button>
          ) : (
            <div className="flex items-center gap-2" style={{ color: '#B9B8C0' }}>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
              <p className="text-sm">Check back soon</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}



