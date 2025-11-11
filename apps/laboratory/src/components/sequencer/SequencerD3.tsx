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
  Position
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus } from 'lucide-react'

// Simple Test Node Component
function TestNode ({ data }: { data: any }) {
  return (
    <div className="bg-white border-2 border-gray-900 rounded-lg p-4 w-[240px] relative">
      <Handle 
        type="target" 
        position={Position.Top}
        style={{ left: '50%', transform: 'translateX(-50%)' }}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      <div className="flex flex-col items-center justify-center">
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
        style={{ left: '50%', transform: 'translateX(-50%)' }}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
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

  // Initialize with first node
  useEffect(() => {
    const initialNode: Node = {
      id: '1',
      type: 'test',
      position: { x: 0, y: 50 },
      style: { width: 240, boxSizing: 'border-box' },
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
      },
      style: { width: 240, boxSizing: 'border-box' }
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
      style: { width: 240, boxSizing: 'border-box' },
      data: {
        number: nodeCounter + 1,
        onAddNext: () => handleAddNext(newNodeId)
      }
    }

    // Create new edge with gray line
    const newEdge: Edge = {
      id: `e${parentId}-${newNodeId}`,
      source: parentId,
      target: newNodeId,
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
      const layoutedNodes = applyVerticalLayout(allNodes)
      
      return layoutedNodes
    })

    setEdges(currentEdges => [...currentEdges, newEdge])
  }, [nodeCounter, edges, applyVerticalLayout])

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
  }, [edges.length])

  return (
    <div className="w-full h-[calc(100vh-180px)] border border-gray-300 rounded-2xl overflow-hidden shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
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

