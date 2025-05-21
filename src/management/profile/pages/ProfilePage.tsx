import { useState, useEffect, useRef } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedOutlined from '@mui/icons-material/RadioButtonUncheckedOutlined';
import Swal from 'sweetalert2';


import { Navbar, UserProfileDTO } from '../../../management';
import { useProfileStore, useAuthStore } from '../../../hooks';

import '../style/profile.css';

export const ProfilePage = () => {
  const { profile, startUpdatingProfile, isLoading, startLoadingProfile } = useProfileStore();
  const { user } = useAuthStore();

  const [formValues, setFormValues] = useState<UserProfileDTO>({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password1: '',
    password2: '',
    profileImageBase64: '',
  });

  const [defaultValues, setDefaultValues] = useState<UserProfileDTO>(formValues);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profileImage, setProfileImage] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [focusedInput, setFocusedInput] = useState<keyof UserProfileDTO | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    startLoadingProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      const imageWithPrefix = profile.profileImageBase64?.startsWith('data:image')
        ? profile.profileImageBase64
        : `data:image/png;base64,${profile.profileImageBase64}`;

      const initialValues = {
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        username: profile.username || '',
        password1: '',
        password2: '',
        profileImageBase64: imageWithPrefix,
      };

      setFormValues(initialValues);
      setDefaultValues(initialValues);
      setProfileImage(imageWithPrefix);
    }
  }, [profile]);

  useEffect(() => {
    if (profileImage !== defaultValues.profileImageBase64) {
      setIsEditMode(true);
    }
  }, [profileImage, defaultValues.profileImageBase64]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const inputName = name as keyof UserProfileDTO;

    setFormValues((prev) => ({ ...prev, [inputName]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setFormValues((prev) => ({ ...prev, profileImageBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formValues.password1 && formValues.password1 !== formValues.password2) {
      Swal.fire({
        title: 'Error',
        text: 'Las contraseñas no coinciden.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    if (formValues.password1 && !isPasswordValid(formValues.password1).allValid) {
      Swal.fire({
        title: 'Contraseña Inválida',
        text: 'La contraseña no cumple con los requisitos.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const { password1, password2, ...rest } = formValues;

    const dataToSubmit: Partial<UserProfileDTO> = {
      ...rest,
      profileImageBase64:
        profileImage && profileImage !== defaultValues.profileImageBase64
          ? profileImage
          : defaultValues.profileImageBase64,
    };

    if (password1 && password2) {
      (dataToSubmit as any).password1 = password1;
      (dataToSubmit as any).password2 = password2;
    }

    const emailBeforeUpdate = defaultValues.email;
    const profileImageBeforeUpdate = defaultValues.profileImageBase64;

    if (user && user.id) {
      try {
        await startUpdatingProfile(user.id, dataToSubmit as UserProfileDTO);

        const newEmail = formValues.email;
        const emailDidChange = newEmail && newEmail.trim() !== '' && newEmail !== emailBeforeUpdate;

        let otherDataDidChange = false;
        if (formValues.first_name !== defaultValues.first_name) otherDataDidChange = true;
        if (formValues.last_name !== defaultValues.last_name) otherDataDidChange = true;
        if (formValues.username !== defaultValues.username) otherDataDidChange = true;
        if (profileImage !== profileImageBeforeUpdate) otherDataDidChange = true;
        if (formValues.password1) {
          otherDataDidChange = true;
        }

        if (emailDidChange && !otherDataDidChange) {
          Swal.fire({
            title: 'Validación Requerida',
            text: 'Se ha enviado un correo de validación a su nueva dirección. Dispone de 24 horas para confirmar el cambio.',
            icon: 'info',
            confirmButtonText: 'Entendido'
          });
        } else if (otherDataDidChange || emailDidChange) {
          let successMessage = "Perfil actualizado correctamente.";
          if (emailDidChange && otherDataDidChange) {
            successMessage += "\n\nAdicionalmente, se ha enviado un correo de validación a su nueva dirección.";
          }
          Swal.fire({
            title: '¡Éxito!',
            text: successMessage,
            icon: 'success',
            timer: (emailDidChange && otherDataDidChange) ? 4500 : 3000,
            showConfirmButton: false
          });
        }

        setDefaultValues(formValues);
        setIsEditMode(false);

      } catch (error) {
        console.error("Error updating profile:", error);
        Swal.fire({
          title: 'Error',
          text: 'Error al guardar los cambios. Por favor, inténtelo de nuevo.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    } else {
      Swal.fire({
        title: 'Error de Autenticación',
        text: 'No se pudo actualizar el perfil: usuario no autenticado o datos incompletos.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const hasFormChanged = () => {
    const keys = Object.keys(defaultValues) as (keyof UserProfileDTO)[];
    return keys.some((key) => formValues[key] !== defaultValues[key]);
  };

  const handleToggleEdit = () => {
    if (isEditMode && (hasFormChanged() || profileImage !== defaultValues.profileImageBase64)) {
      const confirmExit = window.confirm('Tienes cambios sin guardar. ¿Estás seguro de cancelar la edición?');
      if (!confirmExit) return;
    }

    if (isEditMode) {
      const restoredValues = { ...defaultValues };
      setFormValues(restoredValues);
      setProfileImage(restoredValues.profileImageBase64);
      setAnchorEl(null);
    }

    setIsEditMode((prev) => !prev);
  };

  const handleFocus = (name: keyof UserProfileDTO, event?: React.FocusEvent<HTMLInputElement>) => {
    setFocusedInput(name);
    if (name === 'password1' && event) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleBlur = (name?: keyof UserProfileDTO) => {
    setFocusedInput(null);
    if (name === 'password1') {
    }
  };

  const isPasswordValid = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasMinLength = password.length >= 8;
    return { hasUpperCase, hasLowerCase, hasNumber, hasMinLength, allValid: hasUpperCase && hasLowerCase && hasNumber && hasMinLength };
  };

  const passwordValidationStatus = isPasswordValid(formValues.password1 || '');

  const openPopover = Boolean(anchorEl);
  const idPopover = openPopover ? 'password-profile-popover' : undefined;

  const handleClosePopover = () => {
    setAnchorEl(null);
  };


  const renderInputField = (label: string, name: keyof UserProfileDTO, isPassword = false) => (
    <div className="col-md-6 mb-3 position-relative">
      <label className="form-label">{label}</label>
      <input
        type={isPassword ? 'password' : 'text'}
        className={`form-control neumorphic-input ${
          (focusedInput === name || formValues[name] !== defaultValues[name]) ? 'focused' : ''
        }`}
        name={name}
        value={formValues[name] || ''}
        onChange={handleInputChange}
        onFocus={(e) => handleFocus(name, e)}
        onBlur={() => handleBlur(name)}
        disabled={!isEditMode}
        ref={(el) => {
          inputRefs.current[name] = el;
        }}
        aria-describedby={name === 'password1' ? idPopover : undefined}
      />
      {name === 'password1' && (
        <Popover
          id={idPopover}
          open={openPopover}
          anchorEl={anchorEl}
          onClose={handleClosePopover}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
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
      )}
    </div>
  );

  const imageChanged = profileImage !== defaultValues.profileImageBase64;

  if (isLoading) {
    return (
      <div className="container mt-4 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <AccessTimeIcon fontSize="large" color="action" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-page-container container-fluid my-4 d-flex justify-content-center align-items-center">
        <div className="profile-page-card card p-4 w-100">
          <div className="row align-items-center mb-4">
            <div className="col-12 col-md-6 text-center text-md-start mt-4">
              <div className="d-flex align-items-center justify-content-center justify-content-md-start">
                <h2 className="mb-0 ms-md-5 me-3">Perfil</h2>
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={handleToggleEdit}
                  title={isEditMode ? 'Cancelar edición' : 'Editar perfil'}
                  className={`icon-box ${isEditMode ? 'active' : ''}`}
                >
                  {isEditMode ? (
                    <CloseIcon color="error" />
                  ) : (
                    <EditIcon color="action" />
                  )}
                </span>
              </div>
            </div>
            <div className="col-12 col-md-6 text-center mt-4">
              <div className="profile-image-container">
                <img
                  src={profileImage || 'ruta/a/imagen/default.jpg'}
                  alt="Imagen de perfil"
                  className="rounded-circle"
                />
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  className="btn neumorphic-input btn-sm"
                  onClick={() => {
                    if (isEditMode && fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  }}
                  disabled={!isEditMode}
                >
                  Actualizar imagen
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                  accept="image/*"
                  disabled={!isEditMode}
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row">
              {renderInputField('Nombre', 'first_name')}
              {renderInputField('Apellido', 'last_name')}
              {renderInputField('Correo Electrónico', 'email')}
              {renderInputField('Nombre de Usuario', 'username')}
              {renderInputField('Nueva Contraseña', 'password1', true)}
              {renderInputField('Confirmar Nueva Contraseña', 'password2', true)}
            </div>

            <div className="text-end mt-4">
              <button
                type="submit"
                className="btn neumorphic-input"
                disabled={!isEditMode || (!hasFormChanged() && !imageChanged)}
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
