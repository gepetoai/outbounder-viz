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
  Play,
  Loader2,
  Save
} from 'lucide-react'
import { useJobPostings } from '@/hooks/useJobPostings'
import { useShortlistedCandidates } from '@/hooks/useCandidates'
import { useLinkedInAccounts } from '@/hooks/useLinkedInAccounts'
import { useGenerateSampleMessages } from '@/hooks/useCustomMessages'
import { createCampaign, getCampaignByJobDescription, startCampaign, pauseCampaign, resumeCampaign, CampaignWithDetails } from '@/lib/search-api'
import { Checkbox } from '@/components/ui/checkbox'

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
]

// Context variables available for message generation
const VARIABLE_OPTIONS = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'headline', label: 'Headline' },
  { key: 'current_job', label: 'Current Job' },
  { key: 'company', label: 'Company' },
  { key: 'location', label: 'Location' },
  { key: 'industry', label: 'Industry' },
  { key: 'experience_years', label: 'Experience Years' },
  { key: 'education', label: 'Education' },
  { key: 'skills', label: 'Skills' },
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
  const [inputValue, setInputValue] = useState<string>(String(waitValue))
  
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    if (newValue === '') return
    
    const value = parseInt(newValue)
    if (isNaN(value)) return
    
    const clampedValue = Math.min(Math.max(value, 1), 60)
    nodeHandlers.onWaitChange?.(data.nodeId, clampedValue, waitUnit)
  }
  
  const handleBlur = () => {
    const value = parseInt(inputValue)
    if (isNaN(value) || value < 1) {
      setInputValue('1')
      nodeHandlers.onWaitChange?.(data.nodeId, 1, waitUnit)
    }
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
          value={inputValue}
          onChange={handleValueChange}
          onBlur={handleBlur}
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
  const { data: linkedInAccounts } = useLinkedInAccounts()
  const { mutate: generateSampleMessages, isPending: isGenerating, error: generateError } = useGenerateSampleMessages()

  // Get approved candidates from API using the selected job ID (shortlisted = approved)
  const { 
    data: approvedCandidatesData, 
    isLoading: isLoadingCandidates,
    error: candidatesError 
  } = useShortlistedCandidates(selectedJobId)
  const approvedCount = approvedCandidatesData?.length || 0
  const [campaignStatus, setCampaignStatus] = useState<'draft' | 'paused' | 'running' | null>(null)
  const [selectedLinkedInAccountId, setSelectedLinkedInAccountId] = useState<number | null>(null)
  const [isSavingCampaign, setIsSavingCampaign] = useState(false)
  const [currentCampaignId, setCurrentCampaignId] = useState<number | null>(null)
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
  
  // Message template settings (for send-message and send-inmail nodes)
  const [messageInstructions, setMessageInstructions] = useState('')
  const [selectedVariables, setSelectedVariables] = useState<string[]>([])

  // Handler to update message text directly in node data
  const handleMessageTextUpdate = useCallback((nodeId: string, text: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                messageText: text
              }
            }
          : node
      )
    )
  }, [setNodes])

  // Handler to update subject text directly in node data (for InMail)
  const handleSubjectTextUpdate = useCallback((nodeId: string, text: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                subjectText: text
              }
            }
          : node
      )
    )
  }, [setNodes])

  // Handler to toggle context variables
  const handleVariableToggle = useCallback((variableKey: string) => {
    setSelectedVariables((prev) => {
      if (prev.includes(variableKey)) {
        return prev.filter((v) => v !== variableKey)
      } else {
        return [...prev, variableKey]
      }
    })
  }, [])

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

  // Rebuild flow from campaign data
  const rebuildFlowFromCampaign = useCallback((campaign: CampaignWithDetails) => {
    const actionDefs = campaign.action_definitions
    if (actionDefs.length === 0) {
      // Just begin sequence if no actions
      setNodes([createBeginSequenceNode()])
      setEdges([])
      setActionCount(0)
      return
    }

    // Build a map of action definition ID to action definition
    const actionDefMap = new Map<number, CampaignWithDetails['action_definitions'][0]>()
    actionDefs.forEach(def => {
      actionDefMap.set(def.id, def)
    })

    // Build nodes and edges
    const newNodes: Node[] = [createBeginSequenceNode()]
    const newEdges: Edge[] = []
    let actionCounter = 0
    let waitCounter = 0

    // Map to track which nodes have been created for each action definition
    const actionDefToNodeId = new Map<number, string>()
    const actionDefToWaitNodeId = new Map<number, string>()

    // Helper to create a node for an action definition
    const createNodeForActionDef = (def: CampaignWithDetails['action_definitions'][0], x: number, y: number, branch?: 'yes' | 'no'): Node => {
      let actionType: string
      let nodeType: 'actionNode' | 'conditionalNode'
      let label: string

      if (def.condition_type) {
        // It's a conditional node
        actionType = reverseMapConditionType(def.condition_type) || 'if-connection-accepted'
        nodeType = 'conditionalNode'
        label = getActionLabel(actionType)
      } else if (def.action_type) {
        // It's a regular action
        actionType = reverseMapActionType(def.action_type) || def.action_type
        nodeType = 'actionNode'
        label = getActionLabel(actionType)
      } else {
        // Fallback
        actionType = 'end-sequence'
        nodeType = 'actionNode'
        label = 'End Sequence'
      }

      const nodeId = `action-${actionCounter++}`
      const nodeData: {
        nodeId: string
        label: string
        actionType: string
        messageText?: string
        branch?: 'yes' | 'no'
        hasYesChild?: boolean
        hasNoChild?: boolean
      } = {
        nodeId,
        label,
        actionType
      }

      // Add message text if present
      if (def.json_metadata?.message_text) {
        nodeData.messageText = def.json_metadata.message_text as string
      }

      if (branch) {
        nodeData.branch = branch
      }

      // For conditional nodes, set hasYesChild/hasNoChild
      if (nodeType === 'conditionalNode') {
        nodeData.hasYesChild = !!def.next_step_if_true
        nodeData.hasNoChild = !!def.next_step_if_false
      }

      return {
        id: nodeId,
        type: nodeType,
        position: { x, y },
        data: nodeData,
        draggable: false
      }
    }

    // Recursive function to process action definitions following the parent-child chain
    const processActionDef = (
      def: CampaignWithDetails['action_definitions'][0],
      x: number,
      y: number,
      sourceNodeId: string,
      branch?: 'yes' | 'no'
    ): { lastNodeId: string; lastY: number } => {
      let currentY = y
      let lastNodeId = sourceNodeId

      // Create wait node if delay > 0 (delay is BEFORE the action)
      // Skip wait node if source is begin-sequence
      if (def.delay_value > 0 && sourceNodeId !== 'begin-sequence') {
        const waitNodeId = `wait-${waitCounter++}`
        const waitNode: Node = {
          id: waitNodeId,
          type: 'waitNode',
          position: { x, y: currentY },
          data: {
            nodeId: waitNodeId,
            waitValue: def.delay_value,
            waitUnit: def.delay_unit,
            ...(branch ? { branch } : {})
          },
          draggable: false
        }
        newNodes.push(waitNode)
        actionDefToWaitNodeId.set(def.id, waitNodeId)
        
        // Create edge from source to wait node
        newEdges.push({
          id: `edge-${sourceNodeId}-${waitNodeId}`,
          source: sourceNodeId,
          ...(branch ? { sourceHandle: branch, type: 'smoothstep' as const, label: branch === 'yes' ? 'Yes' : 'No', labelStyle: { fill: '#000', fontWeight: '700' as const, fontSize: 16 }, labelBgPadding: [8, 4] as [number, number], labelBgBorderRadius: 4, labelBgStyle: { fill: '#fff', fillOpacity: 1, stroke: '#000', strokeWidth: 2 } } : {}),
          target: waitNodeId,
          markerEnd: { type: MarkerType.ArrowClosed, ...(branch ? { color: '#000' } : {}) },
          style: { stroke: '#000', strokeWidth: 2 }
        })
        
        currentY += NODE_HEIGHTS.wait + DESIRED_GAP
        lastNodeId = waitNodeId
      } else {
        // No wait node - create edge directly from source to action
        if (sourceNodeId !== 'begin-sequence') {
          newEdges.push({
            id: `edge-${sourceNodeId}-action-${def.id}`,
            source: sourceNodeId,
            ...(branch ? { sourceHandle: branch, type: 'smoothstep' as const, label: branch === 'yes' ? 'Yes' : 'No', labelStyle: { fill: '#000', fontWeight: '700' as const, fontSize: 16 }, labelBgPadding: [8, 4] as [number, number], labelBgBorderRadius: 4, labelBgStyle: { fill: '#fff', fillOpacity: 1, stroke: '#000', strokeWidth: 2 } } : {}),
            target: `temp-${def.id}`, // Temporary target, will update after node creation
            markerEnd: { type: MarkerType.ArrowClosed, ...(branch ? { color: '#000' } : {}) },
            style: { stroke: '#000', strokeWidth: 2 }
          })
        }
      }

      // Create action/conditional node
      const actionNode = createNodeForActionDef(def, x, currentY, branch)
      newNodes.push(actionNode)
      actionDefToNodeId.set(def.id, actionNode.id)
      
      // Update edge target if we created one without a wait node
      if (def.delay_value === 0 && sourceNodeId !== 'begin-sequence') {
        const edge = newEdges[newEdges.length - 1]
        if (edge && edge.target === `temp-${def.id}`) {
          edge.target = actionNode.id
          edge.id = `edge-${sourceNodeId}-${actionNode.id}`
        }
      } else if (def.delay_value > 0 && sourceNodeId !== 'begin-sequence') {
        // Create edge from wait node to action node
        newEdges.push({
          id: `edge-${lastNodeId}-${actionNode.id}`,
          source: lastNodeId,
          target: actionNode.id,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#000', strokeWidth: 2 }
        })
      } else if (sourceNodeId === 'begin-sequence') {
        // Edge from begin sequence to first action (no wait node)
        newEdges.push({
          id: `edge-begin-${actionNode.id}`,
          source: 'begin-sequence',
          target: actionNode.id,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#000', strokeWidth: 2 }
        })
      }

      currentY += (def.condition_type ? NODE_HEIGHTS.conditionalWithoutButtons : NODE_HEIGHTS.actionWithoutButton) + DESIRED_GAP
      lastNodeId = actionNode.id

      // Handle conditional branches
      if (def.condition_type) {
        // Yes branch
        if (def.next_step_if_true) {
          const nextDef = actionDefMap.get(def.next_step_if_true)
          if (nextDef) {
            const branchX = x - BRANCH_OFFSET
            const branchY = currentY + BRANCH_VERTICAL_OFFSET
            const result = processActionDef(nextDef, branchX, branchY, actionNode.id, 'yes')
            // Update currentY to be below the deepest branch
            currentY = Math.max(currentY, result.lastY)
          }
        }

        // No branch
        if (def.next_step_if_false) {
          const nextDef = actionDefMap.get(def.next_step_if_false)
          if (nextDef) {
            const branchX = x + BRANCH_OFFSET
            const branchY = currentY + BRANCH_VERTICAL_OFFSET
            const result = processActionDef(nextDef, branchX, branchY, actionNode.id, 'no')
            // Update currentY to be below the deepest branch
            currentY = Math.max(currentY, result.lastY)
          }
        }
      } else {
        // Regular action - find next action in chain via fk_parent_step_id
        const nextDef = actionDefs.find(d => d.fk_parent_step_id === def.id)
        if (nextDef) {
          const result = processActionDef(nextDef, x, currentY, actionNode.id)
          currentY = result.lastY
          lastNodeId = result.lastNodeId
        }
      }

      return { lastNodeId, lastY: currentY }
    }

    // Find root action (no parent)
    const rootAction = actionDefs.find(def => !def.fk_parent_step_id)
    if (rootAction) {
      const initialY = START_Y + NODE_HEIGHTS.actionWithoutButton + DESIRED_GAP
      processActionDef(rootAction, START_X, initialY, 'begin-sequence')
    }

    // Update state
    const nodesWithChildren = markNodesWithChildren(newNodes, newEdges)
    setNodes(nodesWithChildren)
    setEdges(newEdges)
    setActionCount(actionCounter)

    // Update campaign settings
    if (campaign.daily_volume !== undefined && campaign.daily_volume !== null) {
      setDailyVolume(campaign.daily_volume)
    }

    // Gap values are stored in minutes
    if (campaign.min_gap_between_scheduling !== undefined && campaign.min_gap_between_scheduling !== null) {
      setCandidateGapMin(campaign.min_gap_between_scheduling)
    }
    

    // Update sending windows
    if (campaign.campaign_sending_windows && campaign.campaign_sending_windows.length > 0) {
      const windows = campaign.campaign_sending_windows.map(win => {
        // Parse time strings directly to avoid timezone issues
        // Format: "2025-11-20T09:00:00" or "2025-11-20T09:00:00.000Z"
        const parseTime = (timeString: string) => {
          // Extract the time part (HH:MM:SS)
          const timeMatch = timeString.match(/T(\d{2}):(\d{2}):/)
          if (timeMatch) {
            return {
              hours: parseInt(timeMatch[1], 10),
              minutes: parseInt(timeMatch[2], 10)
            }
          }
          // Fallback to Date parsing if format is unexpected
          const date = new Date(timeString)
          return {
            hours: date.getUTCHours(),
            minutes: date.getUTCMinutes()
          }
        }
        
        const startTime = parseTime(win.window_start_time)
        const endTime = parseTime(win.window_end_time)
        
        return {
          start: `${String(startTime.hours).padStart(2, '0')}:${String(startTime.minutes).padStart(2, '0')}`,
          end: `${String(endTime.hours).padStart(2, '0')}:${String(endTime.minutes).padStart(2, '0')}`
        }
      })
      setSendingWindows(windows)
    } else {
      // Reset to empty array if no windows
      setSendingWindows([])
    }

    // Update LinkedIn account
    setSelectedLinkedInAccountId(campaign.fk_linkedin_account_id)

    // Store campaign ID and status
    setCurrentCampaignId(campaign.id)
    setCampaignStatus((campaign.status as 'draft' | 'paused' | 'running') || null)

    // Fit view
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 300 })
    }, 50)
  }, [createBeginSequenceNode, markNodesWithChildren, reactFlowInstance, setNodes, setEdges, setDailyVolume, setCandidateGapMin, setSendingWindows, setSelectedLinkedInAccountId])

  // Load campaign when job description changes
  useEffect(() => {
    if (!selectedJobId) {
      // Clear nodes if no job selected
      setNodes([])
      setEdges([])
      setActionCount(0)
      setCurrentCampaignId(null)
      setCampaignStatus(null)
      return
    }

    // Fetch campaign for this job description
    getCampaignByJobDescription(selectedJobId)
      .then(campaign => {
        if (campaign) {
          // Rebuild flow from campaign
          rebuildFlowFromCampaign(campaign)
        } else {
          // 404 - just show begin sequence, no campaign exists
          setNodes([createBeginSequenceNode()])
          setEdges([])
          setActionCount(0)
          setCurrentCampaignId(null)
          setCampaignStatus(null)
        }
      })
      .catch(error => {
        console.error('Failed to load campaign:', error)
        // On error, just show begin sequence
        setNodes([createBeginSequenceNode()])
        setEdges([])
        setActionCount(0)
        setCurrentCampaignId(null)
        setCampaignStatus(null)
      })
  }, [selectedJobId, rebuildFlowFromCampaign, createBeginSequenceNode, setNodes, setEdges])

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
    const isBeginSequence = parentNodeId === 'begin-sequence'

    const newActionId = `action-${actionCount}`
    
    // Maintain the parent's X position (stay in same column)
    const parentX = parentNode.position.x
    
    // Calculate dynamic positions based on actual node heights
    const parentHeight = getNodeHeight(parentNode)
    
    let newActionNode: Node
    let newEdges: Edge[]
    let newNodes: Node[]
    
    if (isBeginSequence) {
      // Skip wait node for begin-sequence - connect directly to action
      const actionY = parentNode.position.y + parentHeight + DESIRED_GAP
      const [actionX, snappedActionY] = snapToGrid(parentX, actionY)

      newActionNode = {
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

      const edgeToAction: Edge = {
        id: `${parentNodeId}-${newActionId}`,
        source: parentNodeId,
        target: newActionId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#000', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }
      }

      newEdges = [edgeToAction]
      newNodes = [newActionNode]
    } else {
      // Create wait node for other parents
      const waitNodeId = `wait-${actionCount}`
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

      newActionNode = {
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

      newEdges = [edgeToWait, edgeToAction]
      newNodes = [waitNode, newActionNode]
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
    }).concat(newNodes))
    
    setEdges((eds) => [...eds, ...newEdges])
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
    // Validate all required fields
    if (!selectedJobId || !selectedLinkedInAccountId || !messageInstructions.trim() || selectedVariables.length === 0) {
      return
    }

    if (!configureNodeId) {
      return
    }

    const currentNode = nodes.find(n => n.id === configureNodeId)
    if (!currentNode || (currentNode.data.actionType !== 'send-message' && currentNode.data.actionType !== 'send-inmail')) {
      return
    }

    // Map action type from node's actionType to API format
    const actionTypeMap: Record<string, string> = {
      'send-message': 'send_message',
      'send-inmail': 'send_inmail'
    }
    const actionType = actionTypeMap[currentNode.data.actionType]

    // Build context_variables object with true for selected, false for unselected
    const contextVariables: Record<string, boolean> = {}
    VARIABLE_OPTIONS.forEach((variable) => {
      contextVariables[variable.key] = selectedVariables.includes(variable.key)
    })

    // Call the API to generate sample messages
    generateSampleMessages(
      {
        job_description_id: selectedJobId,
        linkedin_account_id: selectedLinkedInAccountId,
        action_type: actionType,
        user_instructions: messageInstructions,
        context_variables: contextVariables,
      },
      {
        onSuccess: (data) => {
          // Save the generated message to the node
          handleMessageTextUpdate(configureNodeId, data.custom_message)
          // Save the subject if present (for InMail)
          if (data.custom_subject) {
            handleSubjectTextUpdate(configureNodeId, data.custom_subject)
          }
          // Save the generation parameters to node data for campaign saving
          setNodes((nds) =>
            nds.map((node) =>
              node.id === configureNodeId
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      userInstructions: messageInstructions,
                      contextVariables: contextVariables,
                    }
                  }
                : node
            )
          )
        },
      }
    )
  }, [messageInstructions, selectedVariables, selectedJobId, selectedLinkedInAccountId, configureNodeId, nodes, handleMessageTextUpdate, handleSubjectTextUpdate, generateSampleMessages, setNodes])

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

  // Helper to validate time window
  const isValidTimeWindow = useCallback((start: string, end: string): boolean => {
    // Validate 24-hour format (HH:MM)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(start) || !timeRegex.test(end)) {
      return false
    }
    
    const [startHours, startMinutes] = start.split(':').map(Number)
    const [endHours, endMinutes] = end.split(':').map(Number)
    
    const startTimeMinutes = startHours * 60 + startMinutes
    const endTimeMinutes = endHours * 60 + endMinutes
    
    // Ensure end time is after start time (same day, 24-hour format)
    return endTimeMinutes > startTimeMinutes
  }, [])

  const handleUpdateTimeWindow = useCallback((index: number, field: 'start' | 'end', value: string) => {
    const updated = [...sendingWindows]
    const window = { ...updated[index] }
    
    // Update the field
    window[field] = value
    
    // Validate that end time is after start time on the same day
    if (window.start && window.end) {
      if (!isValidTimeWindow(window.start, window.end)) {
        // If invalid, don't update - this prevents invalid time windows
        return
      }
    }
    
    updated[index] = window
    setSendingWindows(updated)
  }, [sendingWindows, isValidTimeWindow])

  // Map UI action types to backend enum values
  const mapActionType = (uiActionType: string): string | null => {
    const actionTypeMap: Record<string, string> = {
      'view-profile': 'view_profile',
      'like-post': 'like_post',
      'connection-request': 'send_connection_request',
      'send-message': 'send_message',
      'send-inmail': 'send_inmail',
      'rescind-connection-request': 'withdraw_connection',
    }
    return actionTypeMap[uiActionType] || null
  }

  // Reverse map: backend enum to UI action type
  const reverseMapActionType = (backendActionType: string): string | null => {
    const reverseMap: Record<string, string> = {
      'view_profile': 'view-profile',
      'like_post': 'like-post',
      'send_connection_request': 'connection-request',
      'send_message': 'send-message',
      'send_inmail': 'send-inmail',
      'withdraw_connection': 'rescind-connection-request',
    }
    return reverseMap[backendActionType] || null
  }

  // Map condition types
  const mapConditionType = (uiActionType: string): string | null => {
    if (uiActionType === 'if-connection-accepted') {
      return 'connection_accepted'
    }
    // 'if-message-responded' is not in the ConditionTypeEnum, so we'll skip it for now
    return null
  }

  // Reverse map: backend condition type to UI action type
  const reverseMapConditionType = (backendConditionType: string): string | null => {
    if (backendConditionType === 'connection_accepted') {
      return 'if-connection-accepted'
    }
    return null
  }

  // Get action label from action type
  const getActionLabel = (actionType: string): string => {
    const labelMap: Record<string, string> = {
      'view-profile': 'View Profile',
      'like-post': 'Like Post',
      'connection-request': 'Connection Request',
      'send-message': 'Send Message',
      'send-inmail': 'Send InMail',
      'rescind-connection-request': 'Rescind Connection Request',
      'if-connection-accepted': 'If Connection Accepted',
      'if-message-responded': 'If Message Responded',
    }
    return labelMap[actionType] || actionType
  }

  // Build action definitions from the sequence graph
  const buildActionDefinitions = useCallback(() => {
    if (nodes.length === 0 || edges.length === 0) {
      return []
    }

    // Find begin-sequence node
    const beginNode = nodes.find(n => n.id === 'begin-sequence')
    if (!beginNode) {
      return []
    }

    // Build a map of node ID to node for quick lookup
    const nodeMap = new Map(nodes.map(n => [n.id, n]))
    
    // Build a map of source node to outgoing edges
    const outgoingEdges = new Map<string, Edge[]>()
    edges.forEach(edge => {
      if (!outgoingEdges.has(edge.source)) {
        outgoingEdges.set(edge.source, [])
      }
      outgoingEdges.get(edge.source)!.push(edge)
    })

    // Build a map of target node to incoming edge (for finding wait nodes before actions)
    const incomingEdgeMap = new Map<string, Edge>()
    edges.forEach(edge => {
      incomingEdgeMap.set(edge.target, edge)
    })

    // Traverse the graph and collect action nodes in order
    type ActionDefWithTemp = {
      action_type: string | null
      condition_type?: string | null
      next_step_if_true?: number | null
      next_step_if_false?: number | null
      delay_value: number
      delay_unit: string
      json_metadata?: Record<string, unknown> | null
      nodeId: string
      index: number
      _nextTrueNodeId?: string | null
      _nextFalseNodeId?: string | null
    }
    const actionDefinitions: ActionDefWithTemp[] = []

    // Map node IDs to their action definition indices
    const nodeToIndexMap = new Map<string, number>()

    // Helper to find next action node after a given node (skipping wait nodes)
    const findNextActionNode = (currentNodeId: string, branch?: 'yes' | 'no'): string | null => {
      const edgesFromCurrent = outgoingEdges.get(currentNodeId) || []
      
      // Debug logging
      if (branch) {
        console.log(`findNextActionNode(${currentNodeId}, ${branch}):`, {
          edges: edgesFromCurrent.map(e => ({ target: e.target, sourceHandle: e.sourceHandle, branch: e.data?.branch })),
          targetNodes: edgesFromCurrent.map(e => {
            const node = nodeMap.get(e.target)
            return node ? { id: node.id, type: node.type } : null
          })
        })
      }
      
      for (const edge of edgesFromCurrent) {
        // If we're looking for a specific branch, check the sourceHandle (where branch info is stored)
        if (branch && edge.sourceHandle !== branch) {
          continue
        }
        
        const targetNode = nodeMap.get(edge.target)
        if (!targetNode) continue

        // If it's a wait node, continue to its target
        if (targetNode.type === 'waitNode') {
          const result = findNextActionNode(targetNode.id, branch)
          if (result) return result
          continue
        }
        
        // If it's an action or conditional node, return it
        if (targetNode.type === 'actionNode' || targetNode.type === 'conditionalNode') {
          return targetNode.id
        }
      }
      
      return null
    }

    // Helper to get delay from wait node before an action
    const getDelayFromWaitNode = (actionNodeId: string): { value: number; unit: string } => {
      const incomingEdge = incomingEdgeMap.get(actionNodeId)
      if (!incomingEdge) {
        return { value: 0, unit: 'days' }
      }

      const sourceNode = nodeMap.get(incomingEdge.source)
      if (sourceNode?.type === 'waitNode') {
        return {
          value: sourceNode.data.waitValue || 0,
          unit: sourceNode.data.waitUnit || 'days'
        }
      }

      // Check if there's a wait node in the path
      const checkPathForWait = (nodeId: string): { value: number; unit: string } | null => {
        const incoming = incomingEdgeMap.get(nodeId)
        if (!incoming) return null
        
        const source = nodeMap.get(incoming.source)
        if (source?.type === 'waitNode') {
          return {
            value: source.data.waitValue || 0,
            unit: source.data.waitUnit || 'days'
          }
        }
        return checkPathForWait(incoming.source)
      }

      return checkPathForWait(actionNodeId) || { value: 0, unit: 'days' }
    }

    // Traverse starting from begin-sequence
    const visited = new Set<string>()
    const queue: Array<{ nodeId: string }> = [{ nodeId: 'begin-sequence' }]

    while (queue.length > 0) {
      const { nodeId } = queue.shift()!
      
      if (visited.has(nodeId)) continue
      visited.add(nodeId)

      const currentNode = nodeMap.get(nodeId)
      if (!currentNode) continue

      // Skip begin-sequence and wait nodes (wait nodes are handled as delays)
      if (nodeId === 'begin-sequence' || currentNode.type === 'waitNode') {
        // Continue to next nodes
        const edgesFromCurrent = outgoingEdges.get(nodeId) || []
        for (const edge of edgesFromCurrent) {
          if (!visited.has(edge.target)) {
            queue.push({ nodeId: edge.target })
          }
        }
        continue
      }

      // Process action and conditional nodes
      if (currentNode.type === 'actionNode' || currentNode.type === 'conditionalNode') {
        const actionType = currentNode.data.actionType
        
        // Skip end-sequence and unsupported actions
        if (actionType === 'end-sequence' || actionType === 'activate-responder') {
          // Still traverse to mark as visited
          const edgesFromCurrent = outgoingEdges.get(nodeId) || []
          for (const edge of edgesFromCurrent) {
            if (!visited.has(edge.target)) {
              queue.push({ nodeId: edge.target })
            }
          }
          continue
        }

        // Get delay from wait node before this action
        const delay = getDelayFromWaitNode(nodeId)

        // Check if it's a conditional node
        const conditionType = mapConditionType(actionType)
        
        if (conditionType) {
          // It's a conditional node - find the wait nodes in each branch first
          // Branch information is stored in edge.sourceHandle, not edge.data.branch
          const edgesFromConditional = outgoingEdges.get(nodeId) || []
          let yesWaitNodeId: string | null = null
          let noWaitNodeId: string | null = null
          
          for (const edge of edgesFromConditional) {
            // Check sourceHandle for branch info (yes/no)
            const branch = edge.sourceHandle as 'yes' | 'no' | undefined
            if (branch === 'yes') {
              const targetNode = nodeMap.get(edge.target)
              if (targetNode?.type === 'waitNode') {
                yesWaitNodeId = targetNode.id
              }
            } else if (branch === 'no') {
              const targetNode = nodeMap.get(edge.target)
              if (targetNode?.type === 'waitNode') {
                noWaitNodeId = targetNode.id
              }
            }
          }
          
          // Find the action nodes after the wait nodes
          const nextTrueNodeId = yesWaitNodeId ? findNextActionNode(yesWaitNodeId) : null
          const nextFalseNodeId = noWaitNodeId ? findNextActionNode(noWaitNodeId) : null
          
          // Debug logging
          console.log(`Conditional node ${nodeId}:`, {
            yesWaitNodeId,
            noWaitNodeId,
            nextTrueNodeId,
            nextFalseNodeId,
            edgesFromConditional: edgesFromConditional.map(e => ({ source: e.source, target: e.target, sourceHandle: e.sourceHandle, branch: e.data?.branch }))
          })
          
          // Conditional nodes have null action_type
          const actionDef = {
            action_type: null,
            condition_type: conditionType,
            next_step_if_true: null as number | null,
            next_step_if_false: null as number | null,
            delay_value: delay.value,
            delay_unit: delay.unit,
            json_metadata: null,
            nodeId: nodeId,
            index: actionDefinitions.length,
            _nextTrueNodeId: nextTrueNodeId, // Temporary storage - action node ID
            _nextFalseNodeId: nextFalseNodeId // Temporary storage - action node ID
          }
          
          actionDefinitions.push(actionDef)
          nodeToIndexMap.set(nodeId, actionDef.index)
        } else {
          // Regular action node
          const mappedActionType = mapActionType(actionType)
          if (mappedActionType) {
            // Build json_metadata for send_message and send_inmail actions
            let jsonMetadata: Record<string, unknown> | null = null
            if (mappedActionType === 'send_message' || mappedActionType === 'send_inmail') {
              // Store generation parameters instead of actual message
              jsonMetadata = {
                user_instructions: currentNode.data.userInstructions || '',
                context_variables: currentNode.data.contextVariables || {}
              }
              // Add subject_line for InMail only
              if (mappedActionType === 'send_inmail' && currentNode.data.subjectText) {
                jsonMetadata.subject_line = currentNode.data.subjectText
              }
            }

            const actionDef = {
              action_type: mappedActionType,
              condition_type: null,
              next_step_if_true: null,
              next_step_if_false: null,
              delay_value: delay.value,
              delay_unit: delay.unit,
              json_metadata: jsonMetadata,
              nodeId: nodeId,
              index: actionDefinitions.length
            }
            
            actionDefinitions.push(actionDef)
            nodeToIndexMap.set(nodeId, actionDef.index)
          }
        }

        // Continue traversal
        const edgesFromCurrent = outgoingEdges.get(nodeId) || []
        for (const edge of edgesFromCurrent) {
          if (!visited.has(edge.target)) {
            queue.push({ nodeId: edge.target })
          }
        }
      }
    }

    // Debug: log all nodes in map
    console.log('All nodes in nodeToIndexMap:', Array.from(nodeToIndexMap.entries()))
    
    // Resolve next_step indices for conditional nodes
    // We need to do this after all nodes are processed to ensure nodeToIndexMap is complete
    actionDefinitions.forEach(actionDef => {
      if (actionDef.condition_type && actionDef._nextTrueNodeId !== undefined) {
        const nextTrueNodeId = actionDef._nextTrueNodeId
        const nextFalseNodeId = actionDef._nextFalseNodeId
        
        // The stored IDs are action node IDs, so we can directly look them up
        if (nextTrueNodeId) {
          if (nodeToIndexMap.has(nextTrueNodeId)) {
            actionDef.next_step_if_true = nodeToIndexMap.get(nextTrueNodeId)! + 1 // 1-indexed
            console.log(`Resolved next_step_if_true: ${nextTrueNodeId} -> ${actionDef.next_step_if_true}`)
          } else {
            // Debug: log if node not found
            console.warn(`Next true node not found in map: ${nextTrueNodeId}. Available nodes:`, Array.from(nodeToIndexMap.keys()))
          }
        }
        
        if (nextFalseNodeId) {
          if (nodeToIndexMap.has(nextFalseNodeId)) {
            actionDef.next_step_if_false = nodeToIndexMap.get(nextFalseNodeId)! + 1 // 1-indexed
            console.log(`Resolved next_step_if_false: ${nextFalseNodeId} -> ${actionDef.next_step_if_false}`)
          } else {
            // Debug: log if node not found
            console.warn(`Next false node not found in map: ${nextFalseNodeId}. Available nodes:`, Array.from(nodeToIndexMap.keys()))
          }
        }
      }
    })

    // Remove temporary fields and return clean payload with IDs
    return actionDefinitions.map((actionDef, idx) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { nodeId, index, _nextTrueNodeId, _nextFalseNodeId, ...rest } = actionDef
      return {
        id: idx + 1, // 1-indexed ID
        ...rest,
        next_step_if_true: rest.next_step_if_true ?? null,
        next_step_if_false: rest.next_step_if_false ?? null,
      }
    })
  }, [nodes, edges])

  // Prepare campaign payload
  const prepareCampaignPayload = useCallback(() => {
    // Validate required fields
    if (!selectedJobId) {
      console.error('Please select a job posting')
      return null
    }

    if (!selectedLinkedInAccountId && (!linkedInAccounts || linkedInAccounts.length === 0)) {
      console.error('Please select a LinkedIn account')
      return null
    }

    // Use selected LinkedIn account or default to first one
    const linkedInAccountId = selectedLinkedInAccountId || (linkedInAccounts?.[0]?.id ?? null)
    if (!linkedInAccountId) {
      console.error('No LinkedIn account available')
      return null
    }

    // Get job posting for name
    const selectedJob = jobPostings?.find(job => job.id === selectedJobId)
    const campaignName = selectedJob ? `${selectedJob.title} - Campaign` : 'Campaign'

    // Gap value is already in minutes
    const gapMinutes = candidateGapMin

    // Convert time windows from 'HH:MM' format to datetime strings (ISO format)
    // All times are on the same day (today) in 24-hour format, stored as UTC
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    
    const sendingWindowsPayload = sendingWindows
      .filter(window => {
        // Validate that window is valid (24-hour format, same day, end after start)
        return isValidTimeWindow(window.start, window.end)
      })
      .map(window => {
        const [startHours, startMinutes] = window.start.split(':').map(Number)
        const [endHours, endMinutes] = window.end.split(':').map(Number)
        
        // Format hours and minutes with leading zeros
        const startHoursStr = String(startHours).padStart(2, '0')
        const startMinutesStr = String(startMinutes).padStart(2, '0')
        const endHoursStr = String(endHours).padStart(2, '0')
        const endMinutesStr = String(endMinutes).padStart(2, '0')
        
        // Create ISO strings directly in UTC format (YYYY-MM-DDTHH:MM:SS.000Z)
        // This ensures the selected time is preserved exactly as entered
        const window_start_time = `${year}-${month}-${day}T${startHoursStr}:${startMinutesStr}:00.000Z`
        const window_end_time = `${year}-${month}-${day}T${endHoursStr}:${endMinutesStr}:00.000Z`
        
        return {
          window_start_time,
          window_end_time
        }
      })

    // Build action definitions
    const actionDefinitions = buildActionDefinitions()

    // Prepare campaign payload
    const campaignPayload = {
      name: campaignName,
      status: (campaignStatus || 'draft') as 'draft' | 'paused' | 'running',
      fk_linkedin_account_id: linkedInAccountId,
      fk_job_description_id: selectedJobId,
      daily_volume: dailyVolume,
      min_gap_between_scheduling: gapMinutes,
      max_gap_between_scheduling: gapMinutes,
      campaign_sending_windows: sendingWindowsPayload,
      action_definitions: actionDefinitions
    }

    return campaignPayload
  }, [
    selectedJobId,
    selectedLinkedInAccountId,
    campaignStatus,
    linkedInAccounts,
    jobPostings,
    dailyVolume,
    candidateGapMin,
    sendingWindows,
    buildActionDefinitions,
    isValidTimeWindow
  ])

  // Handle saving campaign
  const handleSaveCampaign = useCallback(async () => {
    const payload = prepareCampaignPayload()
    if (!payload) {
      console.error('Invalid campaign payload')
      return
    }

    setIsSavingCampaign(true)
    try {
      const response = await createCampaign(payload)
      console.log('Campaign saved successfully:', response)
      // Update campaign ID and status after successful save
      setCurrentCampaignId(response.id)
      setCampaignStatus((response.status as 'draft' | 'paused' | 'running') || 'draft')
      // You can add a success toast/notification here if needed
    } catch (error) {
      console.error('Failed to save campaign:', error)
      // You can add an error toast/notification here if needed
    } finally {
      setIsSavingCampaign(false)
    }
  }, [prepareCampaignPayload])

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

      {/* LinkedIn Account Selector */}
      {linkedInAccounts && linkedInAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select LinkedIn Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedLinkedInAccountId?.toString() || ''} 
              onValueChange={(value) => {
                setSelectedLinkedInAccountId(value === 'clear-selection' ? null : parseInt(value))
              }}
            >
              <SelectTrigger className={`w-full ${!selectedLinkedInAccountId ? 'border-gray-400 focus:border-gray-600' : ''}`}>
                <SelectValue placeholder={linkedInAccounts[0] ? `${linkedInAccounts[0].email} (default)` : 'No account selected'} />
              </SelectTrigger>
              <SelectContent>
                {selectedLinkedInAccountId && (
                  <SelectItem value="clear-selection">
                    <span className="text-muted-foreground italic">Use default (first account)</span>
                  </SelectItem>
                )}
                {linkedInAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.email} {account.first_name || account.last_name ? `(${account.first_name} ${account.last_name})`.trim() : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Candidates Summary */}
      {selectedJobId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isLoadingCandidates ? (
                <span className="text-muted-foreground">Loading candidates...</span>
              ) : candidatesError ? (
                <span className="text-red-600">Error loading candidates</span>
              ) : (
                `${approvedCount} Approved Candidates`
              )}
            </CardTitle>
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
                // disabled={nodes.length === 0}
                variant="outline"
                className="bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Sequence
              </Button>
              <Button
                onClick={handleSaveCampaign}
                disabled={isSavingCampaign || currentCampaignId !== null}
                variant="outline"
                className="bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingCampaign ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-300">
                <span className="text-sm font-semibold text-gray-900">
                  {campaignStatus === 'running' ? 'Running' : campaignStatus === 'paused' ? 'Paused' : campaignStatus === 'draft' ? 'Draft' : 'Draft'}
                </span>
                <Switch
                  checked={campaignStatus === 'running'}
                  onCheckedChange={async (checked) => {
                    // Only call API if campaign exists
                    if (currentCampaignId) {
                      const previousStatus = campaignStatus
                      const newStatus = checked ? 'running' : 'paused'
                      
                      try {
                        if (checked && previousStatus === 'paused') {
                          // Resuming campaign: paused -> running
                          await resumeCampaign(currentCampaignId)
                          setCampaignStatus('running')
                        } else if (checked && previousStatus === 'draft') {
                          // Starting campaign: draft -> running
                          await startCampaign(currentCampaignId)
                          setCampaignStatus('running')
                        } else if (!checked && previousStatus === 'running') {
                          // Pausing campaign: running -> paused
                          await pauseCampaign(currentCampaignId)
                          setCampaignStatus('paused')
                        } else {
                          // Just update local state if no API call needed
                          setCampaignStatus(newStatus)
                        }
                      } catch (error) {
                        console.error('Failed to update campaign status:', error)
                        // Revert to previous status on error
                        setCampaignStatus(previousStatus || 'draft')
                      }
                    } else {
                      // No campaign exists - prevent status changes
                      if (!currentCampaignId) {
                        console.error('Please save the campaign before changing status')
                        return
                      }
                      setCampaignStatus(checked ? 'running' : 'draft')
                    }
                  }}
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
                        <div>
                          <Label>Sending Windows</Label>
                          <p className="text-xs text-gray-500 mt-0.5">Times are in UTC</p>
                        </div>
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
                        {sendingWindows.map((window, index) => {
                          const isValid = isValidTimeWindow(window.start, window.end)
                          return (
                            <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                              <div className="flex-1 flex items-center gap-2">
                                <div className="flex-1">
                                  <Label htmlFor={`start-${index}`} className="text-xs text-gray-600">Start (24h)</Label>
                                  <Input
                                    id={`start-${index}`}
                                    type="time"
                                    step="60"
                                    value={window.start}
                                    onChange={(e) => handleUpdateTimeWindow(index, 'start', e.target.value)}
                                    className={`bg-white border-gray-300 mt-1 ${!isValid && window.start && window.end ? 'border-red-500' : ''}`}
                                  />
                                </div>
                                <div className="flex-1">
                                  <Label htmlFor={`end-${index}`} className="text-xs text-gray-600">End (24h)</Label>
                                  <Input
                                    id={`end-${index}`}
                                    type="time"
                                    step="60"
                                    value={window.end}
                                    onChange={(e) => handleUpdateTimeWindow(index, 'end', e.target.value)}
                                    className={`bg-white border-gray-300 mt-1 ${!isValid && window.start && window.end ? 'border-red-500' : ''}`}
                                  />
                                </div>
                              </div>
                              {!isValid && window.start && window.end && (
                                <div className="text-xs text-red-500 mt-5">
                                  End must be after start
                                </div>
                              )}
                              {sendingWindows.length > 1 && (
                                <button
                                  onClick={() => handleRemoveTimeWindow(index)}
                                  className="text-gray-400 hover:text-red-600 transition-colors mt-5"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <p className="text-xs text-gray-500">Messages will only be sent within these time windows</p>
                    </div>
                    
                    {/* Candidate Gap Settings */}
                    <div className="space-y-2">
                      <Label>Gap Between Candidates</Label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Label htmlFor="gap-min" className="text-xs text-gray-600">Wait Time (minutes)</Label>
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
                      </div>
                      <p className="text-xs text-gray-500">
                        Wait time between starting sequences for different candidates (e.g., wait {candidateGapMin} minutes)
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
                    
                    // Get current message text from node data (reactive to nodes changes)
                    const currentMessageText = currentNode?.data.messageText || ''
                    const currentSubjectText = currentNode?.data.subjectText || ''

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

                        {/* Context Variables */}
                        <div className="space-y-2">
                          <Label>Context Variables <span className="text-xs text-gray-500">(Required)</span></Label>
                          <div className="grid grid-cols-2 gap-3">
                            {VARIABLE_OPTIONS.map((variable) => (
                              <div key={variable.key} className="flex items-center space-x-2">
                                <Checkbox
                                  id={variable.key}
                                  checked={selectedVariables.includes(variable.key)}
                                  onCheckedChange={() => handleVariableToggle(variable.key)}
                                />
                                <label
                                  htmlFor={variable.key}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {variable.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">
                            Select which candidate data to include in the message generation
                          </p>
                        </div>

                        {/* Generate Button */}
                        <div>
                          <Button
                            onClick={handleGenerateMessage}
                            disabled={!selectedJobId || !selectedLinkedInAccountId || !messageInstructions.trim() || selectedVariables.length === 0 || isGenerating}
                            className="w-full bg-black hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              'Generate Sample Message'
                            )}
                          </Button>
                        </div>

                        {/* Error Display */}
                        {generateError && (
                          <div className="text-sm text-red-600 p-2 bg-red-50 rounded">
                            Error: {generateError instanceof Error ? generateError.message : 'Failed to generate message'}
                          </div>
                        )}

                        {/* Subject (InMail only) */}
                        {actionType === 'send-inmail' && (
                          <div className="space-y-2">
                            <Label htmlFor="subject-text">Subject</Label>
                            <Input
                              id="subject-text"
                              value={currentSubjectText}
                              onChange={(e) => {
                                const newValue = e.target.value
                                if (configureNodeId) {
                                  handleSubjectTextUpdate(configureNodeId, newValue)
                                }
                              }}
                              placeholder="Enter or generate the subject line here"
                              className="bg-gray-50 border-gray-300"
                            />
                            <p className="text-xs text-gray-500">
                              Subject line for the InMail. You can edit it directly or generate from instructions above.
                            </p>
                          </div>
                        )}

                        {/* Generated Output */}
                        <div className="space-y-2">
                          <Label htmlFor="generated-output">Message Text</Label>
                          <Textarea
                            id="generated-output"
                            value={currentMessageText}
                            onChange={(e) => {
                              const newValue = e.target.value
                              if (configureNodeId) {
                                handleMessageTextUpdate(configureNodeId, newValue)
                              }
                            }}
                            placeholder="Enter or generate the message text here"
                            className="min-h-[180px] bg-gray-50 border-gray-300 cursor-text font-mono text-sm"
                          />
                          <p className="text-xs text-gray-500">
                            This message will be sent. You can edit it directly or generate from instructions above.
                          </p>
                        </div>
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
