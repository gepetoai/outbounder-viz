'use client'

import { Button } from './button'
import Image from 'next/image'

interface SidebarNavItemProps {
  id: string
  label: string
  iconPath: string
  isActive?: boolean
  isCollapsed?: boolean
  onClick?: () => void
}

export function SidebarNavItem ({
  label,
  iconPath,
  isActive = false,
  isCollapsed = false,
  onClick
}: SidebarNavItemProps) {
  // Switch to light icon when active (on dark background)
  const displayIconPath = isActive 
    ? iconPath.replace('-dark.svg', '-light.svg')
    : iconPath

  return (
    <Button
      variant={isActive ? 'default' : 'ghost'}
      size={isCollapsed ? 'icon' : 'default'}
      className={`w-full h-9 flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-start px-3'}`}
      onClick={onClick}
      style={isActive ? {
        backgroundColor: '#1C1B20',
        color: '#FFFFFF'
      } : undefined}
    >
      <Image
        src={displayIconPath}
        alt={label}
        width={16}
        height={16}
        className="flex-shrink-0"
      />
      {!isCollapsed && (
        <span className="ml-2 flex items-center">{label}</span>
      )}
    </Button>
  )
}

