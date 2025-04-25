import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useGoogleLogin } from '@react-oauth/google';

import { springApi } from "../api";
import { 
  clearErrorMessage, 
  onChecking, 
  onLogin, 
  onLogout,
  RootState, 
  AppDispatch,
  onLogoutBoards,
} from "../store";
import { GoogleTokenResponse } from "../management";
import Swal from "sweetalert2";

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
  token: string;
  username: string;
  email: string;
}

export const useAuthStore = () => {
  const { status, user, errorMessage } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const startLogin = async ({ email, password }: LoginForm): Promise<void> => {
    dispatch(onChecking());
    try {
      const { data } = await springApi.post<AuthResponse>('/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('token-init-date', new Date().getTime().toString());
      dispatch(onLogin({ username: data.username, email: data.email }));
    } catch (error: any) {
      dispatch(onLogout('Credenciales incorrectas'));
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
        dispatch(onLogin({ username: data.username, email: data.email }));
      } catch (error) {
        Swal.fire('Error', 'No se pudo autenticar con Google', 'error');
      }
    },
    onError: (error: Error) => {
      console.error('Error al intentar autenticar con Google:', error);
      Swal.fire('Error', 'No se pudo autenticar con Google', 'error');
    },
  });
  
  
  

  const startRegister = async ({ first_name, last_name, email, username, password }: RegisterForm): Promise<void> => {
    dispatch(onChecking()); 
    try {
      await springApi.post<AuthResponse>('/auth/register', { first_name, last_name, email, username, password });
      await navigate('/auth/login');
    } catch (error: any) {
      dispatch(onLogout(error.response?.data?.msg || ''));
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
    }
  };

  const checkAuthToken = async (): Promise<void> => {
    if (status === 'not-authenticated') {
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch(onLogout());
      return;
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
      dispatch(onLogin({ username: data.username, email: data.email }));
    } catch (error) {
      localStorage.clear();
      dispatch(onLogout());
    }
  };  

  const startLogout = (): void => {
    localStorage.clear();
    dispatch( onLogoutBoards() );
    dispatch(onLogout());
  };

  return {
    status,
    user,
    errorMessage,

    startLogin,
    startRegister,
    checkAuthToken,
    startLogout,
    googleLogin,
  };
};