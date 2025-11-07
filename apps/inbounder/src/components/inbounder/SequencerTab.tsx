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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus,
  Trash2,
  X,
  Hourglass,
  Settings,
  Undo,
  Redo,
  Play,
  CheckCircle
} from 'lucide-react'

interface SequencerTabProps {
  onNavigateToSandbox?: () => void
}

type LeadSource = 'instagram' | 'linkedin' | null

const actionTypes = [
  { id: 'test', label: 'Test', icon: Settings },
  { id: 'test-if', label: 'Test If', icon: CheckCircle },
  { id: 'end-sequence', label: 'End Sequence', icon: X }
]

// Begin Sequence is not in the action menu - it's always present

const GRID_SIZE = 50
const START_X = 400
const START_Y = 50

// Column-based grid system for branch positioning
const COLUMN_WIDTH = 300 // Distance between column centers
const CENTER_COLUMN = 5 // Main flow is in column 5 (0-indexed, 10 total columns)
const INITIAL_COLUMN_COUNT = 10 // Start with 10 columns, can expand if needed

// Helper function to convert column index to X position
function columnToX (columnIndex: number): number {
  return START_X + (columnIndex - CENTER_COLUMN) * COLUMN_WIDTH
}

// Helper function to convert X position to column index
function xToColumn (x: number): number {
  return Math.round((x - START_X) / COLUMN_WIDTH) + CENTER_COLUMN
}

// Node height constants (in pixels) - measured from actual rendered heights
const NODE_HEIGHTS = {
  actionWithButton: 108,    // Action node with "Add Next Action" button (including padding/border)
  actionWithoutButton: 64,  // Action node without button (centered content, including padding/border)
  conditionalWithButtons: 108, // Conditional node with Yes/No buttons
  conditionalWithoutButtons: 64, // Conditional node without buttons
  wait: 56                  // Wait node height (including padding/border)
}

// Gap-first approach: define the desired visual gap between boxes
const DESIRED_GAP = 40 // The consistent visual space between the bottom of one box and top of the next

// Helper to get X position for a branch using column-based positioning
function getBranchXPosition(branch: string | undefined, parentX: number): number {
  const parentColumn = xToColumn(parentX)
  
  if (branch === 'yes') {
    // Yes branch goes one column to the left
    return columnToX(parentColumn - 1)
  }
  if (branch === 'no') {
    // No branch goes one column to the right
    return columnToX(parentColumn + 1)
  }
  // If no branch specified, inherit parent's X position (stay in same column)
  return parentX
}

function getIcon(type: string, className = 'h-5 w-5') {
  const props = { className }
  switch (type) {
    case 'begin-sequence':
      return <Play {...props} />
    case 'test':
      return <Settings {...props} />
    case 'test-if':
      return <CheckCircle {...props} />
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
  const isTest = data.actionType === 'test'
  
  // Show configure button for test actions (they can be edited)
  const showConfigureButton = isTest
  
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
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                nodeHandlers.onConfigure?.(data.nodeId)
              }}
              className="text-gray-400 hover:text-gray-900 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              nodeHandlers.onDelete?.(data.nodeId)
            }}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {showAddButton && (
        <Button
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            nodeHandlers.onAddNext?.(undefined, data.nodeId)
          }}
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
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            nodeHandlers.onConfigure?.(data.nodeId)
          }}
          className="text-gray-400 hover:text-gray-900 transition-colors"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
      {showAddButton && (
        <Button
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            nodeHandlers.onAddNext?.(undefined, data.nodeId)
          }}
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
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              nodeHandlers.onDelete?.(data.nodeId)
            }}
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
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                nodeHandlers.onAddNext?.('yes', data.nodeId)
              }}
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
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                nodeHandlers.onAddNext?.('no', data.nodeId)
              }}
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

