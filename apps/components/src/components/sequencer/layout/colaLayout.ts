import { Node, Edge } from 'reactflow'
import * as cola from 'webcola'

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

// Layout constants for WebCola
const VERTICAL_SPACING = 150
const HORIZONTAL_BRANCH_GAP = 300 // Gap between Yes/No branches
const NODE_PADDING = 20 // Padding around nodes for collision detection

export function applyColaLayout (nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return nodes

  // Build adjacency map for hierarchy info
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

  // Build hierarchy levels for vertical constraints
  const levels: Record<string, number> = {}
  const queue: Array<{ id: string; level: number }> = []
  queue.push({ id: 'start-node', level: 0 })
  const visited = new Set<string>()

  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current.id)) continue
    visited.add(current.id)
    
    levels[current.id] = current.level
    const children = childrenMap[current.id] || []
    children.forEach(child => {
      queue.push({ id: child.id, level: current.level + 1 })
    })
  }

  // Create Cola nodes with bounds for collision detection
  const colaNodes = nodes.map(node => {
    const sizeKey = node.type as keyof typeof NODE_SIZES
    const size = NODE_SIZES[sizeKey] || NODE_SIZES.action
    
    return {
      id: node.id,
      x: node.position?.x || 800,
      y: node.position?.y || (levels[node.id] || 0) * VERTICAL_SPACING + 100,
      width: size.width + NODE_PADDING * 2,
      height: size.height + NODE_PADDING * 2
    }
  })

  // Create Cola links from edges
  const colaLinks = edges.map((edge, idx) => ({
    source: nodes.findIndex(n => n.id === edge.source),
    target: nodes.findIndex(n => n.id === edge.target)
  }))

  // Create constraints
  const constraints: any[] = []

  // Vertical alignment constraints (maintain hierarchy)
  Object.entries(levels).forEach(([nodeId, level]) => {
    const nextLevelNodes = Object.entries(levels)
      .filter(([id, l]) => l === level + 1 && parentMap[id] === nodeId)
    
    nextLevelNodes.forEach(([childId]) => {
      const parentIdx = nodes.findIndex(n => n.id === nodeId)
      const childIdx = nodes.findIndex(n => n.id === childId)
      
      if (parentIdx >= 0 && childIdx >= 0) {
        // Child should be below parent
        constraints.push({
          axis: 'y',
          left: parentIdx,
          right: childIdx,
          gap: VERTICAL_SPACING
        })
      }
    })
  })

  // Horizontal separation constraints for branches
  nodes.forEach((node, idx) => {
    if (node.type === 'conditional') {
      const children = childrenMap[node.id] || []
      const yesChild = children.find(c => c.branch === 'yes')
      const noChild = children.find(c => c.branch === 'no')
      
      if (yesChild && noChild) {
        const yesIdx = nodes.findIndex(n => n.id === yesChild.id)
        const noIdx = nodes.findIndex(n => n.id === noChild.id)
        
        if (yesIdx >= 0 && noIdx >= 0) {
          // YES branch should be to the RIGHT of NO branch
          constraints.push({
            axis: 'x',
            left: noIdx,
            right: yesIdx,
            gap: HORIZONTAL_BRANCH_GAP
          })
        }
      }
    }
  })

  // Run WebCola layout
  const layout = new cola.Layout()
    .nodes(colaNodes as any)
    .links(colaLinks as any)
    .constraints(constraints)
    .avoidOverlaps(true)
    .handleDisconnected(true)
    .linkDistance(120)
    .symmetricDiffLinkLengths(5)
    .jaccardLinkLengths(40)
    .convergenceThreshold(0.01)

  // Run for a fixed number of iterations
  layout.start(50, 15, 20, 0, false)

  // Extract positions from Cola and apply to React Flow nodes
  return nodes.map((node, idx) => {
    const colaNode = colaNodes[idx]
    
    return {
      ...node,
      position: {
        x: colaNode.x - (colaNode.width / 2),
        y: colaNode.y - (colaNode.height / 2)
      }
    }
  })
}
