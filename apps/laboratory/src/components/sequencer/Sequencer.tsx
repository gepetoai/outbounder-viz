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
  Connection,
  addEdge
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Minus, Save, FolderOpen } from 'lucide-react'
import Image from 'next/image'
import { ActionNode } from './nodes/ActionNode'
import { StartNode } from './nodes/StartNode'
import { ConditionalNode } from './nodes/ConditionalNode'
import { EndNode } from './nodes/EndNode'
import { ActionSelectorModal } from './ActionSelectorModal'
import { ConfigurationPanel } from './ConfigurationPanel'
import { TemplateManager } from './TemplateManager'
import { applyColaLayout } from './layout/colaLayout'
import { actionTypes, type ActionType } from './actionTypes'
import { initializeTestData } from './Sequencer.test-data'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const nodeTypes = {
  start: StartNode,
  action: ActionNode,
  conditional: ConditionalNode,
  end: EndNode
}

// Helper function to check if a node is configured
function isNodeConfigured (actionType: string, config: any): boolean {
  if (!config) return false
  
  switch (actionType) {
    case 'connection-request':
      return !!(config.instructions && config.instructions.trim())
    case 'send-message':
      return !!(config.instructions && config.instructions.trim())
    case 'wait':
      return !!(config.duration && config.duration > 0)
    case 'if-then':
      return !!(config.condition && config.condition.trim())
    case 'update-salesforce':
      // Check if at least one mapping field has a value
      return Object.keys(config).some(key => key.startsWith('mapping_') && config[key] && config[key].trim())
    case 'webhook':
      return !!(config.url && config.url.trim())
    case 'like-post':
      return !!(config.postSelection)
    case 'view-profile':
      return !!(config.timeOfDay)
    case 'rescind-connection':
      return true // No config needed
    case 'end-sequence':
      return true // No config needed
    default:
      return false
  }
}

// Helper function to determine edge type based on node positions
// Use straight edges for vertically aligned nodes, curves for displaced/branching nodes
function updateEdgeTypes (nodes: Node[], edges: Edge[]): Edge[] {
  return edges.map(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)
    
    if (!sourceNode || !targetNode) {
      return edge
    }
    
    // Calculate horizontal distance between nodes
    const horizontalDistance = Math.abs(targetNode.position.x - sourceNode.position.x)
    
    // If nodes are roughly vertically aligned (within 50px), use straight edge
    // Otherwise, use smooth curve for organic feel
    const edgeType = horizontalDistance < 50 ? 'straight' : 'smoothstep'
    
    return {
      ...edge,
      type: edgeType
    }
  })
}

