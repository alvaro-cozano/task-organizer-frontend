import { useEffect, FormEvent, ChangeEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from "@mui/material";
import Swal from 'sweetalert2';
import { useAuthStore, useForm } from '../../hooks';
import "./AuthPage.css";

interface RegisterFormFields {
  registerFirstName: string;
  registerLastName: string;
  registerEmail: string;
  registerUsername: string;
  registerPassword: string;
  registerPassword2: string;
}

const registerFormFields: RegisterFormFields = {
  registerFirstName: '',
  registerLastName: '',
  registerEmail: '',
  registerUsername: '',
  registerPassword: '',
  registerPassword2: '',
};

export const RegisterPage = () => {
  const { errorMessage, startRegister } = useAuthStore();

  const {
    registerFirstName,
    registerLastName,
    registerEmail,
    registerUsername,
    registerPassword,
    registerPassword2,
    onInputChange: onRegisterInputChange,
  }: {
    registerFirstName: string;
    registerLastName: string;
    registerEmail: string;
    registerUsername: string;
    registerPassword: string;
    registerPassword2: string;
    onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  } = useForm(registerFormFields);

  const registerSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (registerPassword !== registerPassword2) {
      Swal.fire('Error en el registro', 'Las contraseñas no coinciden', 'error');
      return;
    }

    startRegister({
      first_name: registerFirstName,
      last_name: registerLastName,
      email: registerEmail,
      username: registerUsername,
      password: registerPassword,
    });
  };

  useEffect(() => {
    if (errorMessage !== undefined) {
      Swal.fire('Error en la autenticación', errorMessage, 'error');
    }
  }, [errorMessage]);

  return (
    <div className="register-page">
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="register-form-2 p-4">
          <h3 className="custom-title">Registro</h3>
          <form onSubmit={registerSubmit}>
            <div className="form-group">
              <label htmlFor="registerUsername" className="form-label">Usuario</label>
              <input
                type="text"
                className="form-control"
                name="registerUsername"
                value={registerUsername}
                onChange={onRegisterInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="registerEmail" className="form-label">Correo electrónico</label>
              <input
                type="email"
                className="form-control"
                name="registerEmail"
                value={registerEmail}
                onChange={onRegisterInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="registerPassword" className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                name="registerPassword"
                value={registerPassword}
                onChange={onRegisterInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="registerPassword2" className="form-label">Repetir contraseña</label>
              <input
                type="password"
                className="form-control"
                name="registerPassword2"
                value={registerPassword2}
                onChange={onRegisterInputChange}
              />
            </div>
            <div className="form-group">
              <button type="submit" className="btnSubmit w-100">
                Aceptar
              </button>
            </div>
          </form>
          <Link component={RouterLink} to="/auth/login" className="MuiLink-root">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
};