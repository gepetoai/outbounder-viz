'use client'

import { Handle, Position } from 'reactflow'
import { GitBranch, Settings } from 'lucide-react'

interface FlowiseConditionalNodeProps {
  id: string
  data: {
    label: string
    onSettingsClick?: (nodeId: string) => void
  }
}

export function FlowiseConditionalNode ({ id, data }: FlowiseConditionalNodeProps) {
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (data.onSettingsClick) {
      data.onSettingsClick(id)
    }
  }

  return (
    <div
      className="bg-[#4A5568] rounded-lg border border-[#718096] relative hover:shadow-xl transition-shadow duration-200 group"
      style={{ 
        width: 200, 
        minHeight: 100,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
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
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
        className="w-4 h-4 rounded-full"
      />
      
      {/* Settings Button */}
      <button
        onClick={handleSettingsClick}
        className="absolute top-2 right-2 w-6 h-6 bg-[#718096] hover:bg-[#1C1B20] rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Node Settings"
      >
        <Settings className="h-3.5 w-3.5 text-white" />
      </button>
      
      <div className="flex flex-col items-center justify-center p-4 gap-2">
        <div className="w-8 h-8 bg-[#718096] rounded-lg flex items-center justify-center shadow-inner">
          <GitBranch className="h-5 w-5 text-white" />
        </div>
        <div className="font-semibold text-sm text-white text-center leading-tight">
          {data.label}
        </div>
      </div>

      {/* Yes/True branch - Right Top */}
      <Handle
        type="source"
        position={Position.Right}
        id="yes"
        style={{ 
          right: 0,
          top: '30%',
          transform: 'translate(50%, -50%)',
          background: '#777D8D',
          border: '2px solid #40404C',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
        className="w-4 h-4 rounded-full"
      />
      
      {/* No/False branch - Right Bottom */}
      <Handle
        type="source"
        position={Position.Right}
        id="no"
        style={{ 
          right: 0,
          top: '70%',
          transform: 'translate(50%, -50%)',
          background: '#B9B8C0',
          border: '2px solid #777D8D',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
        className="w-4 h-4 rounded-full"
      />

      {/* Labels for branches - using grayscale only */}
      <div className="absolute -right-14 top-[30%] transform -translate-y-1/2 text-xs text-[#40404C] font-bold drop-shadow">
        Yes
      </div>
      <div className="absolute -right-12 top-[70%] transform -translate-y-1/2 text-xs text-[#777D8D] font-bold drop-shadow">
        No
      </div>
    </div>
  )
}
