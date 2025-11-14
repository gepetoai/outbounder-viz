'use client'

import { useState, useCallback, useEffect } from 'react'
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
import { Plus, Undo, Redo } from 'lucide-react'

const NODE_WIDTH = 240
const WAIT_WIDTH = 120

// Test Action Node Component
function TestNode ({ data }: { data: any }) {
  return (
    <div className="bg-white rounded-lg w-[240px] relative">
      <Handle 
        type="target" 
        position={Position.Top}
        id="target"
        style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
        className="w-4 h-4 bg-gray-500 rounded-full"
      />
      <div className="flex flex-col items-center justify-center p-4">
        <div className="font-semibold text-sm">Test Action</div>
        <div className="text-xs text-gray-600">Node #{data.number}</div>
        {data.onAddNext && (
          <button
            onClick={data.onAddNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center hover:bg-gray-50"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
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

// Wait Node Component (smaller, compact)
function WaitNode ({ data }: { data: any }) {
  return (
    <div className="bg-gray-100 rounded-md w-[120px] relative">
      <Handle 
        type="target" 
        position={Position.Top}
        id="target"
        style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
        className="w-4 h-4 bg-gray-500 rounded-full"
      />
      <div className="flex flex-col items-center justify-center py-2 px-3">
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
  wait: WaitNode
}

function SequencerD3Component () {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [nodeCounter, setNodeCounter] = useState(1)
  const [testNodeCounter, setTestNodeCounter] = useState(1)
  const { fitView } = useReactFlow()
  const updateNodeInternals = useUpdateNodeInternals()

  // Initialize with first node
  useEffect(() => {
    const initialNode: Node = {
      id: 'test-1',
      type: 'test',
      position: { x: -NODE_WIDTH / 2, y: 50 },
      data: {
        number: 1,
        onAddNext: () => handleAddNext('test-1')
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
    
    let currentY = startY
    
    return currentNodes.map((node, index) => {
      // Center nodes horizontally based on their type
      const nodeWidth = node.type === 'wait' ? WAIT_WIDTH : NODE_WIDTH
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
      }
      
      return {
        ...node,
        position
      }
    })
  }, [])

  // Handle adding next node (adds test node + wait node)
  const handleAddNext = useCallback((parentId: string) => {
    setNodeCounter(prev => prev + 2)
    setTestNodeCounter(prev => prev + 1)

    setNodes(currentNodes => {
      // Get current counter values from state
      const currentNodeCount = currentNodes.length
      const waitNodeId = `wait-${currentNodeCount + 1}`
      const testNodeId = `test-${currentNodeCount + 2}`
      const nextTestNumber = currentNodes.filter(n => n.type === 'test').length + 1

      // Create wait node (auto-added after each test node)
      const waitNode: Node = {
        id: waitNodeId,
        type: 'wait',
        position: { x: -WAIT_WIDTH / 2, y: 200 }, // Temporary position
        data: {}
      }

      // Create new test node
      const testNode: Node = {
        id: testNodeId,
        type: 'test',
        position: { x: -NODE_WIDTH / 2, y: 300 }, // Temporary position
        data: {
          number: nextTestNumber,
          onAddNext: () => handleAddNext(testNodeId)
        }
      }

      // Update parent node to remove the plus button
      const updatedNodes = currentNodes.map(node =>
        node.id === parentId
          ? { ...node, data: { ...node.data, onAddNext: undefined } }
          : node
      )
      
      // Add both new nodes
      const allNodes = [...updatedNodes, waitNode, testNode]
      
      // Apply vertical layout
      const layoutedNodes = applyVerticalLayout(allNodes)
      
      // Important: force React Flow to recalc handle positions
      layoutedNodes.forEach(n => updateNodeInternals(n.id))
      
      return layoutedNodes
    })

    setEdges(currentEdges => {
      const currentNodeCount = currentEdges.length
      const waitNodeId = `wait-${Math.floor(currentNodeCount / 2) * 2 + 2}`
      const testNodeId = `test-${Math.floor(currentNodeCount / 2) * 2 + 3}`

      const edgeToWait: Edge = {
        id: `e${parentId}-${waitNodeId}`,
        source: parentId,
        sourceHandle: 'source',
        target: waitNodeId,
        targetHandle: 'target',
        type: 'straight',
        animated: false,
        style: { stroke: '#9ca3af', strokeWidth: 2 }
      }

      const edgeToTest: Edge = {
        id: `e${waitNodeId}-${testNodeId}`,
        source: waitNodeId,
        sourceHandle: 'source',
        target: testNodeId,
        targetHandle: 'target',
        type: 'straight',
        animated: false,
        style: { stroke: '#9ca3af', strokeWidth: 2 }
      }

      return [...currentEdges, edgeToWait, edgeToTest]
    })
  }, [applyVerticalLayout, updateNodeInternals])

  // Auto-fit view whenever nodes change
  useEffect(() => {
    if (nodes.length === 0) return
    
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 })
    }, 100)
  }, [nodes.length, fitView])

  // Fit view once after initial mount
  useEffect(() => {
    if (!nodes.length) return

    requestAnimationFrame(() => {
      fitView({ padding: 0.2, includeHiddenNodes: true })
    })
  }, [nodes.length, fitView])

  // Update node data callbacks when dependencies change
  useEffect(() => {
    setNodes(currentNodes =>
      currentNodes.map(node => {
        const hasChildren = edges.some(edge => edge.source === node.id)
        return {
          ...node,
          data: {
            ...node.data,
            onAddNext: hasChildren ? undefined : () => handleAddNext(node.id)
          }
        }
      })
    )
  }, [edges, handleAddNext])

  // Debug: log node positions to verify alignment
  useEffect(() => {
    console.log('Node positions:', nodes.map(n => ({ id: n.id, x: n.position.x, y: n.position.y })))
  }, [nodes])

  // Debug: log edges
  useEffect(() => {
    console.log('Edges:', edges)
  }, [edges])

  const handleClearSequence = () => {
    setNodes([])
    setEdges([])
    setNodeCounter(1)
    setTestNodeCounter(1)
    
    // Re-initialize with first node after a brief delay
    setTimeout(() => {
      const initialNode: Node = {
        id: 'test-1',
        type: 'test',
        position: { x: -NODE_WIDTH / 2, y: 50 },
        data: {
          number: 1,
          onAddNext: () => handleAddNext('test-1')
        }
      }
      setNodes([initialNode])
    }, 50)
  }

  return (
    <div className="w-full h-[calc(100vh-180px)] flex flex-col">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300">
        <h3 className="text-lg font-semibold text-[#1C1B20]">Sequence Flow</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const lastNode = nodes.filter(n => n.type === 'test').pop()
              if (lastNode?.data?.onAddNext) {
                lastNode.data.onAddNext()
              }
            }}
            className="w-9 h-9 flex items-center justify-center text-[#1C1B20] bg-white border border-[#1C1B20] rounded-lg hover:bg-gray-50 transition-colors"
            title="Add Node"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center text-gray-400 bg-white border border-gray-300 rounded-lg cursor-not-allowed"
            disabled
            title="Undo (Coming Soon)"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center text-gray-400 bg-white border border-gray-300 rounded-lg cursor-not-allowed"
            disabled
            title="Redo (Coming Soon)"
          >
            <Redo className="h-4 w-4" />
          </button>
          <button
            onClick={handleClearSequence}
            className="px-4 py-2 text-sm font-medium text-[#1C1B20] bg-white border border-[#1C1B20] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Sequence
          </button>
        </div>
      </div>

      {/* ReactFlow Container */}
      <div className="flex-1 border border-gray-300 rounded-2xl overflow-hidden shadow-sm">
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
    </div>
  )
}

export function SequencerD3 () {
  return (
    <ReactFlowProvider>
      <SequencerD3Component />
    </ReactFlowProvider>
  )
}

