'use client'

import { ReactNode } from 'react'
import styles from './ContentCard.module.css'

interface ContentCardProps {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
  onClick?: () => void
  variant?: 'default' | 'elevated' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

export function ContentCard ({
  children,
  header,
  footer,
  onClick,
  variant = 'default',
  padding = 'md',
  className = ''
}: ContentCardProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevated
      case 'flat':
        return styles.flat
      default:
        return styles.default
    }
  }

  const getPaddingClass = () => {
    switch (padding) {
      case 'none':
        return styles.paddingNone
      case 'sm':
        return styles.paddingSm
      case 'lg':
        return styles.paddingLg
      default:
        return styles.paddingMd
    }
  }

  return (
    <div
      className={`
        ${styles.card}
        ${onClick ? styles.clickable : ''}
        ${getVariantClass()}
        ${className}
      `}
      onClick={onClick}
    >
      {header && (
        <div className={styles.header}>
          {header}
        </div>
      )}
      
      <div className={`${styles.content} ${getPaddingClass()}`}>
        {children}
      </div>

      {footer && (
        <div className={styles.footer}>
          {footer}
        </div>
      )}
    </div>
  )
}


