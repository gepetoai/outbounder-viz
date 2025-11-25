export interface DateRange {
  start: Date | null
  end: Date | null
}

export interface CalendarEvent {
  id: string
  title: string
  startDate: Date
  endDate: Date
  type: 'campaign' | 'sequence'
  status: 'active' | 'scheduled' | 'completed'
}

export type ViewMode = 'day' | 'week' | 'month'

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isInRange: boolean
  events: CalendarEvent[]
}

