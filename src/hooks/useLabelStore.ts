import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { springApi } from '../api';
import { LabelDTO } from '../management';
import {
  RootState,
  onAddNewLabel,
  onDeleteLabel,
  onLoadLabelsByBoard,
  onSetActiveLabel,
  onUpdateLabel,
  onStartLoadingLabels,
  onClearLabels,
} from '../store';

export const useLabelStore = () => {
  const dispatch = useDispatch();
  const { labels, labelsByBoard, activeLabel, isLoadingLabels } = useSelector(
    (state: RootState) => state.label
  );

  const setActiveLabel = (label: LabelDTO | null) => {
    dispatch(onSetActiveLabel(label));
  };

  const startSavingLabel = async (label: LabelDTO) => {
    try {
      let response;

      if (label.id) {
        response = await springApi.put(`/labels/${label.id}`, label);
        dispatch(onUpdateLabel(response.data));
      } else {
        response = await springApi.post(`/labels/${label.boardId}`, label);
        dispatch(onAddNewLabel(response.data));
      }

      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error al guardar la etiqueta';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
      throw error;
    }
  };

  const startDeletingLabel = async (labelId: number) => {
    try {
      await springApi.delete(`/labels/${labelId}`);
      dispatch(onDeleteLabel(labelId));
    } catch (error: any) {
      Swal.fire('Error al eliminar', error.response?.data?.msg || 'Error desconocido', 'error');
    }
  };

  const startLoadingLabelsByBoard = async (boardId: number) => {
    try {
      dispatch(onStartLoadingLabels());
      const { data } = await springApi.get(`/labels/${boardId}`);
      dispatch(onLoadLabelsByBoard({ labels: data, boardId }));
    } catch (error: any) {
      Swal.fire('Error', 'No se pudieron cargar las etiquetas', 'error');
    }
  };

  const clearLabels = () => {
    dispatch(onClearLabels());
  };

  return {
    labels,
    activeLabel,
    isLoadingLabels,
    hasLabelSelected: !!activeLabel,

    setActiveLabel,
    startSavingLabel,
    startDeletingLabel,
    startLoadingLabelsByBoard,
    clearLabels,

    getLabelsByBoard: (boardId: number) => labelsByBoard[boardId] || [],
  };
};
