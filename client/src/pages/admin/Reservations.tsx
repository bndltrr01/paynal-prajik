/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import DashboardSkeleton from "../../motions/skeletons/AdminDashboardSkeleton";
import { fetchReservations } from "../../services/Booking";
import Error from "../_ErrorBoundary";

const Reservations = () => {
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const { data, isLoading, error } = useQuery({
    queryKey: ['area_reservations'],
    queryFn: fetchReservations,
    retry: 2
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <Error />

  const reservationsArray = data?.data || [];
  const filteredReservations = reservationsArray.filter((reservation: any) => {
    return (
      (filter === "all" || reservation.status.toLowerCase() === filter) &&
      (search === "" || reservation.guest_name.toLowerCase().includes(search.toLowerCase()))
    );
  });

  // Helper function to format date in YYYY-MM-DD format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  }

  return (
    <div className="h-[calc(100vh-25px)] p-3 overflow-y-auto container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-semibold mb-6">Reservations</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Guest Name"
          className="p-2 border rounded w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="p-2 border rounded w-full md:w-1/3"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-1 text-left">Reservation ID</th>
              <th className="p-1 text-left">Guest Name</th>
              <th className="p-1 text-left">Area Name</th>
              <th className="p-1 text-left">Start Date</th>
              <th className="p-1 text-left">End Date</th>
              <th className="p-1 text-left">Price ($)</th>
              <th className="p-1 text-left">Status</th>
              <th className="p-1 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map((res: any) => (
              <tr key={res.id} className="hover:bg-gray-50">
                <td className="p-1">{res.id}</td>
                <td className="p-1">{res.guest_name}</td>
                <td className="p-1">{res.area_name}</td>
                <td className="p-1">{formatDate(res.start_time)}</td>
                <td className="p-1">{formatDate(res.end_time)}</td>
                <td className="p-1">$ {res.total_price}</td>
                <td className="p-1 capitalize">{res.status}</td>
                <td className="p-1 space-x-2">
                  <button className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded">
                    Edit
                  </button>
                  <button className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded">
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Reservations;