function SequencerFlow () {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [selectedNodeForConfig, setSelectedNodeForConfig] = useState<string | null>(null)
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false)
  const [insertPosition, setInsertPosition] = useState<{ parentId: string; branchType?: 'yes' | 'no' } | null>(null)
  const [forceLayout, setForceLayout] = useState(0) // Force layout trigger
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null) // Track selected node
  const layoutTimeoutRef = useRef<NodeJS.Timeout>()
  const reactFlowInstance = useRef<any>(null)
  
  // Dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null)
  const [deleteMessage, setDeleteMessage] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveDialogName, setSaveDialogName] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  
  // History for undo/redo
  const [history, setHistory] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Initialize test data and start node
  useEffect(() => {
    initializeTestData()
    
    const startNode: Node = {
      id: 'start-node',
      type: 'start',
      position: { x: 400, y: 50 },
      data: { 
        label: 'Start',
        onAddAction: handleAddActionClick,
        hasChildren: false,
        isSelected: false
      }
    }
    setNodes([startNode])
  }, [])

  // Node click handler for selection
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation()
    setSelectedNodeId(node.id)
  }, [])

  // Pane click handler to clear selection
  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  // Helper function to update hasChildren properties based on current edges
  const updateHasChildren = useCallback((currentEdges: Edge[]) => {
    setNodes(prevNodes => {
      return prevNodes.map(node => {
        const hasChildren = currentEdges.some(edge => edge.source === node.id)
        const isSelected = node.id === selectedNodeId
        const isConfigured = node.data.actionType 
          ? isNodeConfigured(node.data.actionType, node.data.config)
          : true // Start node is always "configured"
        
        // For conditional nodes, track yes/no branches separately
        if (node.type === 'conditional') {
          const hasYesChild = currentEdges.some(edge => edge.source === node.id && edge.sourceHandle === 'yes')
          const hasNoChild = currentEdges.some(edge => edge.source === node.id && edge.sourceHandle === 'no')
          
          return {
            ...node,
            data: {
              ...node.data,
              hasChildren,
              hasYesChild,
              hasNoChild,
              isSelected,
              isConfigured
            }
          }
        } else {
          return {
            ...node,
            data: {
              ...node.data,
              hasChildren,
              isSelected,
              isConfigured
            }
          }
        }
      })
    })
  }, [setNodes, selectedNodeId])

  // Update isSelected when selectedNodeId changes
  useEffect(() => {
    setNodes(prevNodes => 
      prevNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          isSelected: node.id === selectedNodeId
        }
      }))
    )
  }, [selectedNodeId, setNodes])

  // Apply WebCola layout whenever nodes/edges change OR when forced
  useEffect(() => {
    if (nodes.length > 0) {
      // Clear existing timeout
      if (layoutTimeoutRef.current) {
        clearTimeout(layoutTimeoutRef.current)
      }

      // Debounce layout updates
      layoutTimeoutRef.current = setTimeout(() => {
        const layoutedNodes = applyColaLayout(nodes, edges)
        const updatedEdges = updateEdgeTypes(layoutedNodes, edges)
        
        setNodes(layoutedNodes)
        setEdges(updatedEdges)
        
        // Auto-fit view after layout with extra padding for + buttons
        setTimeout(() => {
          if (reactFlowInstance.current) {
            reactFlowInstance.current.fitView({ 
              padding: 0.3,
              duration: 800,
              includeHiddenNodes: false
            })
          }
        }, 150)
      }, 100)
    }

    return () => {
      if (layoutTimeoutRef.current) {
        clearTimeout(layoutTimeoutRef.current)
      }
    }
  }, [nodes.length, edges.length, forceLayout])

  const handleAddActionClick = useCallback((parentId: string, branchType?: 'yes' | 'no') => {
    setInsertPosition({ parentId, branchType })
    setIsActionModalOpen(true)
  }, [])

  // Save to history - must be defined before handleActionSelect
  const saveToHistory = useCallback(() => {
    const currentState = { nodes, edges }
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(currentState)
      if (newHistory.length > 50) newHistory.shift()
      return newHistory
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [nodes, edges, historyIndex])

  const handleActionSelect = useCallback((actionType: ActionType) => {
    if (!insertPosition) return

    saveToHistory()

    const newNodeId = `node-${Date.now()}`
    const parentNode = nodes.find(n => n.id === insertPosition.parentId)
    
    if (!parentNode) return

    // Create new node
    const nodeType = actionType.id === 'if-then' ? 'conditional' : actionType.id === 'end-sequence' ? 'end' : 'action'
    
    const baseNodeData = {
      label: actionType.label,
      actionType: actionType.id,
      icon: actionType.icon,
      config: {},
      onEdit: () => {
        setSelectedNodeId(newNodeId)
        setSelectedNodeForConfig(newNodeId)
      },
      onDelete: () => handleDeleteNode(newNodeId),
      onAddAction: handleAddActionClick,
      isSelected: false,
      isConfigured: isNodeConfigured(actionType.id, {})
    }
    
    // For conditional nodes, add branch-specific tracking
    const nodeData = nodeType === 'conditional' ? {
      ...baseNodeData,
      hasYesChild: false,
      hasNoChild: false
    } : baseNodeData
    
    const newNode: Node = {
      id: newNodeId,
      type: nodeType,
      position: { 
        x: parentNode.position.x, 
        y: parentNode.position.y + 150 
      },
      data: nodeData
    }

    // Create edge from parent to new node
    const newEdge: Edge = {
      id: `edge-${insertPosition.parentId}-${newNodeId}`,
      source: insertPosition.parentId,
      target: newNodeId,
      sourceHandle: insertPosition.branchType || null,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#9CA3AF', strokeWidth: 2 }
    }

    setNodes(prev => [...prev, newNode])
    setEdges(prev => {
      const newEdges = [...prev, newEdge]
      // Update hasChildren immediately after adding edge
      updateHasChildren(newEdges)
      return newEdges
    })
    setIsActionModalOpen(false)
    setInsertPosition(null)
  }, [insertPosition, nodes, handleAddActionClick, updateHasChildren, saveToHistory])

  const handleDeleteNode = useCallback((nodeId: string) => {
    // Find all descendant nodes
    const findDescendants = (id: string): string[] => {
      const children = edges.filter(e => e.source === id).map(e => e.target)
      return [id, ...children.flatMap(findDescendants)]
    }

    const nodesToDelete = findDescendants(nodeId)
    const message = `Delete this node${nodesToDelete.length > 1 ? ` and ${nodesToDelete.length - 1} child node(s)` : ''}?`
    
    setNodeToDelete(nodeId)
    setDeleteMessage(message)
    setShowDeleteConfirm(true)
  }, [edges])

  const confirmDelete = useCallback(() => {
    if (!nodeToDelete) return

    saveToHistory()

    // Find all descendant nodes
    const findDescendants = (id: string): string[] => {
      const children = edges.filter(e => e.source === id).map(e => e.target)
      return [id, ...children.flatMap(findDescendants)]
    }

    const nodesToDelete = findDescendants(nodeToDelete)
    
    setNodes(prev => prev.filter(n => !nodesToDelete.includes(n.id)))
    setEdges(prev => {
      const newEdges = prev.filter(e => !nodesToDelete.includes(e.source) && !nodesToDelete.includes(e.target))
      // Update hasChildren immediately after deleting edges
      updateHasChildren(newEdges)
      return newEdges
    })
    
    setShowDeleteConfirm(false)
    setNodeToDelete(null)
  }, [nodeToDelete, edges, setNodes, setEdges, updateHasChildren, saveToHistory])

  const handleDeleteLastNode = useCallback(() => {
    // Find the last action or conditional node (excluding start and end nodes)
    const deletableNodes = nodes.filter(n => n.type === 'action' || n.type === 'conditional')
    
    if (deletableNodes.length === 0) return
    
    // Get the most recently added deletable node (highest position in array)
    const lastNode = deletableNodes[deletableNodes.length - 1]
    
    if (lastNode) {
      handleDeleteNode(lastNode.id)
    }
  }, [nodes, handleDeleteNode])

  const handleSaveSequence = useCallback(() => {
    setSaveDialogName('')
    setShowSaveDialog(true)
  }, [])

  const confirmSave = useCallback(() => {
    if (!saveDialogName.trim()) return

    // Save as logic (node types and connections), NOT coordinates
    const sequenceLogic = {
      name: saveDialogName.trim(),
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        data: {
          label: n.data.label,
          actionType: n.data.actionType,
          icon: n.data.icon?.name, // Store icon name only
          config: n.data.config
        }
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle
      })),
      savedAt: new Date().toISOString()
    }

    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem('sequencer-templates') || '[]')
    saved.push(sequenceLogic)
    localStorage.setItem('sequencer-templates', JSON.stringify(saved))

    setShowSaveDialog(false)
    setSaveDialogName('')
    setSuccessMessage(`Sequence "${saveDialogName.trim()}" saved successfully!`)
    setShowSuccessMessage(true)
  }, [saveDialogName, nodes, edges])

  const handleLoadTemplate = useCallback((template: any) => {
    // CRITICAL: Clear existing nodes and edges first
    setNodes([])
    setEdges([])
    
    // Small delay to ensure state is cleared, then load and layout
    setTimeout(() => {
      // Reconstruct nodes from logic (not coordinates)
      const reconstructedNodes: Node[] = template.nodes.map((n: any) => {
        const actionType = actionTypes.find(at => at.id === n.data.actionType)
        
        const baseData = {
          label: n.data.label,
          actionType: n.data.actionType,
          icon: actionType?.icon,
          config: n.data.config || {},
          onEdit: () => {
            setSelectedNodeId(n.id)
            setSelectedNodeForConfig(n.id)
          },
          onDelete: () => handleDeleteNode(n.id),
          onAddAction: handleAddActionClick,
          hasChildren: false,
          isSelected: false,
          isConfigured: n.data.actionType 
            ? isNodeConfigured(n.data.actionType, n.data.config || {})
            : true
        }
        
        // For conditional nodes, add branch-specific tracking
        const data = n.type === 'conditional' ? {
          ...baseData,
          hasYesChild: false,
          hasNoChild: false
        } : baseData
        
        return {
          id: n.id,
          type: n.type,
          position: { x: 0, y: 0 }, // Temporary position
          data
        }
      })

      // Reconstruct edges with smooth curves
      const reconstructedEdges: Edge[] = template.edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle || null,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#9CA3AF', strokeWidth: 2 }
      }))

      // IMMEDIATELY apply layout before setting state
      const layoutedNodes = applyColaLayout(reconstructedNodes, reconstructedEdges)
      const updatedEdges = updateEdgeTypes(layoutedNodes, reconstructedEdges)
      
      setNodes(layoutedNodes)
      setEdges(updatedEdges)
      
      // Update hasChildren immediately after loading template
      updateHasChildren(updatedEdges)
      
      // Auto-fit view after a brief delay for render
      setTimeout(() => {
        if (reactFlowInstance.current) {
          reactFlowInstance.current.fitView({ 
            padding: 0.3,
            duration: 800
          })
        }
      }, 200)
    }, 50)
    
    setIsTemplateManagerOpen(false)
  }, [setNodes, setEdges, handleAddActionClick, handleDeleteNode, updateHasChildren])

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(eds => {
        const newEdges = addEdge({
          ...connection,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#9CA3AF', strokeWidth: 2 }
        }, eds)
        // Update hasChildren immediately after connecting
        updateHasChildren(newEdges)
        return newEdges
      })
    },
    [setEdges, updateHasChildren]
  )

  // Wrap onEdgesChange to update hasChildren after any edge changes
  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChange(changes)
    // Update hasChildren after edge changes (like deletions)
    // Use setTimeout to ensure state has updated
    setTimeout(() => {
      setEdges(currentEdges => {
        updateHasChildren(currentEdges)
        return currentEdges
      })
    }, 0)
  }, [onEdgesChange, setEdges, updateHasChildren])

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setNodes(prevState.nodes)
      setEdges(prevState.edges)
      setHistoryIndex(historyIndex - 1)
    }
  }, [historyIndex, history, setNodes, setEdges])

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setNodes(nextState.nodes)
      setEdges(nextState.edges)
      setHistoryIndex(historyIndex + 1)
    }
  }, [historyIndex, history, setNodes, setEdges])

  const handleClearSequence = useCallback(() => {
    setShowClearConfirm(true)
  }, [])

  const confirmClear = useCallback(() => {
    // Clear all edges
    setEdges([])
    
    // Reset to just the Start node
    const startNode: Node = {
      id: 'start-node',
      type: 'start',
      position: { x: 600, y: 100 },
      data: { 
        label: 'Start',
        onAddAction: handleAddActionClick,
        hasChildren: false,
        isSelected: false
      }
    }
    setNodes([startNode])
    setSelectedNodeId(null)
    
    // Update hasChildren with empty edges
    updateHasChildren([])
    
    // Close any open panels
    setSelectedNodeForConfig(null)
    setIsActionModalOpen(false)
    setIsTemplateManagerOpen(false)
    setShowClearConfirm(false)
  }, [setNodes, setEdges, handleAddActionClick, updateHasChildren])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1
  const hasNodesToDelete = nodes.filter(n => n.type === 'action' || n.type === 'conditional').length > 0

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-white h-[60px]">
        <h3 className="text-lg font-semibold text-[#1C1B20]">Sequence Flow</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setInsertPosition({ parentId: 'start-node' })
              setIsActionModalOpen(true)
            }}
            className="w-9 h-9 flex items-center justify-center text-[#1C1B20] bg-white border border-[#1C1B20] rounded-lg hover:bg-gray-50 transition-colors"
            title="Add Action"
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
            onClick={handleDeleteLastNode}
            disabled={!hasNodesToDelete}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
              hasNodesToDelete
                ? 'text-[#1C1B20] bg-white border border-[#1C1B20] hover:bg-gray-50'
                : 'text-gray-400 bg-white border border-gray-300 cursor-not-allowed'
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
            onClick={handleClearSequence}
            className="px-4 py-2 text-sm font-medium text-[#1C1B20] bg-white border border-[#1C1B20] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Sequence
          </button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onInit={(instance) => { reactFlowInstance.current = instance }}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          fitView
          minZoom={0.1}
          maxZoom={2}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E5E7EB" />
          <Controls 
            showInteractive={false}
            className="bg-white border-2 border-gray-900 rounded-lg"
          />
        </ReactFlow>
      </div>

      {/* Action Selector Modal */}
      <ActionSelectorModal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false)
          setInsertPosition(null)
        }}
        onSelect={handleActionSelect}
      />

      {/* Configuration Panel */}
      {selectedNodeForConfig && (
        <ConfigurationPanel
          nodeId={selectedNodeForConfig}
          node={nodes.find(n => n.id === selectedNodeForConfig)}
          onClose={() => setSelectedNodeForConfig(null)}
          onSave={(config) => {
            setNodes(prev => prev.map(n => {
              if (n.id === selectedNodeForConfig) {
                const isConfigured = n.data.actionType 
                  ? isNodeConfigured(n.data.actionType, config)
                  : true
                return { 
                  ...n, 
                  data: { 
                    ...n.data, 
                    config,
                    isConfigured
                  } 
                }
              }
              return n
            }))
            setSelectedNodeForConfig(null)
          }}
        />
      )}

      {/* Template Manager */}
      <TemplateManager
        isOpen={isTemplateManagerOpen}
        onClose={() => setIsTemplateManagerOpen(false)}
        onLoad={handleLoadTemplate}
      />

      {/* Delete Node Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1C1B20]">Delete Node</DialogTitle>
            <DialogDescription className="text-[#777D8D]">
              {deleteMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowDeleteConfirm(false)
                setNodeToDelete(null)
              }}
              variant="outline"
              className="border-[#B9B8C0] text-[#1C1B20] hover:bg-[#F5F5F5]"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-[#1C1B20] text-white hover:opacity-90"
            >
              Delete
            </Button>
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
            <Button
              onClick={() => setShowClearConfirm(false)}
              variant="outline"
              className="border-[#B9B8C0] text-[#1C1B20] hover:bg-[#F5F5F5]"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmClear}
              className="bg-[#1C1B20] text-white hover:opacity-90"
            >
              Clear
            </Button>
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
    </div>
  )
}

export function Sequencer () {
  return (
    <ReactFlowProvider>
      <div className="h-[calc(100vh-200px)] w-full border border-[#B9B8C0] rounded-2xl overflow-hidden shadow-sm">
        <SequencerFlow />
      </div>
    </ReactFlowProvider>
  )
}

