/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, FC, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface IArea {
  id: number;
  area_name: string;
  description: string;
  capacity: number;
  price_per_hour: number;
  status: "available" | "occupied" | "maintenance";
  area_image: File | string;
}

interface IAreaFormModalProps {
  isOpen: boolean;
  cancel: () => void;
  onSave: (data: IArea) => Promise<void>;
  areaData: IArea | null;
  loading?: boolean;
}

const EditAreaModal: FC<IAreaFormModalProps> = ({
  onSave,
  areaData,
  isOpen,
  cancel,
  loading = false,
}) => {
  // Initialize form state; updated when areaData changes
  const [formState, setFormState] = useState<IArea>({
    id: areaData?.id || 0,
    area_name: areaData?.area_name || "",
    description: areaData?.description || "",
    capacity: areaData?.capacity || 0,
    price_per_hour: areaData?.price_per_hour || 0,
    status: areaData?.status || "available",
    area_image: areaData?.area_image || "",
  });

  // State for preview URL and errors
  const [previewUrl, setPreviewUrl] = useState<string | null>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fieldMapping: { [key: string]: string } = {
    area_name: "area_name",
    description: "description",
    capacity: "capacity",
    price_per_hour: "price_per_hour",
    status: "status",
  };

  // Update formState when areaData changes
  useEffect(() => {
    setFormState({
      id: areaData?.id || 0,
      area_name: areaData?.area_name || "",
      description: areaData?.description || "",
      capacity: areaData?.capacity || 0,
      price_per_hour: areaData?.price_per_hour || 0,
      status: areaData?.status || "available",
      area_image: areaData?.area_image || "",
    });
  }, [areaData]);

  // Set the preview URL
  useEffect(() => {
    if (formState.area_image instanceof File) {
      const objectUrl = URL.createObjectURL(formState.area_image);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof formState.area_image === "string" && formState.area_image !== "") {
      if (formState.area_image.startsWith("http")) {
        setPreviewUrl(formState.area_image);
      } else {
        setPreviewUrl(`https://res.cloudinary.com/your_cloud_name/${formState.area_image}`);
      }
    } else {
      setPreviewUrl("");
    }
  }, [formState.area_image]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormState((prev) => ({ ...prev, area_image: file }));
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
              {areaData ? "Edit Area" : "Add New Area"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Area Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Area Name
                    </label>
                    <input
                      type="text"
                      name="area_name"
                      value={formState.area_name}
                      onChange={handleChange}
                      placeholder="Enter Area Name"
                      className="border border-gray-300 rounded w-full p-2"
                    />
                    {errors[fieldMapping.name] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[fieldMapping.name]}
                      </p>
                    )}
                  </div>

                  {/* Grid layout for Capacity and Price */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Capacity */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Capacity
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        value={formState.capacity}
                        onChange={handleChange}
                        className="border border-gray-300 rounded w-full p-2"
                      />
                      {errors[fieldMapping.capacity] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[fieldMapping.capacity]}
                        </p>
                      )}
                    </div>

                    {/* Price Per Hour */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Price Per Hour (₱)
                      </label>
                      <input
                        type="number"
                        name="price_per_hour"
                        value={formState.price_per_hour}
                        onChange={handleChange}
                        className="border border-gray-300 rounded w-full p-2"
                      />
                      {errors[fieldMapping.price_per_hour] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[fieldMapping.price_per_hour]}
                        </p>
                      )}
                    </div>
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
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                    {errors[fieldMapping.status] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[fieldMapping.status]}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formState.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Enter description"
                      className="border border-gray-300 rounded w-full p-2 resize-none"
                    />
                    {errors[fieldMapping.description] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[fieldMapping.description]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Area Image */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Area Image
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
                    {errors["area_image"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["area_image"]}
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
                  {areaData ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditAreaModal;
