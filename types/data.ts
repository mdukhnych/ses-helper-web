interface IInstructionItem {
  link: string;
  title: string;
  id: string;
}

interface IServiceItem {
  id: number;
  title: string;
  description: string;
  price: number;
}

interface IEasyProPrice {
  id: number;
  model: string;
  easypro: number;
  easypro2: number;
  easypro3: number;
}

interface IEasyProData {
  pricelist: IEasyProPrice[];
  description: {
    easypro: string;
    easypro2: string;
    easypro3: string;
  };
}

interface ILinkItem {
  link: string;
  title: string;
  id: string;
}

// групи в межах "Сервіси SES"
type ServiceGroup =
  | { title: string; data: IServiceItem[]; id: string; }
  | { title: string; data: IEasyProData; id: string; }
  | ILinkItem;

// блок верхнього рівня
interface IDataBlock {
  title: string;
  data: IInstructionItem[] | ServiceGroup[];
  order: number;
}

export type DataArray = IDataBlock[];
