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

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-center text-3xl sm:text-4xl font-bold mb-6">
        Select Your Perfect Event Space
      </h2>

      {areas.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-lg text-gray-600">No areas available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area: Area) => (
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
  );
};

export default VenueList;