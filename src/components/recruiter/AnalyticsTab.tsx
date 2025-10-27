'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export function AnalyticsTab() {
  // Demo values as specified - do not change these
  const analyticsData = [
    { label: 'Approved Candidates', value: 375, color: 'bg-gray-900' },
    { label: 'Connection Requests', value: 120, color: 'bg-gray-700' },
    { label: 'Initial Messages', value: 45, color: 'bg-gray-500' },
    { label: 'Positive Replies', value: 37, color: 'bg-gray-400' },
    { label: 'Applications Submitted', value: 10, color: 'bg-gray-300' }
  ]

  const maxValue = Math.max(...analyticsData.map(item => item.value))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Outreach Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analyticsData.map((item, index) => {
              const widthPercentage = (item.value / maxValue) * 100
              const minWidth = 8 // Minimum width for visibility
              const actualWidth = Math.max(widthPercentage, minWidth)
              
              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold w-12 text-left">
                      {item.value}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                  <div className="relative">
                    <div 
                      className={`${item.color} rounded-sm transition-all duration-500 ease-out h-8`}
                      style={{ 
                        width: `${actualWidth}%`
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
