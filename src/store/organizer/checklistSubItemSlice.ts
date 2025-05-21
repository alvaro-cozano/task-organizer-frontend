import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ChecklistSubItemDTO } from '../../management';

interface ChecklistSubItemState {
  subItems: ChecklistSubItemDTO[];
  subItemsByChecklistItem: { [checklistItemId: number]: ChecklistSubItemDTO[] };
  activeSubItem: ChecklistSubItemDTO | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChecklistSubItemState = {
  subItems: [],
  subItemsByChecklistItem: {},
  activeSubItem: null,
  isLoading: false,
  error: null,
};

const checklistSubItemSlice = createSlice({
  name: 'checklistSubItem',
  initialState,
  reducers: {
    onLoadSubItemsByChecklistItem: (state, action: PayloadAction<{ subItems: ChecklistSubItemDTO[], checklistItemId: number }>) => {
      const { subItems, checklistItemId } = action.payload;
      state.subItemsByChecklistItem = {
        ...state.subItemsByChecklistItem,
        [checklistItemId]: subItems,
      };
      const otherSubItems = state.subItems.filter(item => item.checklistItemId !== checklistItemId);
      state.subItems = [...otherSubItems, ...subItems];
      state.isLoading = false;
    },
    onAddSubItem: (state, action: PayloadAction<ChecklistSubItemDTO>) => {
      const subItem = action.payload;
      state.subItems.push(subItem);
      
      if (state.subItemsByChecklistItem[subItem.checklistItemId]) {
        state.subItemsByChecklistItem[subItem.checklistItemId].push(subItem);
      } else {
        state.subItemsByChecklistItem[subItem.checklistItemId] = [subItem];
      }
    },
    onUpdateSubItem: (state, action: PayloadAction<ChecklistSubItemDTO>) => {
      const updatedSubItem = action.payload;
      const index = state.subItems.findIndex(item => item.id === updatedSubItem.id);
      
      if (index !== -1) {
        state.subItems[index] = updatedSubItem;
      }
      
      if (state.subItemsByChecklistItem[updatedSubItem.checklistItemId]) {
        const checklistItemIndex = state.subItemsByChecklistItem[updatedSubItem.checklistItemId]
          .findIndex(item => item.id === updatedSubItem.id);
        
        if (checklistItemIndex !== -1) {
          state.subItemsByChecklistItem[updatedSubItem.checklistItemId][checklistItemIndex] = updatedSubItem;
        }
      }
    },
    onDeleteSubItem: (state, action: PayloadAction<{ id: number, checklistItemId: number }>) => {
      const { id, checklistItemId } = action.payload;
      state.subItems = state.subItems.filter(item => item.id !== id);
      
      if (state.subItemsByChecklistItem[checklistItemId]) {
        state.subItemsByChecklistItem[checklistItemId] = 
          state.subItemsByChecklistItem[checklistItemId].filter(item => item.id !== id);
      }
    },
    onSetActiveSubItem: (state, action: PayloadAction<ChecklistSubItemDTO | null>) => {
      state.activeSubItem = action.payload;
    },
    onStartLoadingSubItems: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    onSetSubItemsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    onClearSubItems: (state) => {
      state.subItems = [];
      state.subItemsByChecklistItem = {};
      state.activeSubItem = null;
      state.error = null;
    }
  },
});

export const {
  onLoadSubItemsByChecklistItem,
  onAddSubItem,
  onUpdateSubItem,
  onDeleteSubItem,
  onSetActiveSubItem,
  onStartLoadingSubItems,
  onSetSubItemsError,
  onClearSubItems,
} = checklistSubItemSlice.actions;

export default checklistSubItemSlice;