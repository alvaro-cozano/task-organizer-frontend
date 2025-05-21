import { useEffect, FormEvent, ChangeEvent, useState } from 'react';
import { motion } from 'framer-motion';

import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Link, Button, Typography, IconButton, InputAdornment } from '@mui/material';
import { Google, Visibility, VisibilityOff } from "@mui/icons-material";
import Swal from 'sweetalert2';

import { useAuthStore, useForm } from '../../hooks';

import TaskorT from '../../management/icons/LogoTaskorInverso.png';
import "../style/AuthPage.css";

interface LoginFormFields {
  loginEmail: string;
  loginPassword: string;
}

const loginFormFields: LoginFormFields = {
  loginEmail: '',
  loginPassword: '',
};

const TIMEOUT_NAVIGATION = 800;
const CONTAINER_ANIM_DURATION_S = 0.5;
const CONTENT_EXIT_ANIM_DURATION_S = 0.7;
const CONTENT_ENTRY_ANIM_DURATION_S = 0.8;

export const LoginPage = () => {
  const { startLogin, googleLogin, errorMessage, resendVerificationEmail, checkAuthToken } = useAuthStore();
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendEmail, setResendEmail] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleGoToRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    setAnimatingOut(true);
    setTimeout(() => {
      navigate('/auth/register');
    }, TIMEOUT_NAVIGATION);
  };

  useEffect(() => {
    if (errorMessage !== undefined) {
      const msg = typeof errorMessage === 'string' ? errorMessage : errorMessage.message;
      Swal.fire('Error en la autenticación', msg, 'error');
      if (
        msg.toLowerCase().includes('verificar') ||
        msg.toLowerCase().includes('confirmar')
      ) {
        setShowResend(true);
        setResendEmail(
          typeof errorMessage === 'object' && errorMessage.email ? errorMessage.email : ''
        );
      } else {
        setShowResend(false);
        setResendEmail('');
      }
    }
  }, [errorMessage]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('token-init-date', new Date().getTime().toString());
      checkAuthToken().then((ok) => {
        if (ok) {
          Swal.fire('¡Cuenta verificada!', 'Has iniciado sesión automáticamente.', 'success');
          navigate('/');
        } else {
          Swal.fire('Token inválido', 'El enlace de verificación no es válido o ha expirado.', 'error');
          navigate('/auth/login');
        }
      });
    }
  }, [location, checkAuthToken, navigate]);

  const handleResendVerification = async () => {
    if (!resendEmail) {
      Swal.fire('Error', 'No se ha detectado ningún correo para reenviar la verificación.', 'error');
      return;
    }
    setResendLoading(true);
    const ok = await resendVerificationEmail(resendEmail);
    if (ok) {
      Swal.fire('Correo enviado', 'Se ha reenviado el correo de verificación.', 'success');
    } else {
      Swal.fire('Error', 'No se pudo reenviar el correo. Intenta más tarde.', 'error');
    }
    setResendLoading(false);
  };

  return (
    <div className="login-page">
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <motion.div
          className="login-form-1 p-4 position-relative"
          style={{ overflow: 'hidden' }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={animatingOut
            ? { scale: 0.90, opacity: 0, transition: { duration: CONTAINER_ANIM_DURATION_S, ease: "easeIn" } }
            : { scale: 1, opacity: 1, transition: { duration: CONTAINER_ANIM_DURATION_S, ease: "easeOut" } }
          }
        >
          <motion.div
            initial={{ y: -100 }}
            animate={animatingOut 
              ? { y: 100, opacity: 0, transition: { duration: CONTENT_EXIT_ANIM_DURATION_S, ease: [0.4, 0, 0.2, 1] } } 
              : { y: 0, opacity: 1, transition: { duration: CONTENT_ENTRY_ANIM_DURATION_S, ease: [0.22, 1, 0.36, 1] } }
            }
            style={{ width: '100%' }}
          >
            <img
              src={TaskorT}
              className="d-block mx-auto mb-5 logo-taskort"
              alt="TaskorT Logo"
            />
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
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    name="loginPassword"
                    id="loginPassword"
                    value={loginPassword}
                    onChange={onLoginInputChange}
                  />
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      className="password-visibility-button"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                </div>
              </div>
              <div className="form-group">
                <button type="submit" className="btnSubmit w-100">
                  Aceptar
                </button>
              </div>
              {showResend && (
                <div className="form-group mt-2">
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    disabled={resendLoading}
                    onClick={handleResendVerification}
                  >
                    {resendLoading ? 'Enviando...' : 'Reenviar correo de verificación'}
                  </Button>
                </div>
              )}
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
            <Link
              component={RouterLink}
              to="/auth/register"
              className="MuiLink-root"
              onClick={handleGoToRegister}
            >
              ¿No tienes cuenta? Regístrate
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};