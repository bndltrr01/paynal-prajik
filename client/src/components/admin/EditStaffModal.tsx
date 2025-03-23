/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState, useEffect, ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface IStaff {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    confirm_password?: string;
}

interface IStaffFormModalProps {
    isOpen: boolean;
    cancel: () => void;
    onSave: (data: IStaff) => Promise<void>;
    staffData: IStaff | null;
    loading?: boolean;
}

const EditStaffModal: FC<IStaffFormModalProps> = ({
    isOpen,
    cancel,
    onSave,
    staffData,
    loading = false,
}) => {
    const [formState, setFormState] = useState<IStaff>({
        id: staffData?.id || 0,
        first_name: staffData?.first_name || "",
        last_name: staffData?.last_name || "",
        email: staffData?.email || "",
        password: "",
        confirm_password: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setFormState({
            id: staffData?.id || 0,
            first_name: staffData?.first_name || "",
            last_name: staffData?.last_name || "",
            email: staffData?.email || "",
            password: "",
            confirm_password: "",
        });
        setErrors({});
    }, [staffData]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formState.password && formState.password !== formState.confirm_password) {
            setErrors({ confirm_password: "Passwords do not match" });
            return;
        }
        try {
            const { ...payload } = formState;
            await onSave(payload);
            setErrors({});
        } catch (error: any) {
            console.log("Error response:", error.response);
            const errorData = error.response?.data?.error;
            setErrors(errorData ? errorData : { general: "An error occurred" });
        }
    };

    useEffect(() => {
        const handleKeyDown = (evt: KeyboardEvent) => {
            if (evt.key === "Escape") {
                cancel();
            }
        };
        if (isOpen) window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [cancel, isOpen]);

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 flex items-center justify-center z-10 bg-black/45 overflow-y-auto"
                >
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white w-full max-w-2xl mx-4 rounded shadow-lg p-6 relative max-h-[90vh] overflow-y-auto"
                    >
                        <h2 className="text-xl font-semibold mb-4">
                            {staffData ? "Edit Staff" : "Add New Staff"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formState.first_name}
                                    onChange={handleChange}
                                    placeholder="Enter First Name"
                                    className="border border-gray-300 rounded w-full p-2"
                                />
                                {errors.first_name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formState.last_name}
                                    onChange={handleChange}
                                    placeholder="Enter Last Name"
                                    className="border border-gray-300 rounded w-full p-2"
                                />
                                {errors.last_name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formState.email}
                                    onChange={handleChange}
                                    placeholder="Enter Email"
                                    className="border border-gray-300 rounded w-full p-2"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Password {staffData ? "(Leave blank to keep current)" : ""}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formState.password}
                                    onChange={handleChange}
                                    placeholder={staffData ? "New Password (optional)" : "Enter Password"}
                                    className="border border-gray-300 rounded w-full p-2"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Confirm Password {staffData ? "(Leave blank to keep current)" : ""}
                                </label>
                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={formState.confirm_password || ""}
                                    onChange={handleChange}
                                    placeholder={staffData ? "Confirm New Password" : "Confirm Password"}
                                    className="border border-gray-300 rounded w-full p-2"
                                />
                                {errors.confirm_password && (
                                    <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>
                                )}
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={cancel}
                                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors duration-300 uppercase font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 uppercase font-semibold"
                                >
                                    {staffData ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EditStaffModal;
