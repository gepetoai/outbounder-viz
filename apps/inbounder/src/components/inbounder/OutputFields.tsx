'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'

type OutputField = {
  id: string
  name: string
}

interface OutputFieldsProps {
  fields: OutputField[]
  onChange: (fields: OutputField[]) => void
}

export function OutputFields ({ fields, onChange }: OutputFieldsProps) {
  const addField = () => {
    const newField: OutputField = {
      id: `output-${Date.now()}`,
      name: ''
    }
    onChange([...fields, newField])
  }

  const updateField = (id: string, name: string) => {
    onChange(fields.map(f => f.id === id ? { ...f, name } : f))
  }

  const deleteField = (id: string) => {
    onChange(fields.filter(f => f.id !== id))
  }

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex >= 0 && targetIndex < newFields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]]
      onChange(newFields)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Output Fields</Label>
          <p className="text-sm text-gray-600 mt-1">
            Define fields that the AI agent will fill out after reviewing the conversation
          </p>
        </div>
        <Button
          type="button"
          onClick={addField}
          variant="outline"
          size="sm"
          className="bg-white hover:bg-gray-50 border-gray-900"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <p className="text-sm text-gray-500 mb-4">No output fields defined yet</p>
          <p className="text-xs text-gray-400 mb-4">
            Add fields that the AI agent should populate based on the conversation
          </p>
          <Button
            type="button"
            onClick={addField}
            variant="outline"
            size="sm"
            className="bg-white hover:bg-gray-50 border-gray-900"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Field
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border-2 border-gray-900 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveField(index, 'up')}
                    disabled={index === 0}
                    className="h-6 w-6 p-0 hover:bg-gray-50"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveField(index, 'down')}
                    disabled={index === fields.length - 1}
                    className="h-6 w-6 p-0 hover:bg-gray-50"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex-1">
                  <Input
                    value={field.name}
                    onChange={(e) => updateField(field.id, e.target.value)}
                    placeholder="Field name (e.g., Qualification Score, Lead Quality)"
                    className="border-gray-900"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteField(field.id)}
                  className="h-6 w-6 p-0 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> These fields will be populated by the AI agent after analyzing the conversation. 
          They will be available for mapping to your CRM in the next step.
        </p>
      </div>
    </div>
  )
}


