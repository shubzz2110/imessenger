import { createBrowserRouter, Navigate } from "react-router";
import Signin from "./routes/auth/Signin";
import Signup from "./routes/auth/Signup";
import AuthLayout from "./layouts/auth";
import AppLayout from "./layouts/app";
import App from "./routes/app/App";
import ErrorBoundary from "./components/ErrorBoundary";

const AppRoutes = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to={"/auth/signin"} replace />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      {
        path: "signin",
        element: <Signin />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
    ],
  },
  {
    path: "app",
    element: <AppLayout />,
    children: [
      {
        path: "",
        element: <App />,
      },
    ],
  },
]);

export default AppRoutes;
