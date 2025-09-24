import { DataArray } from "@/types/data";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IDataStore {
  data: DataArray;
  loading: boolean;
  loadingStatus: "idle" | "loading" | "succeeded" | "failed"
}

const initialState: IDataStore = {
  data: [],
  loading: false,
  loadingStatus: "idle"
}

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setDataStore: (state, action: PayloadAction<DataArray>) => {
      state.data = action.payload;
    },
    resetDataStore: () => initialState,
  }
});

export const { setDataStore, resetDataStore } = dataSlice.actions;
export default dataSlice.reducer;