'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  ReactFlowProvider,
  Handle,
  Position,
  useReactFlow,
  useUpdateNodeInternals
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus, Minus, Save, FolderOpen, Settings } from 'lucide-react'
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
import { ConfigurationPanel } from './ConfigurationPanel'

const NODE_WIDTH = 240
const WAIT_WIDTH = 120
const PLUS_BUTTON_SIZE = 72

// Test Action Node Component (no plus button inside)
function TestNode ({ data }: { data: any }) {
  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (data.onConfigure) {
      data.onConfigure()
    }
  }

  return (
    <div className="bg-white rounded-lg w-[240px] relative border-2 border-[#EEEEEE] shadow-sm">
      <Handle 
        type="target" 
        position={Position.Top}
        id="target"
        style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
        className="w-4 h-4 bg-gray-500 rounded-full"
      />
      <div className="flex flex-col items-center justify-center p-4 relative">
        <button
          onClick={handleConfigure}
          className="nodrag nopan absolute top-1 right-1 p-1 rounded hover:bg-[#EEEEEE] transition-colors"
          style={{ pointerEvents: 'auto' }}
          title="Configure"
        >
          <Settings className="h-3.5 w-3.5" style={{ color: '#40404C' }} />
        </button>
        <div className="font-semibold text-sm" style={{ color: '#1C1B20' }}>Test Action</div>
        <div className="text-xs" style={{ color: '#777D8D' }}>Node #{data.number}</div>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom}
        id="source"
        style={{ left: '50%', transform: 'translate(-50%, 50%)' }}
        className="w-4 h-4 bg-gray-500 rounded-full"
      />
    </div>
  )
}

// Plus Button Node Component
function PlusButtonNode ({ data }: { data: any }) {
  return (
    <div className="relative" style={{ width: PLUS_BUTTON_SIZE, height: PLUS_BUTTON_SIZE }}>
      <Handle 
        type="target" 
        position={Position.Top}
        id="target"
        style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
        className="w-4 h-4 bg-gray-500 rounded-full"
      />
      <button
        onClick={data.onAdd}
        className="w-full h-full rounded-full border-2 border-[#1C1B20] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
        style={{ width: PLUS_BUTTON_SIZE, height: PLUS_BUTTON_SIZE }}
      >
        <Plus className="h-8 w-8 text-[#1C1B20]" />
      </button>
    </div>
  )
}

// Wait Node Component (smaller, compact)
function WaitNode ({ data }: { data: any }) {
  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (data.onConfigure) {
      data.onConfigure()
    }
  }

  return (
    <div className="bg-gray-100 rounded-md w-[120px] relative border border-[#B9B8C0]">
      <Handle 
        type="target" 
        position={Position.Top}
        id="target"
        style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
        className="w-4 h-4 bg-gray-500 rounded-full"
      />
      <div className="flex flex-col items-center justify-center py-2 px-3 relative">
        <button
          onClick={handleConfigure}
          className="nodrag nopan absolute top-0.5 right-0.5 p-0.5 rounded hover:bg-gray-200 transition-colors"
          style={{ pointerEvents: 'auto' }}
          title="Configure"
        >
          <Settings className="h-3 w-3" style={{ color: '#40404C' }} />
        </button>
        <div className="font-medium text-xs text-gray-600">Wait</div>
        <div className="text-[10px] text-gray-500">Delay</div>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom}
        id="source"
        style={{ left: '50%', transform: 'translate(-50%, 50%)' }}
        className="w-4 h-4 bg-gray-500 rounded-full"
      />
    </div>
  )
}

const nodeTypes = {
  test: TestNode,
  wait: WaitNode,
  plusButton: PlusButtonNode
}

type HistoryState = {
  nodes: Node[]
  edges: Edge[]
  nodeCounter: number
  testNodeCounter: number
}

