export interface IMenuItem {
  id: keyof ICollections;
  title: string;
  icon?: string;
  order?: number;
}

export interface ICollectionItem {
  id: string;
  title: string;
  order?: number;
}

export interface IEasyProPricelistItem {
  model: string;
  easypro: number;
  easypro2: number;
  easypro3: number;
}
interface IEasyProDescrItem {
  title: string;
  text: string;
}

export interface IServicesDataItem {
  id: string;
  title: string;
  price: number;
  description: string;
} 

export type EasyProDescrKeys = "easypro" | "easypro2" | "easypro3";

export interface IEasyProData {
  pricelist: IEasyProPricelistItem[];
  description: {
    easypro: IEasyProDescrItem;
    easypro2: IEasyProDescrItem;
    easypro3: IEasyProDescrItem;
  };
}

interface IPhoneSettnigsData {
  free: IServicesDataItem;
  mix: IServicesDataItem;
  mixplus: IServicesDataItem;
}


interface IServicesItem extends ICollectionItem {
  data: IServicesDataItem[] | IEasyProData | IPhoneSettnigsData;
}

export interface ICollections {
  services: IServicesItem[];
  information: [];
}