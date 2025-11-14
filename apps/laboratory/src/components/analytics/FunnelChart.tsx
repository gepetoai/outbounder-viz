'use client'

import { useEffect, useState } from 'react'
import styles from './FunnelChart.module.css'
import { FunnelStage } from './metric-data'

interface FunnelChartProps {
  data: FunnelStage[]
  showConversionRates?: boolean
  className?: string
}

export function FunnelChart ({
  data,
  showConversionRates = true,
  className = ''
}: FunnelChartProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const calculateConversionRate = (currentIndex: number): number | null => {
    if (currentIndex === 0) return null
    const current = data[currentIndex].value
    const previous = data[currentIndex - 1].value
    return (current / previous) * 100
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {data.map((stage, index) => {
        const conversionRate = calculateConversionRate(index)
        const widthPercentage = animated ? stage.percentage : 0

        return (
          <div key={index}>
            <div className={styles.stage}>
              <div
                className={styles.stageBar}
                style={{
                  backgroundColor: stage.color,
                  width: `${widthPercentage}%`,
                  transitionDelay: `${index * 0.1}s`
                }}
              >
                <div className={styles.stageContent}>
                  <div className={styles.stageLeft}>
                    <div className={styles.stageLabel}>
                      {stage.label}
                    </div>
                    <div className={styles.stageValue}>
                      {stage.value.toLocaleString()}
                    </div>
                  </div>
                  <div className={styles.stagePercentage}>
                    {stage.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
            {showConversionRates && conversionRate !== null && (
              <div className={styles.conversionRate}>
                {conversionRate.toFixed(1)}% conversion rate
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

