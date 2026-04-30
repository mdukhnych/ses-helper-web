// modal.config.ts
import EktaServiceModal from './components/EktaServiceModal'
import InstructionsModal from './components/InstructionsModal'
import MotivationsModal from './components/MotivationsModal'
import PhoneServicesModal from './components/PhoneServicesModal'
import PromosModal from './components/PromosModal'
import WarrantyModal from './components/WarrantyModal'

export const MODAL_CONFIG = {
  'warranty-protection': {
    title: 'Гарантійний захист',
    Component: WarrantyModal,
  },
  'phone-services': {
    title: 'Послуги налаштування смартфонів',
    Component: PhoneServicesModal,
  },
  'ekta-services': {
    title: 'ЕКТА-Сервіс',
    Component: EktaServiceModal,
  },
  'instructions': {
    title: 'Інструкції',
    Component: InstructionsModal,
  },
  'motivations': {
    title: 'Мотивації',
    Component: MotivationsModal,
  },
  'promos': {
    title: 'Акції та промо',
    Component: PromosModal,
  },
} as const

export type ModalType = keyof typeof MODAL_CONFIG
