import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_FIRESTORE } from "@/firebaseConfug";
import { EasyProData, EktaService, EktaServicesDataItem, PhoneService, PhoneServicesData, Services, WarrantyDataItem } from "@/types/services";

export const fetchServices = createAsyncThunk(
  "services/fetchServices",
  async () => {
    const snapshot = await getDocs(collection(FIREBASE_FIRESTORE, "services"));
    if (snapshot.empty) throw new Error("Помилка завантаження даних!");

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Services;
  }
);

interface IServicesStore {
  loading: boolean;
  error: string | null;
  data: Services;
}

const initialState: IServicesStore = {
  loading: false,
  error: null,
  data: [],
}

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    setServicesStore: (state, action: PayloadAction<Services>) => {
      state.data = action.payload;
    },
    setWarrantyDataStore: (state, action: PayloadAction<WarrantyDataItem[]>) => {
      const service = state.data.find(item => item.id === "warranty-protection");
      if (!service) return;
      service.data = action.payload;
    },
    setEasyproPricelist: (state, action) => {
      const easypro = state.data.find(item => item.id === "easypro")?.data as EasyProData;
      if (!easypro) return;
      easypro.pricelist = action.payload;
    },

    setPhoneServicesData: (state, action: PayloadAction<PhoneServicesData>) => {
      const phoneServiceStore = state.data.find(item => item.id === "phone-services") as PhoneService;
      if (!phoneServiceStore) return;
      phoneServiceStore.data = action.payload;
    },
    setEktaServicesData: (state, action: PayloadAction<EktaServicesDataItem[]>) => {
      const ektaServiceStore = state.data.find(item => item.id === "ekta-services") as EktaService;
      if(!ektaServiceStore) return;
      ektaServiceStore.data = action.payload;
    },
    resestServicesStore: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchServices.pending, state => {
        state.loading = true;
        state.error = null; 
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.error = action.error.message || "Сталася невідома помилка";
        state.loading = false;
      })
  }
});

export const { 
  setServicesStore, 
  setWarrantyDataStore, 
  setEasyproPricelist, 
  resestServicesStore, 
  setPhoneServicesData,
  setEktaServicesData 
} = servicesSlice.actions;
export default servicesSlice.reducer;
