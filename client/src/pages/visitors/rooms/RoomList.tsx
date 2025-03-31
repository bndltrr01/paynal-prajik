/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { FC, useState } from "react";
import RoomCard from "../../../components/rooms/RoomCard";
import DashboardSkeleton from "../../../motions/skeletons/AdminDashboardSkeleton";
import { fetchAllRooms } from "../../../services/Room";
import Error from "../../_ErrorBoundary";

interface Room {
  id: number;
  room_name: string;
  room_image: string;
  room_type: string;
  status: string;
  description: string;
  capacity: number;
  room_price: number;
  amenities: string[];
}

interface RoomsResponse {
  data: Room[];
}

const RoomList: FC = () => {
  const { data, isLoading, isError } = useQuery<RoomsResponse>({
    queryKey: ['rooms'],
    queryFn: fetchAllRooms,
  });

  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <Error />

  if (!data?.data) return <div className="p-6">No rooms available</div>;

  const rooms = data.data.map((room: any) => {
    return {
      id: room.id,
      name: room.room_name,
      image: room.room_image,
      title: room.room_type,
      status: room.status,
      description: room.description,
      capacity: room.capacity,
      price: room.room_price,
      amenities: room.amenities
    };
  });

  const filteredRooms = statusFilter
    ? rooms.filter(room => room.status.toLowerCase() === statusFilter.toLowerCase())
    : rooms;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-center text-3xl sm:text-4xl font-bold mb-6">
        Our Room Accommodations
      </h2>

      {/* Rooms grid or empty state */}
      {filteredRooms.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-lg text-gray-600">No rooms match the selected filter.</p>
          <button
            onClick={() => setStatusFilter(null)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Show all rooms
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room, index) => (
            <div
              key={index}
              className={room.status.toLowerCase() !== 'available' ? 'opacity-90' : ''}
            >
              <RoomCard {...room} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomList;