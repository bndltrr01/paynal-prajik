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
    case "reserved":
      bgColor = "bg-green-100 text-green-800";
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
    case "rejected":
      bgColor = "bg-red-100 text-red-800";
      break;
    case "no_show":
      bgColor = "bg-purple-100 text-purple-800";
      break;
    default:
      bgColor = "bg-gray-100 text-gray-800";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bgColor}`}>
      {formattedStatus.replace("_", " ")}
    </span>
  );
};

// Rejection modal component
const RejectionReasonModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setIsSubmitting(true);
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 relative">
        <h2 className="text-xl font-bold mb-4">Reject Booking</h2>
        <p className="mb-4 text-gray-600">Please provide a reason for rejecting this booking:</p>

        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter rejection reason..."
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Extract the booking price and convert to number
const getBookingPrice = (booking: BookingResponse): number => {
  try {
    // First check if total_price is available and use it if present
    if (booking.total_price) {
      const totalPrice = typeof booking.total_price === 'string'
        ? parseFloat(booking.total_price.replace(/[^\d.]/g, ''))
        : booking.total_price;
      return totalPrice || 0;
    }

    // If no total_price, calculate based on duration and base price
    let basePrice = 0;
    let duration = 1;

    if (booking.is_venue_booking && booking.area_details) {
      // For venues - Calculate based on hours
      const checkIn = booking.check_in_date;
      const checkOut = booking.check_out_date;

      if (checkIn && checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        // For venues, we use hours as duration
        duration = Math.max(Math.ceil(diffTime / (1000 * 60 * 60)), 1);
      }

      // Get hourly rate from price_per_hour
      if (booking.area_details.price_per_hour) {
        const priceString = booking.area_details.price_per_hour;
        basePrice = parseFloat(priceString.replace(/[^\d.]/g, '')) || 0;
      }
    } else if (!booking.is_venue_booking && booking.room_details) {
      // For rooms - Calculate based on nights
      const checkIn = booking.check_in_date;
      const checkOut = booking.check_out_date;

      if (checkIn && checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        // For rooms, we use days as duration
        duration = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
      }

      // Get nightly rate from room_price
      if (booking.room_details.room_price) {
        const priceString = booking.room_details.room_price;
        basePrice = parseFloat(priceString.replace(/[^\d.]/g, '')) || 0;
      }
    }

    // Calculate total price based on duration and base price
    return basePrice * duration;
  } catch (error) {
    console.error('Error parsing booking price:', error);
    return 0;
  }
};

const BookingDetailsModal: FC<{
  booking: BookingResponse | null;
  onClose: () => void;
  onConfirm: () => void;
  onReject: () => void;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  onNoShow?: () => void;
  canManage: boolean;
}> = ({ booking, onClose, onConfirm, onReject, onCheckIn, onCheckOut, onNoShow, canManage }) => {
  const [paymentAmount, setPaymentAmount] = useState<string>("");

  if (!booking) return null;

  const isVenueBooking = booking.is_venue_booking;

  const renderValidId = () => {
    if (!booking.valid_id) {
      return (
        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No valid ID uploaded</p>
        </div>
      );
    }

    return (
      <div className="border rounded-md overflow-hidden">
        <img
          src={booking.valid_id}
          alt="Valid ID"
          loading="lazy"
          className="w-full h-auto"
        />
      </div>
    );
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentAmount(e.target.value);
  };

  const bookingPrice = getBookingPrice(booking);
  const currentPayment = parseFloat(paymentAmount) || 0;
  const isPaymentComplete = currentPayment === bookingPrice;
  const isReservedStatus = booking.status === "reserved";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto p-4 sm:p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center pb-2 border-b">
          User Booking Details
        </h2>

        <div className="space-y-3 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col sm:flex-row justify-between">
              <span className="font-semibold">Fullname:</span>
              <span className="sm:text-right">{booking.user?.first_name} {booking.user?.last_name}</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between">
              <span className="font-semibold">Email:</span>
              <span className="sm:text-right break-words">{booking.user?.email}</span>
            </div>

            {booking.user?.address && (
              <div className="flex flex-col sm:flex-row justify-between sm:col-span-2">
                <span className="font-semibold">Address:</span>
                <span className="sm:text-right">{booking.user?.address}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between">
              <span className="font-semibold">Property Type:</span>
              <span>
                {isVenueBooking ? (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Venue</span>
                ) : (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Room</span>
                )}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between">
              <span className="font-semibold">{isVenueBooking ? "Venue:" : "Room:"}</span>
              <span className="sm:text-right">{isVenueBooking
                ? (booking.area_details?.area_name || "Unknown Venue")
                : (booking.room_details?.room_name || "Unknown Room")}
              </span>
            </div>

            {isVenueBooking && booking.area_details?.capacity && (
              <div className="flex flex-col sm:flex-row justify-between">
                <span className="font-semibold">Capacity:</span>
                <span>{booking.area_details.capacity} people</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between">
              <span className="font-semibold">Date of Reservation:</span>
              <span>{formatDate(booking.created_at)}</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between">
              <span className="font-semibold">Check-in:</span>
              <span>{formatDate(booking.check_in_date)}</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between">
              <span className="font-semibold">Check-out:</span>
              <span>{formatDate(booking.check_out_date)}</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between">
              <span className="font-semibold">Price:</span>
              <span className="font-medium">
                {isVenueBooking
                  ? booking.area_details?.price_per_hour
                  : booking.room_details?.room_price}
                {isVenueBooking ? '/hour' : '/night'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between">
              <span className="font-semibold">Duration:</span>
              <span className="font-medium">
                {(() => {
                  try {
                    const checkIn = new Date(booking.check_in_date);
                    const checkOut = new Date(booking.check_out_date);
                    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());

                    if (isVenueBooking) {
                      // For venues, show hours
                      const hours = Math.max(Math.ceil(diffTime / (1000 * 60 * 60)), 1);
                      return `${hours} hour${hours !== 1 ? 's' : ''}`;
                    } else {
                      // For rooms, show nights
                      const nights = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
                      return `${nights} night${nights !== 1 ? 's' : ''}`;
                    }
                  } catch (e) {
                    return isVenueBooking ? '1 hour' : '1 night';
                  }
                })()}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between">
              <span className="font-semibold">Total Amount:</span>
              <span className="font-medium">
                ₱{bookingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between">
              <span className="font-semibold">Status:</span>
              <BookingStatusBadge status={booking.status} />
            </div>
          </div>

          {/* Payment Input Field - Only show for reserved status */}
          {isReservedStatus && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Payment Details</h3>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">₱</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentAmount}
                    onChange={handlePaymentChange}
                    placeholder={`Enter amount (${bookingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
                    className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-2 text-sm">
                {currentPayment > 0 && (
                  <p className={isPaymentComplete ? "text-green-600" : "text-red-600"}>
                    {isPaymentComplete
                      ? "✓ Payment amount matches the required total."
                      : `Payment must be exactly ₱${bookingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to check in the guest.`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Valid ID Section */}
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Valid ID:</h3>
            {renderValidId()}
          </div>
        </div>

        {canManage && booking.status === "pending" && (
          <div className="flex flex-col sm:flex-row justify-between gap-2 mt-6">
            <button
              onClick={onReject}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <X size={18} />
              Reject Booking
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Reserve Booking
            </button>
          </div>
        )}

        {canManage && booking.status === "reserved" && (
          <div className="flex flex-col sm:flex-row justify-between gap-2 mt-6">
            <button
              onClick={onNoShow}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <X size={18} />
              No Show
            </button>
            <button
              onClick={onCheckIn}
              disabled={!isPaymentComplete}
              className={`px-4 py-2 rounded-md text-white flex items-center justify-center gap-2 transition-colors ${isPaymentComplete
                ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
              <Check size={18} />
              Check In Guest
            </button>
          </div>
        )}

        {canManage && booking.status === "checked_in" && (
          <div className="flex justify-center mt-6">
            <button
              onClick={onCheckOut}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Check Out Guest
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
  const [showRejectionModal, setShowRejectionModal] = useState(false);

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
            console.log(`Booking ${index} is venue booking:`, booking.is_venue_booking);
            if (booking.is_venue_booking) {
              console.log(`Booking ${index} area details:`, booking.area_details);
              console.log(`Booking ${index} total price:`, booking.total_price);
            }
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
    mutationFn: async ({ bookingId, status, reason }: { bookingId: number; status: string; reason?: string }) => {
      return await updateBookingStatus(bookingId, status, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Booking status updated successfully");
      setSelectedBooking(null);
      setShowRejectionModal(false);
    },
    onError: (error) => {
      toast.error(`Failed to update booking: ${error}`);
      setShowRejectionModal(false);
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
        status: "reserved",
      });
    }
  };

  const handleCheckIn = () => {
    if (selectedBooking) {
      updateBookingStatusMutation.mutate({
        bookingId: selectedBooking.id,
        status: "checked_in",
      });
    }
  };

  const handleCheckOut = () => {
    if (selectedBooking) {
      updateBookingStatusMutation.mutate({
        bookingId: selectedBooking.id,
        status: "checked_out",
      });
    }
  };

  const handleNoShow = () => {
    if (selectedBooking) {
      updateBookingStatusMutation.mutate({
        bookingId: selectedBooking.id,
        status: "no_show",
      });
    }
  };

  const handleRejectInitiate = () => {
    setShowRejectionModal(true);
  };

  const handleRejectConfirm = (reason: string) => {
    if (selectedBooking) {
      updateBookingStatusMutation.mutate({
        bookingId: selectedBooking.id,
        status: "rejected",
        reason: reason
      });
    }
  };

  const closeModal = () => {
    setSelectedBooking(null);
  };

  const closeRejectionModal = () => {
    setShowRejectionModal(false);
  };

  const filteredBookings = (bookingsResponse?.data || []).filter((booking) => {
    const guestName = `${booking.user?.first_name || ''} ${booking.user?.last_name || ''}`.toLowerCase();
    const email = booking.user?.email?.toLowerCase() || '';

    // Get property name based on if it's a venue booking or room booking
    const propertyName = booking.is_venue_booking
      ? booking.area_details?.area_name?.toLowerCase() || ''
      : booking.room_details?.room_name?.toLowerCase() || '';

    const searchMatch = searchTerm === '' ||
      guestName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      propertyName.includes(searchTerm.toLowerCase());

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
            <option value="reserved">Reserved</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
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
                  Property
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
                  Total Amount
                </th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => {
                  const isVenueBooking = booking.is_venue_booking;
                  const propertyName = isVenueBooking
                    ? booking.area_details?.area_name || "Unknown Venue"
                    : booking.room_details?.room_name || "Unknown Room";

                  return (
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
                        <div className="flex flex-col">
                          <span>{propertyName}</span>
                          {isVenueBooking ? (
                            <span className="inline-block px-2 py-0.5 mt-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Venue</span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 mt-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Room</span>
                          )}
                        </div>
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
                        ₱{getBookingPrice(booking).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                          {booking.status !== "reserved" && booking.status !== "checked_in" && booking.status !== "checked_out" && (
                            <button
                              className="p-1.5 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
                              title="Edit Booking"
                            >
                              <FileEdit size={25} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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
          onReject={handleRejectInitiate}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onNoShow={handleNoShow}
          canManage={true}
        />
      )}

      {/* Rejection Reason Modal */}
      {showRejectionModal && (
        <RejectionReasonModal
          isOpen={showRejectionModal}
          onClose={closeRejectionModal}
          onConfirm={handleRejectConfirm}
        />
      )}
    </div>
  );
};

export default ManageBookings;
