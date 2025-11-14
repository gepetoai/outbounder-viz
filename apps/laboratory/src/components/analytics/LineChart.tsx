'use client'

import { useEffect, useState } from 'react'
import styles from './LineChart.module.css'
import { LineChartData } from './metric-data'

interface LineChartProps {
  data: LineChartData[]
  height?: number
  showLegend?: boolean
  showValues?: boolean
  className?: string
}

export function LineChart ({
  data,
  height = 300,
  showLegend = true,
  showValues = false,
  className = ''
}: LineChartProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Chart dimensions
  const width = 800
  const padding = { top: 40, right: 40, bottom: 60, left: 60 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Get all values to determine scale
  const allValues = data.flatMap(series => series.data.map(d => d.value))
  const maxValue = Math.max(...allValues)
  const minValue = Math.min(...allValues)
  const valueRange = maxValue - minValue
  const yMax = maxValue + valueRange * 0.1 // Add 10% padding at top
  const yMin = Math.max(0, minValue - valueRange * 0.1) // Add 10% padding at bottom

  // Get x-axis labels
  const xLabels = data[0].data.map(d => d.label)
  const pointSpacing = chartWidth / (xLabels.length - 1)

  // Scale functions
  const scaleY = (value: number) => {
    const normalized = (value - yMin) / (yMax - yMin)
    return chartHeight - (normalized * chartHeight)
  }

  const scaleX = (index: number) => {
    return index * pointSpacing
  }

  // Generate path for line
  const generatePath = (points: { label: string; value: number }[]) => {
    return points.map((point, index) => {
      const x = scaleX(index) + padding.left
      const y = scaleY(point.value) + padding.top
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }

  // Generate grid lines
  const gridLines = 5
  const gridLineValues = Array.from({ length: gridLines }, (_, i) => {
    return yMin + (yMax - yMin) * (i / (gridLines - 1))
  })

  return (
    <div className={`${styles.container} ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={styles.svg}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {gridLineValues.map((value, index) => {
          const y = scaleY(value) + padding.top
          return (
            <line
              key={`grid-${index}`}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              className={styles.gridLine}
            />
          )
        })}

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          className={styles.axis}
        />

        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          className={styles.axis}
        />

        {/* X-axis labels */}
        {xLabels.map((label, index) => {
          const x = scaleX(index) + padding.left
          const y = height - padding.bottom + 20
          return (
            <text
              key={`x-label-${index}`}
              x={x}
              y={y}
              className={styles.label}
            >
              {label}
            </text>
          )
        })}

        {/* Y-axis labels */}
        {gridLineValues.map((value, index) => {
          const y = scaleY(value) + padding.top
          return (
            <text
              key={`y-label-${index}`}
              x={padding.left - 10}
              y={y + 4}
              className={styles.label}
              textAnchor="end"
            >
              {Math.round(value)}
            </text>
          )
        })}

        {/* Lines and data points */}
        {data.map((series, seriesIndex) => {
          const path = generatePath(series.data)
          
          return (
            <g key={`series-${seriesIndex}`}>
              {/* Line */}
              <path
                d={path}
                className={styles.line}
                style={{
                  stroke: series.color,
                  strokeDasharray: animated ? 'none' : '1000',
                  strokeDashoffset: animated ? '0' : '1000',
                  transition: 'stroke-dashoffset 1s ease-out'
                }}
              />

              {/* Data points */}
              {series.data.map((point, pointIndex) => {
                const x = scaleX(pointIndex) + padding.left
                const y = scaleY(point.value) + padding.top

                return (
                  <g key={`point-${seriesIndex}-${pointIndex}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={4}
                      fill={series.color}
                      className={styles.dataPoint}
                      opacity={animated ? 1 : 0}
                      style={{
                        transition: `opacity 0.3s ease-out ${(pointIndex * 0.1)}s`
                      }}
                    />
                    {showValues && (
                      <text
                        x={x}
                        y={y - 10}
                        className={styles.valueLabel}
                        opacity={animated ? 1 : 0}
                        style={{
                          transition: `opacity 0.3s ease-out ${(pointIndex * 0.1)}s`
                        }}
                      >
                        {point.value}
                      </text>
                    )}
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className={styles.legend}>
          {data.map((series, index) => (
            <div key={`legend-${index}`} className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{ backgroundColor: series.color }}
              />
              <span className={styles.legendLabel}>
                {series.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

