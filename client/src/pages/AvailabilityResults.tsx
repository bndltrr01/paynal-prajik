/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, Book, BookmarkPlus } from "lucide-react";
import { fetchAvailability } from "../services/Booking";

const AvailabilityResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const arrival = searchParams.get("arrival") || "";
  const departure = searchParams.get("departure") || "";

  if (!arrival || !departure) {
    navigate("/");
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["availability", arrival, departure],
    queryFn: () => fetchAvailability(arrival, departure),
    enabled: !!arrival && !!departure,
  });

  const arrivalLabel = arrival;
  const departureLabel = departure;

  const handleViewVenueDetails = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    navigate(`/venues/${id}`);
  };

  const handleBookVenue = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    navigate(`/venue-booking/${id}?arrival=${arrival}&departure=${departure}`);
  };

  return (
    <div className="container min-h-screen mx-auto px-4 py-10 mt-[120px] pb-8">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold">Availability Results</h1>
        <p className="text-gray-600 mt-2">
          Showing availability from <span className="font-semibold"> {arrivalLabel} </span> to
          <span className="font-semibold"> {departureLabel} </span>
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <p className="text-lg text-gray-600">Loading availability...</p>
        </div>
      )}
      {error && (
        <div className="text-center text-red-500 mb-4">
          Error fetching availability.
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-10">
          {/* Rooms Section */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              Available Rooms
            </h2>
            {data.rooms && data.rooms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.rooms.map((room: any) => (
                  <div
                    key={room.id}
                    className="bg-white rounded-lg shadow-md p-5 flex flex-col"
                  >
                    {/* Room Image (if available) */}
                    {room.room_image && (
                      <img
                        loading="lazy"
                        src={room.room_image}
                        alt={room.room_name}
                        className="w-full h-40 object-cover mb-3 rounded"
                      />
                    )}
                    {/* Room Name & Basic Info */}
                    <h3 className="text-lg font-bold mb-1">{room.room_name}</h3>
                    {room.room_type && (
                      <p className="text-sm text-gray-500 mb-1">
                        Room Type:{" "}
                        <span className="font-medium">{room.room_type}</span>
                      </p>
                    )}
                    <div className="text-sm text-gray-700 mb-2">
                      {room.bed_size && (
                        <p>
                          <span className="font-medium">Bed Size:</span>{" "}
                          {room.bed_size}
                        </p>
                      )}
                      {room.pax && (
                        <p>
                          <span className="font-medium">Capacity:</span>{" "}
                          {room.pax} pax
                        </p>
                      )}
                    </div>
                    {/* Price & Action */}
                    <p className="text-gray-800 font-semibold text-lg mb-3">
                      {room.room_price}
                    </p>
                    <div className="mt-auto flex flex-wrap justify-evenly gap-2 font-montserrat">
                      <Link
                        to={`/rooms/${room.id}`}
                        className="bg-blue-600 text-sm text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
                      >
                        <Eye size={16} /> <span>View</span>
                      </Link>
                      <Link
                        to={`/confirm-booking?roomId=${room.id}&arrival=${arrival}&departure=${departure}`}
                        className="bg-green-600 text-sm text-white px-3 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-1"
                      >
                        <Book size={16} /> <span>Book</span>
                      </Link>
                      <Link
                        to={`/booking/${room.id}`}
                        className="bg-purple-600 text-sm text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-1"
                      >
                        <BookmarkPlus size={16} /> <span>Reserve</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">
                No rooms available for these dates.
              </p>
            )}
          </div>

          {/* Areas Section */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              Available Areas
            </h2>
            {data.areas && data.areas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.areas.map((area: any) => (
                  <div
                    key={area.id}
                    className="bg-white rounded-lg shadow-md p-5 flex flex-col"
                  >
                    {/* Area Image (if available) */}
                    {area.area_image && (
                      <img
                        loading="lazy"
                        src={area.area_image}
                        alt={area.area_name}
                        className="w-full h-40 object-cover mb-3 rounded"
                      />
                    )}
                    {/* Area Name & Basic Info */}
                    <h3 className="text-lg font-bold mb-1">{area.area_name}</h3>
                    {/* Additional Details (Capacity, etc.) */}
                    <div className="text-sm text-gray-700 mb-2">
                      {area.capacity && (
                        <p>
                          <span className="font-medium">Capacity:</span>{" "}
                          {area.capacity} persons
                        </p>
                      )}
                    </div>
                    {/* Price & Action */}
                    <p className="text-gray-800 font-semibold text-lg mb-3">
                      {area.price_per_hour} / hour
                    </p>
                    <div className="mt-auto flex flex-wrap justify-evenly gap-2 font-montserrat">
                      <button
                        className="bg-blue-600 text-sm text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer flex items-center gap-1"
                        onClick={(e) => handleViewVenueDetails(e, area.id)}
                      >
                        <Eye size={16} /> <span>View</span>
                      </button>
                      <button
                        className="bg-green-600 text-sm text-white px-3 py-2 rounded-lg hover:bg-green-700 transition cursor-pointer flex items-center gap-1"
                        onClick={(e) => handleBookVenue(e, area.id)}
                      >
                        <Book size={16} /> <span>Book</span>
                      </button>
                      <Link to={`/venue-booking/${area.id}?arrival=${arrival}&departure=${departure}`}>
                        <button className="bg-purple-600 text-sm text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition cursor-pointer flex items-center gap-1">
                          <BookmarkPlus size={16} /> <span>Reserve</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">
                No areas available for these dates.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityResults;
