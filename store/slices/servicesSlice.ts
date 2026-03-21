import { createAsyncThunk, createSlice, isFulfilled, isPending, isRejected, PayloadAction } from "@reduxjs/toolkit";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_FIRESTORE } from "@/firebaseConfug";
import { EasyProData, EasyProPricelistItem, EktaService, EktaServicesDataItem, PhoneService, PhoneServicesData, Services, WarrantyDataItem } from "@/types/services";

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

export const fetchWarrantyData = createAsyncThunk(
  "services/fetchWarrantyData",
  async () => {
    const snapshot = await getDocs(collection(FIREBASE_FIRESTORE, "services/warranty-protection/data"));
    if (snapshot.empty) throw new Error("Помилка завантаження даних!");

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as WarrantyDataItem[];
  }
)

export const fetchEasyProData = createAsyncThunk(
  "services/fetchEasyProData",
  async () => {
    const [pricelistSnapshot, descriptionSnapshot] = await Promise.all([
      getDocs(collection(FIREBASE_FIRESTORE, "services", "easy-pro", "pricelist")),
      getDocs(collection(FIREBASE_FIRESTORE, "services", "easy-pro", "description"))
    ]);

    return ({
      description: descriptionSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})),
      pricelist: pricelistSnapshot.docs.map(doc => doc.data())
    }) as EasyProData
  }
)

export const fetchPhoneServicesData = createAsyncThunk(
  "services/fecthPhoneServicesData",
  async () => {
    const [goodsAndServicesSnapshot, servicesItemsSnapshot] = await Promise.all([
      getDocs(collection(FIREBASE_FIRESTORE, "services", "phone-services", "goodsAndServices")),
      getDocs(collection(FIREBASE_FIRESTORE, "services", "phone-services", "servicesItems"))
    ]);

    return({
      goodsAndServices: goodsAndServicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      servicesItems: servicesItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }) as PhoneServicesData;
  }
);

export const fetchEktaServicesData = createAsyncThunk(
  "services/fetchEktaDataServices",
  async () => {
    const snapshot = await getDocs(collection(FIREBASE_FIRESTORE, "services/ekta-services/data"));
    if (snapshot.empty) throw new Error("Помилка завантаження даних!");

    return snapshot.docs.map(doc => ({
      ...doc.data(),
    })) as EktaServicesDataItem[];
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
    setEasyproPricelist: (state, action: PayloadAction<EasyProPricelistItem[]>) => {
      const easypro = state.data.find(item => item.id === "easy-pro")?.data as EasyProData;
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchWarrantyData.fulfilled, (state, action) => {
        const service = state.data.find(i => i.id === "warranty-protection");
        if (service) service.data = action.payload;
      })
      .addCase(fetchEasyProData.fulfilled, (state, action) => {
        const service = state.data.find(i => i.id === "easy-pro");
        if (service) service.data = action.payload;
      })
      .addCase(fetchPhoneServicesData.fulfilled, (state, action) => {
        const service = state.data.find(i => i.id === "phone-services") as PhoneService;
        if (service) service.data = action.payload;
      })
      .addCase(fetchEktaServicesData.fulfilled, (state, action) => {
        const service = state.data.find(i => i.id === "ekta-services") as EktaService;
        if (service) service.data = action.payload;
      })
      //Universal Matchers
      .addMatcher(isPending(fetchServices, fetchWarrantyData, fetchEasyProData, fetchPhoneServicesData, fetchEktaServicesData), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(isFulfilled(fetchServices, fetchWarrantyData, fetchEasyProData, fetchPhoneServicesData, fetchEktaServicesData), (state) => {
        state.loading = false;
      })
      .addMatcher(isRejected(fetchServices, fetchWarrantyData, fetchEasyProData, fetchPhoneServicesData, fetchEktaServicesData), (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Сталася невідома помилка";
      });
  },
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