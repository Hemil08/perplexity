import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import Dashboard from "../features/chat/pages/Dashboard";
import Protected from "../features/auth/components/protected";
import { Navigate } from "react-router";
import EmailVerification from "../features/auth/pages/EmailVerification";

export const router = createBrowserRouter([
    {
        path:"/login",
        element: <Login />
    },
    {
        path:"/register",
        element: <Register/>
    },
    {
        path:"/",
        element:<Protected>
            <Dashboard/>
        </Protected>
    },
    {
        path: "/dashboard",
        element: <Navigate to="/" replace /> 
    },
    {
        path: "/verify-email",
        element: 
            <EmailVerification/>
    
    }
])