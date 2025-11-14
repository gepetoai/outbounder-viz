import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FolderOpen, Trash2 } from 'lucide-react'

interface Template {
  name: string
  nodes: any[]
  edges: any[]
  savedAt: string
}

interface TemplateManagerProps {
  isOpen: boolean
  onClose: () => void
  onLoad: (template: Template) => void
  storageKey?: string
}

export function TemplateManager ({ isOpen, onClose, onLoad, storageKey = 'sequencer-templates' }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([])

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen, storageKey])

  const loadTemplates = () => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        setTemplates(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load templates:', e)
        setTemplates([])
      }
    } else {
      setTemplates([])
    }
  }

  const handleDelete = (index: number) => {
    if (window.confirm('Delete this template?')) {
      const updated = templates.filter((_, i) => i !== index)
      setTemplates(updated)
      localStorage.setItem(storageKey, JSON.stringify(updated))
    }
  }

  const handleLoad = (template: Template) => {
    onLoad(template)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[70vh] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#1C1B20]">Load Template</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {templates.length === 0 ? (
            <div className="text-center py-12 text-[#777D8D]">
              <FolderOpen className="h-12 w-12 mx-auto mb-3 text-[#B9B8C0]" />
              <p className="font-medium text-[#40404C]">No saved templates yet</p>
              <p className="text-sm mt-1">Save your first sequence to create a template</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {templates.map((template, index) => (
                <div
                  key={index}
                  className="border border-[#EEEEEE] rounded-lg p-4 flex items-center justify-between hover:border-[#1C1B20] hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-[#1C1B20]">{template.name}</div>
                    <div className="text-sm text-[#777D8D] mt-1">
                      {template.nodes.length} nodes • Saved {new Date(template.savedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleLoad(template)}
                      variant="outline"
                      size="sm"
                      className="border-[#1C1B20] text-[#1C1B20] hover:bg-[#1C1B20] hover:text-white transition-colors"
                    >
                      Load
                    </Button>
                    <Button
                      onClick={() => handleDelete(index)}
                      variant="outline"
                      size="sm"
                      className="border-[#777D8D] text-[#777D8D] hover:bg-[#777D8D] hover:text-white transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

