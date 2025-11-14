'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Settings } from 'lucide-react'

export interface SupabaseConditionalNodeData {
  label: string
  number: number
  onAddBranch?: (branch: 'yes' | 'no') => void
  hasYesBranch?: boolean
  hasNoBranch?: boolean
  onConfigure?: () => void
}

export const SupabaseConditionalNode = memo(({ data }: NodeProps<SupabaseConditionalNodeData>) => {
  const handleYesClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!data.hasYesBranch && data.onAddBranch) {
      data.onAddBranch('yes')
    }
  }

  const handleNoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!data.hasNoBranch && data.onAddBranch) {
      data.onAddBranch('no')
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
          borderColor: '#B9B8C0',
          width: '280px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 border-b"
          style={{ 
            backgroundColor: '#F5F5F5',
            borderColor: '#B9B8C0'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span 
                className="text-sm font-semibold"
                style={{ color: '#1C1B20' }}
              >
                If/Else #{data.number}
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
              conditional
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-4 py-3">
          <p 
            className="text-sm font-medium"
            style={{ color: '#40404C' }}
          >
            {data.label}
          </p>
          
          {/* Branch indicators */}
          <div className="flex items-center gap-2 mt-3" style={{ position: 'relative', zIndex: 10 }}>
            <button
              onClick={handleYesClick}
              disabled={data.hasYesBranch}
              className="flex-1 px-2 py-1 rounded text-xs text-center font-medium transition-all nodrag nopan"
              style={{ 
                backgroundColor: data.hasYesBranch ? '#F5F5F5' : '#EEEEEE',
                color: data.hasYesBranch ? '#B9B8C0' : '#1C1B20',
                cursor: data.hasYesBranch ? 'not-allowed' : 'pointer',
                border: '1px solid',
                borderColor: data.hasYesBranch ? '#EEEEEE' : 'transparent',
                pointerEvents: 'auto'
              }}
              onMouseEnter={(e) => {
                if (!data.hasYesBranch) {
                  e.currentTarget.style.backgroundColor = '#1C1B20'
                  e.currentTarget.style.color = '#FFFFFF'
                }
              }}
              onMouseLeave={(e) => {
                if (!data.hasYesBranch) {
                  e.currentTarget.style.backgroundColor = '#EEEEEE'
                  e.currentTarget.style.color = '#1C1B20'
                }
              }}
            >
              Yes
            </button>
            <button
              onClick={handleNoClick}
              disabled={data.hasNoBranch}
              className="flex-1 px-2 py-1 rounded text-xs text-center font-medium transition-all nodrag nopan"
              style={{ 
                backgroundColor: data.hasNoBranch ? '#F5F5F5' : '#EEEEEE',
                color: data.hasNoBranch ? '#B9B8C0' : '#1C1B20',
                cursor: data.hasNoBranch ? 'not-allowed' : 'pointer',
                border: '1px solid',
                borderColor: data.hasNoBranch ? '#EEEEEE' : 'transparent',
                pointerEvents: 'auto'
              }}
              onMouseEnter={(e) => {
                if (!data.hasNoBranch) {
                  e.currentTarget.style.backgroundColor = '#1C1B20'
                  e.currentTarget.style.color = '#FFFFFF'
                }
              }}
              onMouseLeave={(e) => {
                if (!data.hasNoBranch) {
                  e.currentTarget.style.backgroundColor = '#EEEEEE'
                  e.currentTarget.style.color = '#1C1B20'
                }
              }}
            >
              No
            </button>
          </div>
        </div>
      </div>
      
      {/* Yes handle (left) */}
      <Handle 
        type="source" 
        position={Position.Bottom}
        id="yes"
        className="w-3 h-3 rounded-full"
        style={{ 
          background: '#40404C',
          border: '2px solid #FFFFFF',
          bottom: -6,
          left: '30%'
        }}
      />
      
      {/* No handle (right) */}
      <Handle 
        type="source" 
        position={Position.Bottom}
        id="no"
        className="w-3 h-3 rounded-full"
        style={{ 
          background: '#40404C',
          border: '2px solid #FFFFFF',
          bottom: -6,
          left: '70%'
        }}
      />
    </div>
  )
})

SupabaseConditionalNode.displayName = 'SupabaseConditionalNode'

