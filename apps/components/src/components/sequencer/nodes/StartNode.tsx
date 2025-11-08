import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Play, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const StartNode = memo(({ data }: NodeProps) => {
  const isSelected = data.isSelected || false

  return (
    <div className="relative">
      <div className={`bg-white border-2 rounded-lg p-6 min-w-[180px] shadow-sm transition-all duration-200 ${
        isSelected ? 'border-gray-900 ring-4 ring-gray-400 ring-opacity-50' : 'border-gray-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-gray-900 flex items-center justify-center bg-gray-50">
            <Play className="h-5 w-5 text-gray-900" />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">Start</div>
          </div>
        </div>
      </div>
      
      {/* Bottom handle - centered */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="w-3 h-3 !bg-gray-900 !border-2 !border-white"
        style={{ left: '50%', transform: 'translateX(-50%)' }}
      />

      {/* Add Action Button - only show if no children */}
      {!data.hasChildren && (
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
          <Button
            onClick={() => data.onAddAction?.('start-node')}
            size="sm"
            className="rounded-full w-8 h-8 p-0 shadow-md border-2 border-gray-900"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
})

StartNode.displayName = 'StartNode'

