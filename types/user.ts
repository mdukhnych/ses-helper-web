interface IOrder {
  id: number;
  goods: string[];
  clientName: string;
  clientPhoneNumber: string;
  clientAddress: string;
  status: "new" | "inProgerss" | "done" | "canceled";
  createdAt: Date;
  editedAt: Date;
}

export interface IUser {
  id: string | null;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  shop: string;
  orders: IOrder[];
  role: "admin" |"director" | "seller";
}