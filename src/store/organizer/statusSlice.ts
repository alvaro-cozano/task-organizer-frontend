import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { StatusDTO } from '../../management';

interface StatusState {
  statuses: StatusDTO[];
  loading: boolean;
  error: string | null;
}

const initialState: StatusState = {
  statuses: [],
  loading: false,
  error: null,
};

export const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    setStatuses(state, action: PayloadAction<StatusDTO[]>) {
      state.statuses = action.payload;
    },
    addStatus(state, action: PayloadAction<StatusDTO>) {
      if (!Array.isArray(state.statuses)) {
        state.statuses = [];
      }
      state.statuses.push(action.payload);
    },
    updateStatus(state, action: PayloadAction<StatusDTO>) {
      const index = state.statuses.findIndex(status => status.id === action.payload.id);
      if (index !== -1) {
        state.statuses[index] = action.payload;
      }
    },
    deleteStatus(state, action: PayloadAction<number>) {
      state.statuses = state.statuses.filter(status => status.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    onClearStatuses(state) {
      state.statuses = [];
    },
  },
});

export const {
  setStatuses,
  addStatus,
  updateStatus,
  deleteStatus,
  setLoading,
  setError,
  onClearStatuses,
} = statusSlice.actions;

export default statusSlice;
