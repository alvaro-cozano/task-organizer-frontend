import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import { springApi } from '../api';
import { StatusDTO } from '../management';
import {
  RootState,
  setStatuses,
  addStatus,
  updateStatus,
  deleteStatus,
  setLoading,
  setError,
  onClearStatuses
} from '../store';

export const useStatusStore = () => {
  const dispatch = useDispatch();
  const statuses = useSelector((state: RootState) => state.status.statuses);
  const loading = useSelector((state: RootState) => state.status.loading);
  const error = useSelector((state: RootState) => state.status.error);

  const loadStatuses = async (boardId: number) => {
    dispatch(setLoading(true));
    try {
      const { data } = await springApi.get(`/status/board/${boardId}`);
      dispatch(setStatuses(data));
    } catch (err: any) {
      dispatch(setError('Error al cargar los estados'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const createStatus = async (status: StatusDTO) => {
    dispatch(setLoading(true));
    try {
      const { data } = await springApi.post('/status', status);
      dispatch(addStatus(data));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Ya existe un estado con ese nombre en este tablero';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  const modifyStatus = async (status: StatusDTO) => {
    dispatch(setLoading(true));
    try {
      const { data } = await springApi.put(`/status/${status.id}`, status);
      dispatch(updateStatus(data));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Ya existe un estado con ese nombre en este tablero';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    } finally {
      dispatch(setLoading(false));
    }
  };
  

  const removeStatus = async (id: number) => {
    dispatch(setLoading(true));
    try {
      await springApi.delete(`/status/${id}`);
      dispatch(deleteStatus(id));
    } catch (err: any) {
      dispatch(setError('Error al eliminar el estado'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const clearStatuses = () => {
    dispatch(onClearStatuses());
  };

  return {
    statuses,
    loading,
    error,
    loadStatuses,
    createStatus,
    modifyStatus,
    removeStatus,
    clearStatuses,
  };
};