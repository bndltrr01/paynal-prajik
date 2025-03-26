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

  return (
    <div className="container mx-auto py-10 px-4">
      <section className="container min-h-screen mt-[100px] min-w-screen overflow-x-hidden">
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
          <div className="relative z-10 px-6 lg:px-80">
            <div className="py-25">
              <h1 className="text-7xl font-montserrat font-bold tracking-widest uppercase py-5">
                {roomDetail.room_name}{" "}
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 2xl:grid-cols-2 px-4 md:px-10 lg:grid-cols-2">
          <div className="w-full">
            <div className="bg-white p-0 lg:p-10 mt-0 lg:mt-10 flex flex-col items-center">
              <div className="w-full max-w-[1200px]">
                <img
                  src={roomDetail.room_image}
                  alt={roomDetail.room_name}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 py-6 md:py-10 lg:py-20">
            <div className="bg-gray-100 p-6 md:p-10 rounded-lg shadow-sm w-full max-w-3xl mx-auto">
              <h2 className="font-playfair text-4xl font-semibold mb-4">
                Room Description
              </h2>
              <hr className="border-gray-300 mb-4" />
              <span className="text-lg font-playfair">
                {roomDetail.description}
              </span>
            </div>
            <div className="bg-gray-100 p-6 md:p-10 rounded-lg shadow-sm w-full max-w-3xl mx-auto mt-6">
              <h2 className="text-4xl font-playfair font-semibold mb-4">
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default withSuspense(RoomDetails, { loaderType: "card", count: 1 });
