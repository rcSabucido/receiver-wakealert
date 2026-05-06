import { Navigate, Outlet } from "react-router-dom";

export function PrivateRoute() {
    const token = localStorage.getItem("authToken");
    return token ? <Outlet /> : <Navigate to="/login" replace />
}