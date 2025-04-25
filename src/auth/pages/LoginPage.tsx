import { useEffect, FormEvent, ChangeEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link, Button, Typography } from '@mui/material';
import Swal from 'sweetalert2';
import { Google } from "@mui/icons-material";
import { useAuthStore, useForm } from '../../hooks';
import "./AuthPage.css";

interface LoginFormFields {
  loginEmail: string;
  loginPassword: string;
}

const loginFormFields: LoginFormFields = {
  loginEmail: '',
  loginPassword: '',
};

export const LoginPage = () => {
  const { startLogin, googleLogin, errorMessage } = useAuthStore();

  const {
    loginEmail,
    loginPassword,
    onInputChange: onLoginInputChange
  }: {
    loginEmail: string;
    loginPassword: string;
    onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  } = useForm(loginFormFields);

  const loginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startLogin({ email: loginEmail, password: loginPassword });
  };

  useEffect(() => {
    if (errorMessage !== undefined) {
      Swal.fire('Error en la autenticación', errorMessage, 'error');
    }
  }, [errorMessage]);

  return (
    <div className="login-page">
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="login-form-1 p-4">
          <h3 className="custom-title">Iniciar sesión</h3>
          <form onSubmit={loginSubmit}>
            <div className="form-group">
              <label htmlFor="loginEmail" className="form-label">Usuario o correo</label>
              <input
                type="text"
                className="form-control"
                name="loginEmail"
                id="loginEmail"
                value={loginEmail}
                onChange={onLoginInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="loginPassword" className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                name="loginPassword"
                id="loginPassword"
                value={loginPassword}
                onChange={onLoginInputChange}
              />
            </div>
            <div className="form-group">
              <button type="submit" className="btnSubmit w-100">
                Aceptar
              </button>
            </div>
            <div className="button-container mt-3">
              <Button
                variant="contained"
                fullWidth
                startIcon={<Google />}
                onClick={() => googleLogin()}
              >
                <Typography sx={{ ml: 1 }}>Iniciar con Google</Typography>
              </Button>
            </div>
          </form>
          <Link component={RouterLink} to="/auth/register" className="MuiLink-root">
            No tienes cuenta? Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
};