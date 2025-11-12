'use client'

import { Card } from '@/components/ui/card'
import Image from 'next/image'

export function SettingsPlaceholder () {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="p-12 max-w-md text-center bg-white shadow-sm">
        <div className="flex flex-col items-center gap-6">
          {/* Custom 248.AI Gear Icon */}
          <div className="relative w-24 h-24 opacity-40">
            <Image
              src="/icons/gear-dark.svg"
              alt="Settings"
              width={96}
              height={96}
              className="w-full h-full"
            />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold" style={{ color: '#1C1B20' }}>
              Settings
            </h2>
            <p className="text-base" style={{ color: '#777D8D' }}>
              Under Development
            </p>
          </div>
          
          {/* Grayscale separator */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          
          <div className="flex items-center gap-2" style={{ color: '#B9B8C0' }}>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
            <p className="text-sm">Check back soon</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

