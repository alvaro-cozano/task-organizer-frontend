import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { LabelDTO } from '../../management';

interface LabelState {
  labels: LabelDTO[];
  labelsByBoard: { [boardId: number]: LabelDTO[] };
  activeLabel: LabelDTO | null;
  isLoadingLabels: boolean;
}

const initialState: LabelState = {
  labels: [],
  labelsByBoard: {},
  activeLabel: null,
  isLoadingLabels: false,
};

const labelSlice = createSlice({
  name: 'label',
  initialState,
  reducers: {
    onAddNewLabel: (state, action: PayloadAction<LabelDTO>) => {
      state.labels.push(action.payload);
      if (state.labelsByBoard[action.payload.boardId]) {
        state.labelsByBoard[action.payload.boardId].push(action.payload);
      }
    },
    onDeleteLabel: (state, action: PayloadAction<number>) => {
      const deletedLabel = state.labels.find(label => label.id === action.payload);
      state.labels = state.labels.filter((label) => label.id !== action.payload);
      
      if (deletedLabel && state.labelsByBoard[deletedLabel.boardId]) {
        state.labelsByBoard[deletedLabel.boardId] = 
          state.labelsByBoard[deletedLabel.boardId].filter(label => label.id !== action.payload);
      }
    },
    onLoadLabelsByBoard: (state, action: PayloadAction<{ labels: LabelDTO[], boardId: number }>) => {
      const { labels, boardId } = action.payload;
      state.isLoadingLabels = false;
      state.labelsByBoard = {
        ...state.labelsByBoard,
        [boardId]: labels,
      };
      const otherLabels = state.labels.filter(label => label.boardId !== boardId);
      state.labels = [...otherLabels, ...labels];
    },
    onStartLoadingLabels: (state) => {
      state.isLoadingLabels = true;
    },
    onSetActiveLabel: (state, action: PayloadAction<LabelDTO | null>) => {
      state.activeLabel = action.payload;
    },
    onUpdateLabel: (state, action: PayloadAction<LabelDTO>) => {
      const index = state.labels.findIndex((label) => label.id === action.payload.id);
      if (index !== -1) {
        state.labels[index] = action.payload;
      } else {
        state.labels.push(action.payload);
      }
      
      if (state.labelsByBoard[action.payload.boardId]) {
        const boardIndex = state.labelsByBoard[action.payload.boardId]
          .findIndex(label => label.id === action.payload.id);
        
        if (boardIndex !== -1) {
          state.labelsByBoard[action.payload.boardId][boardIndex] = action.payload;
        } else {
          state.labelsByBoard[action.payload.boardId].push(action.payload);
        }
      }
    },
    onClearLabels: (state) => {
      state.labels = [];
      state.labelsByBoard = {};
      state.activeLabel = null;
    }
  },
});

export const {
  onAddNewLabel,
  onDeleteLabel,
  onLoadLabelsByBoard,
  onStartLoadingLabels,
  onSetActiveLabel,
  onUpdateLabel,
  onClearLabels,
} = labelSlice.actions;

export default labelSlice;