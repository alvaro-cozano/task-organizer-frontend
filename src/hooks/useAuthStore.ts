import { useDispatch, useSelector } from "react-redux";
import { springApi } from "../api";
import { clearErrorMessage, onChecking, onLogin, onLogout, onLogoutBoards } from "../store";
import { RootState, AppDispatch } from "../store/store";
import { useNavigate } from "react-router";

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
      dispatch(onLogin({ username: data.username }));
    } catch (error: any) {
      dispatch(onLogout('Credenciales incorrectas'));
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
    }
  };

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
      console.log('El usuario no está autenticado, no ejecutando checkAuthToken.');
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
      dispatch(onLogin({ username: data.username }));
    } catch (error) {
      console.error('Error al renovar el token:', error);
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
  };
};