'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  ReactFlowProvider,
  Handle,
  Position,
  useReactFlow,
  Connection
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus, Minus, Save, FolderOpen } from 'lucide-react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@248/ui'
import { TemplateManager } from './TemplateManager'
import { SidePanel } from '@/components/side-panel/SidePanel'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const NODE_WIDTH = 180
const NODE_HEIGHT = 100
const HORIZONTAL_GAP = 100

// Custom Node Component for horizontal flow
function ActionNode ({ data, id }: { data: any; id: string }) {
  const hasNextNode = data.hasNextNode || false
  
  return (
    <div className="bg-white rounded-lg border-2 border-[#1C1B20] shadow-sm relative" style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}>
      <Handle 
        type="target" 
        position={Position.Left}
        id="target"
        style={{ left: 0, top: '50%', transform: 'translate(-50%, -50%)', opacity: 0 }}
        className="w-4 h-4 bg-[#1C1B20] rounded-full border-2 border-white"
      />
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="font-semibold text-base text-[#1C1B20] mb-1">
          Action
        </div>
        <div className="text-xs text-[#777D8D]">
          Node {data.number}
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Right}
        id="source"
        style={{ right: 0, top: '50%', transform: 'translate(50%, -50%)', opacity: 0 }}
        className="w-4 h-4 bg-[#1C1B20] rounded-full border-2 border-white"
      />
      
      {/* Configure button - top right corner inside node */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (data.onConfigure) {
            data.onConfigure(id)
          }
        }}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
        title="Configure node"
      >
        <Image
          src="/icons/gear-dark.svg"
          alt="Configure"
          width={14}
          height={14}
        />
      </button>
      
      {/* Add button - always show if callback exists and no next node */}
      {(!hasNextNode && typeof data.onAdd === 'function') && (
        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation()
              data.onAdd()
            }}
            className="w-6 h-6 rounded-full bg-white border-2 border-[#1C1B20] flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
            title="Add node after this"
          >
            <Plus className="h-3.5 w-3.5 text-[#1C1B20]" />
          </button>
        </div>
      )}
    </div>
  )
}

// If/Else Node Component with two outputs
function IfElseNode ({ data, id }: { data: any; id: string }) {
  // Check if branches have children
  const hasTrueBranch = data.hasTrueBranch || false
  const hasFalseBranch = data.hasFalseBranch || false

  return (
    <div className="bg-[#777D8D] rounded-lg shadow-sm relative" style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}>
      <Handle 
        type="target" 
        position={Position.Left}
        id="target"
        style={{ left: 0, top: '50%', transform: 'translate(-50%, -50%)', opacity: 0 }}
        className="w-4 h-4 bg-white rounded-full border-2 border-[#777D8D]"
      />
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="font-semibold text-base text-white mb-1">
          If/Else
        </div>
        <div className="text-xs text-[#EEEEEE]">
          Branch {data.number}
        </div>
      </div>
      {/* Top source handle for "True" branch */}
      <Handle 
        type="source" 
        position={Position.Right}
        id="source-true"
        style={{ right: 0, top: '30%', transform: 'translate(50%, -50%)', opacity: 0 }}
        className="w-4 h-4 bg-white rounded-full border-2 border-[#777D8D]"
      />
      {/* Bottom source handle for "False" branch */}
      <Handle 
        type="source" 
        position={Position.Right}
        id="source-false"
        style={{ right: 0, top: '70%', transform: 'translate(50%, -50%)', opacity: 0 }}
        className="w-4 h-4 bg-white rounded-full border-2 border-[#777D8D]"
      />
      
      {/* Configure button - top right corner inside node */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (data.onConfigure) {
            data.onConfigure(id)
          }
        }}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center hover:bg-[#40404C] rounded transition-colors"
        title="Configure node"
      >
        <Image
          src="/icons/gear-light.svg"
          alt="Configure"
          width={14}
          height={14}
        />
      </button>
      
      {/* True branch label and add button */}
      <div className="absolute left-full ml-2 top-[30%] transform -translate-y-1/2 flex items-center gap-1.5 z-10">
        <div className="text-xs text-[#777D8D] font-medium whitespace-nowrap">True</div>
        {(!hasTrueBranch && typeof data.onAddTrue === 'function') && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              data.onAddTrue()
            }}
            className="w-6 h-6 rounded-full bg-white border-2 border-[#1C1B20] flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
            title="Add to True branch"
          >
            <Plus className="h-3.5 w-3.5 text-[#1C1B20]" />
          </button>
        )}
      </div>
      
      {/* False branch label and add button */}
      <div className="absolute left-full ml-2 top-[70%] transform -translate-y-1/2 flex items-center gap-1.5 z-10">
        <div className="text-xs text-[#777D8D] font-medium whitespace-nowrap">False</div>
        {(!hasFalseBranch && typeof data.onAddFalse === 'function') && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              data.onAddFalse()
            }}
            className="w-6 h-6 rounded-full bg-white border-2 border-[#1C1B20] flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
            title="Add to False branch"
          >
            <Plus className="h-3.5 w-3.5 text-[#1C1B20]" />
          </button>
        )}
      </div>
    </div>
  )
}

