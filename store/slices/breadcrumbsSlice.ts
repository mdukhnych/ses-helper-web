import { FIREBASE_FIRESTORE } from "@/firebaseConfug";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { collection, getDocs } from "firebase/firestore";

export const fetchBreadcrumbs = createAsyncThunk(
  'breadcrumbs/fetchBreadcrumbs',
  async () => {
    const snapshot = await getDocs(collection(FIREBASE_FIRESTORE, "breadcrumbs"));
    if (snapshot.empty) throw new Error("Помилка завантаження даних!");

    const breadcrumbs: Breadcrumbs = {};

    snapshot.forEach(doc => {
      breadcrumbs[doc.id] = doc.data() as BreadcrumbsItem;
    });

    return breadcrumbs;
  }
)

interface BreadcrumbsItem {
  title: string;
  list: Record<string, string>
}

interface Breadcrumbs {
  [key: string]: BreadcrumbsItem;
}

interface BreadcrumbsStore {
  loading: boolean;
  error: string | undefined;
  data: Breadcrumbs;
}

const initialState: BreadcrumbsStore = {
  loading: false,
  error: undefined,
  data: {}
};

const breadcrumbsSlice = createSlice({
  name: "breadcrumbs",
  initialState,
  reducers: {

  },
  extraReducers: builder => {
    builder
      .addCase(fetchBreadcrumbs.pending, state => {
        state.loading = true;
      })
      .addCase(fetchBreadcrumbs.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchBreadcrumbs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
  }
});

export default breadcrumbsSlice.reducer;