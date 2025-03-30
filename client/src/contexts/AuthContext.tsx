/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";
import { authenticateUser } from "../services/Auth";

interface User {
    id: number;
    username: string;
    email: string;
    profile_image?: string;
}

interface UserContextType {
    isAuthenticated: boolean;
    userDetails: User | null;
    sessionExpired: boolean;
    role?: string;
    isLoading: boolean;
    profileImage?: string;
    setIsAuthenticated: (value: boolean) => void;
    setUserDetails: (value: User | null) => void;
    setSessionExpired: (value: boolean) => void;
    setRole: (value: string) => void;
    setProfileImage?: (value: string) => void;
    clearAuthState: () => void;
}

const UserContext = createContext<UserContextType | any>(null);

export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userDetails, setUserDetails] = useState<User | null>(null);
    const [sessionExpired, setSessionExpired] = useState<boolean>(false);
    const [role, setRole] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [profileImage, setProfileImage] = useState<string>("");

    const clearAuthState = () => {
        setIsAuthenticated(false);
        setUserDetails(null);
        setSessionExpired(false);
        setRole("");
        setProfileImage("");
    };

    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);
            try {
                const res = await authenticateUser();
                if (
                    res &&
                    res.data &&
                    res.data.isAuthenticated === true &&
                    res.data.user &&
                    res.data.user.id
                ) {
                    setIsAuthenticated(true);
                    setUserDetails(res.data.user);
                    setProfileImage(res.data.user.profile_image || "");
                    setRole(res.data.role || "");
                } else {
                    clearAuthState();
                }
            } catch (error) {
                console.error("Authentication check failed:", error);
                clearAuthState();
            } finally {
                // Short delay to ensure UI has time to process auth state
                setTimeout(() => {
                    setIsLoading(false);
                }, 300);
            }
        };

        checkAuth();

        // Set up periodic authentication check to maintain session
        const intervalId = setInterval(checkAuth, 15 * 60 * 1000); // Check every 15 minutes

        return () => clearInterval(intervalId);
    }, []);

    const contextValue: UserContextType = {
        isAuthenticated,
        userDetails,
        sessionExpired,
        role,
        isLoading,
        profileImage,
        setIsAuthenticated,
        setUserDetails,
        setSessionExpired,
        setRole,
        setProfileImage,
        clearAuthState
    }

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    )
}

export const useUserContext = () => {
    return useContext(UserContext);
}