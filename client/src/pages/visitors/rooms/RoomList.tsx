/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
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

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <Error />

  if (!data?.data) return <div className="p-6">No rooms available</div>;

  const availableRooms = data.data
    .filter((room: any) => room.status === 'available')
    .map((room: any) => {
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

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-center text-3xl sm:text-4xl font-bold mb-6">
        Our Room Accommodations
      </h2>

      {/* Rooms grid or empty state */}
      {availableRooms.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-lg text-gray-600">No rooms available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableRooms.map((room, index) => (
            <div key={index}>
              <RoomCard {...room} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomList;