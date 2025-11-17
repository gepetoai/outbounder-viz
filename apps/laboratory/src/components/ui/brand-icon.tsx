'use client'

import Image from 'next/image'

/**
 * BrandIcon Component
 * MANDATORY: Use only 248.AI custom icons from /Branding Assets/Custom Icons/
 * NEVER use Lucide React icons unless custom icon doesn't exist
 */

export type IconName =
  | 'address-book'
  | 'users'
  | 'user'
  | 'sparkles'
  | 'bolt'
  | 'briefcase'
  | 'gear'
  | 'paper-plane'
  | 'comment'
  | 'comments'
  | 'envelope'
  | 'file'
  | 'file-dots'
  | 'circle-exclamation'
  | 'loader'
  | 'spinner'
  | 'check'
  | 'check-dots'
  | 'xmark'
  | 'xmark-dots'
  | 'circle'
  | 'book'
  | 'bars'
  | 'list'
  | 'grid'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'arrow-left'
  | 'arrow-right'

interface BrandIconProps {
  name: IconName
  size?: number
  theme?: 'light' | 'dark'
  className?: string
  alt?: string
}

export function BrandIcon ({
  name,
  size = 24,
  theme = 'light',
  className = '',
  alt
}: BrandIconProps) {
  const iconPath = `/icons/${name}-${theme}.svg`
  
  return (
    <Image
      src={iconPath}
      alt={alt || name}
      width={size}
      height={size}
      className={className}
    />
  )
}



