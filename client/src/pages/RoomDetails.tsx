import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchRoomDetail } from "../services/Room";

interface RoomDetail {
  id: number;
  admission: string;
  room_name: string;
  room_number: string;
  room_type: string;
  status: string;
  room_price: number;
  room_image: string;
  description: string;
  bed_size: string;
  pax: number;
}

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["room", id],
    queryFn: () => fetchRoomDetail(id as string),
    enabled: !!id,
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-500 mt-4">
        Failed to fetch room details.
      </div>
    );

  const roomDetail: RoomDetail = data?.data;

  if (!roomDetail)
    return <div className="text-center mt-4">No room details available</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/rooms")}
        className="text-2xl text-blue-600 hover:text-blue-800 focus:outline-none mb-10"
      >
        &larr; Back to Rooms
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="h-64 md:h-auto">
            <img
              src={roomDetail.room_image}
              alt={roomDetail.room_name}
              className="w-full h-full object-cover"
            />
          </div>
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
                  Admission
                </span>
                <span className="text-lg font-semibold">
                  {roomDetail.admission.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="block text-gray-600 font-medium">
                  Bed Size
                </span>
                <span className="text-lg font-semibold">
                  {roomDetail.bed_size}
                </span>
              </div>
              <div>
                <span className="block text-gray-600 font-medium">
                  Capacity
                </span>
                <span className="text-lg font-semibold">
                  {roomDetail.pax} Pax
                </span>
              </div>
            </div>
            <div className="mt-auto">
              <p className="text-2xl font-bold mb-4">
                ₱{roomDetail.room_price.toLocaleString()}
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
