import { useDispatch, useSelector } from "react-redux";
import { useGoogleLogin } from '@react-oauth/google';
import Swal from "sweetalert2";

import { springApi } from "../api";
import { GoogleTokenResponse, UserDTO } from "../management";
import {
  clearErrorMessage,
  onChecking,
  onLogin,
  onLogout,
  RootState,
  AppDispatch,
  onLogoutBoards,
} from "../store";

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
}

interface AuthResponse {
  id: number;
  token: string;
  username: string;
  email: string;
}

interface UserRolesResponse {
  roles: string[];
  username: string;
}

export const useAuthStore = () => {
  const { status, user, errorMessage } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();

  const internalFetchAndSetUserRoles = async (baseUser: { id: number; username: string; email: string }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const { data: rolesData } = await springApi.get<UserRolesResponse>('/auth/user-roles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      dispatch(onLogin({ ...baseUser, roles: rolesData.roles }));
    } catch (error) {
      console.error("Error fetching user roles:", error);
    }
  };

  const startLogin = async ({ email, password }: LoginForm): Promise<void> => {
    dispatch(onChecking());
    try {
      const { data } = await springApi.post<AuthResponse>('/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('token-init-date', new Date().getTime().toString());
      const baseUser = { id: data.id, username: data.username, email: data.email };
      dispatch(onLogin(baseUser));
      await internalFetchAndSetUserRoles(baseUser);
    } catch (error: any) {
      const backendMsg = error?.response?.data?.msg || error?.response?.data?.message || 'Credenciales incorrectas';
      const backendEmail = error?.response?.data?.email || '';
      dispatch(onLogout({ message: backendMsg, email: backendEmail }));
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse: GoogleTokenResponse) => {
      const accessToken = tokenResponse.access_token;
      try {
        const { data } = await springApi.post<AuthResponse>('/auth/login/google', {
          accessToken,
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('token-init-date', new Date().getTime().toString());
        const baseUser = { id: data.id, username: data.username, email: data.email };
        dispatch(onLogin(baseUser));
        await internalFetchAndSetUserRoles(baseUser);
      } catch (error) {
        Swal.fire('Error', 'No se pudo autenticar con Google', 'error');
        dispatch(onLogout({ message: 'Fallo en la autenticación con Google post-token.' }));
      }
    },
    onError: () => {
      Swal.fire('Error', 'No se pudo autenticar con Google', 'error');
      dispatch(onLogout({ message: 'Error en el flujo de autenticación de Google.' }));
    },
  });

  const startRegister = async ({ first_name, last_name, email, username, password }: RegisterForm): Promise<void> => {
    dispatch(onChecking());
    try {
      await springApi.post<AuthResponse>('/auth/register', {
        first_name,
        last_name,
        email,
        username,
        password,
      });
      dispatch(onLogout(undefined));
      return;
    } catch (error: any) {
      const backendError = error?.response?.data;
      if (typeof backendError === 'object' && backendError !== null) {
        dispatch(onLogout({ message: '', ...backendError }));
      } else {
        const backendMsg = backendError?.msg || backendError?.message || 'Error en el registro';
        dispatch(onLogout({ message: backendMsg }));
      }
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
      throw error;
    }
  };

  const checkAuthToken = async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch(onLogout(undefined));
      return false;
    }

    try {
      const { data } = await springApi.post<AuthResponse>('/auth/check-token', null, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('token-init-date', new Date().getTime().toString());
      const baseUser = { id: data.id, username: data.username, email: data.email };
      dispatch(onLogin(baseUser));
      await internalFetchAndSetUserRoles(baseUser);
      return true;
    } catch (error) {
      localStorage.clear();
      dispatch(onLogout(undefined));
      return false;
    }
  };

  const startLogout = (): void => {
    localStorage.clear();
    dispatch(onLogoutBoards());
    dispatch(onLogout(undefined));
  };

  const getAllEmails = async (): Promise<UserDTO[]> => {
    try {
      const { data } = await springApi.get<UserDTO[]>('/auth/emails');
      return data;
    } catch (error) {
      return [];
    }
  };

  const resendVerificationEmail = async (email: string): Promise<boolean> => {
    try {
      await springApi.post('/auth/resend-verification', { email });
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    status,
    user,
    errorMessage,
    googleLogin,
    startLogin,
    startRegister,
    checkAuthToken,
    startLogout,
    getAllEmails,
    resendVerificationEmail,
  };
};
