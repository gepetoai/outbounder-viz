'use client'

import { useState, useCallback, useEffect, memo, useRef } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
  NodeProps,
  ReactFlowProvider,
  useReactFlow,
  Handle,
  Position
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Eye, 
  Heart, 
  UserPlus, 
  MessageSquare, 
  Send,
  Plus,
  Trash2,
  X,
  Hourglass,
  CheckCircle,
  Reply,
  Zap,
  Settings,
  Undo,
  Redo,
  RefreshCcw,
  Play
} from 'lucide-react'
import { useJobPostings } from '@/hooks/useJobPostings'
import { useCandidates } from '@/hooks/useCandidates'

interface SequencerTabProps {
  jobDescriptionId?: number | null
}

interface SimplifiedCandidate {
  id: string
  name: string
  title: string
  company: string
}

const actionTypes = [
  { id: 'connection-request', label: 'Connection Request', icon: UserPlus },
  { id: 'view-profile', label: 'View Profile', icon: Eye },
  { id: 'like-post', label: 'Like Post', icon: Heart },
  { id: 'send-inmail', label: 'Send InMail', icon: Send },
  { id: 'send-message', label: 'Send Message', icon: MessageSquare },
  { id: 'if-connection-accepted', label: 'If Connection Accepted', icon: CheckCircle },
  { id: 'if-message-responded', label: 'If Message Responded', icon: Reply },
  { id: 'activate-responder', label: 'Activate Responder', icon: Zap },
  { id: 'rescind-connection-request', label: 'Rescind Connection Request', icon: RefreshCcw },
  { id: 'end-sequence', label: 'End Sequence', icon: X }
]

// Begin Sequence is not in the action menu - it's always present

const GRID_SIZE = 50
const START_X = 400
const START_Y = 50

// Branch offset for conditional nodes (relative to parent)
const BRANCH_OFFSET = 150

// Node height constants (in pixels) - measured from actual rendered heights
// ActionNode: border-2 (4px) + p-4 (32px) + content (~28px) = 64px
// WaitNode: border (2px) + py-2 (16px) + h-7 select (28px) + spacing (~10px) = 56px
// ConditionalNode: same as ActionNode = 64px
const NODE_HEIGHTS = {
  actionWithButton: 108,    // Action node with "Add Next Action" button (including padding/border)
  actionWithoutButton: 64,  // Action node without button (centered content, including padding/border)
  conditionalWithButtons: 108, // Conditional node with Yes/No buttons
  conditionalWithoutButtons: 64, // Conditional node without buttons
  wait: 56                  // Wait node height (including padding/border) - UPDATED for accurate spacing
}

// Gap-first approach: define the desired visual gap between boxes
const DESIRED_GAP = 40 // The consistent visual space between the bottom of one box and top of the next

// Helper to get X position for a branch (relative to parent)
function getBranchXPosition(branch: string | undefined, parentX: number): number {
  if (branch === 'yes') {
    // Yes branch goes left (negative offset)
    return parentX - BRANCH_OFFSET
  }
  if (branch === 'no') {
    // No branch goes right (positive offset)
    return parentX + BRANCH_OFFSET
  }
  // If no branch specified, inherit parent's X position (stay in same column)
  return parentX
}

function getIcon(type: string, className = 'h-5 w-5') {
  const props = { className }
  switch (type) {
    case 'begin-sequence':
      return <Play {...props} />
    case 'view-profile':
      return <Eye {...props} />
    case 'send-inmail':
      return <Send {...props} />
    case 'send-message':
      return <MessageSquare {...props} />
    case 'connection-request':
      return <UserPlus {...props} />
    case 'rescind-connection-request':
      return <RefreshCcw {...props} />
    case 'like-post':
      return <Heart {...props} />
    case 'if-connection-accepted':
      return <CheckCircle {...props} />
    case 'if-message-responded':
      return <Reply {...props} />
    case 'activate-responder':
      return <Zap {...props} />
    case 'end-sequence':
      return <X {...props} />
    default:
      return null
  }
}

// Helper function to calculate node height dynamically
function getNodeHeight(node: Node): number {
  if (node.type === 'waitNode') {
    return NODE_HEIGHTS.wait
  }
  
  if (node.type === 'conditionalNode') {
    const hasYesChild = node.data.hasYesChild
    const hasNoChild = node.data.hasNoChild
    const hasButtons = !hasYesChild || !hasNoChild
    return hasButtons ? NODE_HEIGHTS.conditionalWithButtons : NODE_HEIGHTS.conditionalWithoutButtons
  }
  
  if (node.type === 'actionNode') {
    const isEndSequence = node.data.actionType === 'end-sequence'
    const hasChildren = node.data.hasChildren
    const hasButton = !isEndSequence && !hasChildren
    return hasButton ? NODE_HEIGHTS.actionWithButton : NODE_HEIGHTS.actionWithoutButton
  }
  
  return NODE_HEIGHTS.actionWithoutButton
}

// Singleton handlers storage to avoid recreating callbacks
const nodeHandlers = {
  onDelete: null as ((id: string) => void) | null,
  onAddNext: null as ((branch?: string, parentId?: string) => void) | null,
  onWaitChange: null as ((id: string, value: number, unit: string) => void) | null,
  onConfigure: null as ((nodeId: string) => void) | null
}

const ActionNode = memo(({ data }: NodeProps) => {
  const isEndSequence = data.actionType === 'end-sequence'
  const hasChildren = data.hasChildren
  const showAddButton = !isEndSequence && !hasChildren
  
  // Hide configure button for self-explanatory actions
  const selfExplanatoryActions = ['end-sequence', 'rescind-connection-request', 'activate-responder']
  const showConfigureButton = !selfExplanatoryActions.includes(data.actionType)
  
  return (
    <div 
      className={`bg-white border-2 border-gray-900 rounded-lg p-4 w-56 shadow-lg ${!showAddButton ? 'flex items-center' : ''}`}
    >
      <div className={`flex items-center justify-between ${showAddButton ? 'mb-3' : ''} flex-1`}>
        <div className="flex items-center gap-2">
          {getIcon(data.actionType)}
          <span className="font-semibold text-sm">{data.label}</span>
        </div>
        <div className="flex gap-2">
          {showConfigureButton && (
            <button
              onClick={() => nodeHandlers.onConfigure?.(data.nodeId)}
              className="text-gray-400 hover:text-gray-900 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => nodeHandlers.onDelete?.(data.nodeId)}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {showAddButton && (
        <Button
          onClick={() => nodeHandlers.onAddNext?.(undefined, data.nodeId)}
          variant="outline"
          size="sm"
          className="w-full text-xs bg-white hover:bg-gray-50"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Next Action
        </Button>
      )}
    </div>
  )
})
ActionNode.displayName = 'ActionNode'

