/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAmenities } from "../../services/Amenity";
import DashboardSkeleton from "../../motions/skeletons/AdminDashboardSkeleton";
import Error from "../_ErrorBoundary";

const ManageAmenities = () => {
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<string>("All");

  const { data, isLoading, error } = useQuery({
    queryKey: ["amenities"], 
    queryFn: fetchAmenities
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <Error />;

  const amenities = data?.data || [];

  const filteredAmenities = amenities.filter((amenity: any) =>
    amenity.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-25px)] p-3 overflow-y-auto container mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Manage Amenities</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-300">
          Add New Amenity
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by amenity name"
          className="p-2 border rounded w-full md:w-1/2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="p-2 border rounded w-full md:w-1/2"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Amenities</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Amenities Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Amenity Name</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAmenities.map((amenity: any) => (
              <tr key={amenity.id} className="hover:bg-gray-50">
                <td className="border p-2">{amenity.name}</td>
                <td className="border p-2">{amenity.description}</td>
                <td className="border p-2 space-x-2">
                  <button className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded">
                    Edit
                  </button>
                  <button className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls (Optional) */}
      <div className="flex justify-center items-center mt-6 space-x-2">
        <button className="px-3 py-1 bg-gray-200 rounded-l hover:bg-gray-300">
          Previous
        </button>
        <span className="px-3 py-1 bg-gray-100">1</span>
        <button className="px-3 py-1 bg-gray-200 rounded-r hover:bg-gray-300">
          Next
        </button>
      </div>
    </div>
  );
};

export default ManageAmenities;
