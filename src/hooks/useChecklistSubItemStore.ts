import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import { springApi } from '../api';
import { ChecklistSubItemDTO } from '../management';
import {
  RootState,
  onLoadSubItemsByChecklistItem,
  onAddSubItem,
  onUpdateSubItem,
  onDeleteSubItem,
  onSetActiveSubItem,
  onStartLoading,
  onSetError,
  onClearSubItems,
} from '../store';

export const useChecklistSubItemStore = () => {
  const dispatch = useDispatch();
  const { 
    subItems, 
    subItemsByChecklistItem, 
    activeSubItem, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.checklistSubItem);

  const setActiveSubItem = (subItem: ChecklistSubItemDTO | null) => {
    dispatch(onSetActiveSubItem(subItem));
  };

  const startLoadingSubItemsByChecklistItem = async (checklistItemId: number) => {
    try {
      dispatch(onStartLoading());
      const { data } = await springApi.get(`/checklist-subitems/${checklistItemId}`);
      dispatch(onLoadSubItemsByChecklistItem({ subItems: data, checklistItemId }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar los subitems del checklist';
      dispatch(onSetError(errorMessage));
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  const startSavingSubItem = async (checklistItemId: number, subItem: ChecklistSubItemDTO) => {
    try {
      let response;
      
      if (subItem.id) {
        response = await springApi.put(`/checklist-subitems/${subItem.id}`, subItem);
        dispatch(onUpdateSubItem(response.data));
      } else {
        response = await springApi.post(`/checklist-subitems/${checklistItemId}`, subItem);
        dispatch(onAddSubItem(response.data));
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al guardar el subitem del checklist';
      dispatch(onSetError(errorMessage));
      Swal.fire('Error', errorMessage, 'error');
      throw error;
    }
  };

  const startDeletingSubItem = async (id: number, checklistItemId: number) => {
    try {
      await springApi.delete(`/checklist-subitems/${id}`);
      dispatch(onDeleteSubItem({ id, checklistItemId }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar el subitem del checklist';
      dispatch(onSetError(errorMessage));
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  const clearSubItems = () => {
    dispatch(onClearSubItems());
  };

  return {
    subItems,
    subItemsByChecklistItem,
    activeSubItem,
    isLoading,
    error,

    getSubItemsByChecklistItem: (checklistItemId: number) => subItemsByChecklistItem[checklistItemId] || [],

    setActiveSubItem,
    startLoadingSubItemsByChecklistItem,
    startSavingSubItem,
    startDeletingSubItem,
    clearSubItems,
  };
};