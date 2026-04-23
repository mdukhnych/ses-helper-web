export interface BaseServiceItem {
  id: string;
  title: string;
  order?: number | null;
}

//  Warranty Protection
export interface WarrantyDataItem extends BaseServiceItem {
  price: number;
  description: string;
  fileURL: string;
}

export interface WarrantyService extends BaseServiceItem {
  type: 'warranty';
  data: WarrantyDataItem[];
  fileURL: string;
}

export type Warranty = Omit<WarrantyDataItem, "id">;


// Easy Pro
interface EasyProDescrItem {
  id: string;
  title: string;
  text: string;
  shortName?: string;
}
export interface EasyProPricelistItem {
  model: string;
  easypro?: number | null;
  easypro2?: number | null;
  easypro3?: number | null;
} 

export interface EasyProData {
  description: EasyProDescrItem[];
  pricelist: EasyProPricelistItem[];
}

interface EasyProService extends BaseServiceItem {
  type: 'easypro';
  data: EasyProData;
}

// Phone Services
export interface PhoneServiceItem extends BaseServiceItem {
  price: number;
  items: BaseServiceItem[];
}

export interface GoodsAndServicesItem extends BaseServiceItem {
  description?: string;
}
export interface PhoneServicesData {
  link?: string;
  goodsAndServices: GoodsAndServicesItem[];
  servicesItems: PhoneServiceItem[];
}

export interface PhoneService extends BaseServiceItem {
  type: 'phone';
  nextID: number;
  data: PhoneServicesData;
}
export type UpdateGoodsAndServiceItem = Omit<GoodsAndServicesItem, 'id'>;
export type AddPhoneServiceItem = Omit<PhoneServiceItem, 'id'>;


// Ekta Serviecs
export interface EktaListItem extends BaseServiceItem {
  price: number;
  productCode?: string;
  description: string;
}
export interface EktaServicesDataItem extends BaseServiceItem {
  list: EktaListItem[];
}

export interface EktaService extends BaseServiceItem {
  type: 'ekta';
  data: EktaServicesDataItem[];
}

export type UpdateEktaGroup = Omit<EktaServicesDataItem, 'id'>;


// Root
export type ServicesItem = | WarrantyService | EasyProService | PhoneService | EktaService;
export type Services = ServicesItem[];
