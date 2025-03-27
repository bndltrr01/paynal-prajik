import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { FC, useState } from "react";
import { useUserContext } from "../../contexts/AuthContext";
import LoadingHydrate from "../../motions/loaders/LoadingHydrate";
import Error from "../../pages/_ErrorBoundary";
import { getGuestBookings } from "../../services/Guest";
import { getGuestReservations } from "../../services/Reservation";

const GuestCancellations: FC = () => {
  const { userDetails } = useUserContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showType, setShowType] = useState<"all" | "bookings" | "reservations">("all");

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["guestBookings", userDetails?.id],
    queryFn: () => getGuestBookings(userDetails?.id as string),
    enabled: !!userDetails?.id,
  });

  const { data: reservations, isLoading: reservationsLoading } = useQuery({
    queryKey: ["guestReservations", userDetails?.id],
    queryFn: () => getGuestReservations(userDetails?.id as string),
    enabled: !!userDetails?.id,
  });

  if (bookingsLoading || reservationsLoading) return <LoadingHydrate />;
  if (!bookings || !reservations) return <Error />;

  // Filter cancelled bookings and reservations
  const cancelledBookings = (bookings?.data || []).filter(
    (booking: any) => booking.status.toLowerCase() === "cancelled"
  );

  const cancelledReservations = (reservations?.data || []).filter(
    (reservation: any) => reservation.status.toLowerCase() === "cancelled"
  );

  // Apply search filter
  const filteredBookings = cancelledBookings.filter((booking: any) =>
    booking.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.booking_reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReservations = cancelledReservations.filter((reservation: any) =>
    reservation.venue_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.reservation_reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Determine what to show based on filter
  const showBookings = showType === "all" || showType === "bookings";
  const showReservations = showType === "all" || showType === "reservations";

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Cancellations</h1>
        <p className="text-gray-600">View your cancelled bookings and reservations</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search by name or reference number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <div className="flex items-center">
          <label htmlFor="typeFilter" className="text-sm font-medium text-gray-700 mr-2">
            Show:
          </label>
          <select
            id="typeFilter"
            value={showType}
            onChange={(e) => setShowType(e.target.value as "all" | "bookings" | "reservations")}
            className="py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Cancellations</option>
            <option value="bookings">Room Bookings Only</option>
            <option value="reservations">Venue Reservations Only</option>
          </select>
        </div>
      </div>

      {/* Cancelled Bookings */}
      {showBookings && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Cancelled Room Bookings</h2>
          </div>
          <div className="p-6">
            {filteredBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Ref</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cancelled On</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking: any) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                          {booking.booking_reference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                loading="lazy"
                                src={booking.room_image || "https://placehold.co/100"}
                                alt={booking.room_name}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{booking.room_name}</div>
                              <div className="text-sm text-gray-500">{booking.room_type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${booking.total_amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(booking.cancelled_date || booking.updated_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.refund_status === 'processed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {booking.refund_status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No cancelled room bookings found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancelled Reservations */}
      {showReservations && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Cancelled Venue Reservations</h2>
          </div>
          <div className="p-6">
            {filteredReservations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservation Ref</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cancelled On</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReservations.map((reservation: any) => (
                      <tr key={reservation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                          {reservation.reservation_reference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                loading="lazy"
                                src={reservation.venue_image || "https://placehold.co/100"}
                                alt={reservation.venue_name}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{reservation.venue_name}</div>
                              <div className="text-sm text-gray-500">{reservation.venue_type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(reservation.reservation_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${reservation.total_amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(reservation.cancelled_date || reservation.updated_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${reservation.refund_status === 'processed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {reservation.refund_status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No cancelled venue reservations found.
              </div>
            )}
          </div>
        </div>
      )}

      {filteredBookings.length === 0 && filteredReservations.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-xl font-medium text-gray-700 mb-2">No Cancellations Found</div>
          <p className="text-gray-500">You don't have any cancelled bookings or reservations.</p>
        </div>
      )}
    </div>
  );
};

export default GuestCancellations;