import { DateRange, CalendarDay, CalendarEvent } from './types'

/**
 * Get the start of a month
 */
export function getMonthStart (date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/**
 * Get the end of a month
 */
export function getMonthEnd (date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

/**
 * Get the day of the week (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeek (date: Date): number {
  return date.getDay()
}

/**
 * Check if two dates are the same day
 */
export function isSameDay (date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Check if a date is today
 */
export function isToday (date: Date): boolean {
  return isSameDay(date, new Date())
}

/**
 * Check if a date is in a range
 */
export function isInRange (date: Date, range: DateRange): boolean {
  if (!range.start || !range.end) return false
  const time = date.getTime()
  const startTime = range.start.getTime()
  const endTime = range.end.getTime()
  return time >= startTime && time <= endTime
}

/**
 * Check if a date is a range boundary (start or end)
 */
export function isRangeBoundary (date: Date, range: DateRange): boolean {
  if (!range.start && !range.end) return false
  if (range.start && isSameDay(date, range.start)) return true
  if (range.end && isSameDay(date, range.end)) return true
  return false
}

/**
 * Format a date as "MMM DD, YYYY"
 */
export function formatDate (date: Date | null): string {
  if (!date) return ''
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

/**
 * Format a date range
 */
export function formatDateRange (range: DateRange): string {
  if (!range.start && !range.end) return ''
  if (range.start && !range.end) return formatDate(range.start)
  if (!range.start && range.end) return formatDate(range.end)
  return `${formatDate(range.start)} - ${formatDate(range.end)}`
}

/**
 * Get the month name
 */
export function getMonthName (date: Date): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return months[date.getMonth()]
}

/**
 * Get the previous month
 */
export function getPreviousMonth (date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1)
}

/**
 * Get the next month
 */
export function getNextMonth (date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1)
}

/**
 * Generate calendar grid (42 days for 6 weeks)
 * Returns array of CalendarDay objects
 */
export function generateCalendarGrid (
  currentDate: Date,
  selectedRange: DateRange,
  events: CalendarEvent[] = []
): CalendarDay[] {
  const monthStart = getMonthStart(currentDate)
  const monthEnd = getMonthEnd(currentDate)
  const startDayOfWeek = getDayOfWeek(monthStart)
  
  // Start from the first day of the week containing the first day of the month
  const calendarStart = new Date(monthStart)
  calendarStart.setDate(monthStart.getDate() - startDayOfWeek)
  
  const days: CalendarDay[] = []
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(calendarStart)
    date.setDate(calendarStart.getDate() + i)
    
    const isCurrentMonth = date.getMonth() === currentDate.getMonth()
    const today = isToday(date)
    const selected = isRangeBoundary(date, selectedRange)
    const inRange = isInRange(date, selectedRange)
    
    // Filter events for this day
    const dayEvents = events.filter(event => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      eventStart.setHours(0, 0, 0, 0)
      eventEnd.setHours(23, 59, 59, 999)
      const dateTime = date.getTime()
      return dateTime >= eventStart.getTime() && dateTime <= eventEnd.getTime()
    })
    
    days.push({
      date,
      isCurrentMonth,
      isToday: today,
      isSelected: selected,
      isInRange: inRange,
      events: dayEvents
    })
  }
  
  return days
}

/**
 * Get week days (Sunday to Saturday)
 */
export function getWeekDays (): string[] {
  return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
}

/**
 * Add days to a date
 */
export function addDays (date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Get the start of the week (Sunday)
 */
export function getWeekStart (date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  result.setDate(result.getDate() - day)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Get the end of the week (Saturday)
 */
export function getWeekEnd (date: Date): Date {
  const result = getWeekStart(date)
  result.setDate(result.getDate() + 6)
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * Generate hours for day/week view (0-23)
 */
export function generateHours (): string[] {
  const hours: string[] = []
  for (let i = 0; i < 24; i++) {
    const hour = i % 12 || 12
    const period = i < 12 ? 'AM' : 'PM'
    hours.push(`${hour}:00 ${period}`)
  }
  return hours
}

