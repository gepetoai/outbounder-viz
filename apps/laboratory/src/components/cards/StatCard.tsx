'use client'

import { ReactNode } from 'react'
import styles from './StatCard.module.css'

interface StatCardProps {
  value: string | number
  label: string
  icon?: ReactNode
  onClick?: () => void
  isActive?: boolean
  showProgressBar?: boolean
  progressPercent?: number
  variant?: 'default' | 'outlined' | 'filled'
  className?: string
}

export function StatCard ({
  value,
  label,
  icon,
  onClick,
  isActive = false,
  showProgressBar = false,
  progressPercent = 0,
  variant = 'default',
  className = ''
}: StatCardProps) {
  const getVariantClass = () => {
    if (isActive) return styles.active
    
    switch (variant) {
      case 'outlined':
        return styles.outlined
      case 'filled':
        return styles.filled
      default:
        return ''
    }
  }

  return (
    <div className="relative">
      <div
        className={`
          ${styles.card}
          ${onClick ? styles.clickable : ''}
          ${getVariantClass()}
          ${className}
        `}
        onClick={onClick}
      >
        <div className={styles.content}>
          {icon && (
            <div className={styles.iconWrapper}>
              {icon}
            </div>
          )}
          <div className={styles.value}>
            {value}
          </div>
          <div className={styles.label}>
            {label}
          </div>
        </div>
      </div>

      {showProgressBar && (
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}


