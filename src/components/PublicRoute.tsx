import { Navigate, Outlet } from "react-router-dom";

export function PublicRoute() {
    const token = localStorage.getItem("authToken");
    return token ? <Navigate to="alerts" replace /> : <Outlet />
}