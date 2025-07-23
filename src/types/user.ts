export interface IOrder {
  id: number
  clientName: string
  clientTel: string
  clientAddress?: string
  goods: string
  createdAt: Date
  status: "new" | "inprogress" | "done" | "canceled"
}

export interface IUserState {
  id: string | null
  firstName: string
  lastName: string
  phone: string
  shop: string
  orders: IOrder[]
  role: "admin" | "director" | "seller"
} 