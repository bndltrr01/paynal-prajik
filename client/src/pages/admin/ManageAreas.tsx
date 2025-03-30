/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useState } from "react";
import { toast } from "react-toastify";
import EditAreaModal, {
  IArea as IEditArea,
} from "../../components/admin/EditAreaModal";
import Modal from "../../components/Modal";
import EventLoader from "../../motions/loaders/EventLoader";
import DashboardSkeleton from "../../motions/skeletons/AdminDashboardSkeleton";
import {
  addNewArea,
  deleteArea,
  editArea,
  fetchAreas,
} from "../../services/Admin";
import Error from "../_ErrorBoundary";

import { ChevronLeft, ChevronRight, Edit, Eye, MapPin, Trash2 } from "lucide-react";

interface Area {
  id: number;
  area_name: string;
  area_image: string;
  description?: string;
  capacity: number;
  price_per_hour: number;
  status: "available" | "occupied" | "maintenance";
}

interface AddAreaResponse {
  data: any;
}

interface PaginationData {
  total_pages: number;
  current_page: number;
  total_items: number;
  page_size: number;
}

// View Area Modal Component
const ViewAreaModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  areaData: Area | null;
}> = ({ isOpen, onClose, areaData }) => {
  if (!isOpen || !areaData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl mx-4 rounded shadow-lg relative max-h-[100vh] overflow-y-auto">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image */}
          <div className="h-64 md:h-auto">
            {areaData.area_image ? (
              <img
                loading="lazy"
                src={areaData.area_image}
                alt={areaData.area_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </div>

          {/* Right Column: Information */}
          <div className="p-6 flex flex-col">
            <h1 className="text-3xl font-bold mb-4">{areaData.area_name}</h1>
            <p className="text-gray-700 mb-6">
              {areaData.description || "No description available."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <span className="block text-gray-600 font-medium">
                  Capacity
                </span>
                <span className="text-lg font-semibold">
                  {areaData.capacity} people
                </span>
              </div>
              <div>
                <span className="block text-gray-600 font-medium">Status</span>
                <span className="text-lg font-semibold">
                  {areaData.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Price + button */}
            <div className="mt-auto">
              <p className="text-2xl font-bold mb-4">
                {areaData.price_per_hour.toLocaleString()}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageAreas = () => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editAreaData, setEditAreaData] = useState<IEditArea | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9);

  // For view modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewAreaData, setViewAreaData] = useState<Area | null>(null);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [deleteAreaId, setDeleteAreaId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loaderText, setLoaderText] = useState<string>("");
  const queryClient = useQueryClient();

  const {
    data: areasResponse,
    isLoading,
    isError,
  } = useQuery<{
    data: Area[];
    pagination: PaginationData;
  }>({
    queryKey: ["areas", currentPage, pageSize],
    queryFn: fetchAreas,
  });

  const areas = areasResponse?.data || [];
  const pagination = areasResponse?.pagination;

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.total_pages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const addAreaMutation = useMutation<AddAreaResponse, unknown, FormData>({
    mutationFn: addNewArea,
    onMutate: () => {
      setLoading(true);
      setLoaderText("Adding area...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "areas"
      });
      setShowFormModal(false);
      toast.success("Area added successfully!");

      setCurrentPage(1);
    },
    onError: (error: any) => {
      toast.error(`Failed to add area: ${error.message || 'Unknown error'}`);
    },
    onSettled: () => {
      setLoading(false);
      setLoaderText("");
    },
  });

  const editAreaMutation = useMutation<
    AddAreaResponse,
    unknown,
    { areaId: number; formData: FormData }
  >({
    mutationFn: ({ areaId, formData }) => editArea(areaId, formData),
    onMutate: () => {
      setLoading(true);
      setLoaderText("Updating area...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "areas"
      });
      setShowFormModal(false);
      toast.success("Area updated successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to update area: ${error.message || 'Unknown error'}`);
      console.error("Error updating area:", error);
    },
    onSettled: () => {
      setLoading(false);
      setLoaderText("");
    },
  });

  const deleteAreaMutation = useMutation<any, unknown, number>({
    mutationFn: deleteArea,
    onMutate: () => {
      setLoading(true);
      setLoaderText("Deleting area...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "areas"
      });
      setShowModal(false);

      // If we're on a page with only one item and it's not the first page,
      // go back to the previous page
      if (areas.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    },
    onSettled: () => {
      setLoading(false);
      setLoaderText("");
    },
  });

  // Open modal to add a new area
  const handleAddNew = () => {
    setEditAreaData(null);
    setShowFormModal(true);
  };

  // View area details
  const handleView = (area: Area) => {
    setViewAreaData(area);
    setShowViewModal(true);
  };

  // Map the API data to the modal's IEditArea shape when editing
  const handleEdit = (area: Area) => {
    setEditAreaData({
      id: area.id,
      area_name: area.area_name,
      area_image:
        typeof area.area_image === "string" ? area.area_image : area.area_image,
      description: area.description || "",
      capacity: area.capacity,
      price_per_hour: area.price_per_hour,
      status: area.status,
    });
    setShowFormModal(true);
  };

  // Open delete confirmation modal
  const handleDelete = (areaId: number) => {
    setDeleteAreaId(areaId);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (deleteAreaId != null) {
      deleteAreaMutation.mutate(deleteAreaId);
    }
  };

  const cancelDelete = () => {
    setDeleteAreaId(null);
    setShowModal(false);
  };

  // When saving, convert area data to FormData
  const handleSave = async (areaData: IEditArea): Promise<void> => {
    const formData = new FormData();
    formData.append("area_name", areaData.area_name);
    formData.append("description", areaData.description || "");
    formData.append("capacity", areaData.capacity.toString());
    formData.append("price_per_hour", areaData.price_per_hour.toString());
    formData.append("status", areaData.status);

    // Only append the image if it's a File object (new upload)
    if (areaData.area_image instanceof File) {
      formData.append("area_image", areaData.area_image);
    }

    try {
      if (!areaData.id) {
        await addAreaMutation.mutateAsync(formData);
      } else {
        await editAreaMutation.mutateAsync({ areaId: areaData.id, formData });
      }
    } catch (error) {
      console.error("Error saving area:", error);
      throw error;
    }
  };

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <Error />;

  return (
    <div className="overflow-y-auto h-[calc(100vh-25px)]">
      <div className="p-3 container mx-auto">
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 z-[500]">
            <EventLoader size="80px" color="white" text={loaderText} />
          </div>
        )}

        {/* Add New Area Button */}
        <div className="flex flex-row items-center mb-5 justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Manage Areas</h1>
            {pagination && (
              <p className="text-gray-500 mt-1">
                Total: {pagination.total_items} area{pagination.total_items !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition-colors duration-300"
          >
            + Add New Area
          </button>
        </div>

        {/* Areas Grid or Empty State */}
        {areas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {areas.map((area) => (
              <div
                key={area.id}
                className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-full"
              >
                <img
                  loading="lazy"
                  src={area.area_image}
                  alt={area.area_name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      {area.area_name}
                    </h2>
                    <span className="text-sm font-semibold text-blue-600 uppercase">
                      {area.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    Capacity: {area.capacity} people
                  </p>
                  <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                    {area.description || "No description provided."}
                  </p>

                  <div className="mt-auto flex justify-between items-center">
                    <p className="text-lg font-bold text-gray-900">
                      {area.price_per_hour.toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(area)}
                        className="px-3 py-2 uppercase font-semibold bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-300"
                      >
                        <Eye />
                      </button>
                      <button
                        onClick={() => handleEdit(area)}
                        className="px-3 py-2 uppercase font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
                      >
                        <Edit />
                      </button>
                      <button
                        onClick={() => handleDelete(area.id)}
                        className="px-3 py-2 uppercase font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-300"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-16">
            <MapPin className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-2xl font-semibold">No Areas Found</p>
            <p className="mt-2 text-gray-500 text-center max-w-md">
              It looks like you haven't added any areas yet. Click the button
              below to create your first area.
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex justify-center items-center gap-2 my-5">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: pagination.total_pages }).map((_, index) => {
                const pageNumber = index + 1;
                // Show current page, first page, last page, and pages around current
                const isVisible =
                  pageNumber === 1 ||
                  pageNumber === pagination.total_pages ||
                  Math.abs(pageNumber - currentPage) <= 1;

                // Show ellipsis for gaps
                if (!isVisible) {
                  // Show ellipsis only once between gaps
                  if (pageNumber === 2 || pageNumber === pagination.total_pages - 1) {
                    return <span key={`ellipsis-${pageNumber}`} className="px-3 py-1">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    className={`w-8 h-8 rounded-full ${currentPage === pageNumber
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-blue-100"
                      }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNextPage}
              disabled={pagination && currentPage === pagination.total_pages}
              className={`p-2 rounded-full ${pagination && currentPage === pagination.total_pages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Edit/Add Area Modal */}
        {showFormModal && (
          <EditAreaModal
            isOpen={showFormModal}
            cancel={() => setShowFormModal(false)}
            onSave={handleSave}
            areaData={editAreaData}
            loading={addAreaMutation.isPending || editAreaMutation.isPending}
          />
        )}

        {/* View Area Modal */}
        <ViewAreaModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          areaData={viewAreaData}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showModal}
          icon="fas fa-trash"
          title="Delete Area"
          description="Are you sure you want to delete this area?"
          cancel={cancelDelete}
          onConfirm={confirmDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-md uppercase font-bold hover:bg-red-700 transition-all duration-300"
          cancelText="No"
          confirmText="Delete Area"
        />
      </div>
    </div>
  );
};

export default ManageAreas;
