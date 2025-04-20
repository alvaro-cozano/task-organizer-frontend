import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  status: 'checking' | 'authenticated' | 'not-authenticated';
  user: { 
    username: string;
    email: string;
  } | null;
  errorMessage: string | undefined;
}

const initialState: AuthState = {
  status: 'checking',
  user: null,
  errorMessage: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    onChecking: (state) => {
      state.status = 'checking';
    },
    onLogin: (state, action: PayloadAction<{ username: string; email: string  }>) => {
      state.status = 'authenticated';
      state.user = action.payload;
      state.errorMessage = undefined;
    },
    onLogout: (state, action: PayloadAction<string | undefined>) => {
      state.status = 'not-authenticated';
      state.user = null;
      state.errorMessage = action.payload;
    },
    clearErrorMessage: (state) => {
      state.errorMessage = undefined;
    },
  },
});

export const { onChecking, onLogin, onLogout, clearErrorMessage } = authSlice.actions;
export default authSlice;
