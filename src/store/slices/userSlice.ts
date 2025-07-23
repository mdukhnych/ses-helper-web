import { IUserState } from '@/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState: IUserState = {
  id: null,
  firstName: "",
  lastName: "",
  phone: "",
  shop: "",
  orders: [],
  role: "admin"
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUserState>) => {
      state.id = action.payload.id
      state.firstName = action.payload.firstName
      state.lastName = action.payload.lastName
      state.phone = action.payload.phone
      state.shop = action.payload.shop
      state.orders = action.payload.orders
      state.role = action.payload.role
    },
    resetUser: () => initialState
  }
})

export const { setUser, resetUser } = userSlice.actions
export default userSlice.reducer