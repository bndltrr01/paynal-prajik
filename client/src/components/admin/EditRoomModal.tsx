/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, FC, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface IRoom {
    id: number;
    roomName: string;
    roomImage: File | string;
    roomAdmission: "Regular" | "VIP";
    roomType: "Deluxe Rooms" | "Executive Suite" | "Presidential Suite";
    roomNumber: string;
    status: "Available" | "Occupied" | "Maintenance";
    roomPrice: number;
    description: string;
    bedSize: string | number;
    pax: number;
}

interface IRoomFormModalProps {
    isOpen: boolean;
    cancel: () => void;
    onSave: (data: IRoom) => Promise<void>;
    roomData: IRoom | null;
    loading?: boolean;
}

const EditRoomModal: FC<IRoomFormModalProps> = ({
    onSave,
    roomData,
    isOpen,
    cancel,
    loading = false,
}) => {
    const [formState, setFormState] = useState<IRoom>({
        id: roomData?.id || 0,
        roomName: roomData?.roomName || "",
        roomImage: roomData?.roomImage || "",
        roomAdmission: roomData?.roomAdmission || "Regular",
        roomType: roomData?.roomType || "Deluxe Rooms",
        roomNumber: roomData?.roomNumber || "",
        status: roomData?.status || "Available",
        roomPrice: roomData?.roomPrice || 0,
        description: roomData?.description || "",
        bedSize: roomData?.bedSize || 1,
        pax: roomData?.pax || 1,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const fieldMapping: { [key: string]: string } = {
        roomName: "room_name",
        roomAdmission: "admission",
        roomNumber: "room_number",
        roomType: "room_type",
        status: "status",
        roomPrice: "room_price",
        description: "description",
        bedSize: "bed_size",
        pax: "pax",
    };

    useEffect(() => {
        if (formState.roomImage instanceof File) {
            const objectUrl = URL.createObjectURL(formState.roomImage);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (typeof formState.roomImage === "string") {
            setPreviewUrl(formState.roomImage);
        } else {
            setPreviewUrl("");
        }
    }, [formState.roomImage]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFormState((prev) => ({ ...prev, roomImage: file }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSave(formState);
            setErrors({});
        } catch (error: any) {
            setErrors(error.response?.data?.error || {});
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
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
                        className="bg-white w-full max-w-3xl mx-4 rounded shadow-lg p-6 relative max-h-[90vh] overflow-y-auto"
                    >
                        <h2 className="text-xl font-semibold mb-4">
                            {roomData ? "Edit Room" : "Add New Room"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    {/* Room Name */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Room Name
                                        </label>
                                        <input
                                            type="text"
                                            name="roomName"
                                            value={formState.roomName}
                                            onChange={handleChange}
                                            placeholder="Enter Room Name"
                                            className="border border-gray-300 rounded w-full p-2"
                                        />
                                        {errors[fieldMapping.roomName] && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors[fieldMapping.roomName]}
                                            </p>
                                        )}
                                    </div>

                                    {/* Grid layout for primary fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Room Admission */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Room Admission
                                            </label>
                                            <select
                                                name="roomAdmission"
                                                value={formState.roomAdmission}
                                                onChange={handleChange}
                                                className="border border-gray-300 rounded w-full p-2"
                                            >
                                                <option value="Regular">Regular</option>
                                                <option value="VIP">VIP</option>
                                            </select>
                                            {errors[fieldMapping.roomAdmission] && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors[fieldMapping.roomAdmission]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Room Number (Disabled if auto-gen on backend) */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Room Number
                                            </label>
                                            <input
                                                type="text"
                                                name="roomNumber"
                                                value={formState.roomNumber}
                                                onChange={handleChange}
                                                placeholder="Auto-generated or custom"
                                                className="border border-gray-300 rounded w-full p-2"
                                                disabled
                                            />
                                            {errors[fieldMapping.roomNumber] && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors[fieldMapping.roomNumber]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Status
                                            </label>
                                            <select
                                                name="status"
                                                value={formState.status}
                                                onChange={handleChange}
                                                className="border border-gray-300 rounded w-full p-2"
                                            >
                                                <option value="Available">Available</option>
                                                <option value="Occupied">Occupied</option>
                                                <option value="Maintenance">Maintenance</option>
                                            </select>
                                            {errors[fieldMapping.status] && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors[fieldMapping.status]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Room Price */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Room Price (₱)
                                            </label>
                                            <input
                                                type="number"
                                                name="roomPrice"
                                                value={formState.roomPrice}
                                                onChange={handleChange}
                                                className="border border-gray-300 rounded w-full p-2"
                                            />
                                            {errors[fieldMapping.roomPrice] && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors[fieldMapping.roomPrice]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Bed Size */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Bed Size
                                            </label>
                                            <input
                                                type="number"
                                                name="bedSize"
                                                value={formState.bedSize}
                                                onChange={handleChange}
                                                className="border border-gray-300 rounded w-full p-2"
                                            />
                                            {errors[fieldMapping.bedSize] && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors[fieldMapping.bedSize]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Pax */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Pax
                                            </label>
                                            <input
                                                type="number"
                                                name="pax"
                                                value={formState.pax}
                                                onChange={handleChange}
                                                className="border border-gray-300 rounded w-full p-2"
                                            />
                                            {errors[fieldMapping.pax] && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors[fieldMapping.pax]}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Room Type */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Room Type
                                        </label>
                                        <select
                                            name="roomType"
                                            value={formState.roomType}
                                            onChange={handleChange}
                                            className="border border-gray-300 rounded w-full p-2"
                                        >
                                            <option value="Deluxe Rooms">Deluxe Rooms</option>
                                            <option value="Executive Suite">Executive Suite</option>
                                            <option value="Presidential Suite">
                                                Presidential Suite
                                            </option>
                                        </select>
                                        {errors[fieldMapping.roomType] && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors[fieldMapping.roomType]}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formState.description}
                                            onChange={handleChange}
                                            rows={6}
                                            className="border border-gray-300 rounded w-full p-2 resize-none"
                                        />
                                        {errors[fieldMapping.description] && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors[fieldMapping.description]}
                                            </p>
                                        )}
                                    </div>

                                    {/* Room Image */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Room Image
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="mb-2"
                                        />
                                        {previewUrl && (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full h-48 object-cover border border-gray-200 mt-2"
                                            />
                                        )}
                                        {errors["room_image"] && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors["room_image"]}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
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
                                    {roomData ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EditRoomModal;
