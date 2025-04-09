/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import { FC, FormEvent, KeyboardEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Notification from "../components/Notification";
import { useUserContext } from "../contexts/AuthContext";
import { completeRegistration, resendOtp, verifyOtp } from "../services/Auth";

const RegistrationFlow: FC = () => {
    const [otp, setOTP] = useState<string[]>(Array(6).fill(""));
    const [resendDisabled, setResendDisabled] = useState<boolean>(true);
    const [timer, setTimer] = useState<number>(120);
    const [otpError, setOtpError] = useState<string>("");
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [notification, setNotification] = useState<{
        message: string;
        type: "success" | "error" | "info" | "warning";
        icon: string;
    } | null>(null);
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [formErrors, setFormErrors] = useState<{
        firstName?: string;
        lastName?: string;
    }>({});

    const location = useLocation();
    const navigate = useNavigate();

    const { setIsAuthenticated, setUserDetails } = useUserContext();
    const { email, password } = (location.state as { email: string; password: string }) || {};

    useEffect(() => {
        if (!email || !password) {
            navigate("/");
        }
    }, [email, password, navigate]);

    const handleOTPChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value.slice(0, 1);
        setOTP(newOtp);
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOTPKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-input-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const resendOTP = async () => {
        setResendDisabled(true);
        setTimer(120);
        try {
            await resendOtp(email);
            setOTP(Array(6).fill(""));
        } catch (error) {
            console.error(`Failed to resend OTP: ${error}`);
        }
    };

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (resendDisabled && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setResendDisabled(false);
                        if (interval) clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [resendDisabled, timer]);

    const handleOTPSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setOtpError("");
        setFormErrors({});

        let hasErrors = false;
        if (!firstName.trim()) {
            setFormErrors(prev => ({ ...prev, firstName: "First name is required" }));
            hasErrors = true;
        }
        if (!lastName.trim()) {
            setFormErrors(prev => ({ ...prev, lastName: "Last name is required" }));
            hasErrors = true;
        }
        if (hasErrors) {
            return;
        }

        setIsVerifying(true);
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            setOtpError("Please enter a valid 6-digit OTP");
            setIsVerifying(false);
            return;
        }

        try {
            const response = await verifyOtp(email, password, otpCode);
            if (response.status === 200) {
                try {
                    await completeRegistration(
                        email,
                        password,
                        firstName,
                        lastName,
                    );

                    setNotification({
                        message: "Registration completed successfully!",
                        type: "success",
                        icon: "fas fa-check-circle"
                    });

                    setIsAuthenticated(true);
                    setUserDetails({
                        ...response.data.user,
                        first_name: firstName,
                        last_name: lastName
                    });

                    const hasPendingBooking = localStorage.getItem('pendingBookingCallback');
                    const returnUrl = localStorage.getItem('bookingReturnUrl');

                    if (hasPendingBooking) {
                        localStorage.removeItem('pendingBookingCallback');

                        if (returnUrl) {
                            localStorage.removeItem('bookingReturnUrl');
                            navigate(returnUrl);
                        } else {
                            navigate(-1);
                        }
                    } else {
                        navigate("/");
                    }
                } catch (error: any) {
                    setOtpError(error.response?.data?.error || "Failed to complete registration. Please try again.");
                }
            }
        } catch (error: any) {
            if (error.response) {
                const { data, status } = error.response;
                switch (status) {
                    case 400:
                    case 404:
                    case 500:
                        setOtpError(data.error || "Something went wrong. Please try again later.");
                        break;
                    default:
                        setOtpError("Something went wrong. Please try again later.");
                        break;
                }
            } else {
                setOtpError("Something went wrong. Please try again later.");
            }
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white w-full max-w-md rounded-lg shadow-md p-6"
            >
                <div className="flex flex-col items-center mb-6">
                    <div className="text-4xl mb-4 text-blue-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 8V8a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold mb-1 text-center">Complete Your Registration</h2>
                    <p className="text-gray-500 text-center max-w-xs">
                        Please enter your information and the 6-digit verification code sent to your email.
                    </p>
                </div>
                {otpError && (
                    <div className="bg-red-100 text-red-700 p-2 mb-4 text-center rounded">
                        {otpError}
                    </div>
                )}
                <form onSubmit={handleOTPSubmit}>
                    <div className="mb-4">
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your first name"
                        />
                        {formErrors.firstName && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your last name"
                        />
                        {formErrors.lastName && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                        )}
                    </div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code
                    </label>
                    <div className="flex justify-center gap-2 mb-4">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-input-${index}`}
                                type="text"
                                maxLength={1}
                                className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl"
                                value={digit}
                                onChange={(e) => handleOTPChange(e.target.value, index)}
                                onKeyDown={(e) => handleOTPKeyDown(e, index)}
                            />
                        ))}
                    </div>
                    <div className="text-center mb-4">
                        <a href="#" className="text-sm text-blue-500 hover:underline mr-2">
                            Change Email
                        </a>
                        |
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (!resendDisabled) {
                                    resendOTP();
                                }
                            }}
                            className={`text-sm ml-2 ${resendDisabled ? "text-gray-400 cursor-not-allowed" : "text-blue-500 hover:underline"}`}
                        >
                            Resend Code
                        </a>
                        {resendDisabled && (
                            <span className="text-xs text-gray-500 ml-2">({timer}s)</span>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isVerifying}
                        className={`w-full bg-blue-500 text-white py-2 rounded-md cursor-pointer hover:bg-blue-600 transition-colors ${isVerifying ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {isVerifying ? "Processing..." : "Complete Registration"}
                    </button>
                </form>
            </motion.div>
            {notification && (
                <Notification
                    icon={notification.icon}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};

export default RegistrationFlow;