function SequencerTabInner({ onNavigateToSandbox }: SequencerTabProps) {
  const reactFlowInstance = useReactFlow()
  const [selectedLeadSource, setSelectedLeadSource] = useState<LeadSource>(null)
  const [campaignStatus, setCampaignStatus] = useState<'active' | 'paused'>('paused')
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [pendingBranch, setPendingBranch] = useState<{ branch: string; parentId: string } | null>(null)
  const [pendingParent, setPendingParent] = useState<string | null>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [actionCount, setActionCount] = useState(0)
  const [configureNodeId, setConfigureNodeId] = useState<string | null>(null)
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const isInitialized = useRef(false)
  
  // Sequence settings for Begin Sequence node
  const [dailyVolume, setDailyVolume] = useState(50)
  const [sendingWindows, setSendingWindows] = useState<Array<{ start: string; end: string }>>([
    { start: '09:00', end: '17:00' }
  ])
  const [candidateGapMin, setCandidateGapMin] = useState(3)
  const [candidateGapMax, setCandidateGapMax] = useState(5)
  const [candidateGapUnit, setCandidateGapUnit] = useState<'minutes' | 'hours'>('minutes')
  
  // Test action configuration
  const [testActionConfig, setTestActionConfig] = useState<Record<string, string>>({})
  
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

  // Helper to get column occupancy map from current nodes
  const getColumnOccupancy = useCallback((currentNodes: Node[]): Map<number, Array<{ minY: number; maxY: number; nodeIds: string[] }>> => {
    const occupancy = new Map<number, Array<{ minY: number; maxY: number; nodeIds: string[] }>>()
    
    currentNodes.forEach(node => {
      const column = xToColumn(node.position.x)
      const minY = node.position.y
      const maxY = node.position.y + getNodeHeight(node)
      
      if (!occupancy.has(column)) {
        occupancy.set(column, [])
      }
      
      occupancy.get(column)!.push({ minY, maxY, nodeIds: [node.id] })
    })
    
    return occupancy
  }, [])

  // Helper to check if a column is occupied in a given Y range
  const isColumnOccupiedInRange = useCallback((
    column: number,
    minY: number,
    maxY: number,
    currentNodes: Node[]
  ): boolean => {
    return currentNodes.some(node => {
      const nodeColumn = xToColumn(node.position.x)
      if (nodeColumn !== column) return false
      
      const nodeMinY = node.position.y
      const nodeMaxY = node.position.y + getNodeHeight(node)
      
      // Check for Y overlap
      return maxY > nodeMinY && minY < nodeMaxY
    })
  }, [])

  // Get all nodes in a branch recursively
  const getNodesInBranch = useCallback((rootNodeId: string, currentEdges: Edge[]): string[] => {
    const branchNodeIds = new Set<string>([rootNodeId])
    const queue = [rootNodeId]
    const visited = new Set<string>()
    
    while (queue.length > 0) {
      const currentId = queue.shift()!
      if (visited.has(currentId)) continue
      visited.add(currentId)
      
      // Follow all outgoing edges
      const outgoing = currentEdges.filter(edge => edge.source === currentId)
      outgoing.forEach(edge => {
        branchNodeIds.add(edge.target)
        queue.push(edge.target)
      })
    }
    
    return Array.from(branchNodeIds)
  }, [])

  // Bump nodes to a new column
  const bumpNodesToColumn = useCallback((
    nodeIds: string[],
    targetColumn: number,
    currentNodes: Node[]
  ): Node[] => {
    const updatedNodes = currentNodes.map(node => {
      if (nodeIds.includes(node.id)) {
        return {
          ...node,
          position: {
            ...node.position,
            x: columnToX(targetColumn)
          }
        }
      }
      return node
    })
    
    return updatedNodes
  }, [])

  // Assign columns for new branches and handle bumping
  const assignBranchColumns = useCallback((
    parentNodeId: string,
    yesOrNo: 'yes' | 'no',
    newBranchMinY: number,
    newBranchMaxY: number,
    currentNodes: Node[],
    currentEdges: Edge[]
  ): Node[] => {
    const parentNode = currentNodes.find(n => n.id === parentNodeId)
    if (!parentNode) return currentNodes
    
    const parentColumn = xToColumn(parentNode.position.x)
    const targetColumn = yesOrNo === 'yes' ? parentColumn - 1 : parentColumn + 1
    
    // Check if target column is occupied in the Y range
    const conflictingNodes = currentNodes.filter(node => {
      const nodeColumn = xToColumn(node.position.x)
      if (nodeColumn !== targetColumn) return false
      
      const nodeMinY = node.position.y
      const nodeMaxY = node.position.y + getNodeHeight(node)
      
      // Check for Y overlap with some buffer
      const BUFFER = 50
      return (newBranchMaxY + BUFFER) > nodeMinY && (newBranchMinY - BUFFER) < nodeMaxY
    })
    
    if (conflictingNodes.length === 0) {
      return currentNodes // No conflicts, no bumping needed
    }
    
    // Find all branches that need to be bumped
    const branchesToBump = new Set<string>()
    conflictingNodes.forEach(node => {
      // Find the root of this branch (node that has an incoming edge with yes/no sourceHandle)
      let rootNode: Node | undefined = node
      let currentNodeId: string | undefined = node.id
      const visited = new Set<string>()
      
      while (currentNodeId && !visited.has(currentNodeId)) {
        visited.add(currentNodeId)
        const incomingEdge = currentEdges.find(e => e.target === currentNodeId)
        
        if (!incomingEdge) break
        
        if (incomingEdge.sourceHandle === 'yes' || incomingEdge.sourceHandle === 'no') {
          // This is a branch root
          rootNode = currentNodes.find(n => n.id === currentNodeId)
          break
        }
        
        currentNodeId = incomingEdge.source
      }
      
      if (rootNode) {
        // Add all nodes in this branch
        const branchNodes = getNodesInBranch(rootNode.id, currentEdges)
        branchNodes.forEach(id => branchesToBump.add(id))
      } else {
        // Not part of a branch, just bump the node itself
        branchesToBump.add(node.id)
      }
    })
    
    // Determine bump direction (outward from center)
    const bumpDirection = targetColumn < CENTER_COLUMN ? -1 : 1
    const newColumn = targetColumn + bumpDirection
    
    // Bump the conflicting nodes
    let updatedNodes = bumpNodesToColumn(Array.from(branchesToBump), newColumn, currentNodes)
    
    // Recursively check if the bumped nodes now conflict with others
    // For simplicity, we'll do one pass (can extend to recursive if needed)
    
    return updatedNodes
  }, [getNodesInBranch, bumpNodesToColumn])

  // Helper function to mark nodes with children based on edges
  const markNodesWithChildren = useCallback((nodes: Node[], edges: Edge[]): Node[] => {
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        hasChildren: edges.some(edge => edge.source === node.id && !edge.sourceHandle),
        hasYesChild: edges.some(edge => edge.source === node.id && edge.sourceHandle === 'yes'),
        hasNoChild: edges.some(edge => edge.source === node.id && edge.sourceHandle === 'no')
      }
    }))
  }, [])

  // Initialize with Begin Sequence node - only once on mount
  useEffect(() => {
    if (!isInitialized.current && nodes.length === 0) {
      setNodes([createBeginSequenceNode()])
      setEdges([])
      setActionCount(0)
      isInitialized.current = true
    }
  }, [nodes.length, createBeginSequenceNode, setNodes, setEdges])

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
  }, [nodes, edges, actionCount, historyIndex])

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

  // Helper to get all nodes in a branch starting from a branch root
  const getBranchNodes = useCallback((branchRootNodeId: string, currentEdges: Edge[]): string[] => {
    // Start from the branch root and follow all outgoing edges (excluding those with sourceHandle)
    // This gets all nodes in the branch, including the root
    const branchNodeIds = new Set<string>([branchRootNodeId])
    const queue = [branchRootNodeId]
    const visited = new Set<string>()
    
    while (queue.length > 0) {
      const currentId = queue.shift()!
      if (visited.has(currentId)) continue
      visited.add(currentId)
      
      // Follow outgoing edges that don't have sourceHandle (main flow edges, not branch edges)
      const outgoing = currentEdges.filter(edge => 
        edge.source === currentId && !edge.sourceHandle
      )
      outgoing.forEach(edge => {
        branchNodeIds.add(edge.target)
        queue.push(edge.target)
      })
    }
    
    return Array.from(branchNodeIds)
  }, [])

  // Helper to calculate bounding box for a branch
  const getBranchBoundingBox = useCallback((
    branchRootNodeId: string,
    currentNodes: Node[],
    currentEdges: Edge[]
  ): { minX: number; maxX: number; minY: number; maxY: number; nodeIds: string[] } => {
    const nodeIds = getBranchNodes(branchRootNodeId, currentEdges)
    const branchNodes = currentNodes.filter(n => nodeIds.includes(n.id))
    
    if (branchNodes.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0, nodeIds: [] }
    }
    
    const NODE_WIDTH = 224 // w-56 = 14rem = 224px
    
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    
    branchNodes.forEach(node => {
      const nodeLeft = node.position.x
      const nodeRight = node.position.x + NODE_WIDTH
      const nodeTop = node.position.y
      const nodeBottom = node.position.y + getNodeHeight(node)
      
      minX = Math.min(minX, nodeLeft)
      maxX = Math.max(maxX, nodeRight)
      minY = Math.min(minY, nodeTop)
      maxY = Math.max(maxY, nodeBottom)
    })
    
    return { minX, maxX, minY, maxY, nodeIds }
  }, [getBranchNodes])

  // Helper to find all branches in the graph
  const findAllBranches = useCallback((
    currentNodes: Node[],
    currentEdges: Edge[]
  ): Array<{ rootNodeId: string; boundingBox: { minX: number; maxX: number; minY: number; maxY: number; nodeIds: string[] } }> => {
    // Find all nodes that have incoming edges with sourceHandle 'yes' or 'no'
    const branchRoots = new Set<string>()
    
    currentEdges.forEach(edge => {
      if (edge.sourceHandle === 'yes' || edge.sourceHandle === 'no') {
        branchRoots.add(edge.target)
      }
    })
    
    // Calculate bounding box for each branch
    const branches = Array.from(branchRoots).map(rootNodeId => ({
      rootNodeId,
      boundingBox: getBranchBoundingBox(rootNodeId, currentNodes, currentEdges)
    }))
    
    return branches
  }, [getBranchBoundingBox])

  // Main function to detect and resolve branch collisions
  const detectAndResolveBranchCollisions = useCallback((
    newBranchRootNodeId: string,
    newBranchX: number,
    currentNodes: Node[],
    currentEdges: Edge[]
  ): Node[] => {
    const MIN_HORIZONTAL_GAP = 250 // Minimum gap between branches to prevent overlap
    const MAX_SHIFT_DISTANCE = 1000 // Maximum shift distance from START_X
    const MAX_RECURSION_DEPTH = 3 // Limit recursion to prevent infinite loops

    // Calculate new branch's bounding box
    const newBranchBox = getBranchBoundingBox(newBranchRootNodeId, currentNodes, currentEdges)
    
    if (newBranchBox.nodeIds.length === 0) {
      return currentNodes // No nodes in branch, nothing to check
    }

    // Find all existing branches (excluding the new branch)
    const allBranches = findAllBranches(currentNodes, currentEdges)
    const existingBranches = allBranches.filter(
      branch => branch.rootNodeId !== newBranchRootNodeId
    )

    // Track which branches need to be shifted
    const branchesToShift = new Map<string, number>() // rootNodeId -> offset

    // Check for collisions with existing branches
    existingBranches.forEach(existingBranch => {
      const existingBox = existingBranch.boundingBox
      
      // Check if Y ranges overlap
      const yOverlap = newBranchBox.maxY > existingBox.minY && newBranchBox.minY < existingBox.maxY
      
      if (!yOverlap) {
        return // No Y overlap, no collision
      }

      // Check if X ranges overlap (with gap consideration)
      const xOverlap = (newBranchBox.maxX + MIN_HORIZONTAL_GAP > existingBox.minX) &&
                       (newBranchBox.minX - MIN_HORIZONTAL_GAP < existingBox.maxX)

      if (!xOverlap) {
        return // No X overlap, no collision
      }

      // Calculate required offset
      let offset = 0
      
      if (newBranchBox.maxX <= existingBox.minX) {
        // New branch is to the left, shift existing branch right
        offset = (newBranchBox.maxX + MIN_HORIZONTAL_GAP) - existingBox.minX
      } else if (newBranchBox.minX >= existingBox.maxX) {
        // New branch is to the right, shift existing branch left
        offset = (newBranchBox.minX - MIN_HORIZONTAL_GAP) - existingBox.maxX
      } else {
        // Branches overlap - determine which direction to shift
        const centerNew = (newBranchBox.minX + newBranchBox.maxX) / 2
        const centerExisting = (existingBox.minX + existingBox.maxX) / 2
        
        if (centerNew < centerExisting) {
          // New branch is more to the left, shift existing branch right
          offset = (newBranchBox.maxX + MIN_HORIZONTAL_GAP) - existingBox.minX
        } else {
          // New branch is more to the right, shift existing branch left
          offset = (newBranchBox.minX - MIN_HORIZONTAL_GAP) - existingBox.maxX
        }
      }

      // Store the offset (use max if branch already has an offset)
      const currentOffset = branchesToShift.get(existingBranch.rootNodeId) || 0
      branchesToShift.set(existingBranch.rootNodeId, Math.max(Math.abs(currentOffset), Math.abs(offset)) * (offset > 0 ? 1 : -1))
    })

    // Apply shifts to conflicting branches
    let updatedNodes = currentNodes.map(node => ({ ...node }))
    
    if (branchesToShift.size > 0) {
      branchesToShift.forEach((offset, rootNodeId) => {
        // Get all nodes in this branch
        const branchNodeIds = getBranchNodes(rootNodeId, currentEdges)
        
        // Apply offset to all nodes in the branch
        branchNodeIds.forEach(nodeId => {
          const node = updatedNodes.find(n => n.id === nodeId)
          if (node) {
            const newX = node.position.x + offset
            
            // Enforce bounds (don't shift too far)
            const boundedX = Math.max(
              START_X - MAX_SHIFT_DISTANCE,
              Math.min(START_X + MAX_SHIFT_DISTANCE, newX)
            )
            
            node.position = {
              ...node.position,
              x: boundedX
            }
          }
        })
      })

      // Recursively check for new conflicts (limited depth)
      // Note: For now, we'll do a single pass. Multiple passes can be added if needed.
    }

    return updatedNodes
  }, [getBranchBoundingBox, findAllBranches, getBranchNodes])

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
    // They should be positioned at: parent bottom + DESIRED_GAP
    const targetYForBranchChildren = conditionalNode.position.y + conditionalHeight + DESIRED_GAP

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

  // Find available X position for a new conditional node to avoid conflicts
  const findAvailableXForNewConditional = useCallback((
    parentNode: Node,
    conditionalY: number,
    currentNodes: Node[]
  ): number => {
    const NODE_WIDTH = 224 // w-56 = 14rem = 224px
    const MIN_GAP = 50 // Minimum gap between nodes to prevent visual overlap
    const CHECK_DEPTH = 2000 // How far down to check for conflicts (px)
    
    const parentX = parentNode.position.x
    const parentColumn = xToColumn(parentX)
    const defaultYesX = columnToX(parentColumn - 1)
    const defaultNoX = columnToX(parentColumn + 1)
    
    // Calculate Y range where branches will be
    const checkYStart = conditionalY
    const checkYEnd = conditionalY + CHECK_DEPTH
    
    // Find all existing nodes in the Y range where branches will be
    const nodesInRange = currentNodes.filter(node => {
      const nodeTop = node.position.y
      const nodeBottom = node.position.y + getNodeHeight(node)
      return (nodeBottom > checkYStart && nodeTop < checkYEnd)
    })
    
    // Check if default branch positions conflict with existing nodes
    let hasConflict = false
    let minShiftLeft = 0
    let minShiftRight = 0
    
    nodesInRange.forEach(node => {
      const nodeLeft = node.position.x
      const nodeRight = node.position.x + NODE_WIDTH
      const nodeCenter = node.position.x + NODE_WIDTH / 2
      
      // Check conflict with Yes branch (left)
      const yesBranchLeft = defaultYesX - NODE_WIDTH / 2
      const yesBranchRight = defaultYesX + NODE_WIDTH / 2
      
      if (nodeRight > yesBranchLeft - MIN_GAP && nodeLeft < yesBranchRight + MIN_GAP) {
        hasConflict = true
        // Calculate how much to shift right to avoid conflict
        const shiftNeeded = (nodeRight + MIN_GAP) - yesBranchLeft
        minShiftRight = Math.max(minShiftRight, shiftNeeded)
      }
      
      // Check conflict with No branch (right)
      const noBranchLeft = defaultNoX - NODE_WIDTH / 2
      const noBranchRight = defaultNoX + NODE_WIDTH / 2
      
      if (nodeRight > noBranchLeft - MIN_GAP && nodeLeft < noBranchRight + MIN_GAP) {
        hasConflict = true
        // Calculate how much to shift left to avoid conflict
        const shiftNeeded = noBranchRight + MIN_GAP - nodeLeft
        minShiftLeft = Math.max(minShiftLeft, shiftNeeded)
      }
    })
    
    // If no conflict, use default position
    if (!hasConflict) {
      return parentX
    }
    
    // If both branches have conflicts, choose the direction that requires less shift
    if (minShiftLeft > 0 && minShiftRight > 0) {
      // Choose the direction with smaller shift
      if (minShiftLeft <= minShiftRight) {
        return parentX - minShiftLeft
      } else {
        return parentX + minShiftRight
      }
    }
    
    // If only one direction has conflict, shift in that direction
    if (minShiftLeft > 0) {
      return parentX - minShiftLeft
    }
    
    if (minShiftRight > 0) {
      return parentX + minShiftRight
    }
    
    // Fallback (shouldn't reach here)
    return parentX
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
      const conditionalNodes = updatedNodes.filter(node => node.type === 'conditionalNode')
      
      conditionalNodes.forEach(condNode => {
        const hasYes = condNode.data.hasYesChild
        const hasNo = condNode.data.hasNoChild
        
        const hasOneBranch = (hasYes && !hasNo) || (!hasYes && hasNo)
        
        if (hasOneBranch) {
          const heightIncrease = NODE_HEIGHTS.conditionalWithButtons - NODE_HEIGHTS.conditionalWithoutButtons
          
          const descendants = findAllDescendants(condNode.id, remainingEdges)
          
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
      if (branch && parentId) {
        setPendingBranch({ branch, parentId })
        setPendingParent(null)
      } else if (parentId) {
        setPendingBranch(null)
        setPendingParent(parentId)
      } else {
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
  }, [setNodes, confirmDelete])

  const snapToGrid = (x: number, y: number): [number, number] => {
    return [
      Math.round(x / GRID_SIZE) * GRID_SIZE,
      Math.round(y / GRID_SIZE) * GRID_SIZE
    ]
  }

  // Check if action is available - for test actions, allow adding test or test-if below test
  const isActionAvailable = useCallback((actionId: string, parentId?: string) => {
    // If adding to a test action, allow test and test-if
    if (parentId) {
      const parentNode = nodes.find(n => n.id === parentId)
      if (parentNode?.data.actionType === 'test') {
        return actionId === 'test' || actionId === 'test-if'
      }
    }
    
    // For test-if, allow test actions on branches
    if (actionId === 'test-if') {
      return true
    }
    
    // For test, allow if not adding to a conditional branch
    if (actionId === 'test') {
      return true
    }
    
    // End sequence is always available
    if (actionId === 'end-sequence') {
      return true
    }
    
    return true
  }, [nodes])

  const handleAddAction = useCallback((actionType: { id: string; label: string }) => {
    const isConditional = actionType.id === 'test-if'
    const nodeType = isConditional ? 'conditionalNode' : 'actionNode'
    
    if (nodes.length === 0) {
      // Should not happen - Begin Sequence should always be present
      return
    }
    
    // If only Begin Sequence exists, add first action after it
    if (nodes.length === 1 && nodes[0].id === 'begin-sequence') {
      const beginNode = nodes[0]
      const beginHeight = getNodeHeight(beginNode)
      const beginBottom = beginNode.position.y + beginHeight
      
      const newActionId = `action-${actionCount}`
      
      // Position action directly below Begin Sequence
      const actionY = beginBottom + DESIRED_GAP
      const snappedActionY = Math.round(actionY / GRID_SIZE) * GRID_SIZE
      
      // For conditional nodes, find available X position to avoid conflicts
      let actionX = START_X
      if (isConditional) {
        actionX = findAvailableXForNewConditional(beginNode, snappedActionY, nodes)
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
      
      const edgeToAction: Edge = {
        id: `begin-sequence-${newActionId}`,
        source: 'begin-sequence',
        target: newActionId,
        type: 'default',
        animated: false,
        style: { stroke: '#000', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }
      }
      
      setNodes((nds) => nds.map(n => {
        if (n.id === 'begin-sequence') {
          return {
            ...n,
            data: {
              ...n.data,
              hasChildren: true
            }
          }
        }
        return n
      }).concat([newActionNode]))
      
      setEdges([edgeToAction])
      setActionCount(actionCount + 1)
      setShowActionMenu(false)
      setPendingBranch(null)
      setPendingParent(null)
      
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 400 })
      }, 50)
      return
    }

    // Handle branching from conditional nodes
    if (pendingBranch) {
      const parentNode = nodes.find(n => n.id === pendingBranch.parentId)
      if (!parentNode) {
        return
      }

      const newActionId = `action-${actionCount}`
      const waitNodeId = `wait-${actionCount}`
      
      const isAddingSecondBranch = (pendingBranch.branch === 'yes' && parentNode.data.hasNoChild) ||
                                    (pendingBranch.branch === 'no' && parentNode.data.hasYesChild)
      
      const branchX = getBranchXPosition(pendingBranch.branch, parentNode.position.x)
      
      const parentHeight = isAddingSecondBranch 
        ? NODE_HEIGHTS.conditionalWithoutButtons 
        : getNodeHeight(parentNode)
      const waitNodeHeight = NODE_HEIGHTS.wait
      const actionHeight = isConditional ? NODE_HEIGHTS.conditionalWithButtons : NODE_HEIGHTS.actionWithButton
      
      const waitY = parentNode.position.y + parentHeight + DESIRED_GAP
      const [waitX, snappedWaitY] = snapToGrid(branchX, waitY)

      const actionY = waitY + waitNodeHeight + DESIRED_GAP
      const [actionX, snappedActionY] = snapToGrid(branchX, actionY)
      
      // Calculate Y range for the new branch and check for column conflicts
      const newBranchMinY = snappedWaitY
      const newBranchMaxY = snappedActionY + actionHeight
      
      // Apply column assignment and bumping logic
      const nodesAfterBumping = assignBranchColumns(
        pendingBranch.parentId,
        pendingBranch.branch as 'yes' | 'no',
        newBranchMinY,
        newBranchMaxY,
        nodes,
        edges
      )

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
        labelBgStyle: { fill: '#fff', fillOpacity: 1, stroke: '#000', strokeWidth: 2 },
        // @ts-ignore - bendRadius is a valid property for smoothstep edges but not in types
        bendRadius: 80 // Increased bend radius for smoother, rounded curves
      }

      const edgeToAction: Edge = {
        id: `${waitNodeId}-${newActionId}`,
        source: waitNodeId,
        target: newActionId,
        type: 'default',
        animated: false,
        style: { stroke: '#000', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }
      }

      const branchFlag = pendingBranch.branch === 'yes' ? 'hasYesChild' : 'hasNoChild'
      
      setNodes((nds) => {
        // Start with the bumped nodes
        let updatedNodes = nodesAfterBumping.map(n => {
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

        // Recalculate branch positions for symmetry when adding second branch
        if (isAddingSecondBranch) {
          const newEdges = [...edges, edgeToWait, edgeToAction]
          updatedNodes = recalculateBranchPositions(pendingBranch.parentId, updatedNodes, newEdges)
        }

        return updatedNodes
      })
      
      setEdges((eds) => [...eds, edgeToWait, edgeToAction])
      setActionCount(actionCount + 1)
      setShowActionMenu(false)
      setPendingBranch(null)
      setPendingParent(null)
      
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 400 })
      }, 50)
      return
    }

    // Find the last node in the sequence (the bottom-most node)
    let parentNode: Node | undefined
    
    if (pendingParent) {
      parentNode = nodes.find(n => n.id === pendingParent)
    } else {
      // Find the node with the highest Y position (bottom-most), excluding wait nodes
      const nonWaitNodes = nodes.filter(n => n.type !== 'waitNode')
      parentNode = nonWaitNodes.reduce((last, current) => {
        if (!last) return current
        const lastBottom = last.position.y + getNodeHeight(last)
        const currentBottom = current.position.y + getNodeHeight(current)
        return currentBottom > lastBottom ? current : last
      }, undefined as Node | undefined)
    }
    
    if (!parentNode) {
      return
    }
    
    const parentNodeId = parentNode.id

    const newActionId = `action-${actionCount}`
    
    // Check if parent node is in a branch by following incoming edges
    // A node is in a branch if it or any ancestor has an incoming edge with yes/no sourceHandle
    let isInBranch = false
    let currentNodeId: string | undefined = parentNodeId
    const visited = new Set<string>()
    
    while (currentNodeId && !visited.has(currentNodeId)) {
      visited.add(currentNodeId)
      const incomingEdge = edges.find(e => e.target === currentNodeId)
      if (!incomingEdge) break
      
      // Check if this edge has a branch sourceHandle
      if (incomingEdge.sourceHandle === 'yes' || incomingEdge.sourceHandle === 'no') {
        isInBranch = true
        break
      }
      
      // Continue following the chain (in case parent is an action after a wait node)
      currentNodeId = incomingEdge.source
    }
    
    // If in branch, preserve parent's X position; otherwise use START_X for main flow
    let parentX = isInBranch ? parentNode.position.x : START_X
    
    // Calculate position based on the bottom of the parent node
    const parentHeight = getNodeHeight(parentNode)
    const parentBottom = parentNode.position.y + parentHeight
    
    // Position action node directly below parent
    const actionY = parentBottom + DESIRED_GAP
    const snappedActionY = Math.round(actionY / GRID_SIZE) * GRID_SIZE

    // For conditional nodes, find available X position to avoid conflicts
    if (isConditional) {
      parentX = findAvailableXForNewConditional(parentNode, snappedActionY, nodes)
    }

    const newActionNode: Node = {
      id: newActionId,
      type: nodeType,
      position: { x: parentX, y: snappedActionY },
      data: {
        nodeId: newActionId,
        label: actionType.label,
        actionType: actionType.id
      },
      draggable: false
    }

    // Use straight edges for clean vertical flow
    const edgeToAction: Edge = {
      id: `${parentNodeId}-${newActionId}`,
      source: parentNodeId,
      target: newActionId,
      type: 'default',
      animated: false,
      style: { stroke: '#000', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }
    }

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
    }).concat([newActionNode]))
    
    setEdges((eds) => [...eds, edgeToAction])
    setActionCount(actionCount + 1)
    setShowActionMenu(false)
    setPendingBranch(null)
    setPendingParent(null)
    
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 400 })
    }, 50)
  }, [nodes, edges, actionCount, setNodes, setEdges, pendingBranch, pendingParent, reactFlowInstance, recalculateBranchPositions, assignBranchColumns, findAvailableXForNewConditional])

  const handleClearSequence = useCallback(() => {
    setShowClearConfirm(true)
  }, [])

  const executeClearSequence = useCallback(() => {
    setNodes([createBeginSequenceNode()])
    setEdges([])
    setActionCount(0)
    setShowClearConfirm(false)
    // Reset history
    setHistory([])
    setHistoryIndex(-1)
  }, [setNodes, setEdges, createBeginSequenceNode])

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
      {/* Lead Source Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Lead Source</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedLeadSource || ''} 
            onValueChange={(value) => {
              setSelectedLeadSource(value === 'clear-selection' ? null : value as LeadSource)
            }}
          >
            <SelectTrigger className={`w-full ${!selectedLeadSource ? 'border-gray-400 focus:border-gray-600' : ''}`}>
              <SelectValue placeholder="No lead source selected" />
            </SelectTrigger>
            <SelectContent>
              {selectedLeadSource && (
                <SelectItem value="clear-selection">
                  <span className="text-muted-foreground italic">Clear selection</span>
                </SelectItem>
              )}
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

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
                className="bg-black hover:bg-gray-800 text-white"
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
                  const parentId = pendingBranch?.parentId || pendingParent || undefined
                  const isAvailable = isActionAvailable(action.id, parentId)
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
                type: 'default',
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
                  
                  // Test action configuration
                  if (actionType === 'test') {
                    const currentConfig = testActionConfig[configureNodeId || ''] || ''
                    
                    return (
                      <>
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                          <Settings className="h-5 w-5" />
                          <h3 className="text-lg font-semibold">Test Action</h3>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="test-config">Configuration</Label>
                          <Textarea
                            id="test-config"
                            value={currentConfig}
                            onChange={(e) => setTestActionConfig({
                              ...testActionConfig,
                              [configureNodeId || '']: e.target.value
                            })}
                            placeholder="Enter test action configuration..."
                            className="min-h-[120px] bg-white border-gray-300"
                          />
                          <p className="text-xs text-gray-500">
                            Configure this test action
                          </p>
                        </div>
                      </>
                    )
                  }
                  
                  // Default placeholder for other actions
                  return (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Configuration</h3>
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-xs text-gray-400 text-center">
                          Placeholder for action configuration
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

