"use client"

import { AppModal } from "@/components/app-modal"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { MODAL_CONFIG } from "./modal.config"
import { closeModal } from "@/store/slices/modalSlice"

export function ModalRenderer() {

  const dispatch = useAppDispatch()
  const open = useAppSelector(state => state.modal.open);
  const type = useAppSelector(state => state.modal.type);

  if (!type) return null
  const modal = MODAL_CONFIG[type];

  return (
    <AppModal
      open={open}
      title={modal.title}
      onOpenChange={(v) => !v && dispatch(closeModal())}
    >
      <modal.Component />
    </AppModal>
  )
}
