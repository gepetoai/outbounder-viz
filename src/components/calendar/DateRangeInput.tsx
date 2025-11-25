'use client'

import { forwardRef } from 'react'
import Image from 'next/image'
import { DateRange } from './types'
import { formatDateRange } from './calendar-utils'

interface DateRangeInputProps {
  value: DateRange
  onClick: () => void
  placeholder?: string
  className?: string
}

export const DateRangeInput = forwardRef<HTMLDivElement, DateRangeInputProps>(
  ({ value, onClick, placeholder = 'Select date range...', className = '' }, ref) => {
    const displayValue = formatDateRange(value)
    
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`
          relative flex items-center justify-between w-full h-9 px-3 py-1
          border border-[#B9B8C0] rounded-md bg-white
          hover:border-[#777D8D] focus-within:border-[#1C1B20] focus-within:ring-2 focus-within:ring-[#1C1B20]/10
          cursor-pointer transition-colors
          ${className}
        `}
      >
        <span className={`text-sm ${displayValue ? 'text-[#1C1B20]' : 'text-[#B9B8C0]'}`}>
          {displayValue || placeholder}
        </span>
        <Image
          src="/icons/calendar-dark.svg"
          alt="Calendar"
          width={16}
          height={16}
          className="ml-2"
        />
      </div>
    )
  }
)

DateRangeInput.displayName = 'DateRangeInput'

