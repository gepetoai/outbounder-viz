import { Node, Edge } from 'reactflow'

interface ChildInfo {
  id: string
  branch?: 'yes' | 'no'
}

// Node size constants
const NODE_SIZES = {
  start: { width: 200, height: 100 },
  action: { width: 180, height: 80 },
  conditional: { width: 200, height: 120 },
  end: { width: 180, height: 80 }
}

// Layout constants - INCREASED for better branch separation
const VERTICAL_SPACING = 180
const HORIZONTAL_SPACING = 400 // Base horizontal spacing
const MIN_BRANCH_GAP = 250 // Minimum gap between branches
const PADDING = 100

// Calculate the width of a subtree recursively
function calculateSubtreeWidth(
  nodeId: string,
  childrenMap: Record<string, ChildInfo[]>,
  nodes: Node[],
  visited: Set<string> = new Set()
): number {
  if (visited.has(nodeId)) return 0
  visited.add(nodeId)

  const node = nodes.find(n => n.id === nodeId)
  if (!node) return 0

  const sizeKey = node.type as keyof typeof NODE_SIZES
  const size = NODE_SIZES[sizeKey] || NODE_SIZES.action
  const nodeWidth = size.width + PADDING

  const children = childrenMap[nodeId] || []
  
  if (children.length === 0) {
    return nodeWidth
  }

  if (node.type === 'conditional' && children.length > 0) {
    // For branching nodes, separate Yes and No branches
    const yesChild = children.find(c => c.branch === 'yes')
    const noChild = children.find(c => c.branch === 'no')
    
    const yesWidth = yesChild ? calculateSubtreeWidth(yesChild.id, childrenMap, nodes, new Set(visited)) : 0
    const noWidth = noChild ? calculateSubtreeWidth(noChild.id, childrenMap, nodes, new Set(visited)) : 0
    
    return yesWidth + noWidth + MIN_BRANCH_GAP
  }

  // For linear nodes, use the max child width
  let maxChildWidth = 0
  children.forEach(child => {
    const childWidth = calculateSubtreeWidth(child.id, childrenMap, nodes, new Set(visited))
    maxChildWidth = Math.max(maxChildWidth, childWidth)
  })

  return Math.max(nodeWidth, maxChildWidth)
}

export function applyColaLayout (nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return nodes

  // Note: Edges with sourceHandle indicate conditional branches (yes/no)

  // Build adjacency map WITH branch information
  const childrenMap: Record<string, ChildInfo[]> = {}
  const parentMap: Record<string, string> = {}
  
  edges.forEach(edge => {
    if (!childrenMap[edge.source]) {
      childrenMap[edge.source] = []
    }
    const branchInfo: ChildInfo = {
      id: edge.target,
      branch: edge.sourceHandle as 'yes' | 'no' | undefined
    }
    childrenMap[edge.source].push(branchInfo)
    parentMap[edge.target] = edge.source
  })

  // Calculate hierarchical positions with proper branch spacing
  const positions: Record<string, { x: number; y: number; level: number }> = {}
  const START_X = 800 // Centered for better branch visibility
  const START_Y = 100

  // BFS to assign levels and positions
  const queue: Array<{ id: string; x: number; y: number; level: number }> = []
  queue.push({ id: 'start-node', x: START_X, y: START_Y, level: 0 })

  const visited = new Set<string>()

  while (queue.length > 0) {
    const current = queue.shift()!
    
    if (visited.has(current.id)) continue
    visited.add(current.id)
    
    positions[current.id] = { x: current.x, y: current.y, level: current.level }
    
    const children = childrenMap[current.id] || []
    const node = nodes.find(n => n.id === current.id)
    const isConditional = node?.type === 'conditional'

    if (isConditional && children.length > 0) {
      // Separate Yes and No branches explicitly by sourceHandle
      const yesChild = children.find(c => c.branch === 'yes')
      const noChild = children.find(c => c.branch === 'no')
      
      const yesWidth = yesChild ? calculateSubtreeWidth(yesChild.id, childrenMap, nodes) : 0
      const noWidth = noChild ? calculateSubtreeWidth(noChild.id, childrenMap, nodes) : 0
      
      const nextY = current.y + VERTICAL_SPACING
      
      // Position branches based on their individual subtree widths
      // Use aggressive spacing to prevent overlaps in deeply nested trees
      // YES goes RIGHT, NO goes LEFT
      if (yesChild) {
        // Position YES branch to the right: use 60% of YES subtree width for aggressive spacing
        const yesOffset = Math.max(MIN_BRANCH_GAP, yesWidth * 0.6)
        queue.push({ 
          id: yesChild.id, 
          x: current.x + yesOffset, // YES goes RIGHT
          y: nextY,
          level: current.level + 1
        })
      }
      
      if (noChild) {
        // Position NO branch to the left: use 60% of NO subtree width for aggressive spacing
        const noOffset = Math.max(MIN_BRANCH_GAP, noWidth * 0.6)
        queue.push({ 
          id: noChild.id, 
          x: current.x - noOffset, // NO goes LEFT  
          y: nextY,
          level: current.level + 1
        })
      }
    } else if (children.length > 0) {
      // Linear: position child directly below
      const nextY = current.y + VERTICAL_SPACING
      
      children.forEach(child => {
        queue.push({ 
          id: child.id, 
          x: current.x, 
          y: nextY,
          level: current.level + 1
        })
      })
    }
  }

  // Apply our manually calculated positions directly to React Flow nodes
  return nodes.map((node) => {
    const pos = positions[node.id] || { x: START_X, y: START_Y }
    
    return {
      ...node,
      position: {
        x: pos.x,
        y: pos.y
      }
    }
  })
}
