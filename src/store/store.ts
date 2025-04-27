import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { authSlice, boardSlice, cardSlice, statusSlice, userBoardSlice } from "../store";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    board: boardSlice.reducer,
    card: cardSlice.reducer,
    status: statusSlice.reducer,
    userBoard: userBoardSlice.reducer,
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
