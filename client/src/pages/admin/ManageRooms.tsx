/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useState } from "react";
import EditRoomModal, { IRoom } from "../../components/admin/EditRoomModal";
import Modal from "../../components/Modal";
import ManageRoomLoader from "../../motions/loaders/ManageRoomLoader";
import DashboardSkeleton from "../../motions/skeletons/AdminDashboardSkeleton";
import { addNewRoom, deleteRoom, editRoom, fetchRooms } from "../../services/Admin";
import Error from "../_ErrorBoundary";

interface AddRoomResponse {
  data: any;
}

interface Room {
  id: number;
  room_name: string;
  room_image: string;
  admission: "vip" | "regular";
  room_type: string;
  room_number: string;
  status: "maintenance" | "occupied" | "available";
  room_price: number;
  description?: string;
  bed_size: string;
  pax: number;
}

const ManageRooms: FC = () => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editRoomData, setEditRoomData] = useState<IRoom | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [deleteRoomId, setDeleteRoomId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loaderText, setLoaderText] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: roomsData, isLoading, isError } = useQuery<{ data: Room[] }>({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
  });

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

  const handleAddNew = () => {
    setEditRoomData(null);
    setShowFormModal(true);
  };

  const handleEdit = (room: any) => {
    setEditRoomData({
      id: room.id,
      roomName: room.room_name,
      roomImage:
        typeof room.room_image === "string" ? room.room_image : room.room_price,
      roomAdmission: room.admission === "vip" ? "VIP" : "Regular",
      roomType: room.room_type,
      roomNumber: room.room_number,
      status:
        room.status === "maintenance"
          ? "Maintenance"
          : room.status === "occupied"
            ? "Occupied"
            : "Available",
      roomPrice: room.room_price,
      description: room.description,
      bedSize: room.bed_size,
      pax: room.pax,
    });
    setShowFormModal(true);
  };

  const handleDelete = (roomId: number) => {
    setDeleteRoomId(roomId);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (deleteRoomId != null) {
      deleteRoomMutation.mutate(deleteRoomId);
    }
  };

  const cancelDelete = () => {
    setDeleteRoomId(null);
    setShowModal(false);
  };

  const handleSave = async (roomData: IRoom): Promise<void> => {
    const formData = new FormData();
    formData.append("room_name", roomData.roomName);
    formData.append("admission", roomData.roomAdmission === "VIP" ? "vip" : "regular");
    formData.append("room_type", roomData.roomType);
    formData.append("status", roomData.status.toLowerCase() || "available");
    formData.append("room_price", String(roomData.roomPrice || 0));
    formData.append("description", roomData.description || "");
    formData.append("bed_size", String(roomData.bedSize || ""));
    formData.append("room_number", roomData.roomNumber || "");
    formData.append("pax", String(roomData.pax || 1));
    if (roomData.roomImage instanceof File) {
      formData.append("room_image", roomData.roomImage);
    }

    if (!roomData.id) {
      await addRoomMutation.mutateAsync(formData);
    } else {
      await editRoomMutation.mutateAsync({ roomId: roomData.id, formData });
    }
  };

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <Error />;

  const rooms = roomsData?.data || [];

  return (
    <div className="overflow-y-auto h-[calc(100vh-25px)]">
      <div className="p-3 container mx-auto">
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 z-[500]">
            <ManageRoomLoader size="80px" color="white" text={loaderText} />
          </div>
        )}

        <div className="flex flex-row items-center mb-5 justify-between">
          <h1 className="text-3xl font-semibold">Manage Rooms</h1>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition-colors duration-300"
          >
            + Add New Room
          </button>
        </div>

        {/* Responsive Grid for Room Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {rooms.map((room: any) => (
            <div
              key={room.id}
              className="bg-white shadow-md rounded-lg overflow-hidden"
            >
              {/* Room Image */}
              <img
                src={room.room_image}
                alt={room.room_name}
                className="w-full h-48 object-cover"
              />

              {/* Card Content */}
              <div className="p-4 flex flex-col space-y-2">
                {/* Title & Admission (right-aligned) */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    {room.room_name}
                  </h2>
                  <span className="text-sm font-semibold text-blue-600 uppercase">
                    {room.admission === "vip" ? "VIP" : "Regular"}
                  </span>
                </div>

                {/* Room Type & Number */}
                <p className="text-gray-600 text-sm">
                  {room.room_type} ( {room.room_number} )
                </p>

                {/* Room Description */}
                <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                  {room.description || "No description provided."}
                </p>

                {/* Bed Size & Pax */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <i className="fa fa-bed"></i>
                    <span>{room.bed_size}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="fa fa-user-friends"></i>
                    <span>{room.pax} pax</span>
                  </div>
                </div>

                {/* Price and Buttons */}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-gray-900">
                    ₱ {room.room_price?.toLocaleString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(room)}
                      className="px-3 py-1 uppercase font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="px-3 py-1 uppercase font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-300"
                    >
                      Delete
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
      </div>
    </div>
  );
};

export default ManageRooms;
