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
  roomDetails?: {
    room_image?: string;
  };
  userDetails?: {
    fullName: string;
    email: string;
    phoneNumber?: string;
  };
  specialRequest?: string;
  validId?: string;
  bookingDate?: string;
  cancellationReason?: string;
  cancellationDate?: string;
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
  user?: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
  };
  special_request?: string;
  valid_id?: string;
  created_at: string;
  cancellation_reason?: string;
  cancellation_date?: string;
}

const BookingData = ({ bookingId }: BookingDataProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookingsToShow, setBookingsToShow] = useState<FormattedBooking[]>([]);
  const effectiveBookingId = bookingId || searchParams.get('bookingId');

  const { data: bookingData, isLoading: isLoadingBooking, error: bookingError } = useQuery<BookingData>({
    queryKey: ['booking', effectiveBookingId],
    queryFn: () => fetchBookingDetail(effectiveBookingId || ''),
    enabled: !!effectiveBookingId,
  });

  const { data: userBookings, isLoading: isLoadingUserBookings, error: userBookingsError } = useQuery<BookingData[]>({
    queryKey: ['user-bookings'],
    queryFn: fetchUserBookings,
    enabled: !effectiveBookingId,
  });

  useEffect(() => {
    if (effectiveBookingId && bookingData && bookingData.status === 'cancelled') {
      navigate('/my-booking?cancelled=true', { replace: true });
    }
  }, [bookingData, effectiveBookingId, navigate]);

  useEffect(() => {
    if (effectiveBookingId && bookingData) {
      const roomType = bookingData.room?.room_name || "Unknown Room";
      const formattedBooking: FormattedBooking = {
        roomType: roomType,
        imageUrl: roomImages[roomType] || deluxe_twin,
        dates: `${new Date(bookingData.check_in_date).toLocaleDateString()} - ${new Date(bookingData.check_out_date).toLocaleDateString()}`,
        guests: bookingData.room?.pax || 2,
        price: bookingData.room?.room_price || 0,
        status: bookingData.status || "pending",
        bookingId: bookingData.id,
        roomDetails: bookingData.room,
        userDetails: bookingData.user ? {
          fullName: `${bookingData.user.first_name} ${bookingData.user.last_name}`,
          email: bookingData.user.email,
          phoneNumber: bookingData.user.phone_number
        } : undefined,
        specialRequest: bookingData.special_request,
        validId: bookingData.valid_id,
        bookingDate: bookingData.created_at ? new Date(bookingData.created_at).toLocaleDateString() : undefined,
        cancellationReason: bookingData.cancellation_reason,
        cancellationDate: bookingData.cancellation_date ? new Date(bookingData.cancellation_date).toLocaleDateString() : undefined
      };

      setBookingsToShow([formattedBooking]);
    }
  }, [effectiveBookingId, bookingData]);

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
          roomDetails: booking.room,
          userDetails: booking.user ? {
            fullName: `${booking.user.first_name} ${booking.user.last_name}`,
            email: booking.user.email,
            phoneNumber: booking.user.phone_number
          } : undefined,
          specialRequest: booking.special_request,
          validId: booking.valid_id,
          bookingDate: booking.created_at ? new Date(booking.created_at).toLocaleDateString() : undefined,
          cancellationReason: booking.cancellation_reason,
          cancellationDate: booking.cancellation_date ? new Date(booking.cancellation_date).toLocaleDateString() : undefined
        };
      });

      setBookingsToShow(formattedBookings);
    }
  }, [effectiveBookingId, userBookings]);

  const isLoading = isLoadingBooking || isLoadingUserBookings;
  const error = bookingError || userBookingsError;

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
        <p>Error loading booking: {error instanceof Error ? error.message : 'An error occurred'}</p>
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
