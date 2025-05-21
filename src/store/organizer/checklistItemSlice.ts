import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ChecklistItemDTO } from '../../management';

interface ChecklistItemState {
  checklistItems: ChecklistItemDTO[];
  checklistItemsByCard: { [cardId: number]: ChecklistItemDTO[] };
  activeChecklistItem: ChecklistItemDTO | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChecklistItemState = {
  checklistItems: [],
  checklistItemsByCard: {},
  activeChecklistItem: null,
  isLoading: false,
  error: null,
};

const checklistItemSlice = createSlice({
  name: 'checklistItem',
  initialState,
  reducers: {
    onLoadChecklistItemsByCard: (state, action: PayloadAction<{ items: ChecklistItemDTO[], cardId: number }>) => {
      const { items, cardId } = action.payload;
      state.checklistItemsByCard = {
        ...state.checklistItemsByCard,
        [cardId]: items,
      };
      const otherItems = state.checklistItems.filter(item => item.cardId !== cardId);
      state.checklistItems = [...otherItems, ...items];
      state.isLoading = false;
    },
    onAddChecklistItem: (state, action: PayloadAction<ChecklistItemDTO>) => {
      const item = action.payload;
      state.checklistItems.push(item);
      
      if (state.checklistItemsByCard[item.cardId]) {
        state.checklistItemsByCard[item.cardId].push(item);
      } else {
        state.checklistItemsByCard[item.cardId] = [item];
      }
    },
    onUpdateChecklistItem: (state, action: PayloadAction<ChecklistItemDTO>) => {
      const updatedItem = action.payload;
      const index = state.checklistItems.findIndex(item => item.id === updatedItem.id);
      
      if (index !== -1) {
        state.checklistItems[index] = updatedItem;
      }
      
      if (state.checklistItemsByCard[updatedItem.cardId]) {
        const cardIndex = state.checklistItemsByCard[updatedItem.cardId]
          .findIndex(item => item.id === updatedItem.id);
        
        if (cardIndex !== -1) {
          state.checklistItemsByCard[updatedItem.cardId][cardIndex] = updatedItem;
        }
      }
    },
    onDeleteChecklistItem: (state, action: PayloadAction<{ id: number, cardId: number }>) => {
      const { id, cardId } = action.payload;
      state.checklistItems = state.checklistItems.filter(item => item.id !== id);
      
      if (state.checklistItemsByCard[cardId]) {
        state.checklistItemsByCard[cardId] = 
          state.checklistItemsByCard[cardId].filter(item => item.id !== id);
      }
    },
    onSetActiveChecklistItem: (state, action: PayloadAction<ChecklistItemDTO | null>) => {
      state.activeChecklistItem = action.payload;
    },
    onStartLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    onSetError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    onClearChecklistItems: (state) => {
      state.checklistItems = [];
      state.checklistItemsByCard = {};
      state.activeChecklistItem = null;
      state.error = null;
    }
  },
});

export const {
  onLoadChecklistItemsByCard,
  onAddChecklistItem,
  onUpdateChecklistItem,
  onDeleteChecklistItem,
  onSetActiveChecklistItem,
  onStartLoading,
  onSetError,
  onClearChecklistItems,
} = checklistItemSlice.actions;

export default checklistItemSlice;