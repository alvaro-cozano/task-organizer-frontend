import { useEffect, FormEvent, ChangeEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link, Button, Typography } from '@mui/material';
import Swal from 'sweetalert2';
import { Google } from "@mui/icons-material";
import { useAuthStore, useForm } from '../../hooks';

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
    <div className="container login-container">
      <div className="row">
        <div className="col-md-6 login-form-1">
          <h3>Iniciar sesión</h3>
          <form onSubmit={loginSubmit}>
            <div className="form-group mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Introduzca su usuario o correo"
                name="loginEmail"
                value={loginEmail}
                onChange={onLoginInputChange}
              />
            </div>
            <div className="form-group mb-2">
              <input
                type="password"
                className="form-control"  
                placeholder="Introduzca su contraseña"
                name="loginPassword"
                value={loginPassword}
                onChange={onLoginInputChange}
              />
            </div>
            <div className="form-group mb-2">
              <input
                type="submit"
                className="btnSubmit"
                value="Login"
              />
            </div>
            
            <div className="button-container">
              <div className="button-item">
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Google />}
                  onClick={() => googleLogin()}
                >
                  <Typography sx={{ ml: 1 }}>Google</Typography>
                </Button>
              </div>
            </div>
            
          </form>
          <Link component={RouterLink} color='inherit' to="/auth/register">
            Crear una cuenta
          </Link>
        </div>
      </div>
    </div>
  );
};