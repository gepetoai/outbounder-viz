// Mock data for analytics components
// Following 248.AI branding guidelines - grayscale only

export interface MetricData {
  value: string | number
  label: string
  icon: string
  change?: number // percentage change
  changeLabel?: string
}

export interface BarChartDataPoint {
  label: string
  value: number
  color: string
}

export interface FunnelStage {
  label: string
  value: number
  percentage: number
  color: string
}

export interface TimeSeriesDataPoint {
  label: string
  value: number
}

export interface LineChartData {
  label: string
  data: TimeSeriesDataPoint[]
  color: string
}

// Recruiting Metrics
export const recruitingMetrics: MetricData[] = [
  {
    value: 1247,
    label: 'Candidates Sourced',
    icon: '/icons/users-light.svg',
    change: 12,
    changeLabel: 'vs last month'
  },
  {
    value: 342,
    label: 'Applications Sent',
    icon: '/icons/paper-plane-light.svg',
    change: 8,
    changeLabel: 'vs last month'
  },
  {
    value: 89,
    label: 'Interviews Scheduled',
    icon: '/icons/alarm-clock-light.svg',
    change: -3,
    changeLabel: 'vs last month'
  },
  {
    value: 24,
    label: 'Offers Made',
    icon: '/icons/check-light.svg',
    change: 5,
    changeLabel: 'vs last month'
  },
  {
    value: 18,
    label: 'Hires',
    icon: '/icons/briefcase-light.svg',
    change: 15,
    changeLabel: 'vs last month'
  }
]

// Sales Metrics
export const salesMetrics: MetricData[] = [
  {
    value: 2834,
    label: 'Leads Generated',
    icon: '/icons/users-light.svg',
    change: 18,
    changeLabel: 'vs last month'
  },
  {
    value: 1567,
    label: 'Emails Sent',
    icon: '/icons/paper-plane-light.svg',
    change: 22,
    changeLabel: 'vs last month'
  },
  {
    value: 423,
    label: 'Replies Received',
    icon: '/icons/comments-light.svg',
    change: 14,
    changeLabel: 'vs last month'
  },
  {
    value: 127,
    label: 'Meetings Booked',
    icon: '/icons/alarm-clock-light.svg',
    change: 9,
    changeLabel: 'vs last month'
  },
  {
    value: 34,
    label: 'Deals Closed',
    icon: '/icons/briefcase-light.svg',
    change: 21,
    changeLabel: 'vs last month'
  }
]

// Recruiting Funnel Data
export const recruitingFunnelData: FunnelStage[] = [
  {
    label: 'Candidates Sourced',
    value: 1247,
    percentage: 100,
    color: '#1C1B20'
  },
  {
    label: 'Applications Sent',
    value: 342,
    percentage: 27,
    color: '#40404C'
  },
  {
    label: 'Interviews Scheduled',
    value: 89,
    percentage: 7,
    color: '#777D8D'
  },
  {
    label: 'Offers Made',
    value: 24,
    percentage: 2,
    color: '#B9B8C0'
  },
  {
    label: 'Hires',
    value: 18,
    percentage: 1.4,
    color: '#EEEEEE'
  }
]

// Sales Funnel Data
export const salesFunnelData: FunnelStage[] = [
  {
    label: 'Leads Generated',
    value: 2834,
    percentage: 100,
    color: '#1C1B20'
  },
  {
    label: 'Emails Sent',
    value: 1567,
    percentage: 55,
    color: '#40404C'
  },
  {
    label: 'Replies Received',
    value: 423,
    percentage: 15,
    color: '#777D8D'
  },
  {
    label: 'Meetings Booked',
    value: 127,
    percentage: 4.5,
    color: '#B9B8C0'
  },
  {
    label: 'Deals Closed',
    value: 34,
    percentage: 1.2,
    color: '#EEEEEE'
  }
]

// Bar Chart Data - Recruiting Performance
export const recruitingBarData: BarChartDataPoint[] = [
  {
    label: 'Candidates Sourced',
    value: 1247,
    color: '#1C1B20'
  },
  {
    label: 'Applications Sent',
    value: 342,
    color: '#40404C'
  },
  {
    label: 'Interviews Scheduled',
    value: 89,
    color: '#777D8D'
  },
  {
    label: 'Offers Made',
    value: 24,
    color: '#B9B8C0'
  },
  {
    label: 'Hires',
    value: 18,
    color: '#EEEEEE'
  }
]

// Bar Chart Data - Sales Performance
export const salesBarData: BarChartDataPoint[] = [
  {
    label: 'Leads Generated',
    value: 2834,
    color: '#1C1B20'
  },
  {
    label: 'Emails Sent',
    value: 1567,
    color: '#40404C'
  },
  {
    label: 'Replies Received',
    value: 423,
    color: '#777D8D'
  },
  {
    label: 'Meetings Booked',
    value: 127,
    color: '#B9B8C0'
  },
  {
    label: 'Deals Closed',
    value: 34,
    color: '#EEEEEE'
  }
]

// Time Series Data - Recruiting Trend (Last 7 days)
export const recruitingTimeSeriesData: LineChartData[] = [
  {
    label: 'Candidates',
    color: '#40404C',
    data: [
      { label: 'Mon', value: 145 },
      { label: 'Tue', value: 178 },
      { label: 'Wed', value: 162 },
      { label: 'Thu', value: 195 },
      { label: 'Fri', value: 188 },
      { label: 'Sat', value: 142 },
      { label: 'Sun', value: 137 }
    ]
  },
  {
    label: 'Applications',
    color: '#777D8D',
    data: [
      { label: 'Mon', value: 42 },
      { label: 'Tue', value: 55 },
      { label: 'Wed', value: 48 },
      { label: 'Thu', value: 61 },
      { label: 'Fri', value: 58 },
      { label: 'Sat', value: 39 },
      { label: 'Sun', value: 39 }
    ]
  }
]

// Time Series Data - Sales Trend (Last 7 days)
export const salesTimeSeriesData: LineChartData[] = [
  {
    label: 'Leads',
    color: '#40404C',
    data: [
      { label: 'Mon', value: 385 },
      { label: 'Tue', value: 412 },
      { label: 'Wed', value: 398 },
      { label: 'Thu', value: 445 },
      { label: 'Fri', value: 421 },
      { label: 'Sat', value: 367 },
      { label: 'Sun', value: 356 }
    ]
  },
  {
    label: 'Meetings',
    color: '#777D8D',
    data: [
      { label: 'Mon', value: 15 },
      { label: 'Tue', value: 22 },
      { label: 'Wed', value: 18 },
      { label: 'Thu', value: 25 },
      { label: 'Fri', value: 21 },
      { label: 'Sat', value: 14 },
      { label: 'Sun', value: 12 }
    ]
  }
]

