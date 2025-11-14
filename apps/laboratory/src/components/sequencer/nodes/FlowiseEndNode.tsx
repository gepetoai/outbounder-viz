'use client'

import { Handle, Position } from 'reactflow'
import { X, Settings } from 'lucide-react'

interface FlowiseEndNodeProps {
  id: string
  data: {
    label: string
    onSettingsClick?: (nodeId: string) => void
  }
}

export function FlowiseEndNode ({ id, data }: FlowiseEndNodeProps) {
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (data.onSettingsClick) {
      data.onSettingsClick(id)
    }
  }

  return (
    <div
      className="bg-[#1C1B20] rounded-lg border-2 border-[#777D8D] relative hover:shadow-xl transition-shadow duration-200 group"
      style={{ 
        width: 200, 
        minHeight: 80,
        boxShadow: '0 6px 16px rgba(0,0,0,0.25)'
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        style={{ 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: '#B9B8C0',
          border: '2px solid #777D8D',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
        }}
        className="w-4 h-4 rounded-full"
      />
      
      {/* Settings Button */}
      <button
        onClick={handleSettingsClick}
        className="absolute top-2 right-2 w-6 h-6 bg-[#777D8D] hover:bg-[#40404C] rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Node Settings"
      >
        <Settings className="h-3.5 w-3.5 text-white" />
      </button>
      
      <div className="flex flex-col items-center justify-center p-4 gap-2">
        <div className="w-10 h-10 bg-[#777D8D] rounded-lg flex items-center justify-center shadow-lg">
          <X className="h-6 w-6 text-white" />
        </div>
        <div className="font-bold text-base text-white text-center leading-tight">
          {data.label || 'End'}
        </div>
      </div>
    </div>
  )
}
