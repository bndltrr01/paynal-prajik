import { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBookings } from "../../services/Booking";

interface Booking {
  id: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  room: {
    roomName: string;
  };
  check_in_date: string;
  check_out_date: string;
  status: "Confirmed" | "Checked In" | "Checked Out" | "Cancelled";
  created_at: string;
  updated_at: string;
}

const ManageBookings: FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "confirmed" | "checkedIn" | "checkedOut" | "cancelled"
  >("all");

  const { data: bookingsData, error, isLoading } = useQuery<Booking[], Error>({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(
      e.target.value as "all" | "confirmed" | "checkedIn" | "checkedOut" | "cancelled"
    );
  };

  const filteredBookings = (bookingsData || []).filter((booking) => {
    const guestName = `${booking.user.first_name} ${booking.user.last_name}`.toLowerCase();
    const matchesSearch =
      guestName.includes(searchTerm.toLowerCase()) ||
      booking.room.roomName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      booking.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-[calc(100vh-25px)] p-3 overflow-y-auto container mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Manage Bookings</h1>
      {error && <div className="mb-4 text-red-600">{error.message}</div>}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <input
          type="text"
          placeholder="Search by guest or room"
          value={searchTerm}
          onChange={handleSearchChange}
          className="p-2 ring-1 rounded w-full md:w-1/3"
        />
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="p-2 ring-1 rounded w-full md:w-1/3"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked_in">Checked In</option>
          <option value="checked_out">Checked Out</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {isLoading ? (
        <div>Loading bookings...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Booking ID</th>
                <th className="py-2 px-4 border-b">Guest</th>
                <th className="py-2 px-4 border-b">Room</th>
                <th className="py-2 px-4 border-b">Check-In</th>
                <th className="py-2 px-4 border-b">Check-Out</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-center">{booking.id}</td>
                    <td className="py-2 px-4 border-b">
                      {booking.user.first_name} {booking.user.last_name}
                      <div className="text-xs text-gray-500">{booking.user.email}</div>
                    </td>
                    <td className="py-2 px-4 border-b">{booking.room.roomName}</td>
                    <td className="py-2 px-4 border-b text-center">{booking.check_in_date}</td>
                    <td className="py-2 px-4 border-b text-center">{booking.check_out_date}</td>
                    <td className="py-2 px-4 border-b text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          booking.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "Checked In"
                            ? "bg-blue-100 text-blue-800"
                            : booking.status === "Checked Out"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {booking.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <button className="text-blue-500 hover:underline mr-2">View</button>
                      {booking.status === "Confirmed" && (
                        <button className="text-red-500 hover:underline">
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-gray-500">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
