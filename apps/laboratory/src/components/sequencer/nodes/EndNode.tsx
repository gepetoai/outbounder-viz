import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const EndNode = memo(({ id, data }: NodeProps) => {
  const isSelected = data.isSelected || false

  return (
    <div className="relative group">
      <div className={`bg-white border-2 rounded-lg p-4 min-w-[160px] shadow-sm hover:shadow-md transition-all duration-200 ${
        isSelected ? 'border-gray-900 ring-4 ring-gray-400 ring-opacity-50' : 'border-gray-900'
      }`}>
        {/* Top handle - centered */}
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          className="w-3 h-3 !bg-gray-900 !border-2 !border-white"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-gray-900 flex items-center justify-center bg-gray-50 flex-shrink-0">
            <X className="h-4 w-4 text-gray-900" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900 text-sm">{data.label}</div>
          </div>
        </div>

        {/* Delete button only (no edit needed for end node) */}
        <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            onClick={() => data.onDelete?.(id)}
            size="sm"
            variant="outline"
            className="w-7 h-7 p-0 rounded-full bg-white border-2 border-gray-900 hover:bg-gray-100"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
})

EndNode.displayName = 'EndNode'

