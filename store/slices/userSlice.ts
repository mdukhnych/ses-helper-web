import { IUser } from '@/types/user';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState: IUser = {
  id: null,
  firstName: "",
  lastName: "",
  phoneNumber: "",
  address: "",
  dateOfBirth: "",
  shopId: "",
  role: "admin"
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: { 
    setUserStore: (_, action: PayloadAction<IUser>) => action.payload,
    resetUserStore: () => initialState
  }
});

export const { setUserStore, resetUserStore } = userSlice.actions;
export default userSlice.reducer;