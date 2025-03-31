import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileEdit,
  Filter,
  Search,
  X
} from "lucide-react";
import { FC, useState } from "react";
import { toast } from "react-toastify";
import CancellationModal from "../../components/bookings/CancellationModal";
import Modal from "../../components/Modal";
import withSuspense from "../../hoc/withSuspense";
import EventLoader from "../../motions/loaders/EventLoader";
import { getAllBookings, recordPayment, updateBookingStatus } from "../../services/Admin";
import { BookingResponse } from "../../services/Booking";
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

const getBookingPrice = (booking: BookingResponse): number => {
  try {
    if (booking.total_price) {
      const totalPrice = typeof booking.total_price === 'string'
        ? parseFloat(booking.total_price.replace(/[^\d.]/g, ''))
        : booking.total_price;
      return totalPrice || 0;
    }

    let basePrice = 0;

    if (booking.is_venue_booking && booking.area_details) {
      if (booking.area_details.price_per_hour) {
        const priceString = booking.area_details.price_per_hour;
        basePrice = parseFloat(priceString.replace(/[^\d.]/g, '')) || 0;
      }
      return basePrice;
    } else if (!booking.is_venue_booking && booking.room_details) {
      const checkIn = booking.check_in_date;
      const checkOut = booking.check_out_date;
      let nights = 1;
      if (checkIn && checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        nights = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
      }

      if (booking.room_details.room_price) {
        const priceString = booking.room_details.room_price;
        basePrice = parseFloat(priceString.replace(/[^\d.]/g, '')) || 0;
      }

      return basePrice * nights;
    }

    return basePrice;
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
  onCheckIn?: (paymentAmount: number) => void;
  onCheckOut?: () => void;
  onNoShow?: () => void;
  canManage: boolean;
  isUpdating: boolean;
}> = ({ booking, onClose, onConfirm, onReject, onCheckIn, onCheckOut, onNoShow, canManage, isUpdating }) => {
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

        {isUpdating ? (
          <div className="py-12">
            <EventLoader text="Processing booking..." />
          </div>
        ) : (
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
                    } catch (error) {
                      console.error('Error calculating duration:', error);
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
        )}

        {!isUpdating && canManage && booking.status === "pending" && (
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

        {!isUpdating && canManage && booking.status === "reserved" && (
          <div className="flex flex-col sm:flex-row justify-between gap-2 mt-6">
            <button
              onClick={onNoShow}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center justify-center gap-2"
            >
              <X size={18} />
              Mark as No Show
            </button>
            <button
              onClick={() => onCheckIn && isPaymentComplete && onCheckIn(currentPayment)}
              className={`px-4 py-2 text-white rounded-md flex items-center justify-center gap-2 ${isPaymentComplete
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
                }`}
              disabled={!isPaymentComplete}
            >
              <Check size={18} />
              Check In Guest
            </button>
          </div>
        )}

        {!isUpdating && canManage && booking.status === "checked_in" && (
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
  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 9;

  const { data: bookingsResponse, error } = useQuery<{
    data: BookingResponse[],
    pagination?: {
      total_pages: number;
      current_page: number;
      total_items: number;
      page_size: number;
    }
  }, Error>({
    queryKey: ["admin-bookings", currentPage, pageSize],
    queryFn: async () => {
      try {
        const response = await getAllBookings({ page: currentPage, pageSize });
        return response;
      } catch (err) {
        console.error('Error fetching admin bookings:', err);
        throw err;
      }
    },
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({
      bookingId,
      status,
      reason,
      paymentAmount,
      setRoomAvailable = false
    }: {
      bookingId: number;
      status: string;
      reason?: string;
      paymentAmount?: number;
      setRoomAvailable?: boolean;
    }) => {
      // Simplify by sending just what the API expects
      const data: Record<string, any> = {
        status,
        set_available: setRoomAvailable
      };

      // Only add reason if it exists and is required
      if ((status === 'cancelled' || status === 'rejected') && reason) {
        data.reason = reason;
      }

      const result = await updateBookingStatus(bookingId, data);

      if (status === 'checked_in' && paymentAmount) {
        try {
          await recordPayment(bookingId, paymentAmount);
        } catch (error) {
          console.error('Failed to record payment:', error);
        }
      }

      return { result, status };
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });

      const { status } = variables;

      if (status === 'reserved') {
        toast.success("Booking has been reserved successfully! A confirmation email has been sent to the guest.");
      } else if (status === 'rejected') {
        toast.success("Booking has been rejected. The guest has been notified with your reason.");
      } else if (status === 'checked_in') {
        toast.success("Guest has been checked in successfully and payment recorded.");
      } else if (status === 'checked_out') {
        toast.success("Guest has been checked out successfully.");
      } else if (status === 'no_show') {
        toast.success("Booking has been marked as 'No Show' and the room/area has been made available again.");
      } else {
        toast.success(`Booking status updated to ${status.replace('_', ' ')}`);
      }

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
      console.error(`Error fetching booking details: ${error}`);
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

  const handleCheckIn = (paymentAmount?: number) => {
    if (selectedBooking) {
      updateBookingStatusMutation.mutate({
        bookingId: selectedBooking.id,
        status: "checked_in",
        paymentAmount
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
      setShowNoShowModal(true);
    }
  };

  const confirmNoShow = () => {
    if (selectedBooking) {
      try {
        updateBookingStatusMutation.mutate({
          bookingId: selectedBooking.id,
          status: "no_show",
          setRoomAvailable: true // This ensures the room/area will be made available
        });

        toast.info("Processing no-show status...");
        setShowNoShowModal(false);
      } catch (error) {
        console.error("Error marking booking as no-show:", error);
        toast.error("Failed to mark booking as no-show. Please try again.");
        setShowNoShowModal(false);
      }
    }
  };

  const closeNoShowModal = () => {
    setShowNoShowModal(false);
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const totalPages = bookingsResponse?.pagination?.total_pages || 1;
  const filteredBookings = (bookingsResponse?.data || []).filter((booking) => {
    const guestName = `${booking.user?.first_name || ''} ${booking.user?.last_name || ''}`.toLowerCase();
    const email = booking.user?.email?.toLowerCase() || '';

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
                    <td className="py-3 px-4 text-lg text-gray-700 whitespace-nowrap">
                      {formatDate(booking.created_at)}
                    </td>
                    <td className="py-3 px-4 text-lg text-gray-700 whitespace-nowrap">
                      {`${booking.user?.first_name || ''} ${booking.user?.last_name || ''}`}
                    </td>
                    <td className="py-3 px-4 text-lg text-gray-700 whitespace-nowrap">
                      {booking.user?.email || ''}
                    </td>
                    <td className="py-3 px-4 text-lg text-gray-700 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{propertyName}</span>
                        {isVenueBooking ? (
                          <span className="inline-block px-2 py-0.5 mt-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Venue</span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 mt-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Room</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-lg text-gray-700 whitespace-nowrap">
                      {formatDate(booking.check_in_date)}
                    </td>
                    <td className="py-3 px-4 text-lg text-gray-700 whitespace-nowrap">
                      {formatDate(booking.check_out_date)}
                    </td>
                    <td className="py-3 px-4 text-center text-lg text-gray-700 whitespace-nowrap">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                    <td className="py-3 px-4 text-center text-lg text-gray-700 whitespace-nowrap">
                      ₱ {getBookingPrice(booking).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-l-md border ${currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
            >
              <ChevronLeft size={20} />
            </button>

            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 border-t border-b ${currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-r-md border ${currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
            >
              <ChevronRight size={20} />
            </button>
          </nav>
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
          isUpdating={updateBookingStatusMutation.isPending}
        />
      )}

      {/* Use CancellationModal instead of RejectionReasonModal */}
      {showRejectionModal && (
        <CancellationModal
          isOpen={showRejectionModal}
          onClose={closeRejectionModal}
          onConfirm={handleRejectConfirm}
          bookingId={selectedBooking?.id}
          title="Reject Booking"
          description="Please provide a reason for rejecting this booking. This will be shared with the guest."
          reasonLabel="Reason for Rejection"
          reasonPlaceholder="Enter detailed reason for rejecting this booking..."
          confirmButtonText="Confirm Rejection"
          showPolicyNote={false}
        />
      )}

      {/* No Show Confirmation Modal */}
      <Modal
        isOpen={showNoShowModal}
        title="Mark as No Show"
        description={`Are you sure you want to mark this booking as 'No Show'? 
        This will immediately make the ${selectedBooking?.is_venue_booking ? 'venue' : 'room'} available for new bookings.
        This action cannot be undone.`}
        confirmText="Mark as No Show"
        cancelText="Cancel"
        onConfirm={confirmNoShow}
        cancel={closeNoShowModal}
        className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-bold transition-all duration-300 cursor-pointer"
      />
    </div>
  );
};

export default withSuspense(ManageBookings, { height: "500px" });
