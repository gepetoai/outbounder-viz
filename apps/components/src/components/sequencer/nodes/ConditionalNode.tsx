import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { GitBranch, Settings, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const ConditionalNode = memo(({ id, data }: NodeProps) => {
  const condition = data.config?.condition || 'Not configured'

  return (
    <div className="relative group">
      <div className="bg-white border-2 border-gray-900 rounded-lg p-4 min-w-[180px] shadow-sm hover:shadow-md transition-all">
        {/* Top handle - centered */}
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          className="w-3 h-3 !bg-gray-900 !border-2 !border-white"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        />

        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded border-2 border-gray-900 flex items-center justify-center bg-gray-50 flex-shrink-0">
            <GitBranch className="h-4 w-4 text-gray-900" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 text-sm">{data.label}</div>
            <div className="text-xs text-gray-600 truncate">{condition}</div>
          </div>
        </div>

        {/* Branch labels */}
        <div className="flex gap-4 justify-center mt-1">
          <div className="text-xs font-medium text-gray-600">
            No
          </div>
          <div className="text-xs font-medium text-gray-600">
            Yes
          </div>
        </div>

        {/* Action buttons */}
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

        {/* Bottom handles for Yes/No branches */}
        {/* YES handle on RIGHT (85%) to match YES branch positioning */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="yes"
          className="w-3 h-3 !bg-gray-900 !border-2 !border-white"
          style={{ left: '85%', transform: 'translateX(-50%)' }}
        />
        {/* NO handle on LEFT (15%) to match NO branch positioning */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="no"
          className="w-3 h-3 !bg-gray-900 !border-2 !border-white"
          style={{ left: '15%', transform: 'translateX(-50%)' }}
        />
      </div>

      {/* Add Action Buttons for both branches */}
      {/* NO button on LEFT (matches NO branch positioning) - only show if NO branch has no child */}
      {!data.hasNoChild && (
        <div className="absolute -bottom-4 left-1/4 transform -translate-x-1/2">
          <Button
            onClick={() => data.onAddAction?.(id, 'no')}
            size="sm"
            className="rounded-full w-8 h-8 p-0 shadow-md border-2 border-gray-900"
            title="Add to No branch"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
      {/* YES button on RIGHT (matches YES branch positioning) - only show if YES branch has no child */}
      {!data.hasYesChild && (
        <div className="absolute -bottom-4 left-3/4 transform -translate-x-1/2">
          <Button
            onClick={() => data.onAddAction?.(id, 'yes')}
            size="sm"
            className="rounded-full w-8 h-8 p-0 shadow-md border-2 border-gray-900"
            title="Add to Yes branch"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
})

ConditionalNode.displayName = 'ConditionalNode'