// Input Node (first node)
function InputNode ({ data }: { data: any }) {
  const hasNextNode = data.hasNextNode || false
  
  return (
    <div className="bg-[#1C1B20] rounded-lg shadow-sm relative" style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}>
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="font-semibold text-base text-white mb-1">
          Input
        </div>
        <div className="text-xs text-[#B9B8C0]">
          Start
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Right}
        id="source"
        style={{ right: 0, top: '50%', transform: 'translate(50%, -50%)', opacity: 0 }}
        className="w-4 h-4 bg-white rounded-full border-2 border-[#1C1B20]"
      />
      
      {/* Add button */}
      {(!hasNextNode && typeof data.onAdd === 'function') && (
        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation()
              data.onAdd()
            }}
            className="w-6 h-6 rounded-full bg-white border-2 border-[#1C1B20] flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
            title="Add first node"
          >
            <Plus className="h-3.5 w-3.5 text-[#1C1B20]" />
          </button>
        </div>
      )}
    </div>
  )
}

const nodeTypes = {
  input: InputNode,
  action: ActionNode,
  ifelse: IfElseNode
}

type HistoryState = {
  nodes: Node[]
  edges: Edge[]
  nodeCounter: number
}

function SequencerHorizontalComponent () {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [nodeCounter, setNodeCounter] = useState(1)
  const { fitView } = useReactFlow()
  
  // History management for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  // Confirmation dialogs state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showNodeTypeDialog, setShowNodeTypeDialog] = useState(false)
  const [pendingNodeParent, setPendingNodeParent] = useState<string | null>(null)
  
  // Save/Load dialogs
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveDialogName, setSaveDialogName] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false)
  const [pendingBranch, setPendingBranch] = useState<'true' | 'false' | null>(null)
  
  // Configuration panel state
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false)
  const [configNodeId, setConfigNodeId] = useState<string | null>(null)
  
  // Refs to track current state for history
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  const nodeCounterRef = useRef(nodeCounter)
  
  // Update refs when state changes
  useEffect(() => {
    nodesRef.current = nodes
    edgesRef.current = edges
    nodeCounterRef.current = nodeCounter
  }, [nodes, edges, nodeCounter])

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const currentState: HistoryState = {
      nodes: nodesRef.current,
      edges: edgesRef.current,
      nodeCounter: nodeCounterRef.current
    }
    
    setHistory(prevHistory => {
      setHistoryIndex(prevIndex => {
        // Remove any future history if we're not at the end
        const newHistory = prevHistory.slice(0, prevIndex + 1)
        newHistory.push(currentState)
        
        // Limit history to last 50 states
        if (newHistory.length > 50) {
          newHistory.shift()
          return prevIndex
        } else {
          return prevIndex + 1
        }
      })
      
      // Return updated history
      const newHistory = prevHistory.slice(0, historyIndex + 1)
      newHistory.push(currentState)
      if (newHistory.length > 50) {
        newHistory.shift()
      }
      return newHistory
    })
  }, [historyIndex])

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1
      const prevState = history[prevIndex]
      
      setNodes(prevState.nodes)
      setEdges(prevState.edges)
      setNodeCounter(prevState.nodeCounter)
      setHistoryIndex(prevIndex)
    }
  }, [historyIndex, history, setNodes, setEdges])

  // Redo function
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1
      const nextState = history[nextIndex]
      
      setNodes(nextState.nodes)
      setEdges(nextState.edges)
      setNodeCounter(nextState.nodeCounter)
      setHistoryIndex(nextIndex)
    }
  }, [historyIndex, history, setNodes, setEdges])

  // Initialize with input node
  useEffect(() => {
    const initialNode: Node = {
      id: 'input-1',
      type: 'input',
      position: { x: 100, y: 250 },
      data: { 
        label: 'Input',
        hasNextNode: false
      }
    }
    setNodes([initialNode])
  }, [])

  // Apply horizontal layout with branch support
  const applyHorizontalLayout = useCallback((currentNodes: Node[]) => {
    const startX = 100
    const centerY = 250
    const branchOffset = 150 // Vertical offset for branches
    
    // Build a map of parent-child relationships
    const childrenMap = new Map<string, { nodeId: string; isTrueBranch: boolean }[]>()
    edges.forEach(edge => {
      if (!childrenMap.has(edge.source)) {
        childrenMap.set(edge.source, [])
      }
      childrenMap.get(edge.source)!.push({
        nodeId: edge.target,
        isTrueBranch: edge.sourceHandle === 'source-true'
      })
    })
    
    // Calculate positions using BFS to respect branching
    const positions = new Map<string, { x: number; y: number }>()
    const visited = new Set<string>()
    const queue: { nodeId: string; x: number; y: number; depth: number }[] = []
    
    // Find input node
    const inputNode = currentNodes.find(n => n.type === 'input')
    if (inputNode) {
      queue.push({ nodeId: inputNode.id, x: startX, y: centerY, depth: 0 })
    }
    
    while (queue.length > 0) {
      const { nodeId, x, y, depth } = queue.shift()!
      
      if (visited.has(nodeId)) continue
      visited.add(nodeId)
      positions.set(nodeId, { x, y })
      
      const children = childrenMap.get(nodeId) || []
      const nextX = x + NODE_WIDTH + HORIZONTAL_GAP
      
      if (children.length === 1) {
        // Single child - continue on same level
        queue.push({ nodeId: children[0].nodeId, x: nextX, y, depth: depth + 1 })
      } else if (children.length === 2) {
        // Branching node - position children above and below
        const trueChild = children.find(c => c.isTrueBranch)
        const falseChild = children.find(c => !c.isTrueBranch)
        
        if (trueChild) {
          queue.push({ nodeId: trueChild.nodeId, x: nextX, y: y - branchOffset, depth: depth + 1 })
        }
        if (falseChild) {
          queue.push({ nodeId: falseChild.nodeId, x: nextX, y: y + branchOffset, depth: depth + 1 })
        }
      }
    }
    
    // Apply calculated positions
    return currentNodes.map(node => ({
      ...node,
      position: positions.get(node.id) || node.position
    }))
  }, [edges])

  // Open node type selection dialog
  const handleAddNode = useCallback(() => {
    // Find the last node to use as parent
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1]
      setPendingNodeParent(lastNode.id)
      setPendingBranch(null) // No specific branch for regular add
      setShowNodeTypeDialog(true)
    }
  }, [nodes])

  // Open dialog for adding to specific branch or after a regular node
  const handleAddToBranch = useCallback((nodeId: string, branch: 'true' | 'false' | null) => {
    setPendingNodeParent(nodeId)
    setPendingBranch(branch)
    setShowNodeTypeDialog(true)
  }, [])

  // Handle opening configuration panel
  const handleConfigureNode = useCallback((nodeId: string) => {
    setConfigNodeId(nodeId)
    setIsConfigPanelOpen(true)
  }, [])

  // Handle closing configuration panel
  const handleCloseConfigPanel = useCallback(() => {
    setIsConfigPanelOpen(false)
    setConfigNodeId(null)
  }, [])

  // Handle adding action node
  const handleAddActionNode = useCallback(() => {
    if (!pendingNodeParent) return
    
    saveToHistory()

    const newNodeId = `node-${nodeCounter}`

    setNodes(currentNodes => {
      const newNode: Node = {
        id: newNodeId,
        type: 'action',
        position: { x: 0, y: 0 },
        data: {
          number: nodeCounter,
          hasNextNode: false
        }
      }

      const updatedNodes = [...currentNodes, newNode]
      
      setNodeCounter(prev => prev + 1)
      
      return updatedNodes
    })

    setEdges(currentEdges => {
      const newNodeId = `node-${nodeCounter}`
      const parentNode = nodes.find(n => n.id === pendingNodeParent)
      
      if (!parentNode) return currentEdges

      // Determine source handle based on parent type and pending branch
      let sourceHandle = 'source'
      if (parentNode.type === 'ifelse') {
        sourceHandle = pendingBranch === 'false' ? 'source-false' : 'source-true'
      }

      const newEdge: Edge = {
        id: `e${pendingNodeParent}-${newNodeId}`,
        source: pendingNodeParent,
        sourceHandle,
        target: newNodeId,
        targetHandle: 'target',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#1C1B20', strokeWidth: 2 }
      }

      return [...currentEdges, newEdge]
    })

    setShowNodeTypeDialog(false)
    setPendingNodeParent(null)
    setPendingBranch(null)
  }, [nodes, nodeCounter, pendingNodeParent, pendingBranch, saveToHistory, setNodes, setEdges])

  // Handle adding if/else node
  const handleAddIfElseNode = useCallback(() => {
    if (!pendingNodeParent) return
    
    saveToHistory()

    const newNodeId = `ifelse-${nodeCounter}`
    
    setNodes(currentNodes => {
      const newNode: Node = {
        id: newNodeId,
        type: 'ifelse',
        position: { x: 0, y: 0 },
        data: {
          number: nodeCounter,
          hasTrueBranch: false,
          hasFalseBranch: false
        }
      }

      const updatedNodes = [...currentNodes, newNode]
      
      setNodeCounter(prev => prev + 1)
      
      return updatedNodes
    })

    setEdges(currentEdges => {
      const newNodeId = `ifelse-${nodeCounter}`
      const parentNode = nodes.find(n => n.id === pendingNodeParent)
      
      if (!parentNode) return currentEdges

      // Determine source handle based on parent type and pending branch
      let sourceHandle = 'source'
      if (parentNode.type === 'ifelse') {
        sourceHandle = pendingBranch === 'false' ? 'source-false' : 'source-true'
      }

      const newEdge: Edge = {
        id: `e${pendingNodeParent}-${newNodeId}`,
        source: pendingNodeParent,
        sourceHandle,
        target: newNodeId,
        targetHandle: 'target',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#1C1B20', strokeWidth: 2 }
      }

      return [...currentEdges, newEdge]
    })

    setShowNodeTypeDialog(false)
    setPendingNodeParent(null)
    setPendingBranch(null)
  }, [nodes, nodeCounter, pendingNodeParent, pendingBranch, saveToHistory, setNodes, setEdges])

  // Handle deleting last node
  const handleDeleteLast = useCallback(() => {
    if (nodes.length <= 1) return // Don't delete the input node
    
    saveToHistory()
    
    setNodes(currentNodes => {
      const updatedNodes = currentNodes.slice(0, -1)
      return applyHorizontalLayout(updatedNodes)
    })
    
    setEdges(currentEdges => {
      if (currentEdges.length === 0) return currentEdges
      return currentEdges.slice(0, -1)
    })
    
    setNodeCounter(prev => Math.max(1, prev - 1))
    setShowDeleteConfirm(false)
  }, [nodes, saveToHistory, applyHorizontalLayout])

  // Handle clear sequence
  const handleSaveSequence = useCallback(() => {
    setSaveDialogName('')
    setShowSaveDialog(true)
  }, [])

  const confirmSave = useCallback(() => {
    if (!saveDialogName.trim()) return

    const sequenceData = {
      name: saveDialogName.trim(),
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
          label: n.data.label,
          number: n.data.number
        }
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle
      })),
      nodeCounter,
      savedAt: new Date().toISOString()
    }

    const saved = JSON.parse(localStorage.getItem('sequencer-horizontal-templates') || '[]')
    saved.push(sequenceData)
    localStorage.setItem('sequencer-horizontal-templates', JSON.stringify(saved))

    setShowSaveDialog(false)
    setSaveDialogName('')
    setSuccessMessage(`Sequence "${saveDialogName.trim()}" saved successfully!`)
    setShowSuccessMessage(true)
  }, [saveDialogName, nodes, edges, nodeCounter])

  const handleLoadTemplate = useCallback((template: any) => {
    setNodes([])
    setEdges([])

    setTimeout(() => {
      const reconstructedNodes: Node[] = template.nodes.map((n: any) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data
      }))

      const reconstructedEdges: Edge[] = template.edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle || null,
        targetHandle: e.targetHandle || null,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#1C1B20', strokeWidth: 2 }
      }))

      setNodes(reconstructedNodes)
      setEdges(reconstructedEdges)
      setNodeCounter(template.nodeCounter || 1)

      setTimeout(() => {
        fitView({ padding: 0.2, duration: 300 })
      }, 100)
    }, 50)

    setIsTemplateManagerOpen(false)
  }, [setNodes, setEdges, fitView])

  const handleClearSequence = useCallback(() => {
    saveToHistory()
    
    setNodes([])
    setEdges([])
    setNodeCounter(1)
    
    // Clear history since we're starting fresh
    setHistory([])
    setHistoryIndex(-1)
    
    // Re-initialize with input node after a brief delay
    setTimeout(() => {
      const initialNode: Node = {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 250 },
        data: { 
          label: 'Input',
          hasNextNode: false
        }
      }
      setNodes([initialNode])
    }, 50)
    
    setShowClearConfirm(false)
  }, [saveToHistory])

  // Handle connection
  const onConnect = useCallback(
    (params: Connection) => {
      saveToHistory()
      setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true, style: { stroke: '#1C1B20', strokeWidth: 2 } }, eds))
    },
    [saveToHistory, setEdges]
  )

  // Update node data with callbacks and branch status
  useEffect(() => {
    if (nodes.length === 0) return
    
    setNodes(currentNodes => {
      const updatedNodes = currentNodes.map(node => {
        if (node.type === 'ifelse') {
          // Check if this node has children on each branch
          const hasTrueBranch = edges.some(e => e.source === node.id && e.sourceHandle === 'source-true')
          const hasFalseBranch = edges.some(e => e.source === node.id && e.sourceHandle === 'source-false')
          
          // Always ensure callbacks are present
          return {
            ...node,
            data: {
              ...node.data,
              hasTrueBranch,
              hasFalseBranch,
              onAddTrue: () => handleAddToBranch(node.id, 'true'),
              onAddFalse: () => handleAddToBranch(node.id, 'false'),
              onConfigure: handleConfigureNode
            }
          }
        } else if (node.type === 'action') {
          // Check if this action node has a next node
          const hasNextNode = edges.some(e => e.source === node.id)
          
          // Always ensure callbacks are present
          return {
            ...node,
            data: {
              ...node.data,
              hasNextNode,
              onAdd: () => handleAddToBranch(node.id, null),
              onConfigure: handleConfigureNode
            }
          }
        } else if (node.type === 'input') {
          // Check if this input node has a next node
          const hasNextNode = edges.some(e => e.source === node.id)
          
          // Always ensure callback is present
          return {
            ...node,
            data: {
              ...node.data,
              hasNextNode,
              onAdd: () => handleAddToBranch(node.id, null)
            }
          }
        }
        return node
      })
      
      return updatedNodes
    })
  }, [edges, nodes.length, handleAddToBranch, handleConfigureNode, setNodes])

  // Recalculate layout when edges change  
  useEffect(() => {
    if (nodes.length === 0) return
    
    setNodes(currentNodes => {
      const layoutedNodes = applyHorizontalLayout(currentNodes)
      // Only update if positions actually changed
      const hasChanged = currentNodes.some((node, idx) => {
        const layoutedNode = layoutedNodes[idx]
        return layoutedNode && (
          node.position.x !== layoutedNode.position.x ||
          node.position.y !== layoutedNode.position.y
        )
      })
      
      // Preserve callbacks in the node data
      return hasChanged ? layoutedNodes : currentNodes
    })
  }, [edges, applyHorizontalLayout])

  // Auto-fit view whenever nodes change
  useEffect(() => {
    if (nodes.length === 0) return
    
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 })
    }, 100)
  }, [nodes.length, fitView])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1
  const hasNodesToDelete = nodes.length > 1

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-white h-[60px]">
        <h3 className="text-lg font-semibold text-[#1C1B20]">Sequence Flow</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddNode}
            className="w-9 h-9 flex items-center justify-center text-[#1C1B20] bg-white border border-[#1C1B20] rounded-lg hover:bg-gray-50 transition-colors"
            title="Add Node"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={handleSaveSequence}
            className="w-9 h-9 flex items-center justify-center text-[#1C1B20] bg-white border border-[#1C1B20] rounded-lg hover:bg-gray-50 transition-colors"
            title="Save Sequence"
          >
            <Save className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsTemplateManagerOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-[#1C1B20] bg-white border border-[#1C1B20] rounded-lg hover:bg-gray-50 transition-colors"
            title="Load Template"
          >
            <FolderOpen className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={!hasNodesToDelete}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
              !hasNodesToDelete
                ? 'text-gray-400 bg-white border border-gray-300 cursor-not-allowed'
                : 'text-[#1C1B20] bg-white border border-[#1C1B20] hover:bg-gray-50'
            }`}
            title="Delete Last Node"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
              canUndo
                ? 'text-[#1C1B20] bg-white border border-[#1C1B20] hover:bg-gray-50'
                : 'text-gray-400 bg-white border border-gray-300 cursor-not-allowed'
            }`}
            title="Undo"
          >
            <Image
              src="/icons/arrow-left-dark.svg"
              alt="Undo"
              width={16}
              height={16}
              className={!canUndo ? 'opacity-40' : ''}
            />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
              canRedo
                ? 'text-[#1C1B20] bg-white border border-[#1C1B20] hover:bg-gray-50'
                : 'text-gray-400 bg-white border border-gray-300 cursor-not-allowed'
            }`}
            title="Redo"
          >
            <Image
              src="/icons/arrow-right-dark.svg"
              alt="Redo"
              width={16}
              height={16}
              className={!canRedo ? 'opacity-40' : ''}
            />
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 text-sm font-medium text-[#1C1B20] bg-white border border-[#1C1B20] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Sequence
          </button>
        </div>
      </div>

      {/* ReactFlow Container */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          minZoom={0.5}
          maxZoom={2}
          fitView
          attributionPosition="bottom-left"
        >
          <Background variant={BackgroundVariant.Dots} color="#B9B8C0" gap={16} size={1} />
          <Controls />
        </ReactFlow>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1C1B20]">Delete Last Node</DialogTitle>
            <DialogDescription className="text-[#777D8D]">
              Are you sure you want to delete the last node in the sequence? This action can be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-[#1C1B20] bg-white border border-[#B9B8C0] rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteLast}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1C1B20] rounded-lg hover:opacity-90 transition-opacity"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Sequence Confirmation Dialog */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1C1B20]">Clear Sequence</DialogTitle>
            <DialogDescription className="text-[#777D8D]">
              Are you sure you want to clear the entire sequence? This will remove all nodes and reset the flow. This action can be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-[#1C1B20] bg-white border border-[#B9B8C0] rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleClearSequence}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1C1B20] rounded-lg hover:opacity-90 transition-opacity"
            >
              Clear
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Node Type Selection Dialog */}
      <Dialog open={showNodeTypeDialog} onOpenChange={setShowNodeTypeDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1C1B20]">
              Add Node{pendingBranch && ` to ${pendingBranch === 'true' ? 'True' : 'False'} Branch`}
            </DialogTitle>
            <DialogDescription className="text-[#777D8D]">
              {pendingBranch 
                ? `Select the type of node you want to add to the ${pendingBranch === 'true' ? 'True' : 'False'} branch.`
                : 'Select the type of node you want to add to the sequence.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Action Node Option */}
            <button
              onClick={handleAddActionNode}
              className="flex flex-col items-center justify-center p-6 border-2 border-[#1C1B20] rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="w-16 h-16 bg-white border-2 border-[#1C1B20] rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <div className="text-2xl font-bold text-[#1C1B20]">A</div>
              </div>
              <div className="font-semibold text-[#1C1B20] mb-1">Action</div>
              <div className="text-xs text-[#777D8D] text-center">
                Single path node
              </div>
            </button>

            {/* If/Else Node Option */}
            <button
              onClick={handleAddIfElseNode}
              className="flex flex-col items-center justify-center p-6 border-2 border-[#777D8D] rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="w-16 h-16 bg-[#777D8D] rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <div className="text-2xl font-bold text-white">?</div>
              </div>
              <div className="font-semibold text-[#1C1B20] mb-1">If/Else</div>
              <div className="text-xs text-[#777D8D] text-center">
                Branch into two paths
              </div>
            </button>
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setShowNodeTypeDialog(false)
                setPendingNodeParent(null)
                setPendingBranch(null)
              }}
              className="px-4 py-2 text-sm font-medium text-[#1C1B20] bg-white border border-[#B9B8C0] rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Sequence Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1C1B20]">Save Sequence</DialogTitle>
            <DialogDescription className="text-[#777D8D]">
              Enter a name for your sequence template.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={saveDialogName}
              onChange={(e) => setSaveDialogName(e.target.value)}
              placeholder="Sequence name..."
              className="border-[#B9B8C0] text-[#1C1B20]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && saveDialogName.trim()) {
                  confirmSave()
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowSaveDialog(false)
                setSaveDialogName('')
              }}
              variant="outline"
              className="border-[#B9B8C0] text-[#1C1B20] hover:bg-[#F5F5F5]"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSave}
              disabled={!saveDialogName.trim()}
              className="bg-[#1C1B20] text-white hover:opacity-90 disabled:opacity-50"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Message Dialog */}
      <Dialog open={showSuccessMessage} onOpenChange={setShowSuccessMessage}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1C1B20]">Success</DialogTitle>
            <DialogDescription className="text-[#777D8D]">
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowSuccessMessage(false)}
              className="bg-[#1C1B20] text-white hover:opacity-90"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Manager */}
      <TemplateManager
        isOpen={isTemplateManagerOpen}
        onClose={() => setIsTemplateManagerOpen(false)}
        onLoad={handleLoadTemplate}
        storageKey="sequencer-horizontal-templates"
      />

      {/* Configuration Panel */}
      <SidePanel
        isOpen={isConfigPanelOpen}
        onClose={handleCloseConfigPanel}
        title={`Configure ${configNodeId ? nodes.find(n => n.id === configNodeId)?.type === 'ifelse' ? 'If/Else' : 'Action' : 'Node'}`}
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCloseConfigPanel}
              className="flex-1 border-[#B9B8C0] text-[#1C1B20] hover:bg-[#F5F5F5]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // TODO: Save configuration
                console.log('Configuration saved for node:', configNodeId)
                handleCloseConfigPanel()
              }}
              className="flex-1 bg-[#1C1B20] hover:opacity-90 text-white"
            >
              Save
            </Button>
          </div>
        }
      >
        {configNodeId && (() => {
          const node = nodes.find(n => n.id === configNodeId)
          if (!node) return null

          return (
            <div className="space-y-6">
              {/* Node Info */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#1C1B20]">
                  {node.type === 'ifelse' ? 'If/Else Branch' : 'Action Node'} #{node.data.number}
                </h3>
                <p className="text-sm text-[#777D8D]">
                  Configure the behavior and properties of this node
                </p>
              </div>

              {/* Separator */}
              <div className="w-full h-px bg-[#B9B8C0]" />

              {/* Configuration Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="node-label" style={{ color: '#40404C' }}>
                    Node Label
                  </Label>
                  <Input
                    id="node-label"
                    placeholder="Enter node label..."
                    defaultValue={node.type === 'ifelse' ? 'If/Else' : 'Action'}
                    className="border-[#B9B8C0]"
                  />
                </div>

                {node.type === 'ifelse' && (
                  <div className="space-y-2">
                    <Label htmlFor="condition" style={{ color: '#40404C' }}>
                      Condition
                    </Label>
                    <Input
                      id="condition"
                      placeholder="Enter condition..."
                      className="border-[#B9B8C0]"
                    />
                  </div>
                )}

                {node.type === 'action' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="action-type" style={{ color: '#40404C' }}>
                        Action Type
                      </Label>
                      <Input
                        id="action-type"
                        placeholder="Enter action type..."
                        className="border-[#B9B8C0]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parameters" style={{ color: '#40404C' }}>
                        Parameters
                      </Label>
                      <Textarea
                        id="parameters"
                        placeholder="Enter parameters..."
                        className="border-[#B9B8C0] min-h-[100px]"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description" style={{ color: '#40404C' }}>
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Enter description..."
                    className="border-[#B9B8C0] min-h-[80px]"
                  />
                </div>
              </div>

              {/* Additional Info Section */}
              <div className="space-y-3">
                <h4 className="font-semibold text-[#1C1B20]">
                  Node Information
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#777D8D' }}>Node ID:</span>
                    <span style={{ color: '#40404C' }} className="font-medium font-mono text-xs">{node.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#777D8D' }}>Type:</span>
                    <span style={{ color: '#40404C' }} className="font-medium capitalize">{node.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#777D8D' }}>Position:</span>
                    <span style={{ color: '#40404C' }} className="font-medium font-mono text-xs">
                      ({Math.round(node.position.x)}, {Math.round(node.position.y)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </SidePanel>
    </div>
  )
}

export function SequencerHorizontal () {
  return (
    <ReactFlowProvider>
      <div className="h-[calc(100vh-200px)] w-full border border-[#B9B8C0] rounded-2xl overflow-hidden shadow-sm">
        <SequencerHorizontalComponent />
      </div>
    </ReactFlowProvider>
  )
}

