import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface IOrder {
  id: number
  clientName: string
  clientTel: string
  clientAddress?: string
  goods: string
  createdAt: Date
  status: "new" | "inprogress" | "done" | "canceled"
}

interface IUserState {
  id: string
  firstName: string
  lastName: string
  tel: string
  shop: string
  orders: IOrder[]
  role: "admin" | "director" | "seller"
} 

const initialState: IUserState = {
  id: "",
  firstName: "",
  lastName: "",
  tel: "",
  shop: "",
  orders: [],
  role: "admin"
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUserState>) => {
      state = {...action.payload}
    }
  }
})

export const { setUser } = userSlice.actions
export default userSlice.reducer