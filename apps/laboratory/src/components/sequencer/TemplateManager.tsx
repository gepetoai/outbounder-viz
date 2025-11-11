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
}

export function TemplateManager ({ isOpen, onClose, onLoad }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([])

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  const loadTemplates = () => {
    const saved = localStorage.getItem('sequencer-templates')
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
      localStorage.setItem('sequencer-templates', JSON.stringify(updated))
    }
  }

  const handleLoad = (template: Template) => {
    onLoad(template)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[70vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Load Template</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {templates.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <FolderOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No saved templates yet</p>
              <p className="text-sm mt-1">Save your first sequence to create a template</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {templates.map((template, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-900 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-600">
                      {template.nodes.length} nodes • Saved {new Date(template.savedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleLoad(template)}
                      variant="outline"
                      size="sm"
                      className="border-2 border-gray-900"
                    >
                      Load
                    </Button>
                    <Button
                      onClick={() => handleDelete(index)}
                      variant="outline"
                      size="sm"
                      className="border-2 border-gray-900 hover:bg-gray-100"
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

