/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useState } from "react";
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

import { Edit, Eye, Trash2 } from "lucide-react";

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

  // For the read-only view
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewRoomData, setViewRoomData] = useState<Room | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [deleteRoomId, setDeleteRoomId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaderText, setLoaderText] = useState("");

  const queryClient = useQueryClient();

  // 1. Fetch Rooms
  const { data: roomsData, isLoading, isError } = useQuery<{ data: Room[] }>({
    queryKey: ["rooms"],
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
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setShowFormModal(false);
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
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setShowFormModal(false);
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
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setShowModal(false);
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

    roomData.amenities.forEach((amenityId) => {
      formData.append("amenities", String(amenityId));
    });
    if (roomData.roomImage instanceof File) {
      formData.append("room_image", roomData.roomImage);
    }

    if (!roomData.id) {
      await addRoomMutation.mutateAsync(formData);
    } else {
      await editRoomMutation.mutateAsync({ roomId: roomData.id, formData });
    }
  };

  // 5. Loading & Error States
  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <Error />;

  // 6. Rooms array from API
  const rooms = roomsData?.data || [];

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
          <h1 className="text-3xl font-semibold">Manage Rooms</h1>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition-colors duration-300"
          >
            + Add New Room
          </button>
        </div>

        {/* Grid of Room Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-full"
            >
              <img
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
