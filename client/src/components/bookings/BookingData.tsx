import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import deluxe_double from "../../assets/deluxe_double.jpg";
import deluxe_single from "../../assets/deluxe_single.webp";
import deluxe_twin from "../../assets/deluxe_twin.jpg";
import executive_double from "../../assets/executive_double.avif";
import executive_king from "../../assets/executive_king.webp";
import president_king from "../../assets/president_king.jpg";
import { fetchBookingDetail, fetchUserBookings } from "../../services/Booking";
import BookingCard from "./BookingCard";

// Map room types to images
const roomImages: Record<string, string> = {
  "Deluxe Twin Room": deluxe_twin,
  "Deluxe Single Room": deluxe_single,
  "Deluxe Double Room": deluxe_double,
  "Executive King Room": executive_king,
  "Executive Double Room": executive_double,
  "Presidential King Suite": president_king,
};

interface BookingDataProps {
  bookingId?: string | null;
}

interface FormattedBooking {
  roomType: string;
  imageUrl: string;
  dates: string;
  guests: number;
  price: number;
  status: string;
  bookingId: string | number;
}

interface RoomData {
  id: string;
  room_name: string;
  room_image?: string;
  room_price: number;
  pax: number;
}

interface BookingData {
  id: string | number;
  check_in_date: string;
  check_out_date: string;
  status: string;
  room: RoomData;
}

const BookingData = ({ bookingId }: BookingDataProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Use prop if provided, otherwise check URL params (for backward compatibility)
  const effectiveBookingId = bookingId || searchParams.get('bookingId');
  const [bookingsToShow, setBookingsToShow] = useState<FormattedBooking[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch specific booking detail if bookingId is present
  const { data: bookingData, isLoading: isLoadingBooking } = useQuery<BookingData>({
    queryKey: ['booking', effectiveBookingId],
    queryFn: () => fetchBookingDetail(effectiveBookingId || ''),
    enabled: !!effectiveBookingId,
  });

  // Fetch all user bookings if no bookingId is provided
  const { data: userBookings, isLoading: isLoadingUserBookings } = useQuery<BookingData[]>({
    queryKey: ['user-bookings'],
    queryFn: fetchUserBookings,
    enabled: !effectiveBookingId,
  });

  // Handle successful booking cancellation
  // This will be triggered by the BookingCard component via query invalidation
  useEffect(() => {
    // Check if we have a specific booking and it was cancelled
    if (effectiveBookingId && bookingData && bookingData.status === 'cancelled') {
      // Redirect to my-booking page with cancelled=true flag
      navigate('/my-booking?cancelled=true', { replace: true });
    }
  }, [bookingData, effectiveBookingId, navigate]);

  // Process specific booking data
  useEffect(() => {
    if (effectiveBookingId && bookingData) {
      // Transform booking data to the format expected by BookingCard
      const roomType = bookingData.room?.room_name || "Unknown Room";
      const formattedBooking: FormattedBooking = {
        roomType: roomType,
        imageUrl: roomImages[roomType] || deluxe_twin, // Default to deluxe_twin if no match
        dates: `${new Date(bookingData.check_in_date).toLocaleDateString()} - ${new Date(bookingData.check_out_date).toLocaleDateString()}`,
        guests: bookingData.room?.pax || 2,
        price: bookingData.room?.room_price || 0,
        status: bookingData.status || "pending",
        bookingId: bookingData.id,
      };

      setBookingsToShow([formattedBooking]);
    }
  }, [effectiveBookingId, bookingData]);

  // Process all user bookings
  useEffect(() => {
    if (!effectiveBookingId && userBookings && userBookings.length > 0) {
      const formattedBookings = userBookings.map((booking) => {
        const roomType = booking.room?.room_name || "Unknown Room";
        return {
          roomType: roomType,
          imageUrl: roomImages[roomType] || deluxe_twin,
          dates: `${new Date(booking.check_in_date).toLocaleDateString()} - ${new Date(booking.check_out_date).toLocaleDateString()}`,
          guests: booking.room?.pax || 2,
          price: booking.room?.room_price || 0,
          status: booking.status || "pending",
          bookingId: booking.id,
        };
      });

      setBookingsToShow(formattedBookings);
    }
  }, [effectiveBookingId, userBookings]);

  const isLoading = isLoadingBooking || isLoadingUserBookings;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 flex justify-center items-center min-h-[300px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>Error loading booking: {error}</p>
      </div>
    );
  }

  if (bookingsToShow.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-lg shadow-md">
        {effectiveBookingId ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Not Found</h2>
            <p className="text-gray-600">The booking you're looking for could not be found. Please check the booking ID.</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Bookings Found</h2>
            <p className="text-gray-600">You don't have any bookings yet. Start exploring our rooms and book your stay!</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {bookingsToShow.map((booking, index) => (
        <BookingCard key={index} {...booking} />
      ))}
    </div>
  );
};

export default BookingData;
