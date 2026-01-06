"use client"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

interface AppModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  children: React.ReactNode
}

export function AppModal({
  open,
  onOpenChange,
  children,
}: AppModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {children}
      </DialogContent>
    </Dialog>
  )
}
