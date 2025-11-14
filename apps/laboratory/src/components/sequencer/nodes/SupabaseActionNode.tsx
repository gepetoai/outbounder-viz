'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Settings } from 'lucide-react'

export interface SupabaseActionNodeData {
  label: string
  actionType: string
  number: number
  onAddNext?: () => void
  hasNext?: boolean
  onConfigure?: () => void
}

export const SupabaseActionNode = memo(({ data }: NodeProps<SupabaseActionNodeData>) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!data.hasNext && data.onAddNext) {
      data.onAddNext()
    }
  }

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (data.onConfigure) {
      data.onConfigure()
    }
  }

  return (
    <div className="relative">
      <Handle 
        type="target" 
        position={Position.Top}
        id="target"
        className="w-3 h-3 rounded-full"
        style={{ 
          background: '#40404C',
          border: '2px solid #FFFFFF',
          top: -6
        }}
      />
      
      <div 
        className="bg-white rounded-lg shadow-sm border-2 transition-all"
        style={{
          borderColor: '#EEEEEE',
          width: '280px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 border-b"
          style={{ 
            backgroundColor: '#FAFAFA',
            borderColor: '#EEEEEE'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span 
                className="text-sm font-semibold"
                style={{ color: '#1C1B20' }}
              >
                Action #{data.number}
              </span>
              <button
                onClick={handleConfigure}
                className="nodrag nopan p-1 rounded hover:bg-[#EEEEEE] transition-colors"
                style={{ pointerEvents: 'auto' }}
              >
                <Settings className="h-3.5 w-3.5" style={{ color: '#40404C' }} />
              </button>
            </div>
            <div 
              className="px-2 py-1 rounded text-xs font-medium"
              style={{ 
                backgroundColor: '#EEEEEE',
                color: '#40404C'
              }}
            >
              {data.actionType}
            </div>
          </div>
        </div>
        
        {/* Content - Now a clickable button */}
        <button
          onClick={handleClick}
          disabled={data.hasNext}
          className="w-full px-4 py-3 text-left text-sm font-medium transition-all nodrag nopan"
          style={{ 
            color: data.hasNext ? '#B9B8C0' : '#40404C',
            backgroundColor: data.hasNext ? '#FAFAFA' : '#FFFFFF',
            cursor: data.hasNext ? 'not-allowed' : 'pointer',
            pointerEvents: 'auto'
          }}
          onMouseEnter={(e) => {
            if (!data.hasNext) {
              e.currentTarget.style.backgroundColor = '#EEEEEE'
            }
          }}
          onMouseLeave={(e) => {
            if (!data.hasNext) {
              e.currentTarget.style.backgroundColor = '#FFFFFF'
            }
          }}
        >
          {data.label}
        </button>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom}
        id="source"
        className="w-3 h-3 rounded-full"
        style={{ 
          background: '#40404C',
          border: '2px solid #FFFFFF',
          bottom: -6
        }}
      />
    </div>
  )
})

SupabaseActionNode.displayName = 'SupabaseActionNode'

