'use client'

import { useState } from 'react'
import { Input } from './input'

interface SearchableSelectProps {
  placeholder?: string
  options: { label: string; value: string }[]
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function SearchableSelect({
  placeholder = 'Select...',
  options,
  value,
  onValueChange,
  disabled = false,
  className = ''
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find(opt => opt.value === value)
  const displayValue = isOpen ? searchTerm : (selectedOption?.label || '')

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={`relative ${className}`}>
      <Input
        placeholder={placeholder}
        value={displayValue}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        disabled={disabled}
        className="w-full"
      />
      {isOpen && !disabled && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setIsOpen(false)
              setSearchTerm('')
            }}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-md z-20 max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm border-b last:border-b-0 ${
                    option.value === value ? 'bg-gray-50 font-medium' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onValueChange(option.value)
                    setIsOpen(false)
                    setSearchTerm('')
                  }}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                {searchTerm ? 'No results found' : 'Start typing to search...'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
