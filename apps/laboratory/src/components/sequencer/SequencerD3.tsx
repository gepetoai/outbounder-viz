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
  useReactFlow
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus } from 'lucide-react'

const NODE_WIDTH = 240

// Simple Test Node Component
function TestNode ({ data }: { data: any }) {
  return (
    <div className="bg-white rounded-lg w-full relative">
      <Handle 
        type="target" 
        position={Position.Top}
        id="target"
        style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
        className="w-3 h-3 bg-gray-400"
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
        className="w-3 h-3 bg-gray-400"
      />
    </div>
  )
}

const nodeTypes = {
  test: TestNode
}

function SequencerD3Component () {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [nodeCounter, setNodeCounter] = useState(1)
  const { fitView } = useReactFlow()

  // Initialize with first node
  useEffect(() => {
    const initialNode: Node = {
      id: '1',
      type: 'test',
      position: { x: 0, y: 50 },
      width: NODE_WIDTH,
      data: {
        number: 1,
        onAddNext: () => handleAddNext('1')
      }
    }
    setNodes([initialNode])
  }, [])

  // Apply simple vertical layout
  const applyVerticalLayout = useCallback((currentNodes: Node[]) => {
    const startX = 0
    const startY = 100
    const verticalSpacing = 150

    return currentNodes.map((node, index) => ({
      ...node,
      position: {
        x: startX,
        y: startY + (index * verticalSpacing)
      }
    }))
  }, [])

  // Handle adding next node
  const handleAddNext = useCallback((parentId: string) => {
    const newNodeId = String(nodeCounter + 1)
    setNodeCounter(nodeCounter + 1)

    // Create new node
    const newNode: Node = {
      id: newNodeId,
      type: 'test',
      position: { x: 0, y: 200 }, // Temporary position
      width: NODE_WIDTH,
      data: {
        number: nodeCounter + 1,
        onAddNext: () => handleAddNext(newNodeId)
      }
    }

    // Create new edge with gray line
    const newEdge: Edge = {
      id: `e${parentId}-${newNodeId}`,
      source: parentId,
      sourceHandle: 'source',
      target: newNodeId,
      targetHandle: 'target',
      type: 'straight',
      animated: false,
      style: { stroke: '#9ca3af', strokeWidth: 2 }
    }

    // Update parent node to remove the plus button
    setNodes(currentNodes => {
      const updatedNodes = currentNodes.map(node =>
        node.id === parentId
          ? { ...node, data: { ...node.data, onAddNext: undefined } }
          : node
      )
      
      // Add new node
      const allNodes = [...updatedNodes, newNode]
      
      // Apply vertical layout
      return applyVerticalLayout(allNodes)
    })

    setEdges(currentEdges => [...currentEdges, newEdge])
  }, [nodeCounter, applyVerticalLayout])

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

  return (
    <div className="w-full h-[calc(100vh-180px)] border border-gray-300 rounded-2xl overflow-hidden shadow-sm">
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
  )
}

export function SequencerD3 () {
  return (
    <ReactFlowProvider>
      <SequencerD3Component />
    </ReactFlowProvider>
  )
}

