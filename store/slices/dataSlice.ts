import { ICollections, IMenuItem, IServicesDataItem } from "@/types/data";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IDataStore {
  menu: IMenuItem[],
  collections: ICollections,
  loading: boolean;
  error: string | null
}

const initialState: IDataStore = {
  menu: [],
  collections: {
    services: [],
    information: [],
  },
  loading: false,
  error: null
}

export const fetchData = createAsyncThunk(
  "data/fetchData",
  async () => {
    const res = await fetch(`/api/getData`);
    if (!res.ok) throw new Error("Помилка завантаження даних!");
    return await res.json();
  }
)

export const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setDataStore: (state, action) => {
      state.collections = action.payload.collections;
    },
    setWarrantyDataStore: (state, action: PayloadAction<IServicesDataItem[]>) => {
      const service = state.collections.services.find(item => item.id === "warranty-protection");
      if (!service) return;
      service.data = action.payload;
    },
    resestDataStore: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false;
        state.menu = action.payload.menu;
        state.collections = action.payload.collections;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Помилка завантаження даних!";
      })
  }
});

export const { setDataStore, resestDataStore, setWarrantyDataStore } = dataSlice.actions;
export default dataSlice.reducer;