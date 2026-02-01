interface BaseServiceItem {
  id: string;
  title: string;
  order?: number | null;
}

//  Warranty Protection
export interface WarrantyDataItem extends BaseServiceItem {
  price: number;
  description: string;
}

export interface WarrantyService extends BaseServiceItem {
  type: 'warranty';
  data: WarrantyDataItem[];
}


// Easy Pro
interface EasyProDescrItem {
  title: string;
  text: string;
}
export interface EasyProPricelistItem {
  model: string;
  easypro?: number | null;
  easypro2?: number | null;
  easypro3?: number | null;
} 
export interface EasyProDescription {
  easypro: EasyProDescrItem;
  easypro2: EasyProDescrItem;
  easypro3: EasyProDescrItem;
}
export interface EasyProData {
  description: EasyProDescription;
  pricelist: EasyProPricelistItem[];
}

interface EasyProService extends BaseServiceItem {
  type: 'easypro';
  data: EasyProData;
}


// Phone Services
export interface PhoneServiceItem extends BaseServiceItem {
  price: number;
  items: string[];
}
export interface PhoneServicesData {
  link?: string;
  goodsAndServices: string[];
  servicesItems: PhoneServiceItem[];
}

export interface PhoneService extends BaseServiceItem {
  type: 'phone';
  data: PhoneServicesData;
}


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


// Root
export type ServicesItem = | WarrantyService | EasyProService | PhoneService | EktaService;
export type Services = ServicesItem[];
