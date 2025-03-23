import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchRoomDetail } from "../services/Room";
import { lazy } from "react";

const LoadingDashboard = lazy(() => import("../motions/skeletons/AdminDashboardSkeleton"));
const Error = lazy(() => import("./_ErrorBoundary"));

interface RoomDetail {
  id: number;
  room_name: string;
  room_type: string;
  status: string;
  room_price: number;
  room_image: string;
  description: string;
  capacity: string;
  amenities: number[];
}

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["room", id],
    queryFn: () => fetchRoomDetail(id as string),
    enabled: !!id,
  });

  if (isLoading) return <LoadingDashboard />
  if (error) return <Error />

  const roomDetail: RoomDetail = data?.data;

  if (!roomDetail)
    return (
      <div className="text-center mt-4">No room details available</div>
    );

  return (
    <div className="container min-h-screen mx-auto px-4 pt-20 pb-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/rooms")}
        className="mb-4 text-blue-600 hover:text-blue-800 focus:outline-none cursor-pointer"
      >
        &larr; Back to Rooms
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Room Image */}
          <div className="h-64 md:h-auto">
            <img
              src={roomDetail.room_image}
              alt={roomDetail.room_name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Room Information */}
          <div className="p-6 flex flex-col">
            <h1 className="text-3xl font-bold mb-4">{roomDetail.room_name}</h1>
            <p className="text-gray-700 mb-6">{roomDetail.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <span className="block text-gray-600 font-medium">
                  Room Type
                </span>
                <span className="text-lg font-semibold">
                  {roomDetail.room_type}
                </span>
              </div>
              <div>
                <span className="block text-gray-600 font-medium">
                  Status
                </span>
                <span className="text-lg font-semibold">
                  {roomDetail.status.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="block text-gray-600 font-medium">
                  Capacity
                </span>
                <span className="text-lg font-semibold">
                  {roomDetail.capacity}
                </span>
              </div>
              {/* You can add amenities here if needed */}
            </div>
            <div className="mt-auto">
              <p className="text-2xl font-bold mb-4">
                ₱ {roomDetail.room_price.toLocaleString()}
              </p>
              <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                Reserve Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
