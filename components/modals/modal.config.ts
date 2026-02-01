// modal.config.ts
import EktaServiceModal from './components/EktaServiceModal'
import PhoneServicesModal from './components/PhoneServicesModal'
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
} as const

export type ModalType = keyof typeof MODAL_CONFIG
