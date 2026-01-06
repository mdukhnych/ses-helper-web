import { ModalType } from "@/components/modals/modal.config";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface OpenModalPayload<T = unknown> {
  type: ModalType;
  payload?: T;
}

interface ModalState {
  open: boolean
  type: ModalType | null
  payload: unknown | null
}

const initialState: ModalState = {
  open: false,
  type: null,
  payload: null,
}

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<OpenModalPayload>) => {
      state.open = true;
      state.type = action.payload.type;
      state.payload = action.payload.payload;
    },
    closeModal: (state) => {
      state.type = null;
      state.open = false;
      state.payload = null;
    }
  }
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;