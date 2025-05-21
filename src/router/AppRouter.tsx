import { useEffect } from "react";

import { Route, Routes, Navigate } from "react-router-dom"
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { useAuthStore } from "../hooks";
import { AuthRoutes } from "../auth";
import { ManagementRoutes } from "../management";

export const AppRouter = () => {

    const  { status, checkAuthToken } = useAuthStore();

    useEffect(() => {
        if (status === 'checking') {
            checkAuthToken();
        }
    }, [status, checkAuthToken]);
    
    

    if ( status === 'checking' ) {
        return (
            <div className="container mt-4 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <AccessTimeIcon fontSize="large" color="action" />
            </div>
        )
    }

    return (
        <Routes>
            {
                (status === 'not-authenticated')
                ? (
                    <>
                        <Route path="/auth/*" element={<AuthRoutes />}/>
                        <Route path="*" element={<Navigate to="/auth/login" />}/>
                    </>
                )
                : (
                    <>
                        <Route path="/*" element={<ManagementRoutes />}/>
                        <Route path="*" element={<Navigate to="/" />}/>
                    </>
                )
            }
        </Routes>
    )
}
