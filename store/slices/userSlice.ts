import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface IUserStore {
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
    setUserStore: (_, action: PayloadAction<IUserStore>) => {
      return action.payload;
    }
  }
});

export const { setUserStore } = userSlice.actions;
export default userSlice.reducer;