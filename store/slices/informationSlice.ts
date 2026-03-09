import { Information } from "@/types/information";
import { createSlice } from "@reduxjs/toolkit";


interface InformationState {
  loading: boolean;
  error: string | null;
  data: Information;
}

const initialState: InformationState = {
  loading: false,
  error: null,
  data: {
    instructions: {
      title: "Інструкції",
      categories:[],
      items: [],
    },
    motivations: {
      title: "Мотивації",
      items: [],
    }
  }
}

const informationSlice = createSlice({
  name: "information",
  initialState,
  reducers: {

  }
});

export default informationSlice.reducer;