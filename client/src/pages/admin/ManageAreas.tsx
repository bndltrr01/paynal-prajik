import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAreas } from "../../services/Area";

interface Area {
  id: number;
  name: string;
  description: string;
  capacity: number;
  price_per_hour: number;
  status: "available" | "occupied" | "maintenance";
  area_image?: string;
}

const ManageAreas = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: areasData, isLoading, error } = useQuery<Area[], Error>({
    queryKey: ["areas"],
    queryFn: fetchAreas,
  });

  const filteredAreas = (areasData || []).filter((area) =>
    area.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-25px)] p-3 overflow-y-auto container mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-semibold">Manage Areas</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition-colors duration-300">
          + Add New Area
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search areas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-full md:w-1/3"
        />
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500">Loading areas...</div>
      ) : error ? (
        <div className="text-center text-red-500">Failed to load areas.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAreas.length > 0 ? (
            filteredAreas.map((area) => (
              <div
                key={area.id}
                className="bg-white rounded shadow overflow-hidden flex flex-col"
              >
                {area.area_image && (
                  <img
                    src={area.area_image}
                    alt={area.name}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold mb-2">{area.name}</h2>
                  <p className="text-gray-600 mb-2 flex-grow">{area.description}</p>
                  <p className="text-gray-500">Capacity: {area.capacity}</p>
                  <p className="text-gray-500">Price Per Hour: ₱{area.price_per_hour}</p>
                  <span
                    className={`px-2 py-1 mt-2 text-sm font-semibold text-white rounded-full ${
                      area.status === "available"
                        ? "bg-green-500"
                        : area.status === "occupied"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {area.status.charAt(0).toUpperCase() + area.status.slice(1)}
                  </span>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No areas found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageAreas;
