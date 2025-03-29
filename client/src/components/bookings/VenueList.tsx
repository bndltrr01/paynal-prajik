import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ContentLoader from "../../motions/loaders/ContentLoader";
import { fetchAreas } from "../../services/Area";
import VenueCard from "./VenueCard";

interface Area {
  id: number;
  area_name: string;
  description: string;
  area_image: string;
  status: string;
  capacity: number;
  price_per_hour: string;
}

const VenueList = () => {
  const { data: areasData, isLoading, isError } = useQuery<{ data: Area[] }>({
    queryKey: ["venues"],
    queryFn: fetchAreas,
  });

  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h2 className="text-center text-3xl sm:text-4xl font-bold mb-8">
          Select Your Perfect Event Space
        </h2>
        <ContentLoader type="card" count={3} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <h2 className="text-center text-3xl sm:text-4xl font-bold mb-8">
          Select Your Perfect Event Space
        </h2>
        <div className="text-center text-red-500">
          Failed to load venues. Please try again later.
        </div>
      </div>
    );
  }

  const areas = areasData?.data || [];

  // Filter areas based on status filter if set
  const filteredAreas = statusFilter
    ? areas.filter(area => area.status.toLowerCase() === statusFilter.toLowerCase())
    : areas;

  const availableCount = areas.filter(area =>
    area.status.toLowerCase() === 'available'
  ).length;

  return (
    <>
      <div className="container mx-auto p-6">
        <h2 className="text-center text-3xl sm:text-4xl font-bold mb-6">
          Select Your Perfect Event Space
        </h2>

        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-lg text-gray-600">
            {availableCount} of {areas.length} venues available for booking
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

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Area Availability</h3>
          <ul className="list-disc list-inside text-sm text-blue-600">
            <li className="text-lg"><span className="font-medium">Available</span>: Ready to book for your event</li>
            <li className="text-lg"><span className="font-medium">Maintenance</span>: Temporarily unavailable due to maintenance</li>
            <li className="text-lg"><span className="font-medium">Occupied</span>: Currently in use for an event</li>
            <li className="text-lg"><span className="font-medium">Reserved</span>: Already booked for an upcoming event</li>
          </ul>
        </div>

        {filteredAreas.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-lg text-gray-600">No areas match the selected filter.</p>
            <button
              onClick={() => setStatusFilter(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Show all areas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAreas.map((area: Area) => (
              <div
                key={area.id}
                onClick={() => setSelectedArea(selectedArea === area.id ? null : area.id)}
                className={area.status.toLowerCase() !== 'available' ? 'opacity-90' : ''}
              >
                <VenueCard
                  id={area.id}
                  title={area.area_name}
                  priceRange={area.price_per_hour}
                  capacity={area.capacity}
                  image={area.area_image}
                  status={area.status}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default VenueList;
