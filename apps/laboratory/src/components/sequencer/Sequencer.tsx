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
import { Plus, Save, FolderOpen, Trash2 } from 'lucide-react'
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

  const handleActionSelect = useCallback((actionType: ActionType) => {
    if (!insertPosition) return

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
  }, [insertPosition, nodes, handleAddActionClick, updateHasChildren])

  const handleDeleteNode = useCallback((nodeId: string) => {
    // Find all descendant nodes
    const findDescendants = (id: string): string[] => {
      const children = edges.filter(e => e.source === id).map(e => e.target)
      return [id, ...children.flatMap(findDescendants)]
    }

    const nodesToDelete = findDescendants(nodeId)
    
    // Show confirmation
    if (window.confirm(`Delete this node${nodesToDelete.length > 1 ? ` and ${nodesToDelete.length - 1} child node(s)` : ''}?`)) {
      setNodes(prev => prev.filter(n => !nodesToDelete.includes(n.id)))
      setEdges(prev => {
        const newEdges = prev.filter(e => !nodesToDelete.includes(e.source) && !nodesToDelete.includes(e.target))
        // Update hasChildren immediately after deleting edges
        updateHasChildren(newEdges)
        return newEdges
      })
    }
  }, [edges, setNodes, setEdges, updateHasChildren])

  const handleSaveSequence = useCallback(() => {
    const name = prompt('Enter sequence name:')
    if (!name) return

    // Save as logic (node types and connections), NOT coordinates
    const sequenceLogic = {
      name,
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

    alert(`Sequence "${name}" saved successfully!`)
  }, [nodes, edges])

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

  const handleClearSequence = useCallback(() => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to clear the entire sequence? This action cannot be undone.'
    )
    
    if (confirmed) {
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
    }
  }, [setNodes, setEdges, handleAddActionClick, updateHasChildren])

  return (
    <div className="h-full w-full flex flex-col">
      {/* Top Action Bar */}
      <div className="border-b border-gray-300 bg-white p-4 flex items-center gap-3">
        <Button
          onClick={() => {
            setInsertPosition({ parentId: 'start-node' })
            setIsActionModalOpen(true)
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Action
        </Button>
        
        <Button
          onClick={handleSaveSequence}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Sequence
        </Button>

        <Button
          onClick={() => setIsTemplateManagerOpen(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FolderOpen className="h-4 w-4" />
          Load Template
        </Button>

        <Button
          onClick={handleClearSequence}
          variant="outline"
          className="flex items-center gap-2 ml-auto hover:bg-red-50 hover:border-red-300"
        >
          <Trash2 className="h-4 w-4" />
          Clear Sequence
        </Button>
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
    </div>
  )
}

export function Sequencer () {
  return (
    <ReactFlowProvider>
      <div className="h-[calc(100vh-200px)] w-full border border-gray-300 rounded-2xl overflow-hidden shadow-sm">
        <SequencerFlow />
      </div>
    </ReactFlowProvider>
  )
}