function SequencerD3Component () {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [nodeCounter, setNodeCounter] = useState(1)
  const [testNodeCounter, setTestNodeCounter] = useState(1)
  const { fitView } = useReactFlow()
  const updateNodeInternals = useUpdateNodeInternals()
  
  // History management for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  // Confirmation dialogs state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  
  // Save/Load dialogs
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveDialogName, setSaveDialogName] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false)
  
  // Configuration
  const [configuringNodeId, setConfiguringNodeId] = useState<string | null>(null)
  
  // Refs to track current state for history
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  const nodeCounterRef = useRef(nodeCounter)
  const testNodeCounterRef = useRef(testNodeCounter)
  
  // Update refs when state changes
  useEffect(() => {
    nodesRef.current = nodes
    edgesRef.current = edges
    nodeCounterRef.current = nodeCounter
    testNodeCounterRef.current = testNodeCounter
  }, [nodes, edges, nodeCounter, testNodeCounter])

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const currentState: HistoryState = {
      nodes: nodesRef.current,
      edges: edgesRef.current,
      nodeCounter: nodeCounterRef.current,
      testNodeCounter: testNodeCounterRef.current
    }
    
    setHistory(prevHistory => {
      // Remove any future history if we're not at the end
      const newHistory = prevHistory.slice(0, historyIndex + 1)
      newHistory.push(currentState)
      
      // Limit history to last 50 states
      if (newHistory.length > 50) {
        newHistory.shift()
      }
      return newHistory
    })
    
    setHistoryIndex(prevIndex => {
      if (historyIndex >= 49) {
        return 49 // Max index when we have 50 items
      }
      return prevIndex + 1
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
      setTestNodeCounter(prevState.testNodeCounter)
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
      setTestNodeCounter(nextState.testNodeCounter)
      setHistoryIndex(nextIndex)
    }
  }, [historyIndex, history, setNodes, setEdges])

  // Initialize with plus button node
  useEffect(() => {
    const initialNode: Node = {
      id: 'plus-button',
      type: 'plusButton',
      position: { x: -PLUS_BUTTON_SIZE / 2, y: 100 },
      data: {
        onAdd: () => handleAddNext('plus-button')
      }
    }
    setNodes([initialNode])
  }, [])

  // Apply vertical layout with equal visual gaps between nodes
  const applyVerticalLayout = useCallback((currentNodes: Node[]) => {
    const startY = 100
    const visualGap = 50 // Equal visual gap between node edges
    const testNodeHeight = 68 // Approximate height of test action nodes
    const waitNodeHeight = 46 // Approximate height of wait nodes
    const plusButtonHeight = PLUS_BUTTON_SIZE
    
    let currentY = startY
    
    return currentNodes.map((node, index) => {
      // Center nodes horizontally based on their type
      let nodeWidth = NODE_WIDTH
      if (node.type === 'wait') {
        nodeWidth = WAIT_WIDTH
      } else if (node.type === 'plusButton') {
        nodeWidth = PLUS_BUTTON_SIZE
      }
      
      const centerX = -nodeWidth / 2
      
      const position = {
        x: centerX,
        y: currentY
      }
      
      // Calculate next Y position based on current node's height + gap
      if (node.type === 'test') {
        currentY += testNodeHeight + visualGap
      } else if (node.type === 'wait') {
        currentY += waitNodeHeight + visualGap
      } else if (node.type === 'plusButton') {
        currentY += plusButtonHeight + visualGap
      }
      
      return {
        ...node,
        position
      }
    })
  }, [])

  // Handle deleting last node (always removes Test + Wait pair)
  const handleDeleteLast = useCallback(() => {
    // Don't delete if only plus button remains
    const nonPlusNodesCheck = nodes.filter(n => n.type !== 'plusButton')
    if (nonPlusNodesCheck.length === 0) return
    
    saveToHistory()
    
    setNodes(currentNodes => {
      // Find the plus button
      const plusButton = currentNodes.find(n => n.type === 'plusButton')
      if (!plusButton) return currentNodes
      
      const withoutPlus = currentNodes.filter(n => n.type !== 'plusButton')
      if (withoutPlus.length === 0) return currentNodes
      
      // Always remove last 2 nodes (Test + Wait pair)
      const updatedNodes = withoutPlus.slice(0, -2)
      
      // If no nodes left, just return plus button
      if (updatedNodes.length === 0) {
        return applyVerticalLayout([plusButton])
      }
      
      // Add plus button back at the end
      const finalNodes = [...updatedNodes, plusButton]
      
      // Apply layout
      return applyVerticalLayout(finalNodes)
    })
    
    setEdges(currentEdges => {
      if (currentEdges.length <= 0) return currentEdges
      
      const nonPlusNodesForEdges = nodes.filter(n => n.type !== 'plusButton')
      
      // If deleting back to just plus button (was 2 nodes: test + wait)
      if (nonPlusNodesForEdges.length === 2) {
        return []
      }
      
      // Always remove 2 edges: (previous→test, test→wait), plus the wait→plus edge
      // Remove edge to plus button first
      const edgesWithoutPlus = currentEdges.filter(
        edge => edge.target !== 'plus-button'
      )
      
      // Remove the last 2 edges (which are: source→test, test→wait)
      const finalEdges = edgesWithoutPlus.slice(0, -2)
      
      // Find what will be the new last wait node and reconnect to plus button
      const remainingAfterDeletion = nonPlusNodesForEdges.slice(0, -2)
      
      if (remainingAfterDeletion.length > 0) {
        // The new last node should be a wait (since all sequences end with test→wait)
        const newLastWait = remainingAfterDeletion[remainingAfterDeletion.length - 1]
        if (newLastWait) {
          const edgeToPlusButton: Edge = {
            id: `e${newLastWait.id}-plus-button`,
            source: newLastWait.id,
            sourceHandle: 'source',
            target: 'plus-button',
            targetHandle: 'target',
            type: 'straight',
            animated: false,
            style: { stroke: '#9ca3af', strokeWidth: 2 }
          }
          return [...finalEdges, edgeToPlusButton]
        }
      }
      
      return finalEdges
    })
    
    // Always deleting test + wait (2 nodes)
    setNodeCounter(prev => Math.max(1, prev - 2))
    setTestNodeCounter(prev => Math.max(1, prev - 1))
    
    setShowDeleteConfirm(false)
  }, [nodes, saveToHistory, applyVerticalLayout])

  // Handle configuring a node
  const handleConfigure = useCallback((nodeId: string) => {
    setConfiguringNodeId(nodeId)
  }, [])

  // Handle adding next node (always adds: test + wait + plus)
  const handleAddNext = useCallback((parentId: string) => {
    saveToHistory()

    setNodes(currentNodes => {
      // Find and remove the plus button temporarily
      const plusButton = currentNodes.find(n => n.type === 'plusButton')
      const withoutPlus = currentNodes.filter(n => n.type !== 'plusButton')
      
      // Check if this is the first test node
      const isFirstNode = withoutPlus.length === 0
      const nextTestNumber = withoutPlus.filter(n => n.type === 'test').length + 1
      const testNodeId = `test-${nextTestNumber}`

      // Create new test node
      const testNode: Node = {
        id: testNodeId,
        type: 'test',
        position: { x: -NODE_WIDTH / 2, y: 100 },
        data: {
          number: nextTestNumber,
          onConfigure: () => handleConfigure(testNodeId),
          config: {}
        }
      }

      // Every node gets: Test → Wait → Plus
      setNodeCounter(prev => prev + 2)
      setTestNodeCounter(prev => prev + 1)
      
      const waitNodeId = `wait-${nextTestNumber}`
      const waitNode: Node = {
        id: waitNodeId,
        type: 'wait',
        position: { x: -WAIT_WIDTH / 2, y: 200 },
        data: {
          onConfigure: () => handleConfigure(waitNodeId),
          config: {}
        }
      }
      
      const updatedPlusButton = {
        ...plusButton!,
        data: {
          onAdd: () => handleAddNext('plus-button')
        }
      }
      
      // Pattern: existing nodes → new test → new wait → plus button
      const allNodes = [...withoutPlus, testNode, waitNode, updatedPlusButton]
      
      // Apply vertical layout
      const layoutedNodes = applyVerticalLayout(allNodes)
      
      return layoutedNodes
    })

    setEdges(currentEdges => {
      // Determine if this is the first node
      const isFirstNode = currentEdges.length === 0
      
      // All nodes follow: Previous Last → New Test → New Wait → Plus
      const testEdges = currentEdges.filter(e => e.source.startsWith('test-'))
      const nextTestNumber = testEdges.length + 1
      
      const waitNodeId = `wait-${nextTestNumber}`
      const testNodeId = `test-${nextTestNumber}`
      
      let sourceId: string
      if (isFirstNode) {
        // First node connects from plus button
        sourceId = 'plus-button'
      } else {
        // Find the source node (what was connected to plus button)
        const plusButtonEdge = currentEdges.find(e => e.target === 'plus-button')
        sourceId = plusButtonEdge ? plusButtonEdge.source : 'plus-button'
      }
      
      // Remove edge to plus button
      const edgesWithoutPlusConnection = currentEdges.filter(
        edge => edge.target !== 'plus-button'
      )

      const edgeToTest: Edge = {
        id: `e${sourceId}-${testNodeId}`,
        source: sourceId,
        sourceHandle: 'source',
        target: testNodeId,
        targetHandle: 'target',
        type: 'straight',
        animated: false,
        style: { stroke: '#9ca3af', strokeWidth: 2 }
      }

      const edgeToWait: Edge = {
        id: `e${testNodeId}-${waitNodeId}`,
        source: testNodeId,
        sourceHandle: 'source',
        target: waitNodeId,
        targetHandle: 'target',
        type: 'straight',
        animated: false,
        style: { stroke: '#9ca3af', strokeWidth: 2 }
      }
      
      const edgeToPlusButton: Edge = {
        id: `e${waitNodeId}-plus-button`,
        source: waitNodeId,
        sourceHandle: 'source',
        target: 'plus-button',
        targetHandle: 'target',
        type: 'straight',
        animated: false,
        style: { stroke: '#9ca3af', strokeWidth: 2 }
      }

      return [...edgesWithoutPlusConnection, edgeToTest, edgeToWait, edgeToPlusButton]
    })
  }, [applyVerticalLayout, saveToHistory, handleConfigure])

  // Fit view once when nodes length changes (combined effect, no animation for better performance)
  useEffect(() => {
    if (nodes.length === 0) return
    
    const timeoutId = setTimeout(() => {
      fitView({ padding: 0.2, duration: 0 })
    }, 50)
    
    return () => clearTimeout(timeoutId)
  }, [nodes.length, fitView])

  // Handle saving configuration
  const handleSaveConfiguration = useCallback((config: any) => {
    setNodes(currentNodes => {
      return currentNodes.map(node => {
        if (node.id === configuringNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config
            }
          }
        }
        return node
      })
    })
    setConfiguringNodeId(null)
  }, [configuringNodeId, setNodes])

  const handleSaveSequence = () => {
    setSaveDialogName('')
    setShowSaveDialog(true)
  }

  const confirmSave = () => {
    if (!saveDialogName.trim()) return

    const sequenceData = {
      name: saveDialogName.trim(),
      nodes: nodes.filter(n => n.type !== 'plusButton').map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
          label: n.data.label,
          number: n.data.number,
          duration: n.data.duration
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
      testNodeCounter,
      savedAt: new Date().toISOString()
    }

    const saved = JSON.parse(localStorage.getItem('sequencer-d3-templates') || '[]')
    saved.push(sequenceData)
    localStorage.setItem('sequencer-d3-templates', JSON.stringify(saved))

    setShowSaveDialog(false)
    setSaveDialogName('')
    setSuccessMessage(`Sequence "${saveDialogName.trim()}" saved successfully!`)
    setShowSuccessMessage(true)
  }

  const handleLoadTemplate = (template: any) => {
    setNodes([])
    setEdges([])

    setTimeout(() => {
      const reconstructedNodes: Node[] = template.nodes.map((n: any) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
          ...n.data,
          onAdd: () => handleAddNext(n.id)
        }
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
      setTestNodeCounter(template.testNodeCounter || 1)

      setTimeout(() => {
        fitView({ padding: 0.2, duration: 300 })
      }, 100)
    }, 50)

    setIsTemplateManagerOpen(false)
  }

  const handleClearSequence = () => {
    saveToHistory()
    
    setNodes([])
    setEdges([])
    setNodeCounter(1)
    setTestNodeCounter(1)
    
    // Clear history since we're starting fresh
    setHistory([])
    setHistoryIndex(-1)
    
    // Re-initialize with plus button after a brief delay
    setTimeout(() => {
      const initialNode: Node = {
        id: 'plus-button',
        type: 'plusButton',
        position: { x: -PLUS_BUTTON_SIZE / 2, y: 100 },
        data: {
          onAdd: () => handleAddNext('plus-button')
        }
      }
      setNodes([initialNode])
    }, 50)
    
    setShowClearConfirm(false)
  }

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1
  const hasNodesToDelete = nodes.filter(n => n.type !== 'plusButton').length > 0

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-white h-[60px]">
        <h3 className="text-lg font-semibold text-[#1C1B20]">Sequence Flow</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const plusButton = nodes.find(n => n.type === 'plusButton')
              if (plusButton?.data?.onAdd) {
                plusButton.data.onAdd()
              }
            }}
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
          nodeTypes={nodeTypes}
          minZoom={0.5}
          maxZoom={2}
        >
          <Background variant={BackgroundVariant.Dots} />
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
        storageKey="sequencer-d3-templates"
      />

      {/* Configuration Panel */}
      {configuringNodeId && (
        <ConfigurationPanel
          nodeId={configuringNodeId}
          node={nodes.find(n => n.id === configuringNodeId)}
          onClose={() => setConfiguringNodeId(null)}
          onSave={handleSaveConfiguration}
        />
      )}
    </div>
  )
}

export function SequencerD3 () {
  return (
    <ReactFlowProvider>
      <div className="h-[calc(100vh-200px)] w-full border border-[#B9B8C0] rounded-2xl overflow-hidden shadow-sm">
        <SequencerD3Component />
      </div>
    </ReactFlowProvider>
  )
}

