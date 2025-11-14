'use client'

import { Handle, Position } from 'reactflow'
import { getActionById } from '../actionTypes'
import { Settings } from 'lucide-react'

interface FlowiseActionNodeProps {
  id: string
  data: {
    label: string
    actionType: string
    onSettingsClick?: (nodeId: string) => void
  }
}

export function FlowiseActionNode ({ id, data }: FlowiseActionNodeProps) {
  // Look up the icon from actionTypes based on actionType ID
  const actionTypeConfig = getActionById(data.actionType)
  const IconComponent = actionTypeConfig?.icon

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (data.onSettingsClick) {
      data.onSettingsClick(id)
    }
  }

  return (
    <div
      className="bg-[#2D3748] rounded-lg border border-[#4A5568] relative hover:shadow-xl transition-shadow duration-200 group"
      style={{ 
        width: 200, 
        minHeight: 80,
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
        className="absolute top-2 right-2 w-6 h-6 bg-[#4A5568] hover:bg-[#1C1B20] rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Node Settings"
      >
        <Settings className="h-3.5 w-3.5 text-white" />
      </button>
      
      <div className="flex flex-col items-center justify-center p-4 gap-2">
        {IconComponent && (
          <div className="w-8 h-8 bg-[#4A5568] rounded-lg flex items-center justify-center shadow-inner">
            <IconComponent className="h-5 w-5 text-white" />
          </div>
        )}
        <div className="font-semibold text-sm text-white text-center leading-tight">
          {data.label}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        style={{ 
          left: '50%', 
          transform: 'translate(-50%, 50%)',
          background: '#B9B8C0',
          border: '2px solid #777D8D',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
        className="w-4 h-4 rounded-full"
      />
    </div>
  )
}
