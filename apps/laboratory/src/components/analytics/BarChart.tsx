'use client'

import { useEffect, useState } from 'react'
import styles from './BarChart.module.css'
import { BarChartDataPoint } from './metric-data'

interface BarChartProps {
  data: BarChartDataPoint[]
  showValues?: boolean
  className?: string
}

export function BarChart ({
  data,
  showValues = true,
  className = ''
}: BarChartProps) {
  const [animated, setAnimated] = useState(false)
  const maxValue = Math.max(...data.map(item => item.value))

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`${styles.container} ${className}`}>
      {data.map((item, index) => {
        const widthPercentage = (item.value / maxValue) * 100
        const minWidth = 5 // Minimum width for visibility
        const actualWidth = Math.max(widthPercentage, minWidth)

        return (
          <div key={index} className={styles.barItem}>
            <div className={styles.labelRow}>
              <div className={styles.value}>
                {item.value.toLocaleString()}
              </div>
              <div className={styles.label}>
                {item.label}
              </div>
            </div>
            <div className={styles.barTrack}>
              <div
                className={`${styles.barFill} ${animated ? styles.animated : ''}`}
                style={{
                  width: animated ? `${actualWidth}%` : '0%',
                  backgroundColor: item.color
                }}
              >
                {showValues && (
                  <span className={styles.barValue}>
                    {item.value.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}



