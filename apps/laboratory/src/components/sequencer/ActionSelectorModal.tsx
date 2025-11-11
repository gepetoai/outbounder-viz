import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { actionTypes, type ActionType } from './actionTypes'
import { Button } from '@/components/ui/button'

interface ActionSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (actionType: ActionType) => void
}

export function ActionSelectorModal ({ isOpen, onClose, onSelect }: ActionSelectorModalProps) {
  const categories = {
    linkedin: 'LinkedIn Actions',
    messaging: 'Messaging',
    delay: 'Delays & Timing',
    logic: 'Logic & Control',
    integration: 'Integrations'
  }

  const groupedActions = actionTypes.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = []
    }
    acc[action.category].push(action)
    return acc
  }, {} as Record<string, ActionType[]>)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Action</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {Object.entries(categories).map(([key, label]) => {
            const actions = groupedActions[key] || []
            if (actions.length === 0) return null

            return (
              <div key={key}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{label}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {actions.map(action => {
                    const Icon = action.icon
                    return (
                      <Button
                        key={action.id}
                        onClick={() => onSelect(action)}
                        variant="outline"
                        className="h-auto p-4 justify-start text-left border-2 border-gray-900 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-8 h-8 rounded border-2 border-gray-900 flex items-center justify-center bg-white flex-shrink-0">
                            <Icon className="h-4 w-4 text-gray-900" />
                          </div>
                          <span className="font-medium text-gray-900">{action.label}</span>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

