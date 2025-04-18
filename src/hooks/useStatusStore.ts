import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { StatusDTO } from '../management/organizer/types/StatusDTO';
import {
  setStatuses,
  addStatus,
  updateStatus,
  deleteStatus,
  setLoading,
  setError
} from '../store/organizer/statusSlice';
import { springApi } from '../api';

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
      dispatch(setError('Error al crear el estado'));
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
      dispatch(setError('Error al actualizar el estado'));
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

  return {
    statuses,
    loading,
    error,
    loadStatuses,
    createStatus,
    modifyStatus,
    removeStatus,
  };
};