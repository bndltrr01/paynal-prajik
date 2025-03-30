/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useState } from "react";
import { toast } from "react-toastify";
import EditRoomModal, { IRoom } from "../../components/admin/EditRoomModal";
import Modal from "../../components/Modal";
import EventLoader from "../../motions/loaders/EventLoader";
import DashboardSkeleton from "../../motions/skeletons/AdminDashboardSkeleton";
import {
  addNewRoom,
  deleteRoom,
  editRoom,
  fetchAmenities,
  fetchRooms,
} from "../../services/Admin";
import Error from "../_ErrorBoundary";

import { ChevronLeft, ChevronRight, Edit, Eye, Trash2 } from "lucide-react";

interface Amenity {
  id: number;
  description: string;
}

interface Room {
  id: number;
  room_name: string;
  room_image: string;
  room_type: string;
  status: "maintenance" | "occupied" | "available";
  room_price: number;
  description: string;
  capacity: string;
  amenities: number[];
}

interface AddRoomResponse {
  data: any;
}

interface PaginationData {
  total_pages: number;
  current_page: number;
  total_items: number;
  page_size: number;
}

const ViewRoomModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  roomData: Room | null;
  allAmenities: Amenity[];
}> = ({ isOpen, onClose, roomData, allAmenities }) => {
  if (!isOpen || !roomData) return null;

  const getAmenityDescription = (id: number) => {
    const found = allAmenities.find((a) => a.id === id);
    return found ? found.description : `ID: ${id}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl mx-4 rounded shadow-lg relative max-h-[100vh] overflow-y-auto">
        {/* Two-column layout (like RoomDetails) */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image */}
          <div className="h-64 md:h-auto">
            {roomData.room_image ? (
              <img
                loading="lazy"
                src={roomData.room_image}
                alt={roomData.room_name}
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
            <h1 className="text-3xl font-bold mb-4">{roomData.room_name}</h1>
            <p className="text-gray-700 mb-6">{roomData.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <span className="block text-gray-600 font-medium">
                  Room Type
                </span>
                <span className="text-lg font-semibold">
                  {roomData.room_type}
                </span>
              </div>
              <div>
                <span className="block text-gray-600 font-medium">
                  Status
                </span>
                <span className="text-lg font-semibold">
                  {roomData.status.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="block text-gray-600 font-medium">
                  Capacity
                </span>
                <span className="text-lg font-semibold">
                  {roomData.capacity}
                </span>
              </div>
              {/* Amenities as a bulleted list */}
              <div>
                <span className="block text-gray-600 font-medium">
                  Amenities
                </span>
                {roomData.amenities.length === 0 ? (
                  <span className="text-lg font-semibold">None</span>
                ) : (
                  <ul className="list-disc list-inside text-gray-700 text-sm mt-1">
                    {roomData.amenities.map((amenityId) => {
                      const desc = getAmenityDescription(amenityId);
                      return <li key={amenityId}>{desc}</li>;
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Price + optional button */}
            <div className="mt-auto">
              <p className="text-2xl font-bold mb-4">
                {roomData.room_price.toLocaleString()}
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

const ManageRooms: FC = () => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editRoomData, setEditRoomData] = useState<IRoom | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9);

  // For the read-only view
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewRoomData, setViewRoomData] = useState<Room | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [deleteRoomId, setDeleteRoomId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaderText, setLoaderText] = useState("");

  const queryClient = useQueryClient();

  // 1. Fetch Rooms with pagination
  const {
    data: roomsResponse,
    isLoading,
    isError
  } = useQuery<{
    data: Room[];
    pagination: PaginationData;
  }>({
    queryKey: ["rooms", currentPage, pageSize],
    queryFn: fetchRooms,
  });

  // 2. Also fetch ALL amenities (for the View modal)
  const { data: allAmenitiesData } = useQuery<{ data: Amenity[] }>({
    queryKey: ["allAmenitiesForView", 1, 100],
    queryFn: fetchAmenities,
  });
  const allAmenities = allAmenitiesData?.data || [];

  // 3. Mutations for Create, Update, Delete
  const addRoomMutation = useMutation<AddRoomResponse, unknown, FormData>({
    mutationFn: addNewRoom,
    onMutate: () => {
      setLoading(true);
      setLoaderText("Adding room...");
    },
    onSuccess: () => {
      // Force a refetch to ensure data is fresh, all queries with the key "rooms"
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "rooms"
      });
      setShowFormModal(false);
      // Display success toast
      toast.success("Room added successfully!");

      // Set to first page to see the new room
      setCurrentPage(1);
    },
    onError: (error: any) => {
      // Display error toast
      toast.error(`Failed to add room: ${error.message || 'Unknown error'}`);
      console.error("Error adding room:", error);
    },
    onSettled: () => {
      setLoading(false);
      setLoaderText("");
    },
  });

  const editRoomMutation = useMutation<
    AddRoomResponse,
    unknown,
    { roomId: number; formData: FormData }
  >({
    mutationFn: ({ roomId, formData }) => editRoom(roomId, formData),
    onMutate: () => {
      setLoading(true);
      setLoaderText("Updating room...");
    },
    onSuccess: () => {
      // Force a refetch to ensure data is fresh, all queries with the key "rooms"
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "rooms"
      });
      setShowFormModal(false);
      // Display success toast
      toast.success("Room updated successfully!");
    },
    onError: (error: any) => {
      // Display error toast
      toast.error(`Failed to update room: ${error.message || 'Unknown error'}`);
      console.error("Error updating room:", error);
    },
    onSettled: () => {
      setLoading(false);
      setLoaderText("");
    },
  });

  const deleteRoomMutation = useMutation<any, unknown, number>({
    mutationFn: deleteRoom,
    onMutate: () => {
      setLoading(true);
      setLoaderText("Deleting room...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "rooms"
      });
      setShowModal(false);

      // If we're on a page with only one item and it's not the first page,
      // go back to the previous page
      if (rooms.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    },
    onSettled: () => {
      setLoading(false);
      setLoaderText("");
    },
  });

  // 4. Handlers

  // A. Add New Room
  const handleAddNew = () => {
    setEditRoomData(null);
    setShowFormModal(true);
  };

  // B. Edit Existing Room
  const handleEdit = (room: Room) => {
    setEditRoomData({
      id: room.id,
      roomName: room.room_name,
      roomImage: room.room_image,
      roomType: room.room_type,
      status:
        room.status === "maintenance"
          ? "Maintenance"
          : room.status === "occupied"
            ? "Occupied"
            : "Available",
      roomPrice: room.room_price,
      description: room.description,
      capacity: room.capacity,
      amenities: room.amenities ?? [],
    });
    setShowFormModal(true);
  };

  // C. View (READ)
  const handleView = (room: Room) => {
    setViewRoomData(room);
    setShowViewModal(true);
  };

  // D. Delete Room
  const handleDelete = (roomId: number) => {
    setDeleteRoomId(roomId);
    setShowModal(true);
  };
  const confirmDelete = () => {
    if (deleteRoomId !== null) {
      deleteRoomMutation.mutate(deleteRoomId);
    }
  };
  const cancelDelete = () => {
    setDeleteRoomId(null);
    setShowModal(false);
  };

  // E. Save (Create or Update)
  const handleSave = async (roomData: IRoom): Promise<void> => {
    const formData = new FormData();
    formData.append("room_name", roomData.roomName);
    formData.append("room_type", roomData.roomType);
    formData.append("status", roomData.status.toLowerCase() || "available");
    formData.append("room_price", String(roomData.roomPrice || 0));
    formData.append("description", roomData.description || "");
    formData.append("capacity", roomData.capacity || "");

    // Only add amenities that are selected
    if (roomData.amenities && roomData.amenities.length > 0) {
      roomData.amenities.forEach((amenityId) => {
        formData.append("amenities", String(amenityId));
      });
    }

    // Only append the image if it's a File object (new upload)
    if (roomData.roomImage instanceof File) {
      formData.append("room_image", roomData.roomImage);
    }

    try {
      if (!roomData.id) {
        await addRoomMutation.mutateAsync(formData);
      } else {
        await editRoomMutation.mutateAsync({ roomId: roomData.id, formData });
      }
    } catch (error) {
      console.error("Error saving room:", error);
      throw error;
    }
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (roomsResponse?.pagination && currentPage < roomsResponse.pagination.total_pages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // 5. Loading & Error States
  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <Error />;

  // 6. Rooms array and pagination data from API
  const rooms = roomsResponse?.data || [];
  const pagination = roomsResponse?.pagination;

  return (
    <div className="overflow-y-auto h-[calc(100vh-25px)]">
      <div className="p-3 container mx-auto">
        {/* Loader Overlay */}
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 z-[500]">
            <EventLoader size="80px" color="white" text={loaderText} />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-row items-center mb-5 justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Manage Rooms</h1>
            {pagination && (
              <p className="text-gray-500 mt-1">
                Total: {pagination.total_items} room{pagination.total_items !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition-colors duration-300"
          >
            + Add New Room
          </button>
        </div>

        {/* Grid of Room Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-full"
            >
              <img
                loading="lazy"
                src={room.room_image}
                alt={room.room_name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    {room.room_name}
                  </h2>
                  <span className="text-sm font-semibold text-blue-600 uppercase">
                    {room.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-1">
                  {room.room_type} | Capacity: {room.capacity}
                </p>
                {/* Limit the description to 2 lines */}
                <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                  {room.description || "No description provided."}
                </p>

                <div className="mt-auto flex justify-between items-center">
                  <p className="text-lg font-bold text-gray-900">
                    {room.room_price}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(room)}
                      className="px-3 py-2 uppercase font-semibold bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-300"
                    >
                      <Eye />
                    </button>
                    <button
                      onClick={() => handleEdit(room)}
                      className="px-3 py-2 uppercase font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
                    >
                      <Edit />
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
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

        {/* Edit/Add Room Modal */}
        {showFormModal && (
          <EditRoomModal
            isOpen={showFormModal}
            cancel={() => setShowFormModal(false)}
            onSave={handleSave}
            roomData={editRoomData}
            loading={addRoomMutation.isPending || editRoomMutation.isPending}
          />
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showModal}
          icon="fas fa-trash"
          title="Delete Room"
          description="Are you sure you want to delete this room?"
          cancel={cancelDelete}
          onConfirm={confirmDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-md uppercase font-bold hover:bg-red-700 transition-all duration-300"
          cancelText="No"
          confirmText="Delete Room"
        />

        {/* View (Read) Modal */}
        <ViewRoomModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          roomData={viewRoomData}
          allAmenities={allAmenities}
        />
      </div>
    </div>
  );
};

export default ManageRooms;
