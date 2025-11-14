'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/cards/StatCard'
import { MetricGrid } from '@/components/cards/MetricGrid'
import { ChartCard } from './ChartCard'
import { BarChart } from './BarChart'
import Image from 'next/image'
import {
  recruitingMetrics,
  salesMetrics,
  recruitingBarData,
  salesBarData
} from './metric-data'

type AnalyticsMode = 'recruiting' | 'sales'

export function AnalyticsDashboard () {
  const [mode, setMode] = useState<AnalyticsMode>('recruiting')

  const metrics = mode === 'recruiting' ? recruitingMetrics : salesMetrics
  const barData = mode === 'recruiting' ? recruitingBarData : salesBarData

  return (
    <div className="space-y-8">
      {/* Tab Selector */}
      <div className="flex gap-3">
        <Button
          onClick={() => setMode('recruiting')}
          variant={mode === 'recruiting' ? 'default' : 'outline'}
          style={mode === 'recruiting' ? {
            backgroundColor: '#1C1B20',
            color: '#FFFFFF'
          } : {
            backgroundColor: 'transparent',
            color: '#1C1B20',
            borderColor: '#1C1B20'
          }}
        >
          Recruiting
        </Button>
        <Button
          onClick={() => setMode('sales')}
          variant={mode === 'sales' ? 'default' : 'outline'}
          style={mode === 'sales' ? {
            backgroundColor: '#1C1B20',
            color: '#FFFFFF'
          } : {
            backgroundColor: 'transparent',
            color: '#1C1B20',
            borderColor: '#1C1B20'
          }}
        >
          Sales
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div>
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: '#1C1B20' }}
        >
          Key Metrics
        </h2>
        <MetricGrid columns={metrics.length === 5 ? 3 : 4}>
          {metrics.map((metric, index) => (
            <StatCard
              key={index}
              value={metric.value}
              label={metric.label}
              icon={
                <Image
                  src={metric.icon}
                  alt={metric.label}
                  width={24}
                  height={24}
                />
              }
              variant="outlined"
            />
          ))}
        </MetricGrid>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-8">
        {/* Bar Chart */}
        <ChartCard
          title={mode === 'recruiting' ? 'Recruiting Performance' : 'Sales Performance'}
          description="Overview of key metrics and activity levels"
          icon="/icons/bars-light.svg"
        >
          <BarChart data={barData} showValues={false} />
        </ChartCard>
      </div>
    </div>
  )
}

