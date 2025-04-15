import { useEffect, FormEvent, ChangeEvent } from 'react';
import Swal from 'sweetalert2';
import { useAuthStore, useForm } from '../../hooks';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from "@mui/material"

import './AuthPage.css';

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
    <div className="container login-container">
      <div className="row">
        <div className="col-md-6 login-form-2">
          <h3>Registro</h3>
          <form onSubmit={registerSubmit}>
            <div className="form-group mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Nombre"
                name="registerFirstName"
                value={registerFirstName}
                onChange={onRegisterInputChange}
              />
            </div>
            <div className="form-group mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Apellido"
                name="registerLastName"
                value={registerLastName}
                onChange={onRegisterInputChange}
              />
            </div>
            <div className="form-group mb-2">
              <input
                type="email"
                className="form-control"
                placeholder="Correo"
                name="registerEmail"
                value={registerEmail}
                onChange={onRegisterInputChange}
              />
            </div>
            <div className="form-group mb-2">
              <input
                type="username"
                className="form-control"
                placeholder="Usuario"
                name="registerUsername"
                value={registerUsername}
                onChange={onRegisterInputChange}
              />
            </div>
            <div className="form-group mb-2">
              <input
                type="password"
                className="form-control"
                placeholder="Contraseña"
                name="registerPassword"
                value={registerPassword}
                onChange={onRegisterInputChange}
              />
            </div>
            <div className="form-group mb-2">
              <input
                type="password"
                className="form-control"
                placeholder="Repita la contraseña"
                name="registerPassword2"
                value={registerPassword2}
                onChange={onRegisterInputChange}
              />
            </div>
            <div className="form-group mb-2">
              <input
                type="submit"
                className="btnSubmit"
                value="Crear cuenta"
              />
            </div>
          </form>
          <Link component={RouterLink} color='inherit' to="/auth/login">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
};
