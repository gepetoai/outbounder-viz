'use client'

import { useState, useEffect, useRef } from 'react'
import { DateRange } from './types'
import { DateRangeInput } from './DateRangeInput'
import { CalendarGrid } from './CalendarGrid'
import { Button } from '@/components/ui/button'

interface DatePickerPopupProps {
  value: DateRange
  onChange: (range: DateRange) => void
  placeholder?: string
  className?: string
}

export function DatePickerPopup ({
  value,
  onChange,
  placeholder = 'Select date range...',
  className = ''
}: DatePickerPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempRange, setTempRange] = useState<DateRange>(value)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)
  
  useEffect(() => {
    setTempRange(value)
  }, [value])
  
  // Close on outside click
  useEffect(() => {
    function handleClickOutside (event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])
  
  const handleDateSelect = (date: Date) => {
    if (!tempRange.start || (tempRange.start && tempRange.end)) {
      // Start new range
      setTempRange({ start: date, end: null })
    } else {
      // Complete range
      const start = tempRange.start
      const end = date
      
      // Ensure start is before end
      if (start.getTime() > end.getTime()) {
        setTempRange({ start: end, end: start })
        onChange({ start: end, end: start })
        setIsOpen(false)
      } else {
        setTempRange({ start, end })
        onChange({ start, end })
        setIsOpen(false)
      }
    }
  }
  
  const handleClose = () => {
    setIsOpen(false)
  }
  
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(parseInt(e.target.value))
    setCurrentMonth(newMonth)
  }
  
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = new Date(currentMonth)
    newMonth.setFullYear(parseInt(e.target.value))
    setCurrentMonth(newMonth)
  }
  
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <DateRangeInput
        ref={inputRef}
        value={value}
        onClick={() => setIsOpen(!isOpen)}
        placeholder={placeholder}
      />
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-lg border border-[#B9B8C0] p-4 min-w-[340px]">
          {/* Month and Year Dropdowns */}
          <div className="flex gap-2 mb-4">
            <select
              value={currentMonth.getMonth()}
              onChange={handleMonthChange}
              className="flex-1 h-9 px-3 pr-8 text-sm border border-[#B9B8C0] rounded-md bg-white text-[#1C1B20] focus:border-[#1C1B20] focus:outline-none focus:ring-2 focus:ring-[#1C1B20]/10 appearance-none bg-no-repeat bg-right"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231C1B20' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '12px 12px'
              }}
            >
              {months.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
            
            <select
              value={currentMonth.getFullYear()}
              onChange={handleYearChange}
              className="w-28 h-9 px-3 pr-8 text-sm border border-[#B9B8C0] rounded-md bg-white text-[#1C1B20] focus:border-[#1C1B20] focus:outline-none focus:ring-2 focus:ring-[#1C1B20]/10 appearance-none bg-no-repeat bg-right"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231C1B20' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '12px 12px'
              }}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          
          <CalendarGrid
            selectedRange={tempRange}
            onDateSelect={handleDateSelect}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            showNavigation={true}
          />
          
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleClose}
              variant="outline"
              className="text-sm text-[#777D8D] border-[#B9B8C0] hover:bg-[#F5F5F5]"
            >
              CLOSE
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

