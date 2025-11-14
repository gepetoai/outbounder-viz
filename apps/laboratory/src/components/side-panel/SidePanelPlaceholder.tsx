'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'
import { SidePanel } from './SidePanel'

interface SidePanelPlaceholderProps {
  isOpen?: boolean
  onClose?: () => void
}

export function SidePanelPlaceholder ({ isOpen: externalIsOpen, onClose: externalOnClose }: SidePanelPlaceholderProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  
  // Use external props if provided, otherwise use internal state
  const isPanelOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const handleClose = externalOnClose || (() => setInternalIsOpen(false))
  const handleOpen = () => {
    if (externalIsOpen === undefined) {
      setInternalIsOpen(true)
    }
  }

  return (
    <>
      {/* Only show the placeholder card if using internal state */}
      {externalIsOpen === undefined && (
        <div className="flex items-center justify-center h-full">
          <Card className="p-12 max-w-md text-center bg-white shadow-sm">
            <div className="flex flex-col items-center gap-6">
              {/* Custom 248.AI Sliders Icon */}
              <div className="relative w-24 h-24 opacity-40">
                <Image
                  src="/icons/sliders-dark.svg"
                  alt="Side Panel"
                  width={96}
                  height={96}
                  className="w-full h-full"
                />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold" style={{ color: '#1C1B20' }}>
                  Side Panel
                </h2>
                <p className="text-base" style={{ color: '#777D8D' }}>
                  Reusable Component Demo
                </p>
              </div>
              
              {/* Grayscale separator */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              
              <Button
                onClick={handleOpen}
                className="px-8 py-2 bg-[#1C1B20] hover:bg-[#40404C] text-white"
              >
                Activate
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Side Panel */}
      <SidePanel
        isOpen={isPanelOpen}
        onClose={handleClose}
        title="Side Panel"
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log('Action confirmed')
                handleClose()
              }}
              className="flex-1 bg-[#1C1B20] hover:bg-[#40404C] text-white"
            >
              Confirm
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl text-gray-400">👤</span>
            </div>
            <h3 className="text-xl font-bold" style={{ color: '#1C1B20' }}>
              Placeholder Name
            </h3>
            <p className="text-sm" style={{ color: '#777D8D' }}>
              Placeholder Title
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="field1" style={{ color: '#40404C' }}>
                Field 1
              </Label>
              <Input
                id="field1"
                placeholder="Enter value..."
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field2" style={{ color: '#40404C' }}>
                Field 2
              </Label>
              <Input
                id="field2"
                placeholder="Enter value..."
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field3" style={{ color: '#40404C' }}>
                Field 3
              </Label>
              <Input
                id="field3"
                placeholder="Enter value..."
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" style={{ color: '#40404C' }}>
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter description..."
                className="border-gray-300 min-h-[100px]"
              />
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="space-y-3">
            <h4 className="font-semibold" style={{ color: '#1C1B20' }}>
              Additional Information
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: '#777D8D' }}>Status:</span>
                <span style={{ color: '#40404C' }} className="font-medium">Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#777D8D' }}>Created:</span>
                <span style={{ color: '#40404C' }} className="font-medium">2024-11-12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#777D8D' }}>Category:</span>
                <span style={{ color: '#40404C' }} className="font-medium">General</span>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-3">
            <h4 className="font-semibold" style={{ color: '#1C1B20' }}>
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                Tag 1
              </span>
              <span className="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                Tag 2
              </span>
              <span className="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                Tag 3
              </span>
            </div>
          </div>
        </div>
      </SidePanel>
    </>
  )
}

