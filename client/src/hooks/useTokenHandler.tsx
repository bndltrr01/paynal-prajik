import { useEffect } from "react";
import { useUserContext } from "../contexts/AuthContext";
import { authenticateUser } from "../services/Auth";

const useTokenHandler = () => {
  const { setIsAuthenticated, setLoading, setRole, setUserDetails } = useUserContext();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const validateToken = async () => {
      try {
        const response = await authenticateUser(signal);
        if (!signal.aborted && response.data.isAuthenticated) {
          setIsAuthenticated(true);
          setRole(response.data.role);
          setUserDetails(response.data.user);
        } else if (!signal.aborted) {
          setIsAuthenticated(false);
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("Token validation error:", error);
          setIsAuthenticated(false);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    }

    validateToken();
    
    return () => {
      controller.abort();
    };
  }, [setIsAuthenticated, setLoading, setRole, setUserDetails]);
}

export default useTokenHandler;