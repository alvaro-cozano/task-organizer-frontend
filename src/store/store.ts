import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { authSlice, boardSlice, cardSlice, statusSlice, userBoardSlice, profileSlice, labelSlice, checklistItemSlice, checklistSubItemSlice } from "../store";
import { stripeSlice } from "./stripe/stripeSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    board: boardSlice.reducer,
    card: cardSlice.reducer,
    status: statusSlice.reducer,
    userBoard: userBoardSlice.reducer,
    profile: profileSlice.reducer,
    label: labelSlice.reducer,
    checklistItem: checklistItemSlice.reducer,
    checklistSubItem: checklistSubItemSlice.reducer,
    stripe: stripeSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
