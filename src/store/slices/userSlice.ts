import { IUser } from "@/types/user";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit'

const initialState: IUser = {
  id: null,
  firstName: "",
  lastName: "",
  phoneNumber: "",
  shop: "",
  orders: [],
  role: "admin"
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserState: (_, action: PayloadAction<IUser>) => {
      return action.payload
    },
    resetUserState: () => {
      return initialState;
    }
  }
});

export const { setUserState, resetUserState } = userSlice.actions;
export default userSlice.reducer;