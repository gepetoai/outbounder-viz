'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'

type FormField = {
  id: string
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

interface FormBuilderProps {
  fields: FormField[]
  onChange: (fields: FormField[]) => void
}

export function FormBuilder ({ fields, onChange }: FormBuilderProps) {
  const addField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: '',
      required: false
    }
    onChange([...fields, newField])
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    onChange(fields.map(f => f.id === id ? { ...f, ...updates } : f))
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

  const renderPreviewField = (field: FormField) => {
    const commonProps = {
      placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`,
      disabled: true,
      className: 'border-gray-300'
    }

    switch (field.type) {
      case 'textarea':
        return <Textarea {...commonProps} />
      case 'select':
        return (
          <Select disabled>
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt, i) => (
                <SelectItem key={i} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input type="checkbox" disabled className="w-4 h-4" />
            <Label className="text-sm font-normal">{field.label}</Label>
          </div>
        )
      default:
        return <Input type={field.type} {...commonProps} />
    }
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Builder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Input Fields</Label>
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
            <p className="text-sm text-gray-500 mb-4">No input fields added yet</p>
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
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border-2 border-gray-900 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
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

                <div className="space-y-2">
                  <Label>Field Type</Label>
                  <Select
                    value={field.type}
                    onValueChange={(value: FormField['type']) => updateField(field.id, { type: value })}
                  >
                    <SelectTrigger className="border-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    placeholder="Field label"
                    className="border-gray-900"
                  />
                </div>

                {field.type !== 'checkbox' && (
                  <div className="space-y-2">
                    <Label>Placeholder (optional)</Label>
                    <Input
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                      placeholder="Placeholder text"
                      className="border-gray-900"
                    />
                  </div>
                )}

                {field.type === 'select' && (
                  <div className="space-y-2">
                    <Label>Options (comma-separated)</Label>
                    <Input
                      value={field.options?.join(', ') || ''}
                      onChange={(e) => {
                        const options = e.target.value.split(',').map(o => o.trim()).filter(o => o)
                        updateField(field.id, { options })
                      }}
                      placeholder="Option 1, Option 2, Option 3"
                      className="border-gray-900"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label>Required</Label>
                  <Switch
                    checked={field.required}
                    onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Preview</Label>
        <div className="p-6 border-2 border-gray-300 rounded-lg bg-gray-50 space-y-4">
          {fields.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Form preview will appear here
            </p>
          ) : (
            fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label className="text-sm">
                  {field.label || 'Untitled Field'}
                  {field.required && <span className="text-red-600 ml-1">*</span>}
                </Label>
                {renderPreviewField(field)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}


