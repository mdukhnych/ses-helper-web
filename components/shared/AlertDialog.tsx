'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import React from "react";

interface AlertProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  submit: () => void;
}

export default function AlertDialogDemo({
  trigger,
  title,
  description,
  submit
}: AlertProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{ trigger }</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description && description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Відміна</AlertDialogCancel>
          <AlertDialogAction onClick={submit}>Підтвердити</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
