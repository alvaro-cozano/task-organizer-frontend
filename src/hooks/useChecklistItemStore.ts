import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import { springApi } from '../api';
import { ChecklistItemDTO } from '../management';
import {
  RootState,
  onLoadChecklistItemsByCard,
  onAddChecklistItem,
  onUpdateChecklistItem,
  onDeleteChecklistItem,
  onSetActiveChecklistItem,
  onStartLoading,
  onSetError,
  onClearChecklistItems,
} from '../store';

export const useChecklistItemStore = () => {
  const dispatch = useDispatch();
  const { 
    checklistItems, 
    checklistItemsByCard, 
    activeChecklistItem, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.checklistItem);

  const setActiveChecklistItem = (item: ChecklistItemDTO | null) => {
    dispatch(onSetActiveChecklistItem(item));
  };

  const startLoadingChecklistItemsByCard = async (cardId: number) => {
    try {
      dispatch(onStartLoading());
      const { data } = await springApi.get(`/checklist-items/card/${cardId}`);
      dispatch(onLoadChecklistItemsByCard({ items: data, cardId }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar los items del checklist';
      dispatch(onSetError(errorMessage));
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  const startSavingChecklistItem = async (cardId: number, item: ChecklistItemDTO) => {
    try {
      let response;
      
      if (item.id) {
        response = await springApi.put(`/checklist-items/${item.id}`, item);
        dispatch(onUpdateChecklistItem(response.data));
      } else {
        response = await springApi.post(`/checklist-items/card/${cardId}`, item);
        dispatch(onAddChecklistItem(response.data));
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al guardar el item del checklist';
      dispatch(onSetError(errorMessage));
      Swal.fire('Error', errorMessage, 'error');
      throw error;
    }
  };

  const startDeletingChecklistItem = async (id: number, cardId: number) => {
    try {
      await springApi.delete(`/checklist-items/${id}`);
      dispatch(onDeleteChecklistItem({ id, cardId }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar el item del checklist';
      dispatch(onSetError(errorMessage));
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  const clearChecklistItems = () => {
    dispatch(onClearChecklistItems());
  };

  return {
    checklistItems,
    checklistItemsByCard,
    activeChecklistItem,
    isLoading,
    error,

    getChecklistItemsByCard: (cardId: number) => checklistItemsByCard[cardId] || [],

    setActiveChecklistItem,
    startLoadingChecklistItemsByCard,
    startSavingChecklistItem,
    startDeletingChecklistItem,
    clearChecklistItems,
  };
};