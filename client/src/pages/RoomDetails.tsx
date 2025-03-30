/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { lazy } from "react";
import { Link, useParams } from "react-router-dom";
import withSuspense from '../hoc/withSuspense';
import { fetchAmenities } from "../services/Admin";
import { fetchRoomDetail } from "../services/Room";

const LoadingDashboard = lazy(
  () => import("../motions/skeletons/AdminDashboardSkeleton")
);
const Error = lazy(() => import("./_ErrorBoundary"));

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();

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
  const getAmenityDescription = (amenityId: any) => {
    const found = allAmenities.find((a: any) => a.id === amenityId);
    return found ? found.description : `ID: ${amenityId}`;
  };

  const isBookingDisabled = (): boolean => {
    const status = roomDetail.status?.toLowerCase();
    return status === 'maintenance' || status === 'occupied' || status === 'reserved';
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <section className="container mx-auto min-h-screen mt-[100px] overflow-x-hidden">
        {/* Hero Banner */}
        <div
          className="h-[400px] w-full overflow-hidden bg-cover bg-center relative before:absolute before:inset-0 before:bg-black/60 before:z-0 text-white"
          style={{ backgroundImage: `url(${roomDetail.room_image})` }}
        >
          <div className="absolute top-5 left-5 flex items-center gap-x-3 z-11 cursor-pointer">
            <Link
              to="/rooms"
              className="flex items-center gap-x-3 text-white hover:text-white/80"
            >
              <i className="fa fa-arrow-left text-xl"></i>
              <span className="text-xl">Back to Rooms</span>
            </Link>
          </div>
          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-montserrat font-bold tracking-wider uppercase">
                {roomDetail.room_name}
              </h1>
            </div>
          </div>
        </div>

        {/* Room Details Section */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Room Image */}
            <div className="w-full">
              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <img
                  loading="lazy"
                  srcSet={`${roomDetail.room_image} 1x, ${roomDetail.room_image} 2x`}
                  src={roomDetail.room_image}
                  alt={roomDetail.room_name}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Right Column - Room Details */}
            <div className="flex flex-col space-y-8">
              {/* Room Description */}
              <div className="bg-gray-100 p-6 md:p-8 rounded-lg shadow-sm">
                <h2 className="font-playfair text-3xl font-semibold mb-4">
                  Room Description
                </h2>
                <hr className="border-gray-300 mb-4" />
                <p className="text-lg font-playfair">
                  {roomDetail.description}
                </p>
              </div>

              {/* Amenities */}
              <div className="bg-gray-100 p-6 md:p-8 rounded-lg shadow-sm">
                <h2 className="text-3xl font-playfair font-semibold mb-4">
                  Amenities
                </h2>
                <hr className="border-gray-300 mb-4" />
                {isLoadingAmenities ? (
                  <p className="text-sm text-gray-500">Loading amenities...</p>
                ) : amenitiesError ? (
                  <p className="text-sm text-red-500">Failed to load amenities.</p>
                ) : roomDetail.amenities.length === 0 ? (
                  <span className="text-lg font-semibold">None</span>
                ) : (
                  <ul className="list-disc pl-5 text-gray-700">
                    {roomDetail.amenities.map((amenityId: any) => (
                      <li key={amenityId} className="mb-2">
                        {getAmenityDescription(amenityId)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Book Now Button */}
              <div className="mt-4">
                {isBookingDisabled() ? (
                  <div className="relative group">
                    <button
                      disabled
                      className="w-full py-4 bg-gray-400 text-white font-bold text-lg rounded-lg cursor-not-allowed"
                    >
                      Not Available
                    </button>
                    <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      This room is currently {roomDetail.status}
                    </div>
                  </div>
                ) : (
                  <Link to={`/booking/${roomDetail.id}`}>
                    <button className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                      Book Now
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default withSuspense(RoomDetails, { loaderType: "card", count: 1 });
