/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, FormEvent, KeyboardEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Notification from "../components/Notification";
import { useUserContext } from "../contexts/AuthContext";
import { verifyOtp } from "../services/Auth";

const RegistrationFlow: FC = () => {
    const [otp, setOTP] = useState<string[]>(Array(6).fill(""));
    const [otpError, setOtpError] = useState<string>("");
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [notification, setNotification] = useState<{
        message: string;
        type: "success" | "error" | "info" | "warning";
        icon: string;
    } | null>(null);

    const location = useLocation();
    const navigate = useNavigate();
    const { setIsAuthenticated, setUserDetails } = useUserContext();
    const { email } = (location.state as { email: string }) || {};

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

    const handleOTPSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setOtpError("");
        setIsVerifying(true);

        try {
            const otpString = otp.join("");
            const response = await verifyOtp(email, otpString);
            
            if (response) {
                setIsAuthenticated(true);
                setUserDetails(response.user);
                setNotification({
                    message: "Registration successful! Redirecting...",
                    type: "success",
                    icon: "✅"
                });
                setTimeout(() => {
                    navigate(response.isAdmin ? "/admin/dashboard" : "/guest/dashboard");
                }, 2000);
            }
        } catch (error: any) {
            setOtpError(error.response?.data?.error || "An error occurred during verification");
            setNotification({
                message: error.response?.data?.error || "An error occurred during verification",
                type: "error",
                icon: "❌"
            });
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Enter OTP</h2>
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="text-sm text-blue-500 hover:underline"
                    >
                        Back
                    </button>
                </div>
                {otpError && <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">{otpError}</div>}
                <form onSubmit={handleOTPSubmit} className="transition duration-500 ease-in-out">
                    <div className="mb-4">
                        <label htmlFor="otp" className="block text-gray-700 mb-1">One-Time Password</label>
                        <div className="flex justify-center space-x-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-input-${index}`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOTPChange(e.target.value, index)}
                                    onKeyDown={(e) => handleOTPKeyDown(e, index)}
                                    className="w-12 h-12 text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                    placeholder="0"
                                />
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isVerifying || otp.some(digit => !digit)}
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                        {isVerifying ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>

                {notification && (
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        icon={notification.icon}
                        onClose={() => setNotification(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default RegistrationFlow;
