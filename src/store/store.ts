import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./auth/authSlice";
import boardSlice from "./organizer/boardSlice";
import cardSlice from "./organizer/cardSlice";
import statusSlice from "./organizer/statusSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Configuración del store
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    board: boardSlice.reducer,
    card: cardSlice.reducer,
    status: statusSlice.reducer, // Cambia esto si tienes un slice específico para status
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Tipos inferidos del store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks tipados para usar en lugar de los originales
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