const BeginSequenceNode = memo(({ data }: NodeProps) => {
  const hasChildren = data.hasChildren
  const showAddButton = !hasChildren
  
  return (
    <div 
      className={`bg-white border-2 border-gray-900 rounded-lg p-4 w-56 shadow-lg ${!showAddButton ? 'flex items-center' : ''}`}
    >
      <div className={`flex items-center justify-between ${showAddButton ? 'mb-3' : ''} flex-1`}>
        <div className="flex items-center gap-2">
          {getIcon('begin-sequence')}
          <span className="font-semibold text-sm">Begin Sequence</span>
        </div>
        <button
          onClick={() => nodeHandlers.onConfigure?.(data.nodeId)}
          className="text-gray-400 hover:text-gray-900 transition-colors"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
      {showAddButton && (
        <Button
          onClick={() => nodeHandlers.onAddNext?.(undefined, data.nodeId)}
          variant="outline"
          size="sm"
          className="w-full text-xs bg-white hover:bg-gray-50"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Next Action
        </Button>
      )}
    </div>
  )
})
BeginSequenceNode.displayName = 'BeginSequenceNode'

const WaitNode = memo(({ data }: NodeProps) => {
  const waitValue = data.waitValue || 2
  const waitUnit = data.waitUnit || 'days'
  
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    // Allow empty input for user to type
    if (inputValue === '') return
    
    // Parse and validate
    const value = parseInt(inputValue)
    if (isNaN(value)) return
    
    const clampedValue = Math.min(Math.max(value, 1), 60)
    nodeHandlers.onWaitChange?.(data.nodeId, clampedValue, waitUnit)
  }
  
  const handleUnitChange = (unit: string) => {
    nodeHandlers.onWaitChange?.(data.nodeId, waitValue, unit)
  }
  
  return (
    <div 
      className="bg-gray-100 border border-gray-400 rounded-lg px-3 py-2 w-56 shadow-sm"
    >
      <div className="flex items-center justify-center gap-2">
        <Hourglass className="h-4 w-4 text-gray-600 flex-shrink-0" />
        <span className="text-xs text-gray-700 font-medium">Wait</span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={waitValue}
          onChange={handleValueChange}
          className="h-7 w-16 px-3 py-0 text-xs leading-7 text-center border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <Select
          value={waitUnit}
          onValueChange={handleUnitChange}
        >
          <SelectTrigger className="h-7 w-20 px-3 py-0 text-xs leading-7 border border-gray-300 rounded bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minutes">min</SelectItem>
            <SelectItem value="hours">hrs</SelectItem>
            <SelectItem value="days">days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
})
WaitNode.displayName = 'WaitNode'

