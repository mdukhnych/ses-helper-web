// modal.config.ts
import PhoneServicesModal from './components/PhoneServicesModal'
import WarrantyModal from './components/WarrantyModal'

export const MODAL_CONFIG = {
  'warranty-protection': {
    title: 'Гарантійний захист',
    Component: WarrantyModal,
  },
  'phone-services': {
    title: 'Послуги смартфонів',
    Component: PhoneServicesModal,
  },
} as const

export type ModalType = keyof typeof MODAL_CONFIG
