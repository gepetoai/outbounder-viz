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
  Position,
  NodeChange
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { useShortlistedCandidates } from '@/hooks/useCandidates'

interface SequencerTabProps {
  jobDescriptionId?: number | null
  onNavigateToSandbox?: () => void
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
// Vertical offset for branch nodes to create smoother curves (pushes branches down)
const BRANCH_VERTICAL_OFFSET = 60

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
// If parent is already in a branch (offset from START_X), use larger offset to avoid overlap
// Also checks for collisions with existing nodes at the same Y level
function getBranchXPosition(
  branch: string | undefined, 
  parentX: number, 
  targetY: number, 
  existingNodes: Node[] = []
): number {
  // Check if parent is already in a branch (not at the main sequence X position)
  const isParentInBranch = Math.abs(parentX - START_X) > 10 // Allow small tolerance for rounding
  
  // Calculate initial branch X position
  let branchX: number
  if (branch === 'yes') {
    // Yes branch goes left (negative offset)
    if (isParentInBranch) {
      branchX = parentX - BRANCH_OFFSET * 2
    } else {
      branchX = parentX - BRANCH_OFFSET
    }
  } else if (branch === 'no') {
    // No branch goes right (positive offset)
    if (isParentInBranch) {
      branchX = parentX + BRANCH_OFFSET * 2
    } else {
      branchX = parentX + BRANCH_OFFSET
    }
  } else {
    // If no branch specified, inherit parent's X position (stay in same column)
    return parentX
  }
  
  // Check for collisions with existing nodes at the same Y level (within tolerance)
  const Y_TOLERANCE = 50 // Consider nodes within 50px vertically as "same level"
  const X_COLLISION_THRESHOLD = NODE_WIDTH + 20 // Nodes need at least node width + padding apart
  
  // Keep checking and adjusting until no collision is found
  let currentMultiplier = isParentInBranch ? 2 : 1
  const maxAttempts = 5 // Prevent infinite loop
  let attempts = 0
  
  while (attempts < maxAttempts) {
    // Recalculate branchX with current multiplier
    if (branch === 'yes') {
      branchX = parentX - BRANCH_OFFSET * currentMultiplier
    } else if (branch === 'no') {
      branchX = parentX + BRANCH_OFFSET * currentMultiplier
    }
    
    // Check for collisions
    const conflictingNode = existingNodes.find(node => {
      const yDiff = Math.abs(node.position.y - targetY)
      if (yDiff > Y_TOLERANCE) return false
      
      const xDiff = Math.abs(node.position.x - branchX)
      return xDiff < X_COLLISION_THRESHOLD
    })
    
    // If no collision, we're good
    if (!conflictingNode) {
      break
    }
    
    // Collision detected, increase multiplier and try again
    currentMultiplier++
    attempts++
  }
  
  return branchX
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

// Node dimensions for collision detection
const NODE_WIDTH = 224 // w-56 = 14rem = 224px
const COLLISION_PADDING = 10 // Minimum gap between nodes

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
  const selfExplanatoryActions = ['end-sequence', 'rescind-connection-request', 'view-profile', 'connection-request']
  const showConfigureButton = !selfExplanatoryActions.includes(data.actionType)
  
  return (
    <div 
      className={`bg-white border-2 border-gray-900 rounded-lg p-4 w-56 shadow-lg ${!showAddButton ? 'flex items-center' : ''}`}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      
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
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      
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
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      
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
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
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

function SequencerTabInner({ jobDescriptionId: initialJobId, onNavigateToSandbox }: SequencerTabProps) {
  const reactFlowInstance = useReactFlow()
  const [selectedJobId, setSelectedJobId] = useState<number | null>(initialJobId || null)
  const { data: jobPostings, isLoading: isLoadingJobPostings } = useJobPostings()
  
  // Get approved candidates from API using the selected job ID (shortlisted = approved)
  const { data: approvedCandidatesData } = useShortlistedCandidates(selectedJobId)
  const approvedCount = approvedCandidatesData?.length || 0
  const [campaignStatus, setCampaignStatus] = useState<'active' | 'paused'>('paused')
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [pendingBranch, setPendingBranch] = useState<{ branch: string; parentId: string } | null>(null)
  const [pendingParent, setPendingParent] = useState<string | null>(null)

  const [nodes, setNodes, onNodesChangeBase] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [actionCount, setActionCount] = useState(0)
  
  // Ref to track current nodes for collision detection
  const nodesRef = useRef(nodes)
  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])
  
  // Helper function to check if two nodes overlap
  const nodesOverlap = useCallback((node1: Node, node2: Node, nodeHeights: Map<string, number>): boolean => {
    if (node1.id === node2.id) return false
    
    const height1 = nodeHeights.get(node1.id) || getNodeHeight(node1)
    const height2 = nodeHeights.get(node2.id) || getNodeHeight(node2)
    
    // Calculate bounding boxes with padding
    const left1 = node1.position.x - COLLISION_PADDING
    const right1 = node1.position.x + NODE_WIDTH + COLLISION_PADDING
    const top1 = node1.position.y - COLLISION_PADDING
    const bottom1 = node1.position.y + height1 + COLLISION_PADDING
    
    const left2 = node2.position.x - COLLISION_PADDING
    const right2 = node2.position.x + NODE_WIDTH + COLLISION_PADDING
    const top2 = node2.position.y - COLLISION_PADDING
    const bottom2 = node2.position.y + height2 + COLLISION_PADDING
    
    // Check for overlap
    return !(right1 < left2 || left1 > right2 || bottom1 < top2 || top1 > bottom2)
  }, [])
  
  // Helper function to find nearest non-overlapping position
  const findNearestNonOverlappingPosition = useCallback((
    draggedNode: Node,
    otherNodes: Node[],
    nodeHeights: Map<string, number>,
    snapToGridFn: (x: number, y: number) => [number, number]
  ): { x: number; y: number } => {
    const draggedHeight = nodeHeights.get(draggedNode.id) || getNodeHeight(draggedNode)
    const newX = draggedNode.position.x
    const newY = draggedNode.position.y
    
    // Try sliding horizontally first (left and right)
    const slideOffsets = [
      NODE_WIDTH + COLLISION_PADDING * 2, // Right
      -(NODE_WIDTH + COLLISION_PADDING * 2), // Left
      (NODE_WIDTH + COLLISION_PADDING * 2) * 2, // Further right
      -(NODE_WIDTH + COLLISION_PADDING * 2) * 2, // Further left
    ]
    
    for (const offset of slideOffsets) {
      const testX = draggedNode.position.x + offset
      const testNode: Node = {
        ...draggedNode,
        position: { x: testX, y: newY }
      }
      
      // Check if this position overlaps with any other node
      const hasOverlap = otherNodes.some(otherNode => 
        nodesOverlap(testNode, otherNode, nodeHeights)
      )
      
      if (!hasOverlap) {
        // Snap to grid
        const [snappedX] = snapToGridFn(testX, newY)
        return { x: snappedX, y: newY }
      }
    }
    
    // If horizontal sliding doesn't work, try vertical sliding
    const verticalOffsets = [
      draggedHeight + COLLISION_PADDING * 2, // Down
      -(draggedHeight + COLLISION_PADDING * 2), // Up
    ]
    
    for (const offset of verticalOffsets) {
      const testY = draggedNode.position.y + offset
      const testNode: Node = {
        ...draggedNode,
        position: { x: newX, y: testY }
      }
      
      const hasOverlap = otherNodes.some(otherNode => 
        nodesOverlap(testNode, otherNode, nodeHeights)
      )
      
      if (!hasOverlap) {
        const [, snappedY] = snapToGridFn(newX, testY)
        return { x: newX, y: snappedY }
      }
    }
    
    // If all else fails, return original position (will show overlap but won't crash)
    return { x: newX, y: newY }
  }, [nodesOverlap])
  
  // onNodesChange handler - nodes are not draggable, so we just use the base handler
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    // Nodes can only be moved programmatically through layout rules, not by user dragging
    onNodesChangeBase(changes)
  }, [onNodesChangeBase])
  const [configureNodeId, setConfigureNodeId] = useState<string | null>(null)
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  
  // Sequence settings for Begin Sequence node
  const [dailyVolume, setDailyVolume] = useState(50)
  const [sendingWindows, setSendingWindows] = useState<Array<{ start: string; end: string }>>([
    { start: '09:00', end: '17:00' }
  ])
  const [candidateGapMin, setCandidateGapMin] = useState(3)
  const [candidateGapMax, setCandidateGapMax] = useState(5)
  const [candidateGapUnit, setCandidateGapUnit] = useState<'minutes' | 'hours'>('minutes')
  
  // Message template settings (for send-message and send-inmail nodes)
  const [messageInstructions, setMessageInstructions] = useState('')
  const [generatedMessage, setGeneratedMessage] = useState('')
  
  // Activate Responder settings
  const [responderInstructions, setResponderInstructions] = useState('')
  const [responderExample, setResponderExample] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'bot'; text: string }>>([])
  const [currentChatInput, setCurrentChatInput] = useState('')
  
  // Like Post settings
  const [postRecency, setPostRecency] = useState<'latest' | 'last-10' | 'most-relevant'>('latest')
  const [postTimeWindow, setPostTimeWindow] = useState(7)
  
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
      draggable: false
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
      yPos += NODE_HEIGHTS.conditionalWithoutButtons + DESIRED_GAP + BRANCH_VERTICAL_OFFSET
      
      const pos7 = yPos
      yPos += NODE_HEIGHTS.wait + DESIRED_GAP
      
      const pos8 = yPos
      yPos += NODE_HEIGHTS.actionWithoutButton + DESIRED_GAP
      
      const pos9 = yPos
      yPos += NODE_HEIGHTS.wait + DESIRED_GAP
      
      const pos10 = yPos
      
      const engineerNodes: Node[] = [
        createBeginSequenceNode(),
        { id: 'action-0', type: 'actionNode', position: { x: START_X, y: pos0 }, data: { nodeId: 'action-0', label: 'View Profile', actionType: 'view-profile' }, draggable: false },
        { id: 'wait-1', type: 'waitNode', position: { x: START_X, y: pos1 }, data: { nodeId: 'wait-1', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-1', type: 'actionNode', position: { x: START_X, y: pos2 }, data: { nodeId: 'action-1', label: 'Like Post', actionType: 'like-post' }, draggable: false },
        { id: 'wait-2', type: 'waitNode', position: { x: START_X, y: pos3 }, data: { nodeId: 'wait-2', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-2', type: 'actionNode', position: { x: START_X, y: pos4 }, data: { nodeId: 'action-2', label: 'Connection Request', actionType: 'connection-request' }, draggable: false },
        { id: 'wait-3', type: 'waitNode', position: { x: START_X, y: pos5 }, data: { nodeId: 'wait-3', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-3', type: 'conditionalNode', position: { x: START_X, y: pos6 }, data: { nodeId: 'action-3', label: 'If Connection Accepted', actionType: 'if-connection-accepted', hasYesChild: true, hasNoChild: true }, draggable: false },
        { id: 'wait-4', type: 'waitNode', position: { x: START_X - BRANCH_OFFSET, y: pos7 }, data: { nodeId: 'wait-4', branch: 'yes', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-4', type: 'actionNode', position: { x: START_X - BRANCH_OFFSET, y: pos8 }, data: { nodeId: 'action-4', label: 'Send Message', actionType: 'send-message', branch: 'yes' }, draggable: false },
        { id: 'wait-5', type: 'waitNode', position: { x: START_X + BRANCH_OFFSET, y: pos7 }, data: { nodeId: 'wait-5', branch: 'no', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-5', type: 'actionNode', position: { x: START_X + BRANCH_OFFSET, y: pos8 }, data: { nodeId: 'action-5', label: 'Send InMail', actionType: 'send-inmail', branch: 'no' }, draggable: false },
        { id: 'wait-6', type: 'waitNode', position: { x: START_X - BRANCH_OFFSET, y: pos9 }, data: { nodeId: 'wait-6', branch: 'yes', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-6', type: 'actionNode', position: { x: START_X - BRANCH_OFFSET, y: pos10 }, data: { nodeId: 'action-6', label: 'End Sequence', actionType: 'end-sequence', branch: 'yes' }, draggable: false },
        { id: 'wait-7', type: 'waitNode', position: { x: START_X + BRANCH_OFFSET, y: pos9 }, data: { nodeId: 'wait-7', branch: 'no', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-7', type: 'actionNode', position: { x: START_X + BRANCH_OFFSET, y: pos10 }, data: { nodeId: 'action-7', label: 'End Sequence', actionType: 'end-sequence', branch: 'no' }, draggable: false }
      ]
      const engineerEdges: Edge[] = [
        { id: 'edge-begin-0', source: 'begin-sequence', target: 'action-0', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-0-wait-1', source: 'action-0', target: 'wait-1', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-1-1', source: 'wait-1', target: 'action-1', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-1-wait-2', source: 'action-1', target: 'wait-2', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-2-2', source: 'wait-2', target: 'action-2', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-2-wait-3', source: 'action-2', target: 'wait-3', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-3-3', source: 'wait-3', target: 'action-3', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-3-wait-4-yes', source: 'action-3', sourceHandle: 'yes', target: 'wait-4', type: 'smoothstep', animated: false, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }, style: { stroke: '#000', strokeWidth: 2 }, label: 'Yes', labelStyle: { fill: '#000', fontWeight: '700', fontSize: 16 }, labelBgPadding: [8, 4] as [number, number], labelBgBorderRadius: 4, labelBgStyle: { fill: '#fff', fillOpacity: 1, stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-4-4', source: 'wait-4', target: 'action-4', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-3-wait-5-no', source: 'action-3', sourceHandle: 'no', target: 'wait-5', type: 'smoothstep', animated: false, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }, style: { stroke: '#000', strokeWidth: 2 }, label: 'No', labelStyle: { fill: '#000', fontWeight: '700', fontSize: 16 }, labelBgPadding: [8, 4] as [number, number], labelBgBorderRadius: 4, labelBgStyle: { fill: '#fff', fillOpacity: 1, stroke: '#000', strokeWidth: 2 } },
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
      yPos += NODE_HEIGHTS.actionWithoutButton + DESIRED_GAP
      
      const pos0 = yPos
      yPos += NODE_HEIGHTS.actionWithoutButton + DESIRED_GAP
      
      const pos1 = yPos
      yPos += NODE_HEIGHTS.wait + DESIRED_GAP
      
      const pos2 = yPos
      yPos += NODE_HEIGHTS.conditionalWithoutButtons + DESIRED_GAP + BRANCH_VERTICAL_OFFSET
      
      const pos3 = yPos
      yPos += NODE_HEIGHTS.wait + DESIRED_GAP
      
      const pos4 = yPos
      yPos += NODE_HEIGHTS.actionWithoutButton + DESIRED_GAP
      
      const pos5 = yPos
      yPos += NODE_HEIGHTS.wait + DESIRED_GAP
      
      const pos6 = yPos
      yPos += NODE_HEIGHTS.conditionalWithoutButtons + DESIRED_GAP + BRANCH_VERTICAL_OFFSET
      
      const pos7 = yPos
      yPos += NODE_HEIGHTS.wait + DESIRED_GAP
      
      const pos8 = yPos
      yPos += NODE_HEIGHTS.actionWithoutButton + DESIRED_GAP
      
      const pos9 = yPos
      yPos += NODE_HEIGHTS.wait + DESIRED_GAP
      
      const pos10 = yPos
      
      // Calculate nested branch positions (for "If Message Responded" branches)
      // Assign unique columns to each of the 4 final branch paths to prevent overlap
      const leftConditionalX = START_X - BRANCH_OFFSET
      const leftYesBranchX = START_X - BRANCH_OFFSET * 3  // Column 0: leftmost
      const leftNoBranchX = START_X - BRANCH_OFFSET       // Column 1: left-center
      
      // Right branch (from Send InMail)
      const rightConditionalX = START_X + BRANCH_OFFSET
      const rightYesBranchX = START_X + BRANCH_OFFSET     // Column 2: right-center  
      const rightNoBranchX = START_X + BRANCH_OFFSET * 3  // Column 3: rightmost
      
      const managerNodes: Node[] = [
        createBeginSequenceNode(),
        { id: 'action-0', type: 'actionNode', position: { x: START_X, y: pos0 }, data: { nodeId: 'action-0', label: 'Connection Request', actionType: 'connection-request' }, draggable: false },
        { id: 'wait-1', type: 'waitNode', position: { x: START_X, y: pos1 }, data: { nodeId: 'wait-1', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-1', type: 'conditionalNode', position: { x: START_X, y: pos2 }, data: { nodeId: 'action-1', label: 'If Connection Accepted', actionType: 'if-connection-accepted', hasYesChild: true, hasNoChild: true }, draggable: false },
        { id: 'wait-2', type: 'waitNode', position: { x: START_X - BRANCH_OFFSET, y: pos3 }, data: { nodeId: 'wait-2', branch: 'yes', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-2', type: 'actionNode', position: { x: START_X - BRANCH_OFFSET, y: pos4 }, data: { nodeId: 'action-2', label: 'Send Message', actionType: 'send-message', branch: 'yes' }, draggable: false },
        { id: 'wait-3', type: 'waitNode', position: { x: START_X + BRANCH_OFFSET, y: pos3 }, data: { nodeId: 'wait-3', branch: 'no', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-3', type: 'actionNode', position: { x: START_X + BRANCH_OFFSET, y: pos4 }, data: { nodeId: 'action-3', label: 'Send InMail', actionType: 'send-inmail', branch: 'no' }, draggable: false },
        { id: 'wait-4', type: 'waitNode', position: { x: START_X - BRANCH_OFFSET, y: pos5 }, data: { nodeId: 'wait-4', branch: 'yes', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-4', type: 'conditionalNode', position: { x: leftConditionalX, y: pos6 }, data: { nodeId: 'action-4', label: 'If Message Responded', actionType: 'if-message-responded', hasYesChild: true, hasNoChild: true }, draggable: false },
        { id: 'wait-5', type: 'waitNode', position: { x: START_X + BRANCH_OFFSET, y: pos5 }, data: { nodeId: 'wait-5', branch: 'no', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-5', type: 'conditionalNode', position: { x: rightConditionalX, y: pos6 }, data: { nodeId: 'action-5', label: 'If Message Responded', actionType: 'if-message-responded', hasYesChild: true, hasNoChild: true }, draggable: false },
        // Left "If Message Responded" YES branch
        { id: 'wait-6', type: 'waitNode', position: { x: leftYesBranchX, y: pos7 }, data: { nodeId: 'wait-6', branch: 'yes', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-6', type: 'actionNode', position: { x: leftYesBranchX, y: pos8 }, data: { nodeId: 'action-6', label: 'Like Post', actionType: 'like-post', branch: 'yes' }, draggable: false },
        { id: 'wait-7', type: 'waitNode', position: { x: leftYesBranchX, y: pos9 }, data: { nodeId: 'wait-7', branch: 'yes', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-7', type: 'actionNode', position: { x: leftYesBranchX, y: pos10 }, data: { nodeId: 'action-7', label: 'End Sequence', actionType: 'end-sequence', branch: 'yes' }, draggable: false },
        // Left "If Message Responded" NO branch
        { id: 'wait-8', type: 'waitNode', position: { x: leftNoBranchX, y: pos7 }, data: { nodeId: 'wait-8', branch: 'no', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-8', type: 'actionNode', position: { x: leftNoBranchX, y: pos8 }, data: { nodeId: 'action-8', label: 'Like Post', actionType: 'like-post', branch: 'no' }, draggable: false },
        { id: 'wait-9', type: 'waitNode', position: { x: leftNoBranchX, y: pos9 }, data: { nodeId: 'wait-9', branch: 'no', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-9', type: 'actionNode', position: { x: leftNoBranchX, y: pos10 }, data: { nodeId: 'action-9', label: 'End Sequence', actionType: 'end-sequence', branch: 'no' }, draggable: false },
        // Right "If Message Responded" YES branch
        { id: 'wait-10', type: 'waitNode', position: { x: rightYesBranchX, y: pos7 }, data: { nodeId: 'wait-10', branch: 'yes', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-10', type: 'actionNode', position: { x: rightYesBranchX, y: pos8 }, data: { nodeId: 'action-10', label: 'Like Post', actionType: 'like-post', branch: 'yes' }, draggable: false },
        { id: 'wait-11', type: 'waitNode', position: { x: rightYesBranchX, y: pos9 }, data: { nodeId: 'wait-11', branch: 'yes', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-11', type: 'actionNode', position: { x: rightYesBranchX, y: pos10 }, data: { nodeId: 'action-11', label: 'End Sequence', actionType: 'end-sequence', branch: 'yes' }, draggable: false },
        // Right "If Message Responded" NO branch
        { id: 'wait-12', type: 'waitNode', position: { x: rightNoBranchX, y: pos7 }, data: { nodeId: 'wait-12', branch: 'no', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-12', type: 'actionNode', position: { x: rightNoBranchX, y: pos8 }, data: { nodeId: 'action-12', label: 'Send InMail', actionType: 'send-inmail', branch: 'no' }, draggable: false },
        { id: 'wait-13', type: 'waitNode', position: { x: rightNoBranchX, y: pos9 }, data: { nodeId: 'wait-13', branch: 'no', waitValue: 2, waitUnit: 'days' }, draggable: false },
        { id: 'action-13', type: 'actionNode', position: { x: rightNoBranchX, y: pos10 }, data: { nodeId: 'action-13', label: 'End Sequence', actionType: 'end-sequence', branch: 'no' }, draggable: false }
      ]
      const managerEdges: Edge[] = [
        { id: 'edge-begin-0', source: 'begin-sequence', target: 'action-0', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-0-wait-1', source: 'action-0', target: 'wait-1', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-1-1', source: 'wait-1', target: 'action-1', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-1-wait-2-yes', source: 'action-1', sourceHandle: 'yes', target: 'wait-2', type: 'smoothstep', animated: false, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }, style: { stroke: '#000', strokeWidth: 2 }, label: 'Yes', labelStyle: { fill: '#000', fontWeight: '700', fontSize: 16 }, labelBgPadding: [8, 4] as [number, number], labelBgBorderRadius: 4, labelBgStyle: { fill: '#fff', fillOpacity: 1, stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-2-2', source: 'wait-2', target: 'action-2', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-1-wait-3-no', source: 'action-1', sourceHandle: 'no', target: 'wait-3', type: 'smoothstep', animated: false, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }, style: { stroke: '#000', strokeWidth: 2 }, label: 'No', labelStyle: { fill: '#000', fontWeight: '700', fontSize: 16 }, labelBgPadding: [8, 4] as [number, number], labelBgBorderRadius: 4, labelBgStyle: { fill: '#fff', fillOpacity: 1, stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-3-3', source: 'wait-3', target: 'action-3', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-2-wait-4', source: 'action-2', target: 'wait-4', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-4-4', source: 'wait-4', target: 'action-4', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-3-wait-5', source: 'action-3', target: 'wait-5', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-5-5', source: 'wait-5', target: 'action-5', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        // Left "If Message Responded" branches
        { id: 'edge-4-wait-6-yes', source: 'action-4', sourceHandle: 'yes', target: 'wait-6', type: 'smoothstep', animated: false, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }, style: { stroke: '#000', strokeWidth: 2 }, label: 'Yes', labelStyle: { fill: '#000', fontWeight: '700', fontSize: 16 }, labelBgPadding: [8, 4] as [number, number], labelBgBorderRadius: 4, labelBgStyle: { fill: '#fff', fillOpacity: 1, stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-6-6', source: 'wait-6', target: 'action-6', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-6-wait-7', source: 'action-6', target: 'wait-7', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-7-7', source: 'wait-7', target: 'action-7', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-4-wait-8-no', source: 'action-4', sourceHandle: 'no', target: 'wait-8', type: 'smoothstep', animated: false, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }, style: { stroke: '#000', strokeWidth: 2 }, label: 'No', labelStyle: { fill: '#000', fontWeight: '700', fontSize: 16 }, labelBgPadding: [8, 4] as [number, number], labelBgBorderRadius: 4, labelBgStyle: { fill: '#fff', fillOpacity: 1, stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-8-8', source: 'wait-8', target: 'action-8', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-8-wait-9', source: 'action-8', target: 'wait-9', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-9-9', source: 'wait-9', target: 'action-9', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        // Right "If Message Responded" branches
        { id: 'edge-5-wait-10-yes', source: 'action-5', sourceHandle: 'yes', target: 'wait-10', type: 'smoothstep', animated: false, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }, style: { stroke: '#000', strokeWidth: 2 }, label: 'Yes', labelStyle: { fill: '#000', fontWeight: '700', fontSize: 16 }, labelBgPadding: [8, 4] as [number, number], labelBgBorderRadius: 4, labelBgStyle: { fill: '#fff', fillOpacity: 1, stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-10-10', source: 'wait-10', target: 'action-10', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-10-wait-11', source: 'action-10', target: 'wait-11', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-11-11', source: 'wait-11', target: 'action-11', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-5-wait-12-no', source: 'action-5', sourceHandle: 'no', target: 'wait-12', type: 'smoothstep', animated: false, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }, style: { stroke: '#000', strokeWidth: 2 }, label: 'No', labelStyle: { fill: '#000', fontWeight: '700', fontSize: 16 }, labelBgPadding: [8, 4] as [number, number], labelBgBorderRadius: 4, labelBgStyle: { fill: '#fff', fillOpacity: 1, stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-12-12', source: 'wait-12', target: 'action-12', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-12-wait-13', source: 'action-12', target: 'wait-13', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } },
        { id: 'edge-wait-13-13', source: 'wait-13', target: 'action-13', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#000', strokeWidth: 2 } }
      ]
      
      // Mark nodes with children to hide "Add Next Action" buttons
      const nodesWithChildren = markNodesWithChildren(managerNodes, managerEdges)
      
      setNodes(nodesWithChildren)
      setEdges(managerEdges)
      setActionCount(14)
      
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

  // Helper to determine which branch path (yes/no) we came through from a conditional node
  const getBranchPathFromConditional = useCallback((conditionalActionType: string, startNodeId?: string): 'yes' | 'no' | null => {
    // If we're directly branching from a conditional
    if (pendingBranch) {
      const conditionalNode = nodes.find(n => n.id === pendingBranch.parentId && n.data.actionType === conditionalActionType)
      if (conditionalNode) {
        return pendingBranch.branch === 'yes' ? 'yes' : 'no'
      }
    }
    
    // If we have a parent node to trace from
    const traceFromNodeId = startNodeId || pendingParent
    if (!traceFromNodeId) return null
    
    // Trace back through edges to find the conditional node in the actual path
    const visited = new Set<string>()
    const queue = [traceFromNodeId]
    
    while (queue.length > 0) {
      const currentId = queue.shift()!
      if (visited.has(currentId)) continue
      visited.add(currentId)
      
      // Find incoming edges to this node
      const incomingEdges = edges.filter(edge => edge.target === currentId)
      
      for (const edge of incomingEdges) {
        // Check if the source node is a conditional of the type we're looking for
        const sourceNode = nodes.find(n => n.id === edge.source)
        if (sourceNode && sourceNode.data.actionType === conditionalActionType) {
          // Found the conditional node in the path! Return which branch handle was used
          return edge.sourceHandle === 'yes' ? 'yes' : 'no'
        }
        
        // Continue tracing back
        queue.push(edge.source)
      }
    }
    
    return null
  }, [nodes, edges, pendingBranch, pendingParent])

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
    // Cannot be added back-to-back (not immediately after another "If Message Responded")
    if (actionId === 'if-message-responded') {
      // Get the parent node ID from either pendingBranch or pendingParent
      const parentId = pendingBranch?.parentId || pendingParent
      
      if (parentId) {
        // Check if the parent node itself is "if-message-responded" (prevent back-to-back)
        const parentNode = nodes.find(n => n.id === parentId)
        const isParentMessageResponded = parentNode?.data.actionType === 'if-message-responded'
        if (isParentMessageResponded) return false
        
        // Check if the parent node itself is send-message or send-inmail
        const isParentSendMessage = parentNode?.data.actionType === 'send-message'
        const isParentSendInMail = parentNode?.data.actionType === 'send-inmail'
        
        // Check if send-message or send-inmail exists in the ancestry path
        const hasSendMessageInPath = hasActionTypeInPath('send-message', parentId)
        const hasSendInMailInPath = hasActionTypeInPath('send-inmail', parentId)
        
        // Check if "If Message Responded" already exists in THIS PATH (not entire sequence)
        const alreadyHasMessageRespondedInPath = hasActionTypeInPath('if-message-responded', parentId)
        
        // Allow if parent is send-message/send-inmail OR exists in path, AND not already in this path
        const hasMessageAction = isParentSendMessage || isParentSendInMail || hasSendMessageInPath || hasSendInMailInPath
        
        return hasMessageAction && !alreadyHasMessageRespondedInPath
      }
      
      // If no parent context, check the entire sequence (fallback for main sequence)
      return (hasActionType('send-message') || hasActionType('send-inmail')) && !hasActionType('if-message-responded')
    }
    
    // Send InMail: Only available if connection is NOT accepted
    // This means: no if-connection-accepted exists yet, OR we're in the "no" branch path
    if (actionId === 'send-inmail') {
      const connectionAcceptedNode = nodes.find(n => n.data.actionType === 'if-connection-accepted')
      
      // If no conditional exists yet, InMail is allowed
      if (!connectionAcceptedNode) return true
      
      // Determine which branch path we're in
      const branchPath = getBranchPathFromConditional('if-connection-accepted', pendingBranch?.parentId || pendingParent || undefined)
      
      // InMail is ONLY allowed in "no" branch (connection not accepted) or before the conditional
      if (branchPath === 'yes') {
        return false // In "yes" branch = connection accepted = can't use InMail
      }
      
      return true // In "no" branch or no path = can use InMail
    }
    
    // Send Message: Only available after connection IS accepted
    // This means: we must be in the "yes" branch path of if-connection-accepted
    if (actionId === 'send-message') {
      const connectionAcceptedNode = nodes.find(n => n.data.actionType === 'if-connection-accepted')
      
      // If no conditional exists yet, message is NOT allowed (must accept connection first)
      if (!connectionAcceptedNode) return false
      
      // Determine which branch path we're in
      const branchPath = getBranchPathFromConditional('if-connection-accepted', pendingBranch?.parentId || pendingParent || undefined)
      
      // Message is ONLY allowed in "yes" branch (connection accepted)
      return branchPath === 'yes'
    }
    
    // Activate Responder: ONLY available in "yes" branch of "If Message Responded"
    // Cannot be added directly after "Send Message" or "Send InMail"
    // Allow multiple instances in different branch paths (Yes vs No branches are separate)
    if (actionId === 'activate-responder') {
      // Get the parent node ID from either pendingBranch or pendingParent
      const parentId = pendingBranch?.parentId || pendingParent
      
      if (parentId) {
        // Check if "Activate Responder" already exists in THIS PATH (not entire sequence)
        const alreadyHasResponderInPath = hasActionTypeInPath('activate-responder', parentId)
        if (alreadyHasResponderInPath) return false
        
        // Check if the parent node itself is "if-message-responded" (for direct branching)
        const parentNode = nodes.find(n => n.id === parentId)
        const isParentMessageResponded = parentNode?.data.actionType === 'if-message-responded'
        
        // "If Message Responded" MUST exist in the current path (either parent itself or in ancestors)
        const isInPath = isParentMessageResponded || hasActionTypeInPath('if-message-responded', parentId)
        if (!isInPath) return false
        
        // Find the if-message-responded node in the path
        const messageRespondedNode = nodes.find(n => n.data.actionType === 'if-message-responded')
        if (!messageRespondedNode) return false
        
        // If we're directly branching from the if-message-responded node
        if (pendingBranch?.parentId === messageRespondedNode.id) {
          // Only allow in "yes" branch (message was responded to)
          return pendingBranch?.branch === 'yes'
        }
        
        // If we're further down in the tree, use getBranchPathFromConditional to determine which branch we're in
        const branchPath = getBranchPathFromConditional('if-message-responded', parentId)
        // Only allow if we're in the "yes" branch (null or 'no' means not allowed)
        return branchPath === 'yes'
      }
      
      // If no parent context, don't allow (must be in a specific path with "If Message Responded")
      return false
    }
    
    // Rescind Connection Request: Only available after connection-request
    // Allowed in "No" branch of "If Connection Accepted" (connection not accepted)
    // Not allowed in "Yes" branch or main sequence after the conditional
    if (actionId === 'rescind-connection-request') {
      const hasConnectionRequest = hasActionType('connection-request')
      const hasConnectionAccepted = hasActionType('if-connection-accepted')
      
      // Must have sent a connection request
      if (!hasConnectionRequest) return false
      
      // If "If Connection Accepted" exists, check which branch path we're in
      if (hasConnectionAccepted) {
        // Determine which branch path we came through from "If Connection Accepted"
        const branchPath = getBranchPathFromConditional('if-connection-accepted', pendingBranch?.parentId || pendingParent || undefined)
        
        // Allow rescind only in the "No" branch (connection was not accepted)
        if (branchPath === 'no') {
          return true
        }
        
        // Block rescind in "Yes" branch or if we can't determine the path (main sequence after conditional)
        return false
      }
      
      // No conditional exists yet, allow rescind
      return true
    }

    return true
  }, [hasActionType, hasActionTypeInPath, nodes, pendingBranch, pendingParent, getBranchPathFromConditional, findAncestors, edges])

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

  // Helper to recalculate branch positions for symmetry
  const recalculateBranchPositions = useCallback((
    conditionalNodeId: string,
    currentNodes: Node[],
    currentEdges: Edge[]
  ): Node[] => {
    const conditionalNode = currentNodes.find(n => n.id === conditionalNodeId)
    if (!conditionalNode || conditionalNode.type !== 'conditionalNode') {
      return currentNodes
    }

    // Find direct children of yes and no branches
    const yesEdge = currentEdges.find(e => e.source === conditionalNodeId && e.sourceHandle === 'yes')
    const noEdge = currentEdges.find(e => e.source === conditionalNodeId && e.sourceHandle === 'no')
    
    if (!yesEdge && !noEdge) {
      return currentNodes // No branches to recalculate
    }

    // Get the conditional node's height (should be compact when both branches exist)
    const conditionalHeight = NODE_HEIGHTS.conditionalWithoutButtons // 64px when compact
    
    // Calculate the target Y position for direct branch children
    // They should be positioned at: parent bottom + DESIRED_GAP + vertical offset for smoother curves
    const targetYForBranchChildren = conditionalNode.position.y + conditionalHeight + DESIRED_GAP + BRANCH_VERTICAL_OFFSET

    const updatedNodes = currentNodes.map(node => ({ ...node }))

    // Helper to adjust a branch and all its descendants
    const adjustBranch = (branchEdge: Edge) => {
      const firstChildId = branchEdge.target
      const firstChild = updatedNodes.find(n => n.id === firstChildId)
      
      if (!firstChild) return

      // Calculate how much we need to shift this branch
      const currentY = firstChild.position.y
      const yDelta = targetYForBranchChildren - currentY

      if (Math.abs(yDelta) < 1) return // Already positioned correctly

      // Move the first child and all its descendants
      const branchDescendants = [firstChildId, ...findAllDescendants(firstChildId, currentEdges)]
      
      branchDescendants.forEach(nodeId => {
        const node = updatedNodes.find(n => n.id === nodeId)
        if (node) {
          node.position = {
            ...node.position,
            y: node.position.y + yDelta
          }
        }
      })
    }

    // Adjust both branches to have identical vertical positioning
    if (yesEdge) adjustBranch(yesEdge)
    if (noEdge) adjustBranch(noEdge)

    return updatedNodes
  }, [findAllDescendants])

  const confirmDelete = useCallback((nodeId: string) => {
    setNodeToDelete(nodeId)
    setShowDeleteConfirm(true)
  }, [])

  const executeDelete = useCallback(() => {
    if (!nodeToDelete) return
    
    const nodeId = nodeToDelete
    
    // Find edges connected to this node
    const incomingEdges = edges.filter((edge) => edge.target === nodeId)
    
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
      const updatedNodes = filtered.map(node => {
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
      
      // Handle conditional node expansion when a branch is deleted
      // When a branch is deleted, the conditional node transitions from compact (64px) to showing buttons (108px)
      const conditionalNodes = updatedNodes.filter(node => node.type === 'conditionalNode')
      
      conditionalNodes.forEach(condNode => {
        const hasYes = condNode.data.hasYesChild
        const hasNo = condNode.data.hasNoChild
        
        // Check if this node's height changed due to the deletion
        // Before deletion: if it had both branches, it was 64px (no buttons)
        // After deletion: if it has one branch, it's 108px (one button showing)
        const hasOneBranch = (hasYes && !hasNo) || (!hasYes && hasNo)
        
        if (hasOneBranch) {
          // Node now shows a button (108px) where before it was compact (64px)
          // The height increase is: 108 - 64 = 44px
          const heightIncrease = NODE_HEIGHTS.conditionalWithButtons - NODE_HEIGHTS.conditionalWithoutButtons // 44px
          
          // Find all descendants of this conditional node (the remaining branch)
          const descendants = findAllDescendants(condNode.id, remainingEdges)
          
          // Push descendants DOWN by the height increase to maintain proper DESIRED_GAP spacing
          // This ensures the gap between the conditional node bottom and first branch child remains 40px
          descendants.forEach(nodeId => {
            const node = updatedNodes.find(n => n.id === nodeId)
            if (node) {
              node.position = {
                ...node.position,
                y: node.position.y + heightIncrease
              }
            }
          })
        }
      })
      
      return updatedNodes
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
      // CRITICAL: Track both branch context and parent node
      if (branch && parentId) {
        // Adding to a specific branch (yes/no from conditional node)
        console.log('Setting pendingBranch:', { branch, parentId })
        setPendingBranch({ branch, parentId })
        setPendingParent(null) // Branch has its own parent tracking
      } else if (parentId) {
        // Adding directly under a specific node (not a branch, but we know the parent)
        console.log('Setting pendingParent:', parentId)
        setPendingBranch(null)
        setPendingParent(parentId)
      } else {
        // Adding to main sequence (no specific parent)
        console.log('Clearing pendingBranch and pendingParent (main sequence)')
        setPendingBranch(null)
        setPendingParent(null)
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
        draggable: false
      }

      setNodes([newNode])
      setEdges([])
      setActionCount(1)
      setShowActionMenu(false)
      setPendingBranch(null)
      setPendingParent(null)
      
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
      
      // Check if this is the second branch being added (transition from 108px to 64px)
      const isAddingSecondBranch = (pendingBranch.branch === 'yes' && parentNode.data.hasNoChild) ||
                                    (pendingBranch.branch === 'no' && parentNode.data.hasYesChild)
      
      // When adding the second branch, use the compact height for positioning
      const parentHeight = isAddingSecondBranch 
        ? NODE_HEIGHTS.conditionalWithoutButtons 
        : getNodeHeight(parentNode)
      const waitNodeHeight = NODE_HEIGHTS.wait
      
      // Position wait node: parent bottom + DESIRED_GAP + vertical offset for smoother curves
      const waitY = parentNode.position.y + parentHeight + DESIRED_GAP + BRANCH_VERTICAL_OFFSET
      
      // Use grid-based X positioning for branches, checking for collisions at the target Y level
      const branchX = getBranchXPosition(pendingBranch.branch, parentNode.position.x, waitY, nodes)
      console.log('Branch positioning:', { 
        branch: pendingBranch.branch, 
        parentX: parentNode.position.x, 
        branchX,
        waitY,
        isAddingSecondBranch
      })
      
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
        draggable: false
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
          fontWeight: '700', 
          fontSize: 16
        },
        labelBgPadding: [8, 4] as [number, number],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: '#fff', fillOpacity: 1, stroke: '#000', strokeWidth: 2 }
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
        flag: branchFlag,
        isAddingSecondBranch
      })
      
      setNodes((nds) => {
        // First, add the new nodes and update the parent's branch flags
        let updatedNodes = nds.map(n => {
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
        }).concat([waitNode, newActionNode])

        // If adding the second branch, recalculate positions for symmetry
        if (isAddingSecondBranch) {
          const newEdges = [...edges, edgeToWait, edgeToAction]
          updatedNodes = recalculateBranchPositions(pendingBranch.parentId, updatedNodes, newEdges)
        }

        return updatedNodes
      })
      
      setEdges((eds) => [...eds, edgeToWait, edgeToAction])
      setActionCount(actionCount + 1)
      setShowActionMenu(false)
      console.log('Clearing pendingBranch and pendingParent after adding to branch')
      setPendingBranch(null)
      setPendingParent(null)
      
      // Auto-fit view after adding nodes
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 400 })
      }, 50)
      return
    }

    // Find the parent node - either the specific pending parent or the last action node
    console.log('Adding to main sequence (no branch)', { pendingParent })
    let parentNode: Node | undefined
    
    if (pendingParent) {
      // Use the specific parent node that was clicked
      parentNode = nodes.find(n => n.id === pendingParent)
      console.log('Using specific parent:', pendingParent, parentNode)
    } else {
      // Find the last action or conditional node in main sequence
      const actionNodes = nodes.filter(n => n.type === 'actionNode' || n.type === 'conditionalNode')
      parentNode = actionNodes[actionNodes.length - 1]
      console.log('Using last action node as parent')
    }
    
    if (!parentNode) {
      console.error('No parent node found')
      return
    }
    
    const parentNodeId = parentNode.id

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
      draggable: false
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
    console.log('Clearing pendingBranch and pendingParent after adding to main sequence')
    setPendingBranch(null)
    setPendingParent(null)
    
    // Auto-fit view after adding nodes
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 400 })
    }, 50)
  }, [nodes, edges, actionCount, setNodes, setEdges, pendingBranch, pendingParent, reactFlowInstance, recalculateBranchPositions])

  const handleClearSequence = useCallback(() => {
    setShowClearConfirm(true)
  }, [])

  const executeClearSequence = useCallback(() => {
    setNodes([createBeginSequenceNode()])
    setEdges([])
    setActionCount(0)
    setShowClearConfirm(false)
  }, [setNodes, setEdges, createBeginSequenceNode])

  const handleGenerateMessage = useCallback(() => {
    // Mock message generation based on instructions
    if (!messageInstructions.trim()) {
      setGeneratedMessage('Please provide instructions for the message.')
      return
    }
    
    // Simulate AI-generated message based on instructions
    const generatedText = `Hi there,

I noticed your experience and background. ${messageInstructions}

Looking forward to connecting!

Best regards`
    
    setGeneratedMessage(generatedText)
  }, [messageInstructions])

  const handleGenerateResponderExample = useCallback(() => {
    if (!responderInstructions.trim()) {
      setResponderExample('Please provide instructions for the responder.')
      return
    }
    
    const exampleText = `[Auto-responder behavior based on instructions]

Instructions: ${responderInstructions}

Example response: Based on your instructions, the responder will handle incoming messages appropriately.`
    
    setResponderExample(exampleText)
  }, [responderInstructions])

  const handleSendChatMessage = useCallback(() => {
    if (!currentChatInput.trim()) return
    
    // Add user message
    const newMessages = [...chatMessages, { role: 'user' as const, text: currentChatInput }]
    
    // Simulate bot response based on responder instructions
    const botResponse = responderInstructions.trim() 
      ? `[Bot response following instructions: "${responderInstructions}"] - This is a simulated response.`
      : 'Please set responder instructions first.'
    
    newMessages.push({ role: 'bot' as const, text: botResponse })
    
    setChatMessages(newMessages)
    setCurrentChatInput('')
  }, [currentChatInput, chatMessages, responderInstructions])

  const handleClearChat = useCallback(() => {
    setChatMessages([])
  }, [])

  const handleAddTimeWindow = useCallback(() => {
    setSendingWindows([...sendingWindows, { start: '09:00', end: '17:00' }])
  }, [sendingWindows])

  const handleRemoveTimeWindow = useCallback((index: number) => {
    if (sendingWindows.length > 1) {
      setSendingWindows(sendingWindows.filter((_, i) => i !== index))
    }
  }, [sendingWindows])

  const handleUpdateTimeWindow = useCallback((index: number, field: 'start' | 'end', value: string) => {
    const updated = [...sendingWindows]
    updated[index][field] = value
    setSendingWindows(updated)
  }, [sendingWindows])

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
              <SelectValue placeholder="No role selected" />
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
        </CardContent>
      </Card>

      {/* Candidates Summary */}
      {selectedJobId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{approvedCount} Approved Candidates</CardTitle>
          </CardHeader>
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
              <Button
                onClick={() => onNavigateToSandbox?.()}
                variant="outline"
                className="bg-white hover:bg-gray-50"
              >
                Test
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
                    console.log('Closing action menu, clearing pendingBranch and pendingParent')
                    setShowActionMenu(false)
                    setPendingBranch(null)
                    setPendingParent(null)
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
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={true}
              preventScrolling={false}
              zoomOnScroll={true}
              panOnScroll={false}
              defaultEdgeOptions={{
                type: 'smoothstep',
                animated: false,
                style: { stroke: '#000', strokeWidth: 2 }
              }}
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
                      <p className="text-xs text-gray-500">Number of leads to contact per day (1-200)</p>
                    </div>
                    
                    {/* Multiple Sending Windows */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Sending Windows</Label>
                        <Button
                          onClick={handleAddTimeWindow}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Window
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {sendingWindows.map((window, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="flex-1 flex items-center gap-2">
                              <div className="flex-1">
                                <Label htmlFor={`start-${index}`} className="text-xs text-gray-600">Start</Label>
                                <Input
                                  id={`start-${index}`}
                                  type="time"
                                  value={window.start}
                                  onChange={(e) => handleUpdateTimeWindow(index, 'start', e.target.value)}
                                  className="bg-white border-gray-300 mt-1"
                                />
                              </div>
                              <div className="flex-1">
                                <Label htmlFor={`end-${index}`} className="text-xs text-gray-600">End</Label>
                                <Input
                                  id={`end-${index}`}
                                  type="time"
                                  value={window.end}
                                  onChange={(e) => handleUpdateTimeWindow(index, 'end', e.target.value)}
                                  className="bg-white border-gray-300 mt-1"
                                />
                              </div>
                            </div>
                            {sendingWindows.length > 1 && (
                              <button
                                onClick={() => handleRemoveTimeWindow(index)}
                                className="text-gray-400 hover:text-red-600 transition-colors mt-5"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">Messages will only be sent within these time windows</p>
                    </div>
                    
                    {/* Candidate Gap Settings */}
                    <div className="space-y-2">
                      <Label>Gap Between Candidates</Label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Label htmlFor="gap-min" className="text-xs text-gray-600">Min</Label>
                          <Input
                            id="gap-min"
                            type="number"
                            value={candidateGapMin}
                            onChange={(e) => setCandidateGapMin(parseInt(e.target.value) || 1)}
                            min="1"
                            max="60"
                            className="bg-white border-gray-300 mt-1"
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="gap-max" className="text-xs text-gray-600">Max</Label>
                          <Input
                            id="gap-max"
                            type="number"
                            value={candidateGapMax}
                            onChange={(e) => setCandidateGapMax(parseInt(e.target.value) || 1)}
                            min="1"
                            max="60"
                            className="bg-white border-gray-300 mt-1"
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="gap-unit" className="text-xs text-gray-600">Unit</Label>
                          <Select
                            value={candidateGapUnit}
                            onValueChange={(value: 'minutes' | 'hours') => setCandidateGapUnit(value)}
                          >
                            <SelectTrigger id="gap-unit" className="bg-white border-gray-300 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minutes">Minutes</SelectItem>
                              <SelectItem value="hours">Hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Randomized wait time between starting sequences for different candidates (e.g., wait {candidateGapMin}-{candidateGapMax} {candidateGapUnit})
                      </p>
                    </div>
                  </>
                ) : (() => {
                  const currentNode = nodes.find(n => n.id === configureNodeId)
                  const actionType = currentNode?.data.actionType
                  
                  // Send Message or Send InMail configuration
                  if (actionType === 'send-message' || actionType === 'send-inmail') {
                    const icon = actionType === 'send-message' ? <MessageSquare className="h-5 w-5" /> : <Send className="h-5 w-5" />
                    const label = actionType === 'send-message' ? 'Send Message' : 'Send InMail'
                    
                    return (
                      <>
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                          {icon}
                          <h3 className="text-lg font-semibold">{label} Template</h3>
                        </div>
                        
                        {/* Instructions */}
                        <div className="space-y-2">
                          <Label htmlFor="message-instructions">Instructions</Label>
                          <Textarea
                            id="message-instructions"
                            value={messageInstructions}
                            onChange={(e) => setMessageInstructions(e.target.value)}
                            placeholder="Describe how you want the message to be written. E.g., 'Mention their recent project, highlight our company culture, and ask about their interest in the role.'"
                            className="min-h-[120px] bg-white border-gray-300"
                          />
                          <p className="text-xs text-gray-500">
                            Provide plain English instructions for generating the message
                          </p>
                        </div>
                        
                        {/* Generate Button */}
                        <div>
                          <Button
                            onClick={handleGenerateMessage}
                            className="w-full bg-black hover:bg-gray-800 text-white"
                          >
                            Generate Sample Message
                          </Button>
                        </div>
                        
                        {/* Generated Output */}
                        {generatedMessage && (
                          <div className="space-y-2">
                            <Label htmlFor="generated-output">Generated Output (Preview)</Label>
                            <Textarea
                              id="generated-output"
                              value={generatedMessage}
                              readOnly
                              className="min-h-[180px] bg-gray-50 border-gray-300 cursor-text font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500">
                              This is a preview. You can select and copy this text to refine your instructions.
                            </p>
                          </div>
                        )}
                      </>
                    )
                  }
                  
                  // Like Post configuration
                  if (actionType === 'like-post') {
                    return (
                      <>
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                          <Heart className="h-5 w-5" />
                          <h3 className="text-lg font-semibold">Like Post Settings</h3>
                        </div>
                        
                        {/* Post Selection */}
                        <div className="space-y-2">
                          <Label htmlFor="post-recency">Post Selection</Label>
                          <Select
                            value={postRecency}
                            onValueChange={(value: 'latest' | 'last-10' | 'most-relevant') => setPostRecency(value)}
                          >
                            <SelectTrigger id="post-recency" className="bg-white border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="latest">Latest Post</SelectItem>
                              <SelectItem value="last-10">Random from Last 10 Posts</SelectItem>
                              <SelectItem value="most-relevant">Most Relevant by Topic</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500">
                            Choose which post to like from the candidate&apos;s profile
                          </p>
                        </div>
                        
                        {/* Time Window */}
                        <div className="space-y-2">
                          <Label htmlFor="post-time-window">Post Time Window</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="post-time-window"
                              type="number"
                              value={postTimeWindow}
                              onChange={(e) => setPostTimeWindow(parseInt(e.target.value) || 7)}
                              min="1"
                              max="365"
                              className="flex-1 bg-white border-gray-300"
                            />
                            <span className="text-sm text-gray-600">days</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Only like posts from the last X days
                          </p>
                        </div>
                        
                        {/* Preview */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <p className="text-xs font-medium text-gray-700 mb-2">Configuration Summary:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Selection: {postRecency === 'latest' ? 'Latest post' : postRecency === 'last-10' ? 'Random from last 10' : 'Most relevant by topic'}</li>
                            <li>• Time window: Posts from last {postTimeWindow} days</li>
                          </ul>
                        </div>
                      </>
                    )
                  }
                  
                  // Activate Responder configuration
                  if (actionType === 'activate-responder') {
                    return (
                      <>
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                          <Zap className="h-5 w-5" />
                          <h3 className="text-lg font-semibold">Activate Responder</h3>
                        </div>
                        
                        {/* Responder Instructions */}
                        <div className="space-y-2">
                          <Label htmlFor="responder-instructions">Conversation Rules</Label>
                          <Textarea
                            id="responder-instructions"
                            value={responderInstructions}
                            onChange={(e) => setResponderInstructions(e.target.value)}
                            placeholder="Describe how the auto-responder should handle conversations. E.g., 'Be friendly and professional, answer questions about the role, and schedule a call if they show interest.'"
                            className="min-h-[100px] bg-white border-gray-300"
                          />
                          <p className="text-xs text-gray-500">
                            Define the behavior and tone for automated responses
                          </p>
                        </div>
                        
                        {/* Generate Example Button */}
                        <div>
                          <Button
                            onClick={handleGenerateResponderExample}
                            className="w-full bg-black hover:bg-gray-800 text-white"
                          >
                            Generate Example Response
                          </Button>
                        </div>
                        
                        {/* Generated Example */}
                        {responderExample && (
                          <div className="space-y-2">
                            <Label htmlFor="responder-example">Example Response</Label>
                            <Textarea
                              id="responder-example"
                              value={responderExample}
                              readOnly
                              className="min-h-[100px] bg-gray-50 border-gray-300 cursor-text font-mono text-sm"
                            />
                          </div>
                        )}
                        
                        {/* Chat Testing Interface */}
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <div className="flex items-center justify-between mb-3">
                            <Label>Test Conversation</Label>
                            <Button
                              onClick={handleClearChat}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              Clear Chat
                            </Button>
                          </div>
                          
                          {/* Chat Messages */}
                          <div className="border border-gray-300 rounded-lg p-3 min-h-[200px] max-h-[300px] overflow-y-auto bg-gray-50 mb-3 space-y-2">
                            {chatMessages.length === 0 ? (
                              <p className="text-xs text-gray-400 text-center py-8">
                                Start a conversation to test the responder behavior
                              </p>
                            ) : (
                              chatMessages.map((msg, idx) => (
                                <div
                                  key={idx}
                                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                      msg.role === 'user'
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-white border border-gray-300'
                                    }`}
                                  >
                                    {msg.text}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          
                          {/* Chat Input */}
                          <div className="flex gap-2">
                            <Input
                              value={currentChatInput}
                              onChange={(e) => setCurrentChatInput(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleSendChatMessage()
                                }
                              }}
                              placeholder="Type a message from prospect..."
                              className="flex-1 bg-white border-gray-300"
                            />
                            <Button
                              onClick={handleSendChatMessage}
                              className="bg-black hover:bg-gray-800 text-white"
                            >
                              Send
                            </Button>
                          </div>
                        </div>
                      </>
                    )
                  }
                  
                  // Default placeholder for other actions
                  return (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Template</h3>
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-xs text-gray-400 text-center">
                          Placeholder for message configuration
                        </p>
                      </div>
                    </div>
                  )
                })()}
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
