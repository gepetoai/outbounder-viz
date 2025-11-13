'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

// Generic column definition
export interface TableColumn<T> {
  key: string
  label: string
  width?: string
  render?: (item: T) => React.ReactNode
  className?: string
  editable?: boolean
  onRename?: (oldKey: string, newLabel: string) => void
}

// Action button definition
export interface TableAction {
  id: string
  label: string
  icon?: string
  onClick: (selectedIds: string[]) => void | Promise<void>
  variant?: 'default' | 'primary'
  disabled?: boolean
}

export interface DataTableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  getRowId: (item: T) => string
  onRowClick?: (item: T) => void
  selectable?: boolean
  bulkActions?: TableAction[]
  onDownload?: () => void
  emptyMessage?: string
  showAddColumn?: boolean
  onAddColumn?: () => void
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  onRowClick,
  selectable = false,
  bulkActions = [],
  onDownload,
  emptyMessage = 'No data available',
  showAddColumn = false,
  onAddColumn
}: DataTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [editingColumn, setEditingColumn] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.map(item => getRowId(item))))
    }
  }

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkAction = async (action: TableAction) => {
    if (selectedIds.size === 0) return
    
    setIsProcessing(true)
    try {
      await action.onClick(Array.from(selectedIds))
      setSelectedIds(new Set())
    } catch (error) {
      console.error(`Failed to execute action ${action.id}:`, error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStartEdit = (column: TableColumn<T>) => {
    if (column.editable) {
      setEditingColumn(column.key)
      setEditValue(column.label)
    }
  }

  const handleSaveEdit = (column: TableColumn<T>) => {
    if (editValue.trim() && column.onRename) {
      column.onRename(column.key, editValue.trim())
    }
    setEditingColumn(null)
    setEditValue('')
  }

  const handleCancelEdit = () => {
    setEditingColumn(null)
    setEditValue('')
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Card className="p-12 max-w-md text-center bg-white shadow-sm">
          <p className="text-base" style={{ color: '#777D8D' }}>
            {emptyMessage}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Toolbar */}
      {(selectable && (bulkActions.length > 0 || onDownload)) && (
        <Card className="bg-white border-gray-300">
          <CardContent className="py-1 px-0">
            <div className="flex items-center justify-between h-8">
              <div className="text-xs font-medium pl-3 min-w-[150px]" style={{ color: '#1C1B20' }}>
                {selectedIds.size > 0 && (
                  <>{selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected</>
                )}
              </div>
              <div className="flex items-center gap-1 pr-3">
                {/* Bulk actions */}
                {bulkActions.length > 0 && (
                  <div className="inline-flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
                    {bulkActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleBulkAction(action)}
                        disabled={action.disabled || isProcessing || selectedIds.size === 0}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                          action.variant === 'primary'
                            ? 'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
                            : 'bg-white text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {action.icon && (
                          <Image
                            src={action.icon}
                            alt={action.label}
                            width={12}
                            height={12}
                          />
                        )}
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {/* Download button */}
                {onDownload && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onDownload}
                    disabled={data.length === 0}
                    className="h-7 px-3 py-0 text-xs bg-white border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    style={{ color: '#40404C' }}
                  >
                    <Image
                      src="/icons/arrow-down-to-line-light.svg"
                      alt="Download"
                      width={14}
                      height={14}
                      className="mr-1.5"
                    />
                    Download
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-[40px] pl-4">
                    <Checkbox
                      checked={selectedIds.size === data.length && data.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={column.className}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {editingColumn === column.key ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(column)
                          if (e.key === 'Escape') handleCancelEdit()
                        }}
                        onBlur={() => handleSaveEdit(column)}
                        className="h-7 text-sm"
                        autoFocus
                      />
                    ) : (
                      <span
                        className={column.editable ? 'cursor-pointer hover:text-gray-900' : ''}
                        onClick={() => handleStartEdit(column)}
                      >
                        {column.label}
                      </span>
                    )}
                  </TableHead>
                ))}
                {/* Add Column Header */}
                {showAddColumn && onAddColumn && (
                  <TableHead className="w-[80px] text-center">
                    <button
                      onClick={onAddColumn}
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 transition-colors mx-auto"
                      style={{ color: '#777D8D' }}
                      title="Add column"
                    >
                      <span className="text-lg font-light">+</span>
                    </button>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => {
                const rowId = getRowId(item)
                return (
                  <TableRow
                    key={rowId}
                    className={onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''}
                    onClick={() => onRowClick?.(item)}
                  >
                    {selectable && (
                      <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(rowId)}
                          onCheckedChange={() => handleSelectItem(rowId)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {column.render ? column.render(item) : String((item as any)[column.key] ?? '')}
                      </TableCell>
                    ))}
                    {/* Empty cell for add column */}
                    {showAddColumn && onAddColumn && (
                      <TableCell className="text-center" style={{ color: '#B9B8C0' }}>
                        
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
