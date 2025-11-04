'use client'

import { useState } from 'react'
import { Input } from './input'

interface SearchableMultiSelectProps {
  placeholder?: string
  options: string[]
  selectedValues: string[]
  onSelect: (value: string) => void
  className?: string
}

export function SearchableMultiSelect({
  placeholder = 'Select...',
  options,
  selectedValues,
  onSelect,
  className = ''
}: SearchableMultiSelectProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedValues.includes(option)
  )

  return (
    <div className={`relative ${className}`}>
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full"
      />
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => {
              setIsOpen(false)
              setSearchTerm('')
            }}
          />
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border rounded-md shadow-md z-20 max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm border-b last:border-b-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(option)
                  }}
                >
                  {option}
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

