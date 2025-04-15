import { Route, Routes, Navigate } from "react-router-dom"
import { useEffect } from "react";
import { useAuthStore } from "../hooks/useAuthStore";
import { AuthRoutes } from "../auth/routes/AuthRoutes";

export const AppRouter = () => {

    const  { status, checkAuthToken } = useAuthStore();

    useEffect(() => {
        checkAuthToken();
    }, [checkAuthToken])
    

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
                        <Route path="*" element={<Navigate to="/" />}/>
                    </>
                )
            }
        </Routes>
    )
}
