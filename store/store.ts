import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import servicesReducer from './slices/servicesSlice';
import breadcrumbsReducer from './slices/breadcrumbsSlice';
import modalReducer from './slices/modalSlice';
import informationReducer from './slices/informationSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    services: servicesReducer,
    breadcrumbs: breadcrumbsReducer,
    modal: modalReducer,
    information: informationReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch