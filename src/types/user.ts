interface IOrder {
  id: number;
  clinetName: string;
  clientPhoneNumber: string;
  clientAddress?: string;
  products: string[];
  createdAt: Date;
  updatedAt: Date;
  status: "new" | "inProgress" | "done" | "canceled"
}

export interface IUser {
  id: string | null;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  shop: string;
  orders: IOrder[];
  role: "admin" | "director" | "seller"
}