const ConditionalNode = memo(({ data }: NodeProps) => {
  const hasYesChild = data.hasYesChild
  const hasNoChild = data.hasNoChild
  const showButtons = !hasYesChild || !hasNoChild
  
  // Hide configure button for self-explanatory conditional actions
  const selfExplanatoryActions = ['if-connection-accepted', 'if-message-responded']
  const showConfigureButton = !selfExplanatoryActions.includes(data.actionType)
  
  return (
    <div 
      className={`bg-white border-2 border-gray-900 rounded-lg p-4 w-56 shadow-lg ${!showButtons ? 'flex items-center' : ''}`}
    >
      {/* Handles for React Flow connections */}
      <Handle type="source" position={Position.Bottom} id="yes" style={{ left: '30%', opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="no" style={{ left: '70%', opacity: 0 }} />
      
      <div className={`flex items-center justify-between ${showButtons ? 'mb-3' : ''} flex-1`}>
        <div className="flex items-center gap-2">
          {getIcon(data.actionType)}
          <span className="font-semibold text-sm">{data.label}</span>
        </div>
        <div className="flex gap-2">
          {showConfigureButton && (
            <button
              onClick={() => nodeHandlers.onConfigure?.(data.nodeId)}
              className="text-gray-400 hover:text-gray-900 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => nodeHandlers.onDelete?.(data.nodeId)}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {showButtons && (
        <div className="flex gap-2">
          {!hasYesChild && (
            <Button
              onClick={() => nodeHandlers.onAddNext?.('yes', data.nodeId)}
              variant="outline"
              size="sm"
              className="flex-1 text-xs bg-white hover:bg-gray-50 border-gray-900"
            >
              <Plus className="h-3 w-3 mr-1" />
              Yes
            </Button>
          )}
          {!hasNoChild && (
            <Button
              onClick={() => nodeHandlers.onAddNext?.('no', data.nodeId)}
              variant="outline"
              size="sm"
              className="flex-1 text-xs bg-white hover:bg-gray-50 border-gray-900"
            >
              <Plus className="h-3 w-3 mr-1" />
              No
            </Button>
          )}
        </div>
      )}
    </div>
  )
})
ConditionalNode.displayName = 'ConditionalNode'

const nodeTypes = {
  beginSequenceNode: BeginSequenceNode,
  actionNode: ActionNode,
  waitNode: WaitNode,
  conditionalNode: ConditionalNode
}

function SequencerTabInner({ jobDescriptionId: initialJobId }: SequencerTabProps) {
  const reactFlowInstance = useReactFlow()
  const [selectedJobId, setSelectedJobId] = useState<number | null>(initialJobId || null)
  const { data: jobPostings, isLoading: isLoadingJobPostings } = useJobPostings()
  const { data: candidatesData } = useCandidates(selectedJobId || 0)
  const approvedCount = candidatesData?.approved_candidates?.length || 0
  const [campaignStatus, setCampaignStatus] = useState<'active' | 'paused'>('paused')
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [sampleCandidates, setSampleCandidates] = useState<SimplifiedCandidate[]>([])
  const [candidateStartIndex, setCandidateStartIndex] = useState(0)
  const [pendingBranch, setPendingBranch] = useState<{ branch: string; parentId: string } | null>(null)

  // Reset candidate index when job changes
  useEffect(() => {
    setCandidateStartIndex(0)
  }, [selectedJobId])

  useEffect(() => {
    if (candidatesData?.approved_candidates) {
      const allCandidates = candidatesData.approved_candidates
      const startIdx = candidateStartIndex % allCandidates.length
      const endIdx = Math.min(startIdx + 5, allCandidates.length)
      
      const candidates: SimplifiedCandidate[] = allCandidates.slice(startIdx, endIdx).map((c: any, index: number) => ({
        id: c.id?.toString() || `sample-${index}`,
        name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unknown',
        title: c.job_title || c.raw_data?.headline || 'N/A',
        company: c.company_name || 'N/A'
      }))
      setSampleCandidates(candidates)
    } else {
      setSampleCandidates([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateStartIndex, selectedJobId])

  const handleRefreshCandidates = useCallback(() => {
    const totalCandidates = candidatesData?.approved_candidates?.length || 0
    if (totalCandidates > 5) {
      setCandidateStartIndex((prev) => (prev + 5) % totalCandidates)
    }
  }, [candidatesData?.approved_candidates?.length])

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [actionCount, setActionCount] = useState(0)
  const [configureNodeId, setConfigureNodeId] = useState<string | null>(null)
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  
  // Sequence settings for Begin Sequence node
  const [dailyVolume, setDailyVolume] = useState(50)
  const [sendingHoursStart, setSendingHoursStart] = useState('09:00')
  const [sendingHoursEnd, setSendingHoursEnd] = useState('17:00')
  
  // Helper function to create Begin Sequence node
  const createBeginSequenceNode = useCallback((): Node => {
    return {
      id: 'begin-sequence',
      type: 'beginSequenceNode',
      position: { x: START_X, y: START_Y },
      data: { 
        nodeId: 'begin-sequence',
        label: 'Begin Sequence',
        actionType: 'begin-sequence'
      },
      draggable: true
    }
  }, [])

  // Helper function to mark nodes with children based on edges
  const markNodesWithChildren = useCallback((nodes: Node[], edges: Edge[]): Node[] => {
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        hasChildren: edges.some(edge => edge.source === node.id)
      }
    }))
  }, [])

  // Load sequence based on selected job
  useEffect(() => {
    if (!selectedJobId) return

    // Different sequences for different job types
    if (selectedJobId === 1) {
      // Engineer sequence: Begin -> View profile, Like post, Connect, Message if accepted / InMail if not
      // Gap-first approach: calculate positions with consistent gaps between nodes
      let yPos = START_Y
      
      // Begin Sequence (always first)
      const posBegin = yPos
      yPos += NODE_HEIGHTS.actionWithoutButton + DESIRED_GAP
      
      const pos0 = yPos
      yPos += NODE_HEIGHTS.actionWithoutButton + DESIRED_GAP
      
      const pos1 = yPos
      yPos += NODE_HEIGHTS.wait + DESIRED_GAP
      
      const pos2 = yPos
      yPos += NODE_HEIGHTS.actionWithoutButton + DESIRED_GAP
      
      const pos3 = yPos
      yPos += NODE_HEIGHTS.wait + DESIRED_GAP
      
      const pos4 = yPos
      yPos += NODE_HEIGHTS.actionWithoutButton + DESIRED_GAP
      
      const pos5 = yPos
      yPos += NODE_HEIGHTS.wait + DESIRED_GAP
      
      const pos6 = yPos
      yPos += NODE_HEIGHTS.conditionalWithoutButtons + DESIRED_GAP
      
      const pos7 = yPos
      yPos += NODE_HEIGHTS.wait + DESIRED_GAP
      
      const pos8 = yPos
      yPos += NODE_HEIGHTS.actionWithoutButton + DESIRED_GAP
      
      const pos9 = yPos
      yPos += NODE_HEIGHTS.wait + DESIRED_GAP
      
      const pos10 = yPos
      
      const engineerNodes: Node[] = [
        createBeginSequenceNode(),
        { id: 'action-0', type: 'actionNode', position: { x: START_X, y: pos0 }, data: { nodeId: 'action-0', label: 'View Profile', actionType: 'view-profile' }, draggable: true },
        { id: 'wait-1', type: 'waitNode', position: { x: START_X, y: pos1 }, data: { nodeId: 'wait-1', waitValue: 2, waitUnit: 'days' }, draggable: true },
        { id: 'action-1', type: 'actionNode', position: { x: START_X, y: pos2 }, data: { nodeId: 'action-1', label: 'Like Post', actionType: 'like-post' }, draggable: true },
        { id: 'wait-2', type: 'waitNode', position: { x: START_X, y: pos3 }, data: { nodeId: 'wait-2', waitValue: 2, waitUnit: 'days' }, draggable: true },
        { id: 'action-2', type: 'actionNode', position: { x: START_X, y: pos4 }, data: { nodeId: 'action-2', label: 'Connection Request', actionType: 'connection-request' }, draggable: true },
        { id: 'wait-3', type: 'waitNode', position: { x: START_X, y: pos5 }, data: { nodeId: 'wait-3', waitValue: 2, waitUnit: 'days' }, draggable: true },
        { id: 'action-3', type: 'conditionalNode', position: { x: START_X, y: pos6 }, data: { nodeId: 'action-3', label: 'If Connection Accepted', actionType: 'if-connection-accepted', hasYesChild: true, hasNoChild: true }, draggable: true },
        { id: 'wait-4', type: 'waitNode', position: { x: START_X - BRANCH_OFFSET, y: pos7 }, data: { nodeId: 'wait-4', branch: 'yes', waitValue: 2, waitUnit: 'days' }, draggable: true },
        { id: 'action-4', type: 'actionNode', position: { x: START_X - BRANCH_OFFSET, y: pos8 }, data: { nodeId: 'action-4', label: 'Send Message', actionType: 'send-message', branch: 'yes' }, draggable: true },
        { id: 'wait-5', type: 'waitNode', position: { x: START_X + BRANCH_OFFSET, y: pos7 }, data: { nodeId: 'wait-5', branch: 'no', waitValue: 2, waitUnit: 'days' }, draggable: true },
        { id: 'action-5', type: 'actionNode', position: { x: START_X + BRANCH_OFFSET, y: pos8 }, data: { nodeId: 'action-5', label: 'Send InMail', actionType: 'send-inmail', branch: 'no' }, draggable: true },
        { id: 'wait-6', type: 'waitNode', position: { x: START_X - BRANCH_OFFSET, y: pos9 }, data: { nodeId: 'wait-6', branch: 'yes', waitValue: 2, waitUnit: 'days' }, draggable: true },
        { id: 'action-6', type: 'actionNode', position: { x: START_X - BRANCH_OFFSET, y: pos10 }, data: { nodeId: 'action-6', label: 'End Sequence', actionType: 'end-sequence', branch: 'yes' }, draggable: true },
        { id: 'wait-7', type: 'waitNode', position: { x: START_X + BRANCH_OFFSET, y: pos9 }, data: { nodeId: 'wait-7', branch: 'no', waitValue: 2, waitUnit: 'days' }, draggable: true },
        { id: 'action-7', type: 'actionNode', position: { x: START_X + BRANCH_OFFSET, y: pos10 }, data: { nodeId: 'action-7', label: 'End Sequence', actionType: 'end-sequence', branch: 'no' }, draggable: true }
      ]
      const engineerEdges: Edge[] = [
        { id: 'edge-begin-0', source: 'begin-sequence', target: 'action-0', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-0-wait-1', source: 'action-0', target: 'wait-1', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-1-1', source: 'wait-1', target: 'action-1', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-1-wait-2', source: 'action-1', target: 'wait-2', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-2-2', source: 'wait-2', target: 'action-2', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-2-wait-3', source: 'action-2', target: 'wait-3', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-3-3', source: 'wait-3', target: 'action-3', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-3-wait-4-yes', source: 'action-3', sourceHandle: 'yes', target: 'wait-4', type: 'smoothstep', animated: false, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }, style: { stroke: '#000', strokeWidth: 2 }, label: 'Yes', labelStyle: { fill: '#000', fontWeight: 600, fontSize: 14 }, labelBgPadding: [8, 4], labelBgBorderRadius: 4, labelBgStyle: { fill: '#fff', fillOpacity: 1 } },
        { id: 'edge-wait-4-4', source: 'wait-4', target: 'action-4', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-3-wait-5-no', source: 'action-3', sourceHandle: 'no', target: 'wait-5', type: 'smoothstep', animated: false, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }, style: { stroke: '#000', strokeWidth: 2 }, label: 'No', labelStyle: { fill: '#000', fontWeight: 600, fontSize: 14 }, labelBgPadding: [8, 4], labelBgBorderRadius: 4, labelBgStyle: { fill: '#fff', fillOpacity: 1 } },
        { id: 'edge-wait-5-5', source: 'wait-5', target: 'action-5', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-4-wait-6', source: 'action-4', target: 'wait-6', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-6-6', source: 'wait-6', target: 'action-6', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-5-wait-7', source: 'action-5', target: 'wait-7', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-7-7', source: 'wait-7', target: 'action-7', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } }
      ]
      
      // Mark nodes with children to hide "Add Next Action" buttons
      const nodesWithChildren = markNodesWithChildren(engineerNodes, engineerEdges)
      
      setNodes(nodesWithChildren)
      setEdges(engineerEdges)
      setActionCount(8)
      
      // Fit view to show all nodes after a short delay to ensure rendering is complete
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 300 })
      }, 50)
    } else if (selectedJobId === 2) {
      // Territory Manager sequence: Begin -> Connect first, InMail if not accepted, Message if accepted
      // Gap-first approach: calculate positions with consistent gaps between nodes
      let yPos = START_Y
      
      // Begin Sequence (always first)
      const posBegin = yPos
      yPos += NODE_HEIGHTS.actionWithoutButton + DESIRED_GAP
      
      const pos0 = yPos
      yPos += NODE_HEIGHTS.actionWithoutButton + DESIRED_GAP
      
      const pos1 = yPos
      yPos += NODE_HEIGHTS.wait + DESIRED_GAP
      
      const pos2 = yPos
      yPos += NODE_HEIGHTS.conditionalWithoutButtons + DESIRED_GAP
      
      const pos3 = yPos
      yPos += NODE_HEIGHTS.wait + DESIRED_GAP
      
      const pos4 = yPos
      yPos += NODE_HEIGHTS.actionWithoutButton + DESIRED_GAP
      
      const pos5 = yPos
      yPos += NODE_HEIGHTS.wait + DESIRED_GAP
      
      const pos6 = yPos
      
      const managerNodes: Node[] = [
        createBeginSequenceNode(),
        { id: 'action-0', type: 'actionNode', position: { x: START_X, y: pos0 }, data: { nodeId: 'action-0', label: 'Connection Request', actionType: 'connection-request' }, draggable: true },
        { id: 'wait-1', type: 'waitNode', position: { x: START_X, y: pos1 }, data: { nodeId: 'wait-1', waitValue: 2, waitUnit: 'days' }, draggable: true },
        { id: 'action-1', type: 'conditionalNode', position: { x: START_X, y: pos2 }, data: { nodeId: 'action-1', label: 'If Connection Accepted', actionType: 'if-connection-accepted', hasYesChild: true, hasNoChild: true }, draggable: true },
        { id: 'wait-2', type: 'waitNode', position: { x: START_X - BRANCH_OFFSET, y: pos3 }, data: { nodeId: 'wait-2', branch: 'yes', waitValue: 2, waitUnit: 'days' }, draggable: true },
        { id: 'action-2', type: 'actionNode', position: { x: START_X - BRANCH_OFFSET, y: pos4 }, data: { nodeId: 'action-2', label: 'Send Message', actionType: 'send-message', branch: 'yes' }, draggable: true },
        { id: 'wait-3', type: 'waitNode', position: { x: START_X + BRANCH_OFFSET, y: pos3 }, data: { nodeId: 'wait-3', branch: 'no', waitValue: 2, waitUnit: 'days' }, draggable: true },
        { id: 'action-3', type: 'actionNode', position: { x: START_X + BRANCH_OFFSET, y: pos4 }, data: { nodeId: 'action-3', label: 'Send InMail', actionType: 'send-inmail', branch: 'no' }, draggable: true },
        { id: 'wait-4', type: 'waitNode', position: { x: START_X - BRANCH_OFFSET, y: pos5 }, data: { nodeId: 'wait-4', branch: 'yes', waitValue: 2, waitUnit: 'days' }, draggable: true },
        { id: 'action-4', type: 'actionNode', position: { x: START_X - BRANCH_OFFSET, y: pos6 }, data: { nodeId: 'action-4', label: 'End Sequence', actionType: 'end-sequence', branch: 'yes' }, draggable: true },
        { id: 'wait-5', type: 'waitNode', position: { x: START_X + BRANCH_OFFSET, y: pos5 }, data: { nodeId: 'wait-5', branch: 'no', waitValue: 2, waitUnit: 'days' }, draggable: true },
        { id: 'action-5', type: 'actionNode', position: { x: START_X + BRANCH_OFFSET, y: pos6 }, data: { nodeId: 'action-5', label: 'End Sequence', actionType: 'end-sequence', branch: 'no' }, draggable: true }
      ]
      const managerEdges: Edge[] = [
        { id: 'edge-begin-0', source: 'begin-sequence', target: 'action-0', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-0-wait-1', source: 'action-0', target: 'wait-1', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-1-1', source: 'wait-1', target: 'action-1', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-1-wait-2-yes', source: 'action-1', sourceHandle: 'yes', target: 'wait-2', type: 'smoothstep', animated: false, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }, style: { stroke: '#000', strokeWidth: 2 }, label: 'Yes', labelStyle: { fill: '#000', fontWeight: 600, fontSize: 14 }, labelBgPadding: [8, 4], labelBgBorderRadius: 4, labelBgStyle: { fill: '#fff', fillOpacity: 1 } },
        { id: 'edge-wait-2-2', source: 'wait-2', target: 'action-2', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-1-wait-3-no', source: 'action-1', sourceHandle: 'no', target: 'wait-3', type: 'smoothstep', animated: false, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }, style: { stroke: '#000', strokeWidth: 2 }, label: 'No', labelStyle: { fill: '#000', fontWeight: 600, fontSize: 14 }, labelBgPadding: [8, 4], labelBgBorderRadius: 4, labelBgStyle: { fill: '#fff', fillOpacity: 1 } },
        { id: 'edge-wait-3-3', source: 'wait-3', target: 'action-3', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-2-wait-4', source: 'action-2', target: 'wait-4', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-4-4', source: 'wait-4', target: 'action-4', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-3-wait-5', source: 'action-3', target: 'wait-5', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-5-5', source: 'wait-5', target: 'action-5', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } }
      ]
      
      // Mark nodes with children to hide "Add Next Action" buttons
      const nodesWithChildren = markNodesWithChildren(managerNodes, managerEdges)
      
      setNodes(nodesWithChildren)
      setEdges(managerEdges)
      setActionCount(6)
      
      // Fit view to show all nodes after a short delay to ensure rendering is complete
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 300 })
      }, 50)
    }
  }, [selectedJobId, setNodes, setEdges, markNodesWithChildren, reactFlowInstance, createBeginSequenceNode])

  // History management for undo/redo
  const [history, setHistory] = useState<Array<{ nodes: Node[], edges: Edge[], actionCount: number }>>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const isRestoringHistory = useRef(false)

  // Save to history whenever nodes or edges change
  useEffect(() => {
    if (!isRestoringHistory.current && nodes.length >= 0) {
      // Deep clone to preserve all properties including positions
      const newHistoryEntry = { 
        nodes: nodes.map(node => ({
          ...node,
          position: { x: node.position.x, y: node.position.y },
          data: { ...node.data }
        })),
        edges: edges.map(edge => ({ ...edge })),
        actionCount 
      }
      
      // Only add to history if it's different from the current state
      if (historyIndex === -1 || 
          JSON.stringify(history[historyIndex]) !== JSON.stringify(newHistoryEntry)) {
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(newHistoryEntry)
        // Keep history limited to 50 states
        if (newHistory.length > 50) {
          newHistory.shift()
        } else {
          setHistoryIndex(historyIndex + 1)
        }
        setHistory(newHistory)
      }
    }
  }, [nodes, edges, actionCount])

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isRestoringHistory.current = true
      const previousState = history[historyIndex - 1]
      
      // Deep clone and ensure all properties are preserved
      const restoredNodes = previousState.nodes.map(node => ({
        ...node,
        position: { ...node.position },
        data: { ...node.data }
      }))
      const restoredEdges = previousState.edges.map(edge => ({ ...edge }))
      
      setNodes(restoredNodes)
      setEdges(restoredEdges)
      setActionCount(previousState.actionCount)
      setHistoryIndex(historyIndex - 1)
      
      setTimeout(() => {
        isRestoringHistory.current = false
      }, 100)
    }
  }, [historyIndex, history, setNodes, setEdges])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isRestoringHistory.current = true
      const nextState = history[historyIndex + 1]
      
      // Deep clone and ensure all properties are preserved
      const restoredNodes = nextState.nodes.map(node => ({
        ...node,
        position: { ...node.position },
        data: { ...node.data }
      }))
      const restoredEdges = nextState.edges.map(edge => ({ ...edge }))
      
      setNodes(restoredNodes)
      setEdges(restoredEdges)
      setActionCount(nextState.actionCount)
      setHistoryIndex(historyIndex + 1)
      
      setTimeout(() => {
        isRestoringHistory.current = false
      }, 100)
    }
  }, [historyIndex, history, setNodes, setEdges])

  // Helper function to check if an action type exists in the sequence
  const hasActionType = useCallback((actionTypeId: string) => {
    return nodes.some(node => 
      (node.type === 'actionNode' || node.type === 'conditionalNode') && 
      node.data.actionType === actionTypeId
    )
  }, [nodes])

  // Helper to find all ancestors of a node (tracing back through the graph)
  const findAncestors = useCallback((nodeId: string): string[] => {
    const ancestors: string[] = []
    const visited = new Set<string>()
    const queue = [nodeId]
    
    while (queue.length > 0) {
      const currentId = queue.shift()!
      if (visited.has(currentId)) continue
      visited.add(currentId)
      
      // Find all edges pointing TO this node
      const incomingEdges = edges.filter(edge => edge.target === currentId)
      incomingEdges.forEach(edge => {
        ancestors.push(edge.source)
        queue.push(edge.source)
      })
    }
    
    return ancestors
  }, [edges])

  // Helper to check if an action type exists in the ancestry path of a specific node
  const hasActionTypeInPath = useCallback((actionTypeId: string, startNodeId?: string): boolean => {
    if (!startNodeId) {
      // If no specific node, check entire sequence
      return hasActionType(actionTypeId)
    }
    
    // Get all ancestors of this node
    const ancestors = findAncestors(startNodeId)
    
    // Check if any ancestor has the action type
    return nodes.some(node => 
      ancestors.includes(node.id) &&
      (node.type === 'actionNode' || node.type === 'conditionalNode') && 
      node.data.actionType === actionTypeId
    )
  }, [nodes, edges, findAncestors, hasActionType])

  // Check if a conditional action is available
  const isActionAvailable = useCallback((actionId: string) => {
    // Connection Request: Only available if none exists yet (should be first action)
    if (actionId === 'connection-request') {
      return !hasActionType('connection-request')
    }
    
    // Prevent duplicate conditional nodes
    if (actionId === 'if-connection-accepted') {
      return hasActionType('connection-request') && !hasActionType('if-connection-accepted')
    }
    
    // If Message Responded: Check if send-message or send-inmail exists IN THE CURRENT PATH
    if (actionId === 'if-message-responded') {
      // If we're adding to a branch, check the path up to the parent
      const parentId = pendingBranch?.parentId
      
      if (parentId) {
        // Check if send-message or send-inmail exists in the ancestry of the parent node
        const hasSendMessageInPath = hasActionTypeInPath('send-message', parentId)
        const hasSendInMailInPath = hasActionTypeInPath('send-inmail', parentId)
        const alreadyHasMessageResponded = hasActionType('if-message-responded')
        
        return (hasSendMessageInPath || hasSendInMailInPath) && !alreadyHasMessageResponded
      }
      
      // If not in a branch, check the entire sequence
      return (hasActionType('send-message') || hasActionType('send-inmail')) && !hasActionType('if-message-responded')
    }
    
    // Send InMail only available if NOT in "yes" branch of connection accepted
    if (actionId === 'send-inmail') {
      const connectionAcceptedNode = nodes.find(n => n.data.actionType === 'if-connection-accepted')
      if (connectionAcceptedNode && pendingBranch?.parentId === connectionAcceptedNode.id && pendingBranch?.branch === 'yes') {
        return false // Can't send InMail in "yes" branch (connection accepted)
      }
      return true
    }
    
    // Send Message only available after connection is accepted IN THE CURRENT PATH
    if (actionId === 'send-message') {
      const connectionAcceptedNode = nodes.find(n => n.data.actionType === 'if-connection-accepted')
      
      // If we're in a branch of the connection accepted node
      if (connectionAcceptedNode && pendingBranch?.parentId === connectionAcceptedNode.id) {
        // Can send message only in "yes" branch (connection accepted)
        return pendingBranch?.branch === 'yes'
      }
      
      // Otherwise, check if connection accepted exists in the path
      const parentId = pendingBranch?.parentId
      if (parentId) {
        return hasActionTypeInPath('if-connection-accepted', parentId)
      }
      
      return hasActionType('if-connection-accepted')
    }
    
    // Activate Responder: Only available in "yes" branch of If Message Responded
    if (actionId === 'activate-responder') {
      const messageRespondedNode = nodes.find(n => n.data.actionType === 'if-message-responded')
      
      // If we're directly branching from the if-message-responded node
      if (messageRespondedNode && pendingBranch?.parentId === messageRespondedNode.id) {
        // Only allow in "yes" branch (message was responded to)
        return pendingBranch?.branch === 'yes'
      }
      
      // If we're further down in the tree, check if we came through the "yes" branch
      const parentId = pendingBranch?.parentId
      if (parentId && messageRespondedNode) {
        // Check if if-message-responded is in the path
        const isInPath = hasActionTypeInPath('if-message-responded', parentId)
        if (!isInPath) return false
        
        // Now verify we came through the "yes" branch
        // Find the edge from if-message-responded that leads to our current path
        const ancestors = findAncestors(parentId)
        
        // Check if there's a "yes" edge from if-message-responded in our ancestry
        const hasYesPath = edges.some(edge => 
          edge.source === messageRespondedNode.id && 
          edge.sourceHandle === 'yes' &&
          ancestors.includes(edge.target)
        )
        
        return hasYesPath
      }
      
      // Fallback: check if if-message-responded exists anywhere
      // (This would only apply if not in a branch context)
      return hasActionType('if-message-responded')
    }
    
    // Rescind Connection Request: Only available after connection-request but before if-connection-accepted
    if (actionId === 'rescind-connection-request') {
      const hasConnectionRequest = hasActionType('connection-request')
      const hasConnectionAccepted = hasActionType('if-connection-accepted')
      
      // Must have sent a connection request
      if (!hasConnectionRequest) return false
      
      // Cannot rescind after the conditional check (if-connection-accepted)
      if (hasConnectionAccepted) {
        // If we're in a branch context, check if we're adding before or after the conditional
        if (pendingBranch?.parentId) {
          const conditionalNode = nodes.find(n => n.data.actionType === 'if-connection-accepted')
          // Can't add rescind in branches after the conditional
          if (conditionalNode) return false
        } else {
          // Not in a branch, but conditional exists - can't add rescind
          return false
        }
      }
      
      return true
    }

    return true
  }, [hasActionType, hasActionTypeInPath, nodes, pendingBranch])

  // Recursive function to find all descendant nodes
  const findAllDescendants = useCallback((nodeId: string, currentEdges: Edge[]): string[] => {
    const descendants: string[] = []
    const queue = [nodeId]
    const visited = new Set<string>()
    
    while (queue.length > 0) {
      const currentId = queue.shift()!
      if (visited.has(currentId)) continue
      visited.add(currentId)
      
      const outgoing = currentEdges.filter(edge => edge.source === currentId)
      outgoing.forEach(edge => {
        descendants.push(edge.target)
        queue.push(edge.target)
      })
    }
    
    return descendants
  }, [])

  const confirmDelete = useCallback((nodeId: string) => {
    setNodeToDelete(nodeId)
    setShowDeleteConfirm(true)
  }, [])

  const executeDelete = useCallback(() => {
    if (!nodeToDelete) return
    
    const nodeId = nodeToDelete
    
    // Find edges connected to this node
    const incomingEdges = edges.filter((edge) => edge.target === nodeId)
    const outgoingEdges = edges.filter((edge) => edge.source === nodeId)
    
    const nodesToDelete = new Set<string>([nodeId])
    
    // Find and delete preceding wait node if it exists
    incomingEdges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source)
      if (sourceNode?.type === 'waitNode') {
        nodesToDelete.add(sourceNode.id)
      }
    })
    
    // Find ALL descendants recursively (including both yes/no branches)
    const descendants = findAllDescendants(nodeId, edges)
    descendants.forEach(desc => nodesToDelete.add(desc))
    
    // Filter out deleted edges first
    const remainingEdges = edges.filter((edge) => 
      !nodesToDelete.has(edge.source) && !nodesToDelete.has(edge.target)
    )
    
    setNodes((nds) => {
      const filtered = nds.filter((node) => !nodesToDelete.has(node.id))
      
      // Update ALL nodes to check their remaining children
      return filtered.map(node => {
        // For each node, check if it still has children in the remaining edges
        const stillHasYesChild = remainingEdges.some(edge => edge.source === node.id && edge.sourceHandle === 'yes')
        const stillHasNoChild = remainingEdges.some(edge => edge.source === node.id && edge.sourceHandle === 'no')
        const stillHasChildren = remainingEdges.some(edge => edge.source === node.id && !edge.sourceHandle)
        
        // Update the node data with the current state
        return {
          ...node,
          data: {
            ...node.data,
            hasYesChild: stillHasYesChild,
            hasNoChild: stillHasNoChild,
            hasChildren: stillHasChildren
          }
        }
      })
    })
    
    setEdges(remainingEdges)
    
    setShowDeleteConfirm(false)
    setNodeToDelete(null)
  }, [nodeToDelete, edges, nodes, setNodes, setEdges, findAllDescendants])

  // Setup stable handlers
  useEffect(() => {
    nodeHandlers.onDelete = (nodeId: string) => {
      // Prevent deleting the begin-sequence node
      if (nodeId === 'begin-sequence') return
      confirmDelete(nodeId)
    }
    
    nodeHandlers.onAddNext = (branch?: string, parentId?: string) => {
      // CRITICAL: Always set pendingBranch first, before opening menu
      if (branch && parentId) {
        // Adding to a specific branch (yes/no from conditional node)
        console.log('Setting pendingBranch:', { branch, parentId })
        setPendingBranch({ branch, parentId })
      } else {
        // Adding to main sequence (not from a branch)
        console.log('Clearing pendingBranch (main sequence)')
        setPendingBranch(null)
      }
      setShowActionMenu(true)
    }
    
    nodeHandlers.onWaitChange = (nodeId: string, value: number, unit: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                waitValue: value,
                waitUnit: unit
              }
            }
          }
          return node
        })
      )
    }
    
    nodeHandlers.onConfigure = (nodeId: string) => {
      setConfigureNodeId(nodeId)
      setShowConfigPanel(true)
    }
  }, [setNodes, setEdges, edges, confirmDelete, nodes])

  const snapToGrid = (x: number, y: number): [number, number] => {
    return [
      Math.round(x / GRID_SIZE) * GRID_SIZE,
      Math.round(y / GRID_SIZE) * GRID_SIZE
    ]
  }

  const handleAddAction = useCallback((actionType: { id: string; label: string }) => {
    console.log('handleAddAction called:', { 
      actionType: actionType.id, 
      pendingBranch,
      nodesCount: nodes.length 
    })
    
    const isConditional = actionType.id === 'if-connection-accepted' || actionType.id === 'if-message-responded'
    const nodeType = isConditional ? 'conditionalNode' : 'actionNode'
    
    if (nodes.length === 0) {
      // First action
      console.log('Adding first action')
      const [snappedX, snappedY] = snapToGrid(START_X, START_Y)
      
      const newNode: Node = {
        id: 'action-0',
        type: nodeType,
        position: { x: snappedX, y: snappedY },
        data: {
          nodeId: 'action-0',
          label: actionType.label,
          actionType: actionType.id
        },
        draggable: true
      }

      setNodes([newNode])
      setEdges([])
      setActionCount(1)
      setShowActionMenu(false)
      setPendingBranch(null)
      
      // Auto-fit view after adding node
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 400 })
      }, 50)
      return
    }

    // Handle branching from conditional nodes
    if (pendingBranch) {
      console.log('Adding to branch:', pendingBranch)
      const parentNode = nodes.find(n => n.id === pendingBranch.parentId)
      if (!parentNode) {
        console.error('Parent node not found for pendingBranch:', pendingBranch)
        return
      }

      const newActionId = `action-${actionCount}`
      const waitNodeId = `wait-${actionCount}`
      
      // Use grid-based X positioning for branches
      const branchX = getBranchXPosition(pendingBranch.branch, parentNode.position.x)
      console.log('Branch positioning:', { 
        branch: pendingBranch.branch, 
        parentX: parentNode.position.x, 
        branchX 
      })
      
      // Calculate dynamic positions based on actual node heights
      const parentHeight = getNodeHeight(parentNode)
      const waitNodeHeight = NODE_HEIGHTS.wait
      
      // Calculate total vertical distance from parent bottom to child top
      const totalVerticalSpace = DESIRED_GAP * 2 + waitNodeHeight
      
      // Position wait node so it's perfectly centered in the vertical space
      // Parent bottom is at: parentNode.position.y + parentHeight
      // Wait node should start at: parent bottom + DESIRED_GAP
      const waitY = parentNode.position.y + parentHeight + DESIRED_GAP
      const [waitX, snappedWaitY] = snapToGrid(branchX, waitY)

      // Position action node: wait node bottom + DESIRED_GAP
      const actionY = waitY + waitNodeHeight + DESIRED_GAP
      const [actionX, snappedActionY] = snapToGrid(branchX, actionY)

      const waitNode: Node = {
        id: waitNodeId,
        type: 'waitNode',
        position: { x: waitX, y: snappedWaitY },
        data: {
          nodeId: waitNodeId,
          waitValue: 2,
          waitUnit: 'days'
        },
        draggable: false
      }

      const newActionNode: Node = {
        id: newActionId,
        type: nodeType,
        position: { x: actionX, y: snappedActionY },
        data: {
          nodeId: newActionId,
          label: actionType.label,
          actionType: actionType.id
        },
        draggable: true
      }

      // Create edges
      const edgeToWait: Edge = {
        id: `${pendingBranch.parentId}-${waitNodeId}`,
        source: pendingBranch.parentId,
        sourceHandle: pendingBranch.branch,
        target: waitNodeId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#000', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#000' },
        label: pendingBranch.branch === 'yes' ? 'Yes' : 'No',
        labelStyle: { 
          fill: '#000', 
          fontWeight: 600, 
          fontSize: 14
        },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: '#fff', fillOpacity: 1 }
      }

      const edgeToAction: Edge = {
        id: `${waitNodeId}-${newActionId}`,
        source: waitNodeId,
        target: newActionId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#000', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }
      }

      // Mark parent node as having a child on this branch
      const branchFlag = pendingBranch.branch === 'yes' ? 'hasYesChild' : 'hasNoChild'
      console.log('Marking parent node with flag:', { 
        parentId: pendingBranch.parentId, 
        branch: pendingBranch.branch,
        flag: branchFlag 
      })
      
      setNodes((nds) => nds.map(n => {
        if (n.id === pendingBranch.parentId) {
          return {
            ...n,
            data: {
              ...n.data,
              [branchFlag]: true
            }
          }
        }
        return n
      }).concat([waitNode, newActionNode]))
      
      setEdges((eds) => [...eds, edgeToWait, edgeToAction])
      setActionCount(actionCount + 1)
      setShowActionMenu(false)
      console.log('Clearing pendingBranch after adding to branch')
      setPendingBranch(null)
      
      // Auto-fit view after adding nodes
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 400 })
      }, 50)
      return
    }

    // Find the last action or conditional node (main sequence, not branching)
    console.log('Adding to main sequence (no branch)')
    const actionNodes = nodes.filter(n => n.type === 'actionNode' || n.type === 'conditionalNode')
    const lastActionNode = actionNodes[actionNodes.length - 1]
    if (!lastActionNode) {
      console.error('No last action node found')
      return
    }
    
    const parentNodeId = lastActionNode.id
    const parentNode = lastActionNode

    const newActionId = `action-${actionCount}`
    const waitNodeId = `wait-${actionCount}`
    
    // Maintain the parent's X position (stay in same column)
    const parentX = parentNode.position.x
    
    // Calculate dynamic positions based on actual node heights
    const parentHeight = getNodeHeight(parentNode)
    const waitNodeHeight = NODE_HEIGHTS.wait
    
    // Calculate positions to ensure equal gaps
    // Parent bottom is at: parentNode.position.y + parentHeight
    // Wait node should start at: parent bottom + DESIRED_GAP
    const waitY = parentNode.position.y + parentHeight + DESIRED_GAP
    const [waitX, snappedWaitY] = snapToGrid(parentX, waitY)

    // Position action node: wait node bottom + DESIRED_GAP
    const actionY = waitY + waitNodeHeight + DESIRED_GAP
    const [actionX, snappedActionY] = snapToGrid(parentX, actionY)

    const waitNode: Node = {
      id: waitNodeId,
      type: 'waitNode',
      position: { x: waitX, y: snappedWaitY },
      data: {
        nodeId: waitNodeId,
        waitValue: 2,
        waitUnit: 'days'
      },
      draggable: false
    }

    const newActionNode: Node = {
      id: newActionId,
      type: nodeType,
      position: { x: actionX, y: snappedActionY },
      data: {
        nodeId: newActionId,
        label: actionType.label,
        actionType: actionType.id
      },
      draggable: true
    }

    // Create edges
    const edgeToWait: Edge = {
      id: `${parentNodeId}-${waitNodeId}`,
      source: parentNodeId,
      target: waitNodeId,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#000', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }
    }

    const edgeToAction: Edge = {
      id: `${waitNodeId}-${newActionId}`,
      source: waitNodeId,
      target: newActionId,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#000', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }
    }

    // Mark parent node as having children
    setNodes((nds) => nds.map(n => {
      if (n.id === parentNodeId) {
        return {
          ...n,
          data: {
            ...n.data,
            hasChildren: true
          }
        }
      }
      return n
    }).concat([waitNode, newActionNode]))
    
    setEdges((eds) => [...eds, edgeToWait, edgeToAction])
    setActionCount(actionCount + 1)
    setShowActionMenu(false)
    console.log('Clearing pendingBranch after adding to main sequence')
    setPendingBranch(null)
    
    // Auto-fit view after adding nodes
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 400 })
    }, 50)
  }, [nodes, actionCount, setNodes, setEdges, pendingBranch, reactFlowInstance])

  const handleClearSequence = useCallback(() => {
    setShowClearConfirm(true)
  }, [])

  const executeClearSequence = useCallback(() => {
    setNodes([createBeginSequenceNode()])
    setEdges([])
    setActionCount(0)
    setShowClearConfirm(false)
  }, [setNodes, setEdges, createBeginSequenceNode])

  return (
    <div className="space-y-6">
      {/* Job Posting Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Open Role</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedJobId?.toString() || ''} 
            onValueChange={(value) => {
              setSelectedJobId(value === 'clear-selection' ? null : parseInt(value))
            }}
          >
            <SelectTrigger className={`w-full ${!selectedJobId ? 'border-gray-400 focus:border-gray-600' : ''}`}>
              <SelectValue placeholder="Select a job posting..." />
            </SelectTrigger>
            <SelectContent>
              {selectedJobId && (
                <SelectItem value="clear-selection">
                  <span className="text-muted-foreground italic">Clear selection</span>
                </SelectItem>
              )}
              {isLoadingJobPostings ? (
                <SelectItem value="loading" disabled>
                  Loading jobs...
                </SelectItem>
              ) : jobPostings && jobPostings.length > 0 ? (
                jobPostings.map((job) => (
                  <SelectItem key={job.id} value={job.id.toString()}>
                    {job.title}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-jobs" disabled>
                  No job postings available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {!selectedJobId && (
            <p className="text-xs text-gray-600 mt-2">
              Please select a job posting to view campaign details
            </p>
          )}
        </CardContent>
      </Card>

      {/* Candidates Summary & Table */}
      {selectedJobId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{approvedCount} Approved Candidates</CardTitle>
              <Button
                onClick={handleRefreshCandidates}
                disabled={approvedCount <= 5}
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sampleCandidates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleCandidates.map((candidate) => (
                      <tr 
                        key={candidate.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm">{candidate.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{candidate.title}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{candidate.company}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No approved candidates for this role yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* React Flow Workspace */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Sequence Builder</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setShowActionMenu(!showActionMenu)}
                disabled={nodes.some(node => node.data.actionType === 'end-sequence')}
                className="bg-black hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Action
              </Button>
              <Button
                onClick={handleClearSequence}
                disabled={nodes.length === 0}
                variant="outline"
                className="bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Sequence
              </Button>
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-300">
                <span className="text-sm font-semibold text-gray-900">
                  {campaignStatus === 'active' ? 'Active' : 'Paused'}
                </span>
                <Switch
                  checked={campaignStatus === 'active'}
                  onCheckedChange={(checked) => setCampaignStatus(checked ? 'active' : 'paused')}
                  className="scale-110"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 relative">
          {/* Action Menu Dropdown */}
          {showActionMenu && (
            <div className="absolute top-4 right-4 z-50 bg-white border-2 border-gray-900 rounded-lg shadow-xl p-4 w-64">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Select Action</h3>
                <button
                  onClick={() => {
                    console.log('Closing action menu, clearing pendingBranch')
                    setShowActionMenu(false)
                    setPendingBranch(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {actionTypes.map((action) => {
                  const Icon = action.icon
                  const isAvailable = isActionAvailable(action.id)
                  return (
                    <button
                      key={action.id}
                      onClick={() => isAvailable && handleAddAction(action)}
                      disabled={!isAvailable}
                      className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 transition-colors text-left border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* React Flow Canvas */}
          <div style={{ height: '800px' }} className="border-t">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView={nodes.length === 0}
              snapToGrid={true}
              snapGrid={[GRID_SIZE, GRID_SIZE]}
              className="bg-gray-50"
              nodesDraggable={true}
              nodesConnectable={false}
              elementsSelectable={true}
              preventScrolling={false}
              zoomOnScroll={true}
              panOnScroll={false}
            >
              <Background 
                color="#ddd" 
                gap={GRID_SIZE} 
                variant={BackgroundVariant.Dots}
                size={1}
              />
              <Controls />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Panel */}
      {showConfigPanel && (
        <>
          {/* Backdrop/Overlay */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowConfigPanel(false)}
          />
          
          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 border-l-2 border-gray-900 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">
                  {nodes.find(n => n.id === configureNodeId)?.data.label || 'Configure'}
                </h2>
                <button
                  onClick={() => setShowConfigPanel(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {configureNodeId === 'begin-sequence' ? (
                  <>
                    {/* Begin Sequence Settings */}
                    <div className="space-y-2">
                      <Label htmlFor="daily-volume">Daily Volume</Label>
                      <Input
                        id="daily-volume"
                        type="number"
                        value={dailyVolume}
                        onChange={(e) => setDailyVolume(parseInt(e.target.value) || 0)}
                        min="1"
                        max="200"
                        className="bg-white border-gray-300"
                      />
                      <p className="text-xs text-gray-500">Number of messages to send per day (1-200)</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Sending Hours</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Label htmlFor="start-time" className="text-xs text-gray-600">Start</Label>
                          <Input
                            id="start-time"
                            type="time"
                            value={sendingHoursStart}
                            onChange={(e) => setSendingHoursStart(e.target.value)}
                            className="bg-white border-gray-300"
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="end-time" className="text-xs text-gray-600">End</Label>
                          <Input
                            id="end-time"
                            type="time"
                            value={sendingHoursEnd}
                            onChange={(e) => setSendingHoursEnd(e.target.value)}
                            className="bg-white border-gray-300"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Messages will only be sent within this time window</p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Template Section for other actions */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Template</h3>
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-xs text-gray-400 text-center">
                          Placeholder for message configuration
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowConfigPanel(false)}
                    variant="outline"
                    className="flex-1 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setShowConfigPanel(false)}
                    className="flex-1 bg-black hover:bg-gray-800 text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-white border-2 border-gray-900">
          <DialogHeader>
            <DialogTitle>Delete Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this action and all the steps below it? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false)
                setNodeToDelete(null)
              }}
              className="bg-white hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={executeDelete}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Sequence Confirmation Dialog */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="bg-white border-2 border-gray-900">
          <DialogHeader>
            <DialogTitle>Clear Sequence</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear the entire sequence? This will remove all actions and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(false)}
              className="bg-white hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={executeClearSequence}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Clear Sequence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export function SequencerTab(props: SequencerTabProps) {
  return (
    <ReactFlowProvider>
      <SequencerTabInner {...props} />
    </ReactFlowProvider>
  )
}
