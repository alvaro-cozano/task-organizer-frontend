import { useEffect, FormEvent, ChangeEvent, useState } from 'react';
import { motion } from 'framer-motion';

import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Link, IconButton, InputAdornment, Popover, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Visibility, VisibilityOff, CheckCircleOutline, RadioButtonUncheckedOutlined } from '@mui/icons-material';
import Swal from 'sweetalert2';

import { useAuthStore, useForm } from '../../hooks';

import TaskorT from '../../management/icons/LogoTaskorInverso.png';
import "../style/AuthPage.css";

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

const TIMEOUT_NAVIGATION = 800;
const CONTAINER_ANIM_DURATION_S = 0.5;
const CONTENT_EXIT_ANIM_DURATION_S = 0.7;
const CONTENT_ENTRY_ANIM_DURATION_S = 0.8;

export const RegisterPage = () => {
  const { errorMessage, startRegister } = useAuthStore();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLInputElement | null>(null);
  const [animatingOut, setAnimatingOut] = useState(false);

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

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowPassword2 = () => setShowPassword2((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handlePasswordFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePasswordBlur = () => {
    setAnchorEl(null);
  };

  const isPasswordValid = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasMinLength = password.length >= 8;
    return { hasUpperCase, hasLowerCase, hasNumber, hasMinLength, allValid: hasUpperCase && hasLowerCase && hasNumber && hasMinLength };
  };

  const passwordValidationStatus = isPasswordValid(registerPassword);

  const registerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (registerPassword !== registerPassword2) {
      Swal.fire('Error en el registro', 'Las contraseñas no coinciden', 'error');
      return;
    }

    if (!passwordValidationStatus.allValid) {
      Swal.fire('Error en el registro', 'La contraseña no cumple con los requisitos.', 'error');
      return;
    }

    try {
      await startRegister({
        first_name: registerFirstName,
        last_name: registerLastName,
        email: registerEmail,
        username: registerUsername,
        password: registerPassword,
      });
      await Swal.fire(
        'Registro exitoso',
        'Revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.',
        'success'
      );
      navigate('/auth/login');
    } catch (error) {
    }
  };

  useEffect(() => {
    if (errorMessage !== undefined) {
      if (typeof errorMessage === 'string') {
        Swal.fire('Error en el registro', errorMessage, 'error');
      } else if (typeof errorMessage === 'object' && errorMessage !== null) {
        const messages = Object.values(errorMessage)
          .filter(msg => typeof msg === 'string' && msg.length > 0)
          .join('<br>');
        Swal.fire({
          title: 'Error en el registro',
          html: messages,
          icon: 'error'
        });
      }
    }
  }, [errorMessage]);

  const openPopover = Boolean(anchorEl);
  const idPopover = openPopover ? 'password-popover' : undefined;

  const handleGoToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setAnimatingOut(true);
    setTimeout(() => {
      navigate('/auth/login');
    }, TIMEOUT_NAVIGATION); 
  };

  return (
    <div className="register-page">
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <motion.div
          className="register-form-2 p-4 position-relative"
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
              : { y: 0, opacity: 1, transition: { duration: CONTENT_ENTRY_ANIM_DURATION_S, ease: [0.4, 0, 0.2, 1] } }
            }
            style={{ width: '100%' }}
          >
            <img
              src={TaskorT}
              className="d-block mx-auto mb-5 logo-taskort"
              alt="TaskorT Logo"
            />
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
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    name="registerPassword"
                    value={registerPassword}
                    onChange={onRegisterInputChange}
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                    aria-describedby={idPopover}
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
                <Popover
                  id={idPopover}
                  open={openPopover}
                  anchorEl={anchorEl}
                  onClose={handlePasswordBlur}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  disableRestoreFocus
                  disableEnforceFocus
                  disableAutoFocus
                  PaperProps={{
                    className: 'custom-popover-paper',
                  }}
                >
                  <div className="popover-content-wrapper">
                    <List dense className="password-popover-list">
                      <Typography variant="caption" display="block" gutterBottom className="password-popover-title">
                        La contraseña debe contener:
                      </Typography>
                      <ListItem className="password-popover-list-item">
                        <ListItemIcon className="password-popover-list-item-icon">
                          {passwordValidationStatus.hasUpperCase ? <CheckCircleOutline fontSize="small" color="success" /> : <RadioButtonUncheckedOutlined fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText primary={<Typography variant="caption">Al menos una mayúscula</Typography>} />
                      </ListItem>
                      <ListItem className="password-popover-list-item">
                        <ListItemIcon className="password-popover-list-item-icon">
                          {passwordValidationStatus.hasLowerCase ? <CheckCircleOutline fontSize="small" color="success" /> : <RadioButtonUncheckedOutlined fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText primary={<Typography variant="caption">Al menos una minúscula</Typography>} />
                      </ListItem>
                      <ListItem className="password-popover-list-item">
                        <ListItemIcon className="password-popover-list-item-icon">
                          {passwordValidationStatus.hasNumber ? <CheckCircleOutline fontSize="small" color="success" /> : <RadioButtonUncheckedOutlined fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText primary={<Typography variant="caption">Al menos un número</Typography>} />
                      </ListItem>
                      <ListItem className="password-popover-list-item">
                        <ListItemIcon className="password-popover-list-item-icon">
                          {passwordValidationStatus.hasMinLength ? <CheckCircleOutline fontSize="small" color="success" /> : <RadioButtonUncheckedOutlined fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText primary={<Typography variant="caption">Mínimo 8 caracteres</Typography>} />
                      </ListItem>
                    </List>
                  </div>
                </Popover>
              </div>
              <div className="form-group">
                <label htmlFor="registerPassword2" className="form-label">Repetir contraseña</label>
                <div className="input-group">
                  <input
                    type={showPassword2 ? 'text' : 'password'}
                    className="form-control"
                    name="registerPassword2"
                    value={registerPassword2}
                    onChange={onRegisterInputChange}
                  />
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword2}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      className="password-visibility-button"
                    >
                      {showPassword2 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                </div>
              </div>
              <div className="form-group">
                <button type="submit" className="btnSubmit w-100">
                  Aceptar
                </button>
              </div>
            </form>
            <Link
              component={RouterLink}
              to="/auth/login"
              className="MuiLink-root"
              onClick={handleGoToLogin}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};