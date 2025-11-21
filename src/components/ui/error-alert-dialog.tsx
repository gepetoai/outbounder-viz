'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ErrorAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: string
  title?: string
}

export function ErrorAlertDialog({ open, onOpenChange, message, title = 'Error' }: ErrorAlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 p-2 bg-red-100 rounded-full">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-left">{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-4 text-left">
            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
              {message}
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="default">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
