'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  onCancel?: () => void
  isLoading?: boolean
  confirmText?: string
  cancelText?: string
  showCloseButton?: boolean
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  isLoading = false,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  showCloseButton = false,
}: DeleteConfirmationDialogProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onOpenChange(false)
    }
  }

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={showCloseButton} aria-describedby="delete-dialog-description">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id="delete-dialog-description">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            autoFocus
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

