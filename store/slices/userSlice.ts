import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface IUserStore {
  id: string | null;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  shop: string;
  role: "admin" |"director" | "seller";
}

const initialState: IUserStore = {
  id: null,
  firstName: "",
  lastName: "",
  phoneNumber: "",
  address: "",
  dateOfBirth: "",
  shop: "",
  role: "admin"
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: { 
    setUserStore: (state, action: PayloadAction<IUserStore>) => action.payload,
    resetUserStore: () => initialState
  }
});

export const { setUserStore, resetUserStore } = userSlice.actions;
export default userSlice.reducer;