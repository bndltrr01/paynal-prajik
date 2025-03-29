import { FC, ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUserContext } from "./AuthContext";

interface ProtectedRouteProps {
  requiredRole: string;
  children?: ReactNode;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ requiredRole, children }) => {
  const { isAuthenticated, role } = useUserContext();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole.toLowerCase() === "admin") {
    if (!(role.toLowerCase() === "admin")) {
      return <Navigate to="/" replace />;
    }
  } else {
    if (role.toLowerCase() !== requiredRole.toLowerCase()) {
      return <Navigate to="/" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
