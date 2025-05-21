import {Navigate, Routes, Route} from 'react-router-dom';

import { LoginPage, RegisterPage } from '../../auth';

export const AuthRoutes = () => {
  return (
    <Routes>
        <Route path="login" element={<LoginPage />}/>
        <Route path="register" element={<RegisterPage />}/>
        <Route path="/*" element={<Navigate to="/auth/login" />}/>
    </Routes>
  )
}