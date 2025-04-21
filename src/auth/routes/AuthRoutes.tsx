import {Navigate, Routes, Route} from 'react-router-dom';

import { LoginPage, RegisterPage } from '../../auth';

import { GoogleLogin } from '@react-oauth/google';

export const AuthRoutes = () => {
  return (
    <Routes>
        <Route path="login" element={<LoginPage />}/>
        <Route path="register" element={<RegisterPage />}/>
        <Route path="google-auth" element={<GoogleLogin />} />
        <Route path="/*" element={<Navigate to="/auth/login" />}/>
    </Routes>
  )
}