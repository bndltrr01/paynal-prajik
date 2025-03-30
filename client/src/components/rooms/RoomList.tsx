/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { FC, useState } from "react";
import DashboardSkeleton from "../../motions/skeletons/AdminDashboardSkeleton";
import Error from "../../pages/_ErrorBoundary";
import { fetchAllRooms } from "../../services/Room";
import RoomCard from "./RoomCard";

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

  const availableCount = rooms.filter(room =>
    room.status.toLowerCase() === 'available'
  ).length;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-center text-3xl sm:text-4xl font-bold mb-6">
        Our Luxurious Accommodations
      </h2>

      {/* Status filter and available count */}
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-lg text-gray-600">
          {availableCount} of {rooms.length} rooms available for booking
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <button
            className={`px-3 py-1 rounded-full text-lg font-medium transition-colors ${statusFilter === null ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            onClick={() => setStatusFilter(null)}
          >
            All
          </button>
          <button
            className={`px-3 py-1 rounded-full text-lg font-medium transition-colors ${statusFilter === 'available' ? 'bg-green-600 text-white' : 'bg-green-100 hover:bg-green-200'
              }`}
            onClick={() => setStatusFilter('available')}
          >
            Available
          </button>
          <button
            className={`px-3 py-1 rounded-full text-lg font-medium transition-colors ${statusFilter === 'maintenance' ? 'bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            onClick={() => setStatusFilter('maintenance')}
          >
            Maintenance
          </button>
          <button
            className={`px-3 py-1 rounded-full text-lg font-medium transition-colors ${statusFilter === 'occupied' ? 'bg-red-600 text-white' : 'bg-red-100 hover:bg-red-200'
              }`}
            onClick={() => setStatusFilter('occupied')}
          >
            Occupied
          </button>
          <button
            className={`px-3 py-1 rounded-full text-lg font-medium transition-colors ${statusFilter === 'reserved' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 hover:bg-yellow-200'
              }`}
            onClick={() => setStatusFilter('reserved')}
          >
            Reserved
          </button>
        </div>
      </div>

      {/* Information about room statuses */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-xl font-semibold text-blue-700 mb-2">Room Availability</h3>
        <ul className="list-disc list-inside text-sm text-blue-600">
          <li className="text-lg"><span className="font-medium">Available</span>: Ready to book for your stay</li>
          <li className="text-lg"><span className="font-medium">Maintenance</span>: Temporarily unavailable due to maintenance</li>
          <li className="text-lg"><span className="font-medium">Occupied</span>: Currently occupied by guests</li>
          <li className="text-lg"><span className="font-medium">Reserved</span>: Already booked for future dates</li>
        </ul>
      </div>

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