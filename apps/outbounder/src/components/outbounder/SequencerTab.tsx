'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Undo, Redo, Play, Settings, Trash2, Mail, MessageSquare, Phone, Hourglass, CheckCircle, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

type LeadSource = 'instagram' | 'linkedin' | 'twitter' | null

type ActionType = 'email' | 'linkedin-message' | 'phone-call' | 'wait' | 'condition'

interface SequenceAction {
  id: string
  type: ActionType
  label: string
  column: number
  row: number
  parentId: string | null
  branch: 'yes' | 'no' | null
  children: {
    yes?: string
    no?: string
  }
  isSpacer?: boolean
}

const actionTypes = [
  { id: 'email', label: 'Send Email', icon: Mail },
  { id: 'linkedin-message', label: 'LinkedIn Message', icon: MessageSquare },
  { id: 'phone-call', label: 'Phone Call', icon: Phone },
  { id: 'wait', label: 'Wait', icon: Hourglass },
  { id: 'condition', label: 'If/Then Condition', icon: CheckCircle }
]

export default function SequencerTab () {
  const [selectedLeadSource, setSelectedLeadSource] = useState<LeadSource>(null)
  const [campaignStatus, setCampaignStatus] = useState<'active' | 'paused'>('paused')
  const [actions, setActions] = useState<SequenceAction[]>([])
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [actionCount, setActionCount] = useState(0)
  const [pendingAction, setPendingAction] = useState<{ parentId: string | null; branch: 'yes' | 'no' | null }>({ parentId: null, branch: null })
  
  // Refs and state for tracking card positions
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [cardPositions, setCardPositions] = useState<Record<string, DOMRect>>({})
  
  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(1)

  const shiftColumnsRows = (baseActions: SequenceAction[], columns: number[], fromRow: number) => {
    if (columns.length === 0) return baseActions
    const columnSet = new Set(columns)
    return baseActions.map(action => {
      if (columnSet.has(action.column) && action.row >= fromRow) {
        return { ...action, row: action.row + 1 }
      }
      return action
    })
  }

  const handleAddAction = (actionType: typeof actionTypes[0]) => {
    const { parentId, branch } = pendingAction
    
    let column = 0
    let row = 0
    
    if (parentId && branch) {
      const parent = actions.find(a => a.id === parentId)
      if (parent) {
        // Both Yes and No branches go to parent.row + 1 (same row as each other!)
        row = parent.row + 1
        
        if (branch === 'yes') {
          // Yes branch stays in same column
          column = parent.column
        } else {
          // No branch: find the rightmost column currently used and add 1
          const maxCol = actions.length > 0 ? Math.max(...actions.map(a => a.column)) : 0
          column = Math.max(maxCol + 1, parent.column + 1)
        }
      }
    } else if (parentId) {
      const parent = actions.find(a => a.id === parentId)
      if (parent) {
        column = parent.column
        row = parent.row + 1
      }
    } else {
      // First action, no parent
      row = 1 // Begin Sequence is row 0
    }

    const newAction: SequenceAction = {
      id: `action-${actionCount}`,
      type: actionType.id as ActionType,
      label: actionType.label,
      column,
      row,
      parentId,
      branch,
      children: {}
    }

    let updatedActions = [...actions]
    let currentCount = actionCount
    
    // Check if we need to create spacer cards (for No branches that skip columns)
    if (parentId && branch === 'no') {
      const parent = updatedActions.find(a => a.id === parentId)
      if (parent && column > parent.column + 1) {
        // We need spacers in intermediate columns
        const spacers: SequenceAction[] = []
        
        // Identify which columns we'll be adding spacers to
        const spacerColumns: number[] = []
        for (let col = parent.column + 1; col < column; col++) {
          spacerColumns.push(col)
        }
        
        // CRITICAL: Bump down existing cards in these columns at/after this row
        updatedActions = shiftColumnsRows(updatedActions, spacerColumns, newAction.row)
        
        // Create spacer cards for each intermediate column
        // All spacers should be on the same row as the new action
        for (let col = parent.column + 1; col < column; col++) {
          const spacer: SequenceAction = {
            id: `spacer-${currentCount}`,
            type: 'wait',
            label: 'Spacer',
            column: col,
            row: newAction.row, // Same row as the target No branch action!
            parentId: null, // Will be set below
            branch: null,
            children: {},
            isSpacer: true
          }
          spacers.push(spacer)
          currentCount++
        }
        
        // Now link everything together properly
        if (spacers.length > 0) {
          // First spacer is the No child of the parent
          spacers[0].parentId = parentId
          spacers[0].branch = 'no'
          
          // Link spacers in chain
          for (let i = 0; i < spacers.length - 1; i++) {
            spacers[i + 1].parentId = spacers[i].id
            spacers[i + 1].branch = null
          }
          
          // Last spacer has the new action as its child
          newAction.parentId = spacers[spacers.length - 1].id
          newAction.branch = null
          
          // Update parent to point to first spacer
          updatedActions = updatedActions.map(a => 
            a.id === parentId 
              ? { ...a, children: { ...a.children, no: spacers[0].id } }
              : a
          )
          
          // Add all spacers to the actions array
          updatedActions = updatedActions.concat(spacers)
        }
      }
    }

    // Update parent's children reference (for non-spacer cases, or when spacers weren't needed)
    if (newAction.parentId && newAction.branch) {
      const branchKey = newAction.branch
      updatedActions = updatedActions.map(a => 
        a.id === newAction.parentId 
          ? { ...a, children: { ...a.children, [branchKey]: newAction.id } }
          : a
      )
    }
    
    // Add the new action
    updatedActions.push(newAction)
    
    setActions(updatedActions)
    setActionCount(currentCount + 1)
    setShowActionMenu(false)
    setPendingAction({ parentId: null, branch: null })
  }

  const handleDeleteAction = (id: string) => {
    // Find all descendants
    const findDescendants = (actionId: string): string[] => {
      const action = actions.find(a => a.id === actionId)
      if (!action) return []
      
      const descendants: string[] = [actionId]
      if (action.children.yes) {
        descendants.push(...findDescendants(action.children.yes))
      }
      if (action.children.no) {
        descendants.push(...findDescendants(action.children.no))
      }
      return descendants
    }

    const toDelete = new Set(findDescendants(id))
    
    // Update parent's children reference
    const deletedAction = actions.find(a => a.id === id)
    if (deletedAction?.parentId) {
      setActions(actions
        .filter(a => !toDelete.has(a.id))
        .map(a => {
          if (a.id === deletedAction.parentId && deletedAction.branch) {
            const { [deletedAction.branch]: removed, ...remainingChildren } = a.children
            return { ...a, children: remainingChildren }
          }
          return a
        })
      )
    } else {
      setActions(actions.filter(a => !toDelete.has(a.id)))
    }
  }

  const handleClearSequence = () => {
    setActions([])
    setActionCount(0)
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2.0))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.3))
  }

  const handleFitView = () => {
    if (!containerRef.current) return
    
    const container = containerRef.current.parentElement
    if (!container) return
    
    // Get container dimensions
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    
    // Calculate content dimensions based on grid
    const contentWidth = (maxColumn + 1) * 340 + maxColumn * 40 + 48 * 2 // columns * cardWidth + gaps + padding
    const contentHeight = (actionTree.length > 0 ? Math.max(...actionTree.map(n => n.row)) + 1 : 1) * 200 + (actionTree.length > 0 ? Math.max(...actionTree.map(n => n.row)) : 0) * 20 + 48 * 2 // rows * cardHeight + gaps + padding
    
    // Calculate zoom to fit with 10% padding
    const zoomX = (containerWidth * 0.9) / contentWidth
    const zoomY = (containerHeight * 0.9) / contentHeight
    const fitZoom = Math.min(zoomX, zoomY)
    
    // Clamp between 0.3 and 2.0
    const newZoom = Math.max(0.3, Math.min(2.0, fitZoom))
    setZoomLevel(newZoom)
    
    // Center the view after zoom is applied
    setTimeout(() => {
      const scaledContentWidth = contentWidth * newZoom
      const scaledContentHeight = contentHeight * newZoom
      
      // Calculate scroll position to center content
      const scrollLeft = Math.max(0, (scaledContentWidth - containerWidth) / 2)
      const scrollTop = Math.max(0, (scaledContentHeight - containerHeight) / 2)
      
      container.scrollTo({
        left: scrollLeft,
        top: scrollTop,
        behavior: 'smooth'
      })
    }, 50) // Small delay to ensure zoom transform is applied
  }

  const getActionIcon = (type: ActionType) => {
    const actionType = actionTypes.find(a => a.id === type)
    if (!actionType) return null
    const Icon = actionType.icon
    return <Icon className="h-5 w-5" />
  }

  const openActionMenu = (parentId: string | null = null, branch: 'yes' | 'no' | null = null) => {
    setPendingAction({ parentId, branch })
    setShowActionMenu(true)
  }

  // Calculate max column for grid layout
  const maxColumn = actions.length > 0 ? Math.max(...actions.map(a => a.column)) : 0
  
  // Check if there are any real (non-spacer) actions
  const hasRealActions = actions.some(a => !a.isSpacer)

  // Find next action in column
  const getNextInColumn = (actionId: string): SequenceAction | null => {
    const action = actions.find(a => a.id === actionId)
    if (!action) return null
    
    // Look for an action with this action as parent and no branch (direct child)
    // Also exclude spacers from consideration
    return actions.find(a => a.parentId === actionId && a.branch === null && !a.isSpacer) || null
  }

  // Check if action is last in its branch
  const isLastInBranch = (actionId: string): boolean => {
    const action = actions.find(a => a.id === actionId)
    // Spacers should never show "Add Next Action" button
    if (action?.isSpacer) return false
    return !getNextInColumn(actionId)
  }

  // Build a tree structure to organize rendering
  const buildActionTree = () => {
    const tree: Array<{ action: SequenceAction | null; row: number; column: number }> = []
    
    // Start with Begin Sequence at row 0
    tree.push({ action: null, row: 0, column: 0 })
    
    // Add all actions using their pre-calculated row and column values
    actions.forEach(action => {
      tree.push({
        action,
        row: action.row,
        column: action.column
      })
    })
    
    return tree
  }
  
  const actionTree = buildActionTree()

  // Calculate card positions after render
  useEffect(() => {
    const calculatePositions = () => {
      const positions: Record<string, DOMRect> = {}
      const containerRect = containerRef.current?.getBoundingClientRect()
      
      if (!containerRect) return
      
      // Add begin sequence position
      const beginElement = cardRefs.current['begin-sequence']
      if (beginElement) {
        const rect = beginElement.getBoundingClientRect()
        positions['begin-sequence'] = {
          x: rect.x - containerRect.x,
          y: rect.y - containerRect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          toJSON: rect.toJSON
        } as DOMRect
      }
      
      // Add action positions
      Object.entries(cardRefs.current).forEach(([id, element]) => {
        if (element && id !== 'begin-sequence') {
          const rect = element.getBoundingClientRect()
          positions[id] = {
            x: rect.x - containerRect.x,
            y: rect.y - containerRect.y,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom,
            toJSON: rect.toJSON
          } as DOMRect
        }
      })
      
      setCardPositions(positions)
    }
    
    // Use setTimeout to defer calculation until after render
    const timeoutId = setTimeout(calculatePositions, 0)
    
    // Recalculate on window resize
    window.addEventListener('resize', calculatePositions)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', calculatePositions)
    }
  }, [actions, zoomLevel])

  // Helper function to determine connections
  interface Connection {
    fromId: string
    toId: string
    isHorizontal: boolean
  }
  
  const getConnections = (): Connection[] => {
    const connections: Connection[] = []
    
    // Connection from Begin Sequence to first action
    if (actions.length > 0) {
      const firstAction = actions.find(a => !a.parentId)
      if (firstAction) {
        connections.push({
          fromId: 'begin-sequence',
          toId: firstAction.id,
          isHorizontal: false
        })
      }
    }
    
    // Connections between actions
    actions.forEach(action => {
      // Direct child (non-branch)
      const directChild = actions.find(a => a.parentId === action.id && a.branch === null)
      if (directChild) {
        connections.push({
          fromId: action.id,
          toId: directChild.id,
          isHorizontal: false
        })
      }
      
      // Yes branch
      if (action.children.yes) {
        connections.push({
          fromId: action.id,
          toId: action.children.yes,
          isHorizontal: action.column !== actions.find(a => a.id === action.children.yes)?.column
        })
      }
      
      // No branch
      if (action.children.no) {
        connections.push({
          fromId: action.id,
          toId: action.children.no,
          isHorizontal: action.column !== actions.find(a => a.id === action.children.no)?.column
        })
      }
    })
    
    return connections
  }

  // Generate SVG linear path
  const generatePath = (fromPos: DOMRect, toPos: DOMRect, isHorizontal: boolean): string => {
    // Start point: bottom-center of from card
    const startX = fromPos.x + fromPos.width / 2
    const startY = fromPos.y + fromPos.height
    
    // End point: top-center of to card
    const endX = toPos.x + toPos.width / 2
    const endY = toPos.y
    
    if (isHorizontal) {
      // Horizontal branch: straight line with right angle
      const midY = startY + (endY - startY) / 2
      return `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`
    } else {
      // Vertical: straight line
      return `M ${startX} ${startY} L ${endX} ${endY}`
    }
  }

  const connections = getConnections()

  return (
    <div className="space-y-6">
      {/* Lead Source Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Lead Source</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedLeadSource || ''}
            onValueChange={(value) => {
              setSelectedLeadSource(value === 'clear-selection' ? null : value as LeadSource)
            }}
          >
            <SelectTrigger className={`w-full ${!selectedLeadSource ? 'border-gray-400 focus:border-gray-600' : ''}`}>
              <SelectValue placeholder="No lead source selected" />
            </SelectTrigger>
            <SelectContent>
              {selectedLeadSource && (
                <SelectItem value="clear-selection">
                  <span className="text-muted-foreground italic">Clear selection</span>
                </SelectItem>
              )}
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Sequence Builder */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Sequence Builder</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-50"
                disabled
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-50"
                disabled
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="bg-black hover:bg-gray-800 text-white"
                onClick={() => setShowActionMenu(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Action
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-50"
                onClick={handleClearSequence}
                disabled={!hasRealActions}
              >
                Clear Sequence
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-50"
              >
                Test
              </Button>
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-300">
                <span className="text-sm font-semibold text-gray-900">
                  {campaignStatus === 'active' ? 'Active' : 'Paused'}
                </span>
                <Switch
                  checked={campaignStatus === 'active'}
                  onCheckedChange={(checked) => setCampaignStatus(checked ? 'active' : 'paused')}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 relative">
          {/* Canvas Area - CSS Grid Layout */}
          <div style={{ height: '800px' }} className="border-t bg-gray-50 overflow-auto">
            <div 
              ref={containerRef} 
              className="p-12 relative" 
              style={{ 
                minWidth: 'max-content',
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top left',
                transition: 'transform 0.2s ease-out'
              }}
            >
              {/* SVG Overlay for connection lines */}
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ zIndex: 1 }}
              >
                {connections.map((conn, idx) => {
                  const fromPos = cardPositions[conn.fromId]
                  const toPos = cardPositions[conn.toId]
                  
                  if (!fromPos || !toPos) return null
                  
                  const pathData = generatePath(fromPos, toPos, conn.isHorizontal)
                  
                  return (
                    <path
                      key={`${conn.fromId}-${conn.toId}-${idx}`}
                      d={pathData}
                      stroke="black"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  )
                })}
              </svg>
              
              {/* Grid-based layout for precise positioning */}
              <div 
                className="relative"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${maxColumn + 1}, 340px)`,
                  gridAutoRows: '200px',
                  gap: '20px 40px',
                  zIndex: 2
                }}
              >
                {actionTree.map((node, idx) => {
                  const { action, row, column } = node
                  
                  if (!action) {
                    // Begin Sequence Card
                    return (
                      <div 
                        key="begin-sequence"
                        ref={(el) => { cardRefs.current['begin-sequence'] = el }}
                        style={{
                          gridRow: row + 1,
                          gridColumn: column + 1
                        }}
                      >
                        <Card className="border-2 border-gray-900 shadow-lg w-80">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Play className="h-5 w-5" />
                                <span className="font-semibold text-sm">Begin Sequence</span>
                              </div>
                              <button className="text-gray-400 hover:text-gray-900 transition-colors">
                                <Settings className="h-4 w-4" />
                              </button>
                            </div>
                            {!hasRealActions && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs bg-white hover:bg-gray-50"
                                onClick={() => openActionMenu()}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Next Action
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    )
                  }
                  
                  // Spacer Card (invisible, just for positioning)
                  if (action.isSpacer) {
                    return (
                      <div 
                        key={action.id}
                        ref={(el) => { cardRefs.current[action.id] = el }}
                        style={{
                          gridRow: row + 1,
                          gridColumn: column + 1,
                          width: '320px',
                          height: '180px'
                        }}
                        className="pointer-events-none"
                      />
                    )
                  }
                  
                  // Regular Action Card
                  return (
                    <div 
                      key={action.id}
                      ref={(el) => { cardRefs.current[action.id] = el }}
                      style={{
                        gridRow: row + 1,
                        gridColumn: column + 1
                      }}
                    >
                      <Card className="border-2 border-gray-900 shadow-lg w-80">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              {getActionIcon(action.type)}
                              <span className="font-semibold text-sm">{action.label}</span>
                            </div>
                            <button 
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              onClick={() => handleDeleteAction(action.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          {/* If/Then Condition: Show Yes/No buttons */}
                          {action.type === 'condition' && (
                            <div className="flex gap-2">
                              {!action.children.yes && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 text-xs bg-white hover:bg-gray-50"
                                  onClick={() => openActionMenu(action.id, 'yes')}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Yes
                                </Button>
                              )}
                              {!action.children.no && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 text-xs bg-white hover:bg-gray-50"
                                  onClick={() => openActionMenu(action.id, 'no')}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  No
                                </Button>
                              )}
                            </div>
                          )}
                          
                          {/* Regular actions: Show Add Next Action if last in branch */}
                          {action.type !== 'condition' && isLastInBranch(action.id) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs bg-white hover:bg-gray-50"
                              onClick={() => openActionMenu(action.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Next Action
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          
          {/* Zoom Controls */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-10">
            <Button
              variant="outline"
              size="icon"
              className="bg-white hover:bg-gray-50 border-2 border-gray-900"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2.0}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-white hover:bg-gray-50 border-2 border-gray-900"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.3}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-white hover:bg-gray-50 border-2 border-gray-900"
              onClick={handleFitView}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Menu Dialog */}
      <Dialog open={showActionMenu} onOpenChange={setShowActionMenu}>
        <DialogContent className="bg-white border-2 border-gray-900">
          <DialogHeader>
            <DialogTitle>Select Action Type</DialogTitle>
            <DialogDescription>
              Choose the type of action to add to your sequence
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {actionTypes.map((actionType) => {
              const Icon = actionType.icon
              return (
                <Button
                  key={actionType.id}
                  variant="outline"
                  className="justify-start h-auto p-4 bg-white hover:bg-gray-50"
                  onClick={() => handleAddAction(actionType)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{actionType.label}</span>
                </Button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

