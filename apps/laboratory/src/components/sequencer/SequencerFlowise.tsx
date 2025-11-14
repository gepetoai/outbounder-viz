'use client'

import { useState, useCallback, useRef, DragEvent } from 'react'
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
  addEdge,
  ReactFlowInstance
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Minus, Save, FolderOpen, ChevronDown, ChevronRight, Settings as SettingsIcon, X as XIcon } from 'lucide-react'
import Image from 'next/image'
import { actionTypes, type ActionType } from './actionTypes'
import { FlowiseActionNode } from './nodes/FlowiseActionNode'
import { FlowiseConditionalNode } from './nodes/FlowiseConditionalNode'
import { FlowiseStartNode } from './nodes/FlowiseStartNode'
import { FlowiseEndNode } from './nodes/FlowiseEndNode'
import { TemplateManager } from './TemplateManager'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const nodeTypes = {
  start: FlowiseStartNode,
  action: FlowiseActionNode,
  conditional: FlowiseConditionalNode,
  end: FlowiseEndNode
}

function SequencerFlowiseComponent () {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodeIdCounter, setNodeIdCounter] = useState(1)
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveDialogName, setSaveDialogName] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showNodeLibrary, setShowNodeLibrary] = useState(false)
  
  // Track last node for auto-connection
  const [lastNodeId, setLastNodeId] = useState<string | null>(null)
  const [lastConditionalNodeId, setLastConditionalNodeId] = useState<string | null>(null)
  const [conditionalConnectionCount, setConditionalConnectionCount] = useState(0)
  
  // Settings panel
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  
  // History for undo/redo
  const [history, setHistory] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Categorized actions
  const categorizedActions = {
    linkedin: actionTypes.filter(a => a.category === 'linkedin'),
    messaging: actionTypes.filter(a => a.category === 'messaging'),
    delay: actionTypes.filter(a => a.category === 'delay'),
    logic: actionTypes.filter(a => a.category === 'logic'),
    integration: actionTypes.filter(a => a.category === 'integration')
  }

  // Category expansion state
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    linkedin: true,
    messaging: true,
    delay: true,
    logic: true,
    integration: true
  })

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  // Handle settings click from node
  const handleNodeSettingsClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId)
    setShowSettingsPanel(true)
  }, [])

  // Drag handlers
  const onDragStart = (event: DragEvent, actionType: ActionType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(actionType))
    event.dataTransfer.effectAllowed = 'move'
  }

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault()

      if (!reactFlowWrapper.current || !reactFlowInstance) return

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const actionTypeData = event.dataTransfer.getData('application/reactflow')

      if (!actionTypeData) return

      const actionType: ActionType = JSON.parse(actionTypeData)
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      })

      const newNodeId = `node-${nodeIdCounter}`
      const nodeType = actionType.id === 'if-then' ? 'conditional' : actionType.id === 'end-sequence' ? 'end' : 'action'

      const newNode: Node = {
        id: newNodeId,
        type: nodeType,
        position,
        data: {
          label: actionType.label,
          actionType: actionType.id,
          config: {},
          onSettingsClick: handleNodeSettingsClick
        }
      }

      setNodes(nds => nds.concat(newNode))
      setNodeIdCounter(prev => prev + 1)

      // Auto-connect logic
      if (lastNodeId) {
        let sourceHandle = null
        let sourceNodeId = lastNodeId

        // Check if we're connecting from a conditional node
        if (lastConditionalNodeId && conditionalConnectionCount < 2) {
          sourceNodeId = lastConditionalNodeId
          // First connection goes to 'yes', second to 'no'
          sourceHandle = conditionalConnectionCount === 0 ? 'yes' : 'no'
          
          // Create the edge
          const newEdge: Edge = {
            id: `edge-${sourceNodeId}-${newNodeId}`,
            source: sourceNodeId,
            target: newNodeId,
            sourceHandle,
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#1C1B20', strokeWidth: 2 }
          }
          setEdges(eds => [...eds, newEdge])

          // Update conditional connection count
          const newCount = conditionalConnectionCount + 1
          setConditionalConnectionCount(newCount)
          
          // Reset conditional tracking after both connections are made
          if (newCount >= 2) {
            setLastConditionalNodeId(null)
            setConditionalConnectionCount(0)
          }
        } else {
          // Regular connection from previous node
          const newEdge: Edge = {
            id: `edge-${sourceNodeId}-${newNodeId}`,
            source: sourceNodeId,
            target: newNodeId,
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#1C1B20', strokeWidth: 2 }
          }
          setEdges(eds => [...eds, newEdge])
        }
      }

      // Update tracking
      if (nodeType === 'conditional') {
        // New conditional node becomes the source for next connections
        setLastConditionalNodeId(newNodeId)
        setConditionalConnectionCount(0)
      }
      
      // Always update last node
      setLastNodeId(newNodeId)
    },
    [reactFlowInstance, nodeIdCounter, setNodes, lastNodeId, lastConditionalNodeId, conditionalConnectionCount, setEdges, handleNodeSettingsClick]
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(eds =>
        addEdge(
          {
            ...connection,
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#1C1B20', strokeWidth: 2 }
          },
          eds
        )
      )
    },
    [setEdges]
  )

  // Update node configuration
  const updateNodeConfig = useCallback((nodeId: string, configKey: string, value: any) => {
    setNodes(nds =>
      nds.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config: {
                ...node.data.config,
                [configKey]: value
              }
            }
          }
        }
        return node
      })
    )
  }, [setNodes])

  // Get selected node
  const selectedNode = nodes.find(n => n.id === selectedNodeId)

  // Save to history
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

  const handleClearCanvas = useCallback(() => {
    setShowClearConfirm(true)
  }, [])

  const confirmClear = useCallback(() => {
    setNodes([])
    setEdges([])
    setNodeIdCounter(1)
    setLastNodeId(null)
    setLastConditionalNodeId(null)
    setConditionalConnectionCount(0)
    setShowClearConfirm(false)
  }, [setNodes, setEdges])

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
          actionType: n.data.actionType,
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
      savedAt: new Date().toISOString()
    }

    const saved = JSON.parse(localStorage.getItem('sequencer-flowise-templates') || '[]')
    saved.push(sequenceData)
    localStorage.setItem('sequencer-flowise-templates', JSON.stringify(saved))

    setShowSaveDialog(false)
    setSaveDialogName('')
    setSuccessMessage(`Sequence "${saveDialogName.trim()}" saved successfully!`)
    setShowSuccessMessage(true)
  }, [saveDialogName, nodes, edges])

  const handleLoadTemplate = useCallback((template: any) => {
    // Clear existing nodes and edges
    setNodes([])
    setEdges([])
    setLastNodeId(null)
    setLastConditionalNodeId(null)
    setConditionalConnectionCount(0)

    setTimeout(() => {
      // Reconstruct nodes from template
      const reconstructedNodes: Node[] = template.nodes.map((n: any) => {
        return {
          id: n.id,
          type: n.type,
          position: n.position,
          data: {
            label: n.data.label,
            actionType: n.data.actionType,
            config: n.data.config || {},
            onSettingsClick: handleNodeSettingsClick
          }
        }
      })

      // Reconstruct edges
      const reconstructedEdges: Edge[] = template.edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle || null,
        targetHandle: e.targetHandle || null,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#1C1B20', strokeWidth: 2 }
      }))

      setNodes(reconstructedNodes)
      setEdges(reconstructedEdges)

      // Find highest node ID to continue counter
      const maxId = Math.max(
        ...reconstructedNodes.map(n => {
          const match = n.id.match(/node-(\d+)/)
          return match ? parseInt(match[1]) : 0
        }),
        0
      )
      setNodeIdCounter(maxId + 1)

      // Set the last node to the most recently added node in the template
      if (reconstructedNodes.length > 0) {
        const lastNode = reconstructedNodes[reconstructedNodes.length - 1]
        setLastNodeId(lastNode.id)
        
        // Check if it's a conditional node and count its connections
        if (lastNode.type === 'conditional') {
          const connectionsFromLastNode = reconstructedEdges.filter(e => e.source === lastNode.id)
          if (connectionsFromLastNode.length < 2) {
            setLastConditionalNodeId(lastNode.id)
            setConditionalConnectionCount(connectionsFromLastNode.length)
          }
        }
      }

      // Fit view after loading
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2, duration: 300 })
        }
      }, 100)
    }, 50)

    setIsTemplateManagerOpen(false)
  }, [setNodes, setEdges, reactFlowInstance, handleNodeSettingsClick])

  const categoryLabels: Record<string, string> = {
    linkedin: 'LinkedIn',
    messaging: 'Messaging',
    delay: 'Delay',
    logic: 'Logic',
    integration: 'Integration'
  }

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  return (
    <div className="flex h-full w-full">
      {/* Node Library Panel - LEFT */}
      {showNodeLibrary && (
        <div className="w-[300px] bg-white border-r border-[#B9B8C0] flex flex-col overflow-hidden">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-white h-[60px]">
            <h3 className="text-lg font-semibold text-[#1C1B20]">Node Library</h3>
          </div>

          {/* Scrollable Categories */}
          <div className="flex-1 overflow-y-auto">
            {Object.entries(categorizedActions).map(([category, actions]) => (
              <div key={category} className="border-b border-[#EEEEEE]">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#FAFAFA] transition-all duration-200"
                >
                  <span className="text-sm font-semibold text-[#1C1B20]">
                    {categoryLabels[category]}
                  </span>
                  {expandedCategories[category] ? (
                    <ChevronDown className="h-4 w-4 text-[#777D8D]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#777D8D]" />
                  )}
                </button>

                {/* Category Actions */}
                {expandedCategories[category] && (
                  <div className="px-3 pb-3 space-y-2">
                    {actions.map(action => {
                      const Icon = action.icon
                      return (
                        <div
                          key={action.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, action)}
                          className="flex items-center gap-3 p-3 bg-white border border-[#EEEEEE] rounded-lg cursor-grab active:cursor-grabbing hover:shadow-sm hover:border-[#1C1B20] hover:scale-[1.02] transition-all duration-200"
                          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                        >
                          <div className="w-8 h-8 flex items-center justify-center bg-[#FAFAFA] rounded-md">
                            <Icon className="h-4 w-4 text-[#1C1B20] flex-shrink-0" />
                          </div>
                          <span className="text-sm text-[#40404C] font-medium">
                            {action.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with Action Buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-white h-[60px]">
          <h3 className="text-lg font-semibold text-[#1C1B20]">Sequence Flow</h3>
          <div className="flex items-center gap-2">
            {/* Node Library Toggle */}
            {showNodeLibrary ? (
              <button
                onClick={() => setShowNodeLibrary(false)}
                className="w-9 h-9 flex items-center justify-center text-[#1C1B20] bg-white border border-[#1C1B20] rounded-lg hover:bg-gray-50 transition-colors"
                title="Hide Node Library"
              >
                <Minus className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowNodeLibrary(true)}
                className="w-9 h-9 flex items-center justify-center text-[#1C1B20] bg-white border border-[#1C1B20] rounded-lg hover:bg-gray-50 transition-colors"
                title="Show Node Library"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
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
              onClick={handleClearCanvas}
              className="px-4 py-2 text-sm font-medium text-[#1C1B20] bg-white border border-[#1C1B20] rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Sequence
            </button>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            minZoom={0.1}
            maxZoom={2}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#B9B8C0" />
            <Controls className="bg-white border-2 border-[#1C1B20] rounded-lg" />
          </ReactFlow>
        </div>
      </div>

      {/* Settings Panel - RIGHT SLIDE-OUT OVERLAY */}
      {showSettingsPanel && selectedNode && (
        <div className="fixed top-0 right-0 h-full w-96 bg-white border-l border-[#B9B8C0] shadow-2xl z-50 flex flex-col">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#B9B8C0] bg-white">
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-[#1C1B20]" />
              <h3 className="text-lg font-semibold text-[#1C1B20]">Node Settings</h3>
            </div>
            <Button
              onClick={() => {
                setShowSettingsPanel(false)
                setSelectedNodeId(null)
              }}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <XIcon className="h-4 w-4 text-[#777D8D]" />
            </Button>
          </div>

          {/* Settings Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Node Type Display */}
            <div>
              <Label className="text-sm font-semibold text-[#1C1B20]">Node Type</Label>
              <div className="mt-1 px-3 py-2 bg-[#EEEEEE] rounded-lg text-sm text-[#40404C] font-medium">
                {selectedNode.data.label}
              </div>
            </div>

            {/* Settings based on node type */}
            {selectedNode.data.actionType === 'send-message' && (
              <>
                <div>
                  <Label htmlFor="message-content" className="text-sm font-semibold text-[#1C1B20]">
                    Message Content
                  </Label>
                  <Textarea
                    id="message-content"
                    value={selectedNode.data.config?.messageContent || ''}
                    onChange={(e) => updateNodeConfig(selectedNode.id, 'messageContent', e.target.value)}
                    placeholder="Enter your message..."
                    className="mt-1 min-h-[120px] border-[#B9B8C0] text-[#40404C] resize-none"
                  />
                </div>
                <div>
                  <Label htmlFor="use-variables" className="text-sm font-semibold text-[#1C1B20]">
                    Available Variables
                  </Label>
                  <div className="mt-2 space-y-2 text-xs text-[#777D8D]">
                    <div className="px-2 py-1 bg-[#F5F5F5] rounded">{'{{firstName}}'}</div>
                    <div className="px-2 py-1 bg-[#F5F5F5] rounded">{'{{lastName}}'}</div>
                    <div className="px-2 py-1 bg-[#F5F5F5] rounded">{'{{company}}'}</div>
                    <div className="px-2 py-1 bg-[#F5F5F5] rounded">{'{{title}}'}</div>
                  </div>
                </div>
              </>
            )}

            {selectedNode.data.actionType === 'wait' && (
              <>
                <div>
                  <Label htmlFor="wait-duration" className="text-sm font-semibold text-[#1C1B20]">
                    Wait Duration
                  </Label>
                  <Input
                    id="wait-duration"
                    type="number"
                    value={selectedNode.data.config?.duration || ''}
                    onChange={(e) => updateNodeConfig(selectedNode.id, 'duration', e.target.value)}
                    placeholder="Enter duration..."
                    className="mt-1 border-[#B9B8C0] text-[#40404C]"
                  />
                </div>
                <div>
                  <Label htmlFor="wait-unit" className="text-sm font-semibold text-[#1C1B20]">
                    Time Unit
                  </Label>
                  <select
                    id="wait-unit"
                    value={selectedNode.data.config?.unit || 'minutes'}
                    onChange={(e) => updateNodeConfig(selectedNode.id, 'unit', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-[#B9B8C0] rounded-lg text-[#40404C] bg-white"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </>
            )}

            {selectedNode.data.actionType === 'connection-request' && (
              <div>
                <Label htmlFor="connection-note" className="text-sm font-semibold text-[#1C1B20]">
                  Connection Note (Optional)
                </Label>
                <Textarea
                  id="connection-note"
                  value={selectedNode.data.config?.note || ''}
                  onChange={(e) => updateNodeConfig(selectedNode.id, 'note', e.target.value)}
                  placeholder="Add a personal note..."
                  className="mt-1 min-h-[100px] border-[#B9B8C0] text-[#40404C] resize-none"
                />
              </div>
            )}

            {selectedNode.data.actionType === 'if-then' && (
              <>
                <div>
                  <Label htmlFor="condition-type" className="text-sm font-semibold text-[#1C1B20]">
                    Condition Type
                  </Label>
                  <select
                    id="condition-type"
                    value={selectedNode.data.config?.conditionType || 'response'}
                    onChange={(e) => updateNodeConfig(selectedNode.id, 'conditionType', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-[#B9B8C0] rounded-lg text-[#40404C] bg-white"
                  >
                    <option value="response">Has Responded</option>
                    <option value="accepted">Connection Accepted</option>
                    <option value="profile-view">Profile Viewed</option>
                    <option value="custom">Custom Condition</option>
                  </select>
                </div>
                {selectedNode.data.config?.conditionType === 'custom' && (
                  <div>
                    <Label htmlFor="custom-condition" className="text-sm font-semibold text-[#1C1B20]">
                      Custom Condition
                    </Label>
                    <Textarea
                      id="custom-condition"
                      value={selectedNode.data.config?.customCondition || ''}
                      onChange={(e) => updateNodeConfig(selectedNode.id, 'customCondition', e.target.value)}
                      placeholder="Define your condition..."
                      className="mt-1 min-h-[80px] border-[#B9B8C0] text-[#40404C] resize-none"
                    />
                  </div>
                )}
              </>
            )}

            {selectedNode.data.actionType === 'webhook' && (
              <>
                <div>
                  <Label htmlFor="webhook-url" className="text-sm font-semibold text-[#1C1B20]">
                    Webhook URL
                  </Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    value={selectedNode.data.config?.webhookUrl || ''}
                    onChange={(e) => updateNodeConfig(selectedNode.id, 'webhookUrl', e.target.value)}
                    placeholder="https://..."
                    className="mt-1 border-[#B9B8C0] text-[#40404C]"
                  />
                </div>
                <div>
                  <Label htmlFor="webhook-method" className="text-sm font-semibold text-[#1C1B20]">
                    HTTP Method
                  </Label>
                  <select
                    id="webhook-method"
                    value={selectedNode.data.config?.method || 'POST'}
                    onChange={(e) => updateNodeConfig(selectedNode.id, 'method', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-[#B9B8C0] rounded-lg text-[#40404C] bg-white"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
              </>
            )}

            {selectedNode.data.actionType === 'update-salesforce' && (
              <>
                <div>
                  <Label htmlFor="salesforce-object" className="text-sm font-semibold text-[#1C1B20]">
                    Salesforce Object
                  </Label>
                  <select
                    id="salesforce-object"
                    value={selectedNode.data.config?.objectType || 'Lead'}
                    onChange={(e) => updateNodeConfig(selectedNode.id, 'objectType', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-[#B9B8C0] rounded-lg text-[#40404C] bg-white"
                  >
                    <option value="Lead">Lead</option>
                    <option value="Contact">Contact</option>
                    <option value="Account">Account</option>
                    <option value="Opportunity">Opportunity</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="salesforce-action" className="text-sm font-semibold text-[#1C1B20]">
                    Action
                  </Label>
                  <select
                    id="salesforce-action"
                    value={selectedNode.data.config?.action || 'update'}
                    onChange={(e) => updateNodeConfig(selectedNode.id, 'action', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-[#B9B8C0] rounded-lg text-[#40404C] bg-white"
                  >
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="upsert">Upsert</option>
                  </select>
                </div>
              </>
            )}

            {/* Generic settings for other action types */}
            {!['send-message', 'wait', 'connection-request', 'if-then', 'webhook', 'update-salesforce', 'start', 'end-sequence'].includes(selectedNode.data.actionType || '') && (
              <div>
                <Label htmlFor="notes" className="text-sm font-semibold text-[#1C1B20]">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={selectedNode.data.config?.notes || ''}
                  onChange={(e) => updateNodeConfig(selectedNode.id, 'notes', e.target.value)}
                  placeholder="Add notes for this action..."
                  className="mt-1 min-h-[100px] border-[#B9B8C0] text-[#40404C] resize-none"
                />
              </div>
            )}
          </div>

          {/* Footer with action buttons */}
          <div className="border-t border-[#B9B8C0] p-4 flex gap-2">
            <Button
              onClick={() => {
                setShowSettingsPanel(false)
                setSelectedNodeId(null)
              }}
              className="flex-1 bg-[#1C1B20] text-white hover:opacity-90"
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* Backdrop overlay when settings panel is open */}
      {showSettingsPanel && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => {
            setShowSettingsPanel(false)
            setSelectedNodeId(null)
          }}
        />
      )}

      {/* Template Manager */}
      <TemplateManager
        isOpen={isTemplateManagerOpen}
        onClose={() => setIsTemplateManagerOpen(false)}
        onLoad={handleLoadTemplate}
        storageKey="sequencer-flowise-templates"
      />

      {/* Clear Canvas Confirmation Dialog */}
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

export function SequencerFlowise () {
  return (
    <ReactFlowProvider>
      <div className="h-[calc(100vh-200px)] w-full border border-[#B9B8C0] rounded-2xl overflow-hidden shadow-sm">
        <SequencerFlowiseComponent />
      </div>
    </ReactFlowProvider>
  )
}
