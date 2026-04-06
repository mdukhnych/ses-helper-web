import { FIREBASE_FIRESTORE } from "@/firebaseConfug";
import { Information, InformationBase, Instructions, InstructionsItem, Motivations } from "@/types/information";
import { createAsyncThunk, createSlice, isFulfilled, isPending, isRejected, PayloadAction } from "@reduxjs/toolkit";
import { collection, getDocs } from "firebase/firestore";

export const fetchInformation = createAsyncThunk(
  "information/fetchInformation",
  async (): Promise<Information> => {
    const ref = collection(FIREBASE_FIRESTORE, "information");
    const snapshot = await getDocs(ref);

    const data = Object.fromEntries(
      snapshot.docs.map(doc => [doc.id, doc.data()])
    );

    return {
      instructions: data.instructions as Instructions,
      motivations: data.motivations as Motivations,
    };
  }
);

export const fetchInstructions = createAsyncThunk(
  "information/fetchInstructions",
  async () => {
    const ref = collection(FIREBASE_FIRESTORE, "information", "instructions", "items");
    const snapshot = getDocs(ref);

    return (await snapshot).docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InstructionsItem));
  }
)

interface InformationStore {
  loading: boolean;
  error: string | null;
  data: Information;
}

const initialState: InformationStore = {
  loading: false,
  error: null,
  data: {
    instructions: {
      id: "",
      title: "",
      categories: [],
      items: []
    },
    motivations: {
      id: "",
      title: "",
      items: [],
    }
  }
}

const informationSlice = createSlice({
  name: "information",
  initialState,
  reducers: {
    addInstructionToStore: (state, action: PayloadAction<InstructionsItem>) => {
      if (!state.data.instructions.items) {
        state.data.instructions.items = [];
      }
      state.data.instructions.items.push(action.payload);
    },
    // updateInstructionInStore: (state, action: PayloadAction<InstructionsItem>) => {
    //   const index = state.data.instructions.items.findIndex(
    //     item => item.id === action.payload.id
    //   );

    //   if (index !== -1) {
    //     state.data.instructions.items[index] = action.payload;
    //   }
    // },
    updateInstructionsInStore: (state, action: PayloadAction<InstructionsItem[]>) => {
      if (!state.data.instructions.items) {
        state.data.instructions.items = [];
      }
      state.data.instructions.items = action.payload;
    },
    updateInstructionsCategories: (state, action: PayloadAction<InformationBase[]>) => {
      if (!state.data.instructions.categories) {
        state.data.instructions.categories = [];
      }

      state.data.instructions.categories = [...action.payload];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInformation.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchInstructions.fulfilled,(state, action) => {
        state.data.instructions.items = action.payload;
      })
      //Universal Matchers
      .addMatcher(isPending(fetchInformation, fetchInstructions), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(isFulfilled(fetchInformation, fetchInstructions), (state) => {
        state.loading = false;
      })
      .addMatcher(isRejected(fetchInformation, fetchInstructions), (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Сталася невідома помилка";
      });
  }
});

export const {
  addInstructionToStore,
  // updateInstructionInStore,
  updateInstructionsInStore,
  updateInstructionsCategories
} = informationSlice.actions;

export default informationSlice.reducer;