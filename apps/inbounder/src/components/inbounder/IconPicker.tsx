'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Instagram,
  Linkedin,
  Globe,
  FileText,
  Mail,
  Phone,
  MessageSquare,
  Users,
  Building2,
  Megaphone,
  Target,
  TrendingUp,
  Zap,
  Youtube,
  Twitter,
  Facebook,
  type LucideIcon
} from 'lucide-react'

export const AVAILABLE_ICONS = {
  Instagram,
  Linkedin,
  Globe,
  FileText,
  Mail,
  Phone,
  MessageSquare,
  Users,
  Building2,
  Megaphone,
  Target,
  TrendingUp,
  Zap,
  Youtube,
  Twitter,
  Facebook
}

export type IconName = keyof typeof AVAILABLE_ICONS

interface IconPickerProps {
  selectedIcon: IconName
  onChange: (icon: IconName) => void
}

export function IconPicker ({ selectedIcon, onChange }: IconPickerProps) {
  return (
    <div className="space-y-3">
      <Label>Icon</Label>
      <div className="grid grid-cols-8 gap-2">
        {Object.entries(AVAILABLE_ICONS).map(([name, Icon]) => {
          const isSelected = selectedIcon === name
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name as IconName)}
              className={`p-3 rounded-lg border-2 transition-colors hover:bg-gray-50 ${
                isSelected
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-300'
              }`}
              title={name}
            >
              <Icon className="h-5 w-5 text-gray-700" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

