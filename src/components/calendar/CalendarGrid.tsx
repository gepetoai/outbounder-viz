'use client'

import { useState } from 'react'
import Image from 'next/image'
import { DateRange, CalendarEvent } from './types'
import {
  generateCalendarGrid,
  getWeekDays,
  getMonthName,
  getPreviousMonth,
  getNextMonth,
  isSameDay
} from './calendar-utils'

interface CalendarGridProps {
  selectedRange: DateRange
  onDateSelect: (date: Date) => void
  currentMonth?: Date
  onMonthChange?: (month: Date) => void
  events?: CalendarEvent[]
  showNavigation?: boolean
}

export function CalendarGrid({
  selectedRange,
  onDateSelect,
  currentMonth: controlledMonth,
  onMonthChange,
  events = [],
  showNavigation = true
}: CalendarGridProps) {
  const [internalMonth, setInternalMonth] = useState(new Date())

  const currentMonth = controlledMonth || internalMonth
  const setCurrentMonth = onMonthChange || setInternalMonth

  const calendarDays = generateCalendarGrid(currentMonth, selectedRange, events)
  const weekDays = getWeekDays()

  const handlePreviousMonth = () => {
    setCurrentMonth(getPreviousMonth(currentMonth))
  }

  const handleNextMonth = () => {
    setCurrentMonth(getNextMonth(currentMonth))
  }

  const handleDateClick = (date: Date) => {
    onDateSelect(date)
  }

  return (
    <div className="w-full">
      {showNavigation && (
        <div className="flex items-center justify-between mb-4 px-2">
          <button
            onClick={handlePreviousMonth}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F5F5F5] transition-colors"
            aria-label="Previous month"
          >
            <Image
              src="/icons/arrow-left-dark.svg"
              alt="Previous"
              width={16}
              height={16}
            />
          </button>

          <h3 className="text-base font-semibold text-[#1C1B20]">
            {getMonthName(currentMonth)} {currentMonth.getFullYear()}
          </h3>

          <button
            onClick={handleNextMonth}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F5F5F5] transition-colors"
            aria-label="Next month"
          >
            <Image
              src="/icons/arrow-right-dark.svg"
              alt="Next"
              width={16}
              height={16}
            />
          </button>
        </div>
      )}

      {/* Week days header */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-[#777D8D] py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isRangeStart = selectedRange.start && isSameDay(day.date, selectedRange.start)
          const isRangeEnd = selectedRange.end && isSameDay(day.date, selectedRange.end)

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day.date)}
              className={`
                relative h-10 flex items-center justify-center text-sm rounded-lg transition-colors
                ${!day.isCurrentMonth ? 'text-[#B9B8C0]' : 'text-[#1C1B20]'}
                ${day.isToday && !day.isSelected ? 'bg-[#EEEEEE] font-semibold' : ''}
                ${day.isSelected ? 'bg-[#1C1B20] text-white font-semibold' : ''}
                ${day.isInRange && !day.isSelected ? 'bg-[#F5F5F5]' : ''}
                ${!day.isSelected && !day.isToday ? 'hover:bg-[#F5F5F5]' : ''}
              `}
            >
              <span>{day.date.getDate()}</span>
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
                {/* Show atmost 5 events for a day */}
                {day.events.map((_, index) => (
                  index < 5 ? (
                    <span key={index} className="w-1 h-1 rounded-full bg-[#40404C]" />
                  ) : null
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

