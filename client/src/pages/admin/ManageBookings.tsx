import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Eye,
  FileEdit,
  Filter,
  Search,
  X
} from "lucide-react";
import { FC, useState } from "react";
import { toast } from "react-toastify";
import { updateBookingStatus } from "../../services/Admin";
import { BookingResponse, fetchBookings } from "../../services/Booking";
import { formatDate } from "../../utils/formatters";

const BookingStatusBadge: FC<{ status: string }> = ({ status }) => {
  let bgColor = "";
  const formattedStatus = status.toUpperCase();

  switch (status.toLowerCase()) {
    case "pending":
      bgColor = "bg-yellow-100 text-yellow-800";
      break;
    case "confirmed":
      bgColor = "bg-green-100 text-green-800";
      break;
    case "checked_in":
      bgColor = "bg-blue-100 text-blue-800";
      break;
    case "checked_out":
      bgColor = "bg-gray-100 text-gray-800";
      break;
    case "cancelled":
      bgColor = "bg-red-100 text-red-800";
      break;
    case "no_show":
      bgColor = "bg-purple-100 text-purple-800";
      break;
    default:
      bgColor = "bg-gray-100 text-gray-800";
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${bgColor}`}
    >
      {formattedStatus.replace("_", " ")}
    </span>
  );
};

// User Booking Details Modal
const BookingDetailsModal: FC<{
  booking: BookingResponse | null;
  onClose: () => void;
  onConfirm: () => void;
  onReject: () => void;
  canManage: boolean;
}> = ({ booking, onClose, onConfirm, onReject, canManage }) => {
  if (!booking) return null;

  const renderValidId = () => {
    if (!booking.valid_id) {
      console.log('No valid ID found');
      return (
        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No valid ID uploaded</p>
        </div>
      );
    }

    console.log('Rendering valid ID:', booking.valid_id);
    return (
      <div className="border rounded-md overflow-hidden">
        <img
          src={booking.valid_id}
          alt="Valid ID"
          loading="lazy"
          className="w-full h-auto"
          onError={(e) => {
            console.error('Error loading valid ID image:', booking.valid_id);
            e.currentTarget.src = 'https://via.placeholder.com/400x200?text=ID+Image+Not+Available';
          }}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center pb-2 border-b">
          User Booking Details
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-semibold">Fullname:</span>
            <span>{booking.user?.first_name} {booking.user?.last_name}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Email:</span>
            <span>{booking.user?.email}</span>
          </div>

          {booking.user?.address && (
            <div className="flex justify-between">
              <span className="font-semibold">Address:</span>
              <span>{booking.user?.address}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="font-semibold">Room/Area:</span>
            <span>{booking.room_details?.room_name}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Date of Reservation:</span>
            <span>{formatDate(booking.created_at)}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Check-in:</span>
            <span>{formatDate(booking.check_in_date)}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Check-out:</span>
            <span>{formatDate(booking.check_out_date)}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Status:</span>
            <BookingStatusBadge status={booking.status} />
          </div>

          {/* Valid ID Section */}
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Valid ID:</h3>
            {renderValidId()}
          </div>
        </div>

        {canManage && booking.status === "pending" && (
          <div className="flex justify-between mt-6">
            <button
              onClick={onReject}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <X size={18} />
              Reject Booking
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Check size={18} />
              Confirm Booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ManageBookings: FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);

  const { data: bookingsResponse, error, isLoading } = useQuery<{ data: BookingResponse[] }, Error>({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      try {
        const response = await fetchBookings();
        console.log('Admin bookings response:', response);

        // Check if any bookings have valid_id field
        if (response.data && response.data.length > 0) {
          response.data.forEach((booking, index) => {
            console.log(`Booking ${index} valid_id:`, booking.valid_id);
            console.log(`Booking ${index} user details:`, booking.user);
          });
        }

        return response;
      } catch (err) {
        console.error('Error fetching admin bookings:', err);
        throw err;
      }
    },
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number; status: string }) => {
      return await updateBookingStatus(bookingId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Booking status updated successfully");
      setSelectedBooking(null);
    },
    onError: (error) => {
      toast.error(`Failed to update booking: ${error}`);
    },
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleViewBooking = async (booking: BookingResponse) => {
    try {
      setSelectedBooking(booking);
    } catch (error) {
      toast.error("Failed to fetch booking details");
    }
  };

  const handleConfirmBooking = () => {
    if (selectedBooking) {
      updateBookingStatusMutation.mutate({
        bookingId: selectedBooking.id,
        status: "confirmed",
      });
    }
  };

  const handleRejectBooking = () => {
    if (selectedBooking) {
      updateBookingStatusMutation.mutate({
        bookingId: selectedBooking.id,
        status: "cancelled",
      });
    }
  };

  const closeModal = () => {
    setSelectedBooking(null);
  };

  const filteredBookings = (bookingsResponse?.data || []).filter((booking) => {
    const guestName = `${booking.user?.first_name || ''} ${booking.user?.last_name || ''}`.toLowerCase();
    const email = booking.user?.email?.toLowerCase() || '';
    const roomName = booking.room_details?.room_name?.toLowerCase() || '';

    const searchMatch = searchTerm === '' ||
      guestName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      roomName.includes(searchTerm.toLowerCase());

    const statusMatch =
      statusFilter === "all" ||
      booking.status?.toLowerCase() === statusFilter.toLowerCase();

    return searchMatch && statusMatch;
  });

  return (
    <div className="h-[calc(100vh-25px)] p-3 overflow-y-auto container mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Manage Bookings</h1>

      {error && <div className="mb-4 text-red-600">{error.message}</div>}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="relative w-full md:w-1/3">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search by Guest Name"
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 p-2.5 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="relative w-full md:w-1/3">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Filter size={18} className="text-gray-500" />
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="pl-10 p-2.5 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date of Reservation
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest Name
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room / Area
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-out
                </th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">
                      {formatDate(booking.created_at)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">
                      {`${booking.user?.first_name || ''} ${booking.user?.last_name || ''}`}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">
                      {booking.user?.email || ''}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">
                      {booking.room_details?.room_name || ''}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">
                      {formatDate(booking.check_in_date)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">
                      {formatDate(booking.check_out_date)}
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-700 whitespace-nowrap">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-700 whitespace-nowrap">
                      {booking.room_details?.room_price || ''}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewBooking(booking)}
                          className="p-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                          title="View Details"
                        >
                          <Eye size={25} />
                        </button>
                        <button
                          className="p-1.5 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
                          title="Edit Booking"
                        >
                          <FileEdit size={25} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-gray-500">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={closeModal}
          onConfirm={handleConfirmBooking}
          onReject={handleRejectBooking}
          canManage={true}
        />
      )}
    </div>
  );
};

export default ManageBookings;
