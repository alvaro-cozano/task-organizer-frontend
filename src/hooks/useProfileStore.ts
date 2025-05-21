import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import { springApi } from '../api';
import { UserProfileDTO } from '../management';
import {
  RootState,
  onLoadProfile,
  onUpdateProfile,
  onStartLoadingProfile,
  onEndLoadingProfile,
} from '../store';

export const useProfileStore = () => {
  const dispatch = useDispatch();
  const { profile, isLoading } = useSelector((state: RootState) => state.profile);

  const startLoadingProfile = async (): Promise<UserProfileDTO | null> => {
    try {
      dispatch(onStartLoadingProfile());
      const { data } = await springApi.get<UserProfileDTO>('/auth/profile');
      dispatch(onLoadProfile(data));
      return data;
    } catch (error: any) {
      Swal.fire('Error', 'No se pudo cargar el perfil', 'error');
      return null;
    } finally {
      dispatch(onEndLoadingProfile());
    }
  };

  const startUpdatingProfile = async (id: number, profileData: UserProfileDTO) => {
    try {
      const { data } = await springApi.put(`/auth/profile/${id}`, profileData);
      Swal.fire('Perfil actualizado', data, 'success');
      dispatch(onUpdateProfile(profileData));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.password || 'Error al actualizar perfil';
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  return {
    profile,
    isLoading,
    startLoadingProfile,
    startUpdatingProfile,
  };
};
