import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Settings, Trash2, Plus, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const ActionNode = memo(({ id, data }: NodeProps) => {
  const Icon = data.icon || Settings
  const isWaitNode = data.actionType === 'wait'
  const waitDuration = data.config?.duration ? `${data.config.duration} ${data.config.unit || 'minutes'}` : null

  return (
    <div className="relative group">
      <div className="bg-white border-2 border-gray-900 rounded-lg p-4 min-w-[160px] shadow-sm hover:shadow-md transition-all">
        {/* Top handle - centered */}
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          className="w-3 h-3 !bg-gray-900 !border-2 !border-white"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border-2 border-gray-900 flex items-center justify-center bg-gray-50 flex-shrink-0">
            <Icon className="h-4 w-4 text-gray-900" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 text-sm truncate">{data.label}</div>
            {isWaitNode && waitDuration && (
              <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {waitDuration}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons - show on hover */}
        <div className="absolute -right-2 -top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            onClick={() => data.onEdit?.(id)}
            size="sm"
            variant="outline"
            className="w-7 h-7 p-0 rounded-full bg-white border-2 border-gray-900 hover:bg-gray-100"
          >
            <Settings className="h-3 w-3" />
          </Button>
          <Button
            onClick={() => data.onDelete?.(id)}
            size="sm"
            variant="outline"
            className="w-7 h-7 p-0 rounded-full bg-white border-2 border-gray-900 hover:bg-gray-100"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Bottom handle - centered */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="w-3 h-3 !bg-gray-900 !border-2 !border-white"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        />
      </div>

      {/* Add Action Button - only show if no children */}
      {!data.hasChildren && (
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
          <Button
            onClick={() => data.onAddAction?.(id)}
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

ActionNode.displayName = 'ActionNode'

