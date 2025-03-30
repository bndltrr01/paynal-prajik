import { FC, ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import LoadingHydrate from "../motions/loaders/LoadingHydrate";
import { useUserContext } from "./AuthContext";

interface ProtectedRouteProps {
  requiredRole: string;
  children?: ReactNode;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ requiredRole, children }) => {
  const { isAuthenticated, role, isLoading } = useUserContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingHydrate />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
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
