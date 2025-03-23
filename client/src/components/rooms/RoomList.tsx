/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllRooms } from "../../services/Room";
import RoomCard from "./RoomCard";
import DashboardSkeleton from "../../motions/skeletons/AdminDashboardSkeleton";
import Error from "../../pages/_ErrorBoundary";

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
    retry: 2
  });

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

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-15 p-6"
    >
      {rooms.map((room, index) => (
        <div key={index}>
          <RoomCard {...room} />
        </div>
      ))}
    </div>
  );
};

export default RoomList;