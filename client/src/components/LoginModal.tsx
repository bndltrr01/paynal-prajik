/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  faEye,
  faEyeSlash,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../contexts/AuthContext";
import { login } from "../services/Auth";
import Notification from "./Notification";

interface LoginProps {
  toggleLoginModal: () => void;
  openSignupModal: () => void;
  onSuccessfulLogin?: () => void;
  bookingInProgress?: boolean;
}

const LoginModal: FC<LoginProps> = ({ toggleLoginModal, openSignupModal, onSuccessfulLogin, bookingInProgress = false }) => {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
    icon: string;
  } | null>(null);

  const navigate = useNavigate();
  const { setIsAuthenticated, setRole, setUserDetails, setProfileImage } = useUserContext();

  const togglePassword = () => setPasswordVisible(!passwordVisible);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const loginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const response = await login(email, password);
      if (response.status === 200) {
        const { user } = response.data;
        setUserDetails(user);
        setProfileImage(user.profile_image || "");
        setIsAuthenticated(true);
        setRole(user.role || "guest");

        setNotification({
          message: bookingInProgress ? "Logged in successfully, completing your booking..." : "Logged in successfully",
          type: "success",
          icon: "fas fa-check-circle",
        });

        if (onSuccessfulLogin) {
          toggleLoginModal();
          onSuccessfulLogin();
          return;
        }

        if (user.role === "admin" || user.role === "staff") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error(`Failed to login: ${error}`);
      const errData = error.response?.data;
      if (errData && errData.error) {
        const message = errData.error;
        if (message.toLowerCase().includes("user does not exist")) {
          setErrors({ email: message });
        } else if (message.toLowerCase().includes("password")) {
          setErrors({ password: message });
        } else {
          setErrors({ general: message });
        }
      } else {
        setErrors({ general: "An error occurred" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="relative z-20 min-h-screen flex items-center justify-center">
        <div className="relative z-30 w-full max-w-md bg-white rounded-md sm:max-w-md xl:p-2 dark:border-gray-700 shadow-2xl">
          <i
            className="fa fa-x absolute top-3 right-3 z-40 cursor-pointer"
            onClick={toggleLoginModal}
          ></i>
          <div className="p-7 space-y-4 md:space-y-6 sm:p-9">
            <h1 className="text-3xl text-center font-bold text-gray-800 mb-2 tracking-wide">
              Welcome to <span className="text-blue-600">Azurea</span>
            </h1>
            <h3 className="text-normal text-center text-gray-500 tracking-wide mb-4">
              Azurea Hotel Management System
            </h3>

            {bookingInProgress && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
                <h4 className="font-semibold text-blue-700 mb-1">Login Required to Complete Booking</h4>
                <p className="text-sm text-blue-600">
                  Please log in to your account to complete your booking. Don't worry, all your booking information has been saved.
                </p>
              </div>
            )}

            <div className="border-b-2 border-gray-300 mb-4"></div>

            <form onSubmit={loginSubmit} className="space-y-4 md:space-y-6">
              <div className="mb-3">
                <label
                  htmlFor="email"
                  className="text-md font-semibold text-gray-700 tracking-tighter"
                >
                  Email
                </label>
                <div className="relative">
                  <i className="fa-solid fa-user absolute left-3 top-3 z-20 text-gray-600"></i>
                  <motion.input
                    type="email"
                    id="email"
                    value={email}
                    placeholder="email@gmail.com"
                    onChange={handleEmailChange}
                    className="bg-gray-50 border border-gray-300 text-sm text-gray-900 rounded-sm mt-1 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pl-9"
                    required
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="mb-2 relative">
                <label
                  htmlFor="password"
                  className="text-md font-semibold text-gray-700 tracking-tighter"
                >
                  Password
                </label>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-lock absolute left-3 top-4 z-20 text-gray-600"></i>
                  <motion.input
                    placeholder="Enter your password"
                    type={passwordVisible ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="bg-gray-50 border border-gray-300 text-sm text-gray-900 rounded-sm mt-1 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pl-9"
                    required
                  />
                  <FontAwesomeIcon
                    icon={passwordVisible ? faEyeSlash : faEye}
                    className="absolute right-3 cursor-pointer text-gray-800"
                    onClick={togglePassword}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm">{errors.password}</p>
                )}
                <div className="py-2">
                  <Link
                    to="/forgot-password"
                    className="text-md font-semibold text-blue-500 underline tracking-tighter"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!email || !password || loading}
                className={`w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition-colors duration-300 flex items-center justify-center ${loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />{" "}
                    Logging in...
                  </>
                ) : (
                  bookingInProgress ? "Login & Complete Booking" : "Login"
                )}
              </motion.button>
            </form>
            <div className="mt-6 text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <button
                onClick={() => {
                  toggleLoginModal();
                  openSignupModal();
                }}
                className="text-blue-500 cursor-pointer font-bold"
              >
                Register here
              </button>
            </div>
          </div>
        </div>
      </section>
      {notification && (
        <Notification
          icon={notification.icon}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export default LoginModal;
