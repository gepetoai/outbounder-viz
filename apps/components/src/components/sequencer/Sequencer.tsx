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

function SequencerFlow () {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [selectedNodeForConfig, setSelectedNodeForConfig] = useState<string | null>(null)
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false)
  const [insertPosition, setInsertPosition] = useState<{ parentId: string; branchType?: 'yes' | 'no' } | null>(null)
  const [forceLayout, setForceLayout] = useState(0) // Force layout trigger
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
        hasChildren: false
      }
    }
    setNodes([startNode])
  }, [])

  // Helper function to update hasChildren properties based on current edges
  const updateHasChildren = useCallback((currentEdges: Edge[]) => {
    setNodes(prevNodes => {
      return prevNodes.map(node => {
        const hasChildren = currentEdges.some(edge => edge.source === node.id)
        
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
              hasNoChild
            }
          }
        } else {
          return {
            ...node,
            data: {
              ...node.data,
              hasChildren
            }
          }
        }
      })
    })
  }, [setNodes])

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
        setNodes(layoutedNodes)
        
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
      onEdit: () => setSelectedNodeForConfig(newNodeId),
      onDelete: () => handleDeleteNode(newNodeId),
      onAddAction: handleAddActionClick
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
    // Use straight edges for clean, direct lines
    const newEdge: Edge = {
      id: `edge-${insertPosition.parentId}-${newNodeId}`,
      source: insertPosition.parentId,
      target: newNodeId,
      sourceHandle: insertPosition.branchType || null,
      type: 'straight',
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
          onEdit: () => setSelectedNodeForConfig(n.id),
          onDelete: () => handleDeleteNode(n.id),
          onAddAction: handleAddActionClick,
          hasChildren: false
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

      // Reconstruct edges - use straight for clean, direct lines
      const reconstructedEdges: Edge[] = template.edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle || null,
        type: 'straight',
        animated: false,
        style: { stroke: '#9CA3AF', strokeWidth: 2 }
      }))

      // IMMEDIATELY apply layout before setting state
      const layoutedNodes = applyColaLayout(reconstructedNodes, reconstructedEdges)
      
      setNodes(layoutedNodes)
      setEdges(reconstructedEdges)
      
      // Update hasChildren immediately after loading template
      updateHasChildren(reconstructedEdges)
      
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
          type: 'straight',
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
          hasChildren: false
        }
      }
      setNodes([startNode])
      
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
            setNodes(prev => prev.map(n => 
              n.id === selectedNodeForConfig 
                ? { ...n, data: { ...n.data, config } }
                : n
            ))
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

