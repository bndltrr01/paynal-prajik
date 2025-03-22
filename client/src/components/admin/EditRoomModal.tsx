/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState, useEffect, ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface IRoom {
    id: number;
    roomName: string;
    roomType: string;  // e.g., "Deluxe", "Suite"
    capacity: string;  // e.g., "2 Adults, 1 Child"
    amenities: number[]; // array of Amenity IDs
    roomPrice: number;
    roomImage: File | string;
    status: "Available" | "Occupied" | "Maintenance"; // Shown only if editing
    description: string;
}

interface IRoomFormModalProps {
    isOpen: boolean;
    cancel: () => void;
    onSave: (data: IRoom) => Promise<void>;
    roomData: IRoom | null;
    loading?: boolean;
    availableAmenities?: { id: number; name: string }[];
}

const EditRoomModal: FC<IRoomFormModalProps> = ({
    isOpen,
    cancel,
    onSave,
    roomData,
    loading = false,
    availableAmenities = [],
}) => {
    const [formState, setFormState] = useState<IRoom>({
        id: roomData?.id || 0,
        roomName: roomData?.roomName || "",
        roomType: roomData?.roomType || "",
        capacity: roomData?.capacity || "",
        amenities: roomData?.amenities || [],
        roomPrice: roomData?.roomPrice || 0,
        // Default to "Available" if creating a new room
        status: roomData?.status || "Available",
        description: roomData?.description || "",
        roomImage: roomData?.roomImage || "",
    });

    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Map front-end fields to API fields if needed
    const fieldMapping: Record<string, string> = {
        roomName: "room_name",
        roomType: "room_type",
        capacity: "capacity",
        amenities: "amenities",
        roomPrice: "room_price",
        status: "status",
        description: "description",
        roomImage: "room_image",
    };

    // Generate preview if roomImage is a File
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

    // Handle field changes
    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    // Handle amenities (checkbox)
    const handleAmenityChange = (amenityId: number) => {
        setFormState((prev) => {
            const newSet = new Set(prev.amenities);
            if (newSet.has(amenityId)) {
                newSet.delete(amenityId);
            } else {
                newSet.add(amenityId);
            }
            return { ...prev, amenities: Array.from(newSet) };
        });
    };

    // Handle image file
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFormState((prev) => ({ ...prev, roomImage: file }));
        }
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSave(formState);
            setErrors({});
        } catch (error: any) {
            setErrors(error.response?.data?.error || {});
        }
    };

    // Close modal on ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                cancel();
            }
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
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

                                    {/* Room Type */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Room Type
                                        </label>
                                        <input
                                            type="text"
                                            name="roomType"
                                            value={formState.roomType}
                                            onChange={handleChange}
                                            placeholder="e.g. Deluxe, Suite"
                                            className="border border-gray-300 rounded w-full p-2"
                                        />
                                        {errors[fieldMapping.roomType] && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors[fieldMapping.roomType]}
                                            </p>
                                        )}
                                    </div>

                                    {/* Capacity */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Capacity
                                        </label>
                                        <input
                                            type="text"
                                            name="capacity"
                                            value={formState.capacity}
                                            onChange={handleChange}
                                            placeholder="e.g., 2 Adults, 1 Child"
                                            className="border border-gray-300 rounded w-full p-2"
                                        />
                                        {errors[fieldMapping.capacity] && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors[fieldMapping.capacity]}
                                            </p>
                                        )}
                                    </div>

                                    {/* Amenities (checkboxes) */}
                                    {availableAmenities.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Amenities
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {availableAmenities.map((amenity) => (
                                                    <label key={amenity.id} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={formState.amenities.includes(amenity.id)}
                                                            onChange={() => handleAmenityChange(amenity.id)}
                                                        />
                                                        <span>{amenity.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {errors[fieldMapping.amenities] && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors[fieldMapping.amenities]}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* 
                    Hide Status when creating (roomData == null),
                    show only when editing.
                  */}
                                    {roomData && (
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
                                    )}

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
                                            className="mb-2 ring-1 rounded-sm p-2"
                                        />
                                        {previewUrl && (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full h-48 object-cover border border-gray-200 mt-2"
                                            />
                                        )}
                                        {errors[fieldMapping.roomImage] && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors[fieldMapping.roomImage]}
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
