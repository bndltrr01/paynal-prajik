import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { lazy } from "react";
import { fetchRoomDetail } from "../services/Room";
import { fetchAmenities } from "../services/Admin";
import RoomImage from "../components/RoomImage";
import RoomDetailsHero from "../layout/RoomDetailsHero";
import RoomDescription from "../components/RoomDescription";
import RoomAmenities from "../components/RoomAmenities";
import RoomRule from "../components/RoomRule";
import RoomAvailabilityCalendar from "../components/rooms/RoomAvailabilityCalendar";

const LoadingDashboard = lazy(
  () => import("../motions/skeletons/AdminDashboardSkeleton")
);
const Error = lazy(() => import("./_ErrorBoundary"));

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: roomData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["room", id],
    queryFn: () => fetchRoomDetail(id as string),
    enabled: !!id,
  });

  const {
    data: allAmenitiesData,
    isLoading: isLoadingAmenities,
    error: amenitiesError,
  } = useQuery({
    queryKey: ["allAmenitiesForRoomDetails", 1, 100],
    queryFn: fetchAmenities,
  });

  if (isLoading) return <LoadingDashboard />;
  if (error) return <Error />;

  const roomDetail = roomData?.data;
  if (!roomDetail) {
    return <div className="text-center mt-4">No room details available</div>;
  }

  const allAmenities = allAmenitiesData?.data || [];
  const getAmenityDescription = (amenityId) => {
    const found = allAmenities.find((a) => a.id === amenityId);
    return found ? found.description : `ID: ${amenityId}`;
  };

  return (
    <div className="container min-h-screen mt-[120px] min-w-screen overflow-x-hidden">
      <RoomDetailsHero />
      <div className="grid grid-cols-1 2xl:grid-cols-2 px-4 md:px-10 lg:grid-cols-2">
        <div className="w-full">
          <RoomImage />
        </div>
        <div className="grid grid-cols-1 gap-4 py-6 md:py-10 lg:py-20">
          <RoomDescription />
          <RoomAmenities />
          <RoomRule />
        </div>
      </div>

      {/* <button
        onClick={() => navigate("/rooms")}
        className="mt-4 text-blue-600 hover:text-blue-800 focus:outline-none cursor-pointer"
      >
        &larr; Back to Rooms
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full h-64 md:h-auto flex justify-center">
            <img
              src={roomDetail.room_image}
              alt={roomDetail.room_name}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
          <div className="p-6 flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              {roomDetail.room_name}
            </h1>
            <p className="text-gray-700 text-sm md:text-base mb-6">
              {roomDetail.description}
            </p>

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
                <span className="block text-gray-600 font-medium">Status</span>
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
              <div>
                <span className="block text-gray-600 font-medium">
                  Amenities
                </span>
                {isLoadingAmenities ? (
                  <p className="text-sm text-gray-500">Loading amenities...</p>
                ) : amenitiesError ? (
                  <p className="text-sm text-red-500">
                    Failed to load amenities.
                  </p>
                ) : roomDetail.amenities.length === 0 ? (
                  <span className="text-lg font-semibold">None</span>
                ) : (
                  <ul className="list-disc list-inside mt-1 text-gray-700 text-sm md:text-base">
                    {roomDetail.amenities.map((amenityId) => (
                      <li key={amenityId}>
                        {getAmenityDescription(amenityId)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-auto text-center md:text-left">
              <p className="text-xl md:text-2xl font-bold mb-4">
                {roomDetail.room_price.toLocaleString()}
              </p>
              <button className="w-full md:w-auto bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition">
                Reserve Now
              </button>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default RoomDetails;
