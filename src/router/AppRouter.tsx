import { Route, Routes, Navigate } from "react-router-dom"
import { useEffect } from "react";
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
            <h3>Cargando...</h3>
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
