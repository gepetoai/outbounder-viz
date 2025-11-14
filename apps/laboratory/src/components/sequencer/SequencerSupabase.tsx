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
  useReactFlow,
  applyNodeChanges,
  NodeChange
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus, Minus, Save, FolderOpen } from 'lucide-react'
import Image from 'next/image'
import { SupabaseActionNode } from './nodes/SupabaseActionNode'
import { SupabaseConditionalNode } from './nodes/SupabaseConditionalNode'
import { ConfigurationPanel } from './ConfigurationPanel'
import { TemplateManager } from './TemplateManager'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const NODE_WIDTH = 280
const VERTICAL_SPACING = 150

const nodeTypes = {
  action: SupabaseActionNode,
  conditional: SupabaseConditionalNode
}

function SequencerSupabaseComponent () {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [nodeCounter, setNodeCounter] = useState(1)
  const [actionCounter, setActionCounter] = useState(1)
  const [conditionalCounter, setConditionalCounter] = useState(1)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showNodeTypeDialog, setShowNodeTypeDialog] = useState(false)
  const [pendingBranch, setPendingBranch] = useState<{ nodeId: string; branch: 'yes' | 'no' } | null>(null)
  const [pendingNext, setPendingNext] = useState<string | null>(null)
  const [configuringNodeId, setConfiguringNodeId] = useState<string | null>(null)
  const { fitView } = useReactFlow()
  
  // History for undo/redo
  const [history, setHistory] = useState<Array<{ nodes: Node[]; edges: Edge[]; nodeCounter: number; actionCounter: number; conditionalCounter: number }>>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  // Save/Load dialogs
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveDialogName, setSaveDialogName] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false)

  // Save to history
  const saveToHistory = useCallback(() => {
    const currentState = { nodes, edges, nodeCounter, actionCounter, conditionalCounter }
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(currentState)
      if (newHistory.length > 50) newHistory.shift()
      return newHistory
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [nodes, edges, nodeCounter, actionCounter, conditionalCounter, historyIndex])

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setNodes(prevState.nodes)
      setEdges(prevState.edges)
      setNodeCounter(prevState.nodeCounter)
      setActionCounter(prevState.actionCounter)
      setConditionalCounter(prevState.conditionalCounter)
      setHistoryIndex(historyIndex - 1)
    }
  }, [historyIndex, history, setNodes, setEdges])

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setNodes(nextState.nodes)
      setEdges(nextState.edges)
      setNodeCounter(nextState.nodeCounter)
      setActionCounter(nextState.actionCounter)
      setConditionalCounter(nextState.conditionalCounter)
      setHistoryIndex(historyIndex + 1)
    }
  }, [historyIndex, history, setNodes, setEdges])

  // Track branches for conditional nodes and next nodes for action nodes
  const updateBranchTracking = useCallback((currentEdges: Edge[]) => {
    setNodes(prevNodes => {
      return prevNodes.map(node => {
        if (node.type === 'conditional') {
          const hasYesBranch = currentEdges.some(edge => edge.source === node.id && edge.sourceHandle === 'yes')
          const hasNoBranch = currentEdges.some(edge => edge.source === node.id && edge.sourceHandle === 'no')
          
          return {
            ...node,
            data: {
              ...node.data,
              hasYesBranch,
              hasNoBranch
            }
          }
        } else if (node.type === 'action') {
          const hasNext = currentEdges.some(edge => edge.source === node.id)
          
          return {
            ...node,
            data: {
              ...node.data,
              hasNext
            }
          }
        }
        return node
      })
    })
  }, [])

  // Apply vertical auto-layout with horizontal spacing for branches
  const applyVerticalLayout = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    const positionedNodes = new Set<string>()
    const nodePositions = new Map<string, { x: number; y: number }>()
    
    // Find root nodes (no incoming edges)
    const rootNodes = currentNodes.filter(node => 
      !currentEdges.some(edge => edge.target === node.id)
    )
    
    // BFS to position nodes
    const queue = rootNodes.map(node => ({ node, x: 0, y: 100 }))
    let maxY = 100
    
    while (queue.length > 0) {
      const { node, x, y } = queue.shift()!
      
      if (positionedNodes.has(node.id)) continue
      
      nodePositions.set(node.id, { x: x - NODE_WIDTH / 2, y })
      positionedNodes.add(node.id)
      maxY = Math.max(maxY, y)
      
      // Find children
      const children = currentEdges.filter(edge => edge.source === node.id)
      
      if (children.length === 1) {
        // Single child - keep vertical
        const child = currentNodes.find(n => n.id === children[0].target)
        if (child && !positionedNodes.has(child.id)) {
          queue.push({ node: child, x, y: y + VERTICAL_SPACING })
        }
      } else if (children.length === 2) {
        // Branch - spread horizontally with more spacing
        const yesChild = currentNodes.find(n => n.id === children.find(e => e.sourceHandle === 'yes')?.target)
        const noChild = currentNodes.find(n => n.id === children.find(e => e.sourceHandle === 'no')?.target)
        
        if (yesChild && !positionedNodes.has(yesChild.id)) {
          queue.push({ node: yesChild, x: x - 350, y: y + VERTICAL_SPACING })
        }
        if (noChild && !positionedNodes.has(noChild.id)) {
          queue.push({ node: noChild, x: x + 350, y: y + VERTICAL_SPACING })
        }
      }
    }
    
    return currentNodes.map((node) => ({
      ...node,
      position: nodePositions.get(node.id) || { x: -NODE_WIDTH / 2, y: 100 }
    }))
  }, [])

  // Handle adding branch to conditional node
  const handleAddBranch = useCallback((nodeId: string, branch: 'yes' | 'no') => {
    setPendingBranch({ nodeId, branch })
    setShowNodeTypeDialog(true)
  }, [])

  // Handle adding next node from action node
  const handleAddNext = useCallback((nodeId: string) => {
    setPendingNext(nodeId)
    setShowNodeTypeDialog(true)
  }, [])

  // Handle configuring a node
  const handleConfigure = useCallback((nodeId: string) => {
    setConfiguringNodeId(nodeId)
  }, [])

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
  }, [configuringNodeId])

  // Handle adding new node
  const handleAddNode = useCallback((nodeType: 'action' | 'conditional') => {
    saveToHistory()
    const newNodeId = `node-${nodeCounter}`
    
    let newNode: Node
    
    if (nodeType === 'action') {
      const handleNextAdd = () => {
        handleAddNext(newNodeId)
      }
      const handleConfigureNode = () => {
        handleConfigure(newNodeId)
      }
      
      newNode = {
        id: newNodeId,
        type: 'action',
        position: { x: 0, y: 0 },
        data: {
          label: 'New Action',
          actionType: 'action',
          number: actionCounter,
          onAddNext: handleNextAdd,
          hasNext: false,
          onConfigure: handleConfigureNode,
          config: {}
        }
      }
      setActionCounter(prev => prev + 1)
    } else {
      const handleBranchAdd = (branch: 'yes' | 'no') => {
        handleAddBranch(newNodeId, branch)
      }
      const handleConfigureNode = () => {
        handleConfigure(newNodeId)
      }
      
      newNode = {
        id: newNodeId,
        type: 'conditional',
        position: { x: 0, y: 0 },
        data: {
          label: 'If/Else Condition',
          number: conditionalCounter,
          onAddBranch: handleBranchAdd,
          hasYesBranch: false,
          hasNoBranch: false,
          onConfigure: handleConfigureNode,
          config: {}
        }
      }
      setConditionalCounter(prev => prev + 1)
    }
    
    setNodeCounter(prev => prev + 1)
    
    setNodes(currentNodes => {
      const allNodes = [...currentNodes, newNode]
      return allNodes
    })
    
    // Create edge from previous node or branch if exists
    setEdges(currentEdges => {
      let sourceNodeId: string | null = null
      let sourceHandle: string | null = null
      
      if (pendingBranch) {
        // Adding to a specific branch
        sourceNodeId = pendingBranch.nodeId
        sourceHandle = pendingBranch.branch
        setPendingBranch(null)
      } else if (pendingNext) {
        // Adding after an action node
        sourceNodeId = pendingNext
        sourceHandle = 'source'
        setPendingNext(null)
      } else if (nodes.length > 0) {
        // Adding to end of sequence
        const previousNode = nodes[nodes.length - 1]
        sourceNodeId = previousNode.id
        sourceHandle = previousNode.type === 'conditional' ? null : 'source'
      }
      
      if (sourceNodeId) {
        const newEdge: Edge = {
          id: `e${sourceNodeId}-${sourceHandle || 'default'}-${newNodeId}`,
          source: sourceNodeId,
          sourceHandle: sourceHandle,
          target: newNodeId,
          targetHandle: 'target',
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: '#40404C', 
            strokeWidth: 2 
          }
        }
        const updatedEdges = [...currentEdges, newEdge]
        
        // Update branch tracking
        setTimeout(() => {
          updateBranchTracking(updatedEdges)
        }, 0)
        
        return updatedEdges
      }
      return currentEdges
    })
    
    setShowNodeTypeDialog(false)
    
    // Fit view after adding node
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 })
    }, 150)
  }, [nodeCounter, actionCounter, conditionalCounter, nodes, pendingBranch, pendingNext, handleAddBranch, handleAddNext, updateBranchTracking, fitView, saveToHistory])
  
  // Update node data with handlers whenever nodes change
  useEffect(() => {
    setNodes(currentNodes => {
      return currentNodes.map(node => {
        if (node.type === 'conditional') {
          const handleBranchAdd = (branch: 'yes' | 'no') => {
            handleAddBranch(node.id, branch)
          }
          const handleConfigureNode = () => {
            handleConfigure(node.id)
          }
          
          return {
            ...node,
            data: {
              ...node.data,
              onAddBranch: handleBranchAdd,
              onConfigure: handleConfigureNode
            }
          }
        } else if (node.type === 'action') {
          const handleNextAdd = () => {
            handleAddNext(node.id)
          }
          const handleConfigureNode = () => {
            handleConfigure(node.id)
          }
          
          return {
            ...node,
            data: {
              ...node.data,
              onAddNext: handleNextAdd,
              onConfigure: handleConfigureNode
            }
          }
        }
        return node
      })
    })
  }, [handleAddBranch, handleAddNext, handleConfigure])

  // Handle deleting last node
  const handleDeleteLast = useCallback(() => {
    if (nodes.length === 0) return
    
    saveToHistory()
    const lastNode = nodes[nodes.length - 1]
    
    setNodes(currentNodes => {
      return currentNodes.filter(n => n.id !== lastNode.id)
    })
    
    setEdges(currentEdges => {
      const updatedEdges = currentEdges.filter(e => e.source !== lastNode.id && e.target !== lastNode.id)
      
      // Update branch tracking
      setTimeout(() => {
        updateBranchTracking(updatedEdges)
      }, 0)
      
      return updatedEdges
    })
    
    // Decrement appropriate counter
    if (lastNode.type === 'action') {
      setActionCounter(prev => Math.max(1, prev - 1))
    } else if (lastNode.type === 'conditional') {
      setConditionalCounter(prev => Math.max(1, prev - 1))
    }
    setNodeCounter(prev => Math.max(1, prev - 1))
  }, [nodes, updateBranchTracking, saveToHistory])

  // Handle clear sequence
  const handleClearSequence = useCallback(() => {
    saveToHistory()
    setNodes([])
    setEdges([])
    setNodeCounter(1)
    setActionCounter(1)
    setConditionalCounter(1)
    setShowClearConfirm(false)
  }, [saveToHistory])

  // Handle save sequence
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
        data: {
          label: n.data.label,
          actionType: n.data.actionType,
          number: n.data.number,
          config: n.data.config
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
      actionCounter,
      conditionalCounter,
      savedAt: new Date().toISOString()
    }

    const saved = JSON.parse(localStorage.getItem('sequencer-supabase-templates') || '[]')
    saved.push(sequenceData)
    localStorage.setItem('sequencer-supabase-templates', JSON.stringify(saved))

    setShowSaveDialog(false)
    setSaveDialogName('')
    setSuccessMessage(`Sequence "${saveDialogName.trim()}" saved successfully!`)
    setShowSuccessMessage(true)
  }, [saveDialogName, nodes, edges, nodeCounter, actionCounter, conditionalCounter])

  const handleLoadTemplate = useCallback((template: any) => {
    setNodes([])
    setEdges([])

    setTimeout(() => {
      const reconstructedNodes: Node[] = template.nodes.map((n: any) => ({
        id: n.id,
        type: n.type,
        position: { x: 0, y: 0 },
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
        style: { stroke: '#40404C', strokeWidth: 2 }
      }))

      setNodes(reconstructedNodes)
      setEdges(reconstructedEdges)
      setNodeCounter(template.nodeCounter || 1)
      setActionCounter(template.actionCounter || 1)
      setConditionalCounter(template.conditionalCounter || 1)

      setTimeout(() => {
        fitView({ padding: 0.2, duration: 300 })
      }, 100)
    }, 50)

    setIsTemplateManagerOpen(false)
  }, [setNodes, setEdges, fitView])

  // Apply layout when nodes or edges change
  useEffect(() => {
    if (nodes.length > 0) {
      const timeoutId = setTimeout(() => {
        setNodes(currentNodes => {
          const layoutedNodes = applyVerticalLayout(currentNodes, edges)
          return layoutedNodes
        })
        fitView({ padding: 0.2, duration: 300 })
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [nodes.length, edges.length, fitView, applyVerticalLayout])

  const hasNodes = nodes.length > 0
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-white h-[60px]">
        <h3 className="text-lg font-semibold text-[#1C1B20]">Sequence Flow</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNodeTypeDialog(true)}
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
            onClick={handleDeleteLast}
            disabled={!hasNodes}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
              hasNodes
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
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 text-sm font-medium text-[#1C1B20] bg-white border border-[#1C1B20] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Sequence
          </button>
        </div>
      </div>

      {/* ReactFlow Container with gradient mask */}
      <div className="flex-1 relative">
        <div
          style={{ 
            maskImage: 'linear-gradient(to right, transparent 1%, black 8%, black 92%, transparent 99%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 1%, black 8%, black 92%, transparent 99%)'
          }}
          className="absolute inset-0"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.5}
            maxZoom={1.5}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            panOnScroll
            panOnScrollSpeed={0.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background 
              gap={16} 
              className="opacity-50"
              variant={BackgroundVariant.Dots}
              style={{ 
                backgroundColor: '#FAFAFA'
              }}
              color="#B9B8C0"
            />
            <Controls 
              showInteractive={false}
              className="bg-white border-2 rounded-lg"
              style={{ borderColor: '#1C1B20' }}
            />
          </ReactFlow>
        </div>
      </div>

      {/* Node Type Selection Dialog */}
      <Dialog open={showNodeTypeDialog} onOpenChange={setShowNodeTypeDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1C1B20]">Add Node</DialogTitle>
            <DialogDescription className="text-[#777D8D]">
              Choose the type of node to add to your sequence.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <button
              onClick={() => handleAddNode('action')}
              className="w-full px-4 py-3 text-left rounded-lg border-2 transition-all hover:shadow-sm"
              style={{
                borderColor: '#EEEEEE',
                backgroundColor: '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1C1B20'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#EEEEEE'
              }}
            >
              <div className="font-semibold text-sm" style={{ color: '#1C1B20' }}>
                Action
              </div>
              <div className="text-xs mt-1" style={{ color: '#777D8D' }}>
                A single action step in your sequence
              </div>
            </button>
            
            <button
              onClick={() => handleAddNode('conditional')}
              className="w-full px-4 py-3 text-left rounded-lg border-2 transition-all hover:shadow-sm"
              style={{
                borderColor: '#EEEEEE',
                backgroundColor: '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1C1B20'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#EEEEEE'
              }}
            >
              <div className="font-semibold text-sm" style={{ color: '#1C1B20' }}>
                If/Else
              </div>
              <div className="text-xs mt-1" style={{ color: '#777D8D' }}>
                A conditional branch with yes/no paths
              </div>
            </button>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowNodeTypeDialog(false)}
              variant="outline"
              className="border-[#B9B8C0] text-[#1C1B20] hover:bg-[#F5F5F5]"
            >
              Cancel
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
              onClick={handleClearSequence}
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

      {/* Template Manager */}
      <TemplateManager
        isOpen={isTemplateManagerOpen}
        onClose={() => setIsTemplateManagerOpen(false)}
        onLoad={handleLoadTemplate}
        storageKey="sequencer-supabase-templates"
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

export function SequencerSupabase () {
  return (
    <ReactFlowProvider>
      <div className="h-[calc(100vh-200px)] w-full border border-[#B9B8C0] rounded-2xl overflow-hidden shadow-sm">
        <SequencerSupabaseComponent />
      </div>
    </ReactFlowProvider>
  )
}

