import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import deluxe_twin from "../../assets/deluxe_twin.jpg";
import withSuspense from "../../hoc/withSuspense";
import { fetchBookingDetail } from "../../services/Booking";
import BookingCard from "./BookingCard";

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
  isVenueBooking?: boolean;
  roomDetails?: {
    room_image?: string;
  };
  areaDetails?: {
    area_image?: string;
    area_name?: string;
    price_per_hour?: string;
    capacity?: number;
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
  totalPrice?: number;
}

interface RoomData {
  id: string;
  room_name: string;
  room_image?: string;
  room_price: number;
  pax: number;
}

interface AreaData {
  id: string;
  area_name: string;
  area_image?: string;
  price_per_hour: string;
  capacity: number;
}

interface BookingData {
  id: string | number;
  check_in_date: string;
  check_out_date: string;
  status: string;
  room?: RoomData;
  area?: AreaData;
  room_details?: RoomData;
  area_details?: AreaData;
  is_venue_booking?: boolean;
  total_price?: number;
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

// Memoize utility functions
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';

  try {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (e) {
    return dateString;
  }
};

const BookingData = memo(({ bookingId }: BookingDataProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const effectiveBookingId = bookingId || searchParams.get('bookingId');

  // Setup query with proper caching
  const { data: bookingData, isLoading, error } = useQuery<BookingData>({
    queryKey: ['booking', effectiveBookingId],
    queryFn: () => fetchBookingDetail(effectiveBookingId || ''),
    enabled: !!effectiveBookingId,
  });

  const formattedBooking = useMemo(() => {
    if (!effectiveBookingId || !bookingData) return null;

    if (bookingData?.status === 'cancelled') {
      navigate('/my-booking?cancelled=true', { replace: true });
    }

    const isVenueBooking = bookingData?.is_venue_booking || false;
    const result: FormattedBooking = {
      bookingId: bookingData?.id || '',
      status: bookingData?.status || "pending",
      dates: `${formatDate(bookingData?.check_in_date || '').split(',')[0]} - ${formatDate(bookingData?.check_out_date || '').split(',')[0]}`,
      specialRequest: bookingData?.special_request,
      validId: bookingData?.valid_id,
      bookingDate: bookingData?.created_at ? formatDate(bookingData.created_at) : undefined,
      cancellationReason: bookingData?.cancellation_reason,
      cancellationDate: bookingData?.cancellation_date ? formatDate(bookingData.cancellation_date) : undefined,
      isVenueBooking: isVenueBooking,
      roomType: "",
      imageUrl: "",
      guests: 0,
      price: 0
    };

    if (bookingData?.user) {
      result.userDetails = {
        fullName: `${bookingData.user.first_name} ${bookingData.user.last_name}`,
        email: bookingData.user.email,
        phoneNumber: bookingData.user.phone_number
      };
    }

    if (isVenueBooking) {
      const areaData = bookingData?.area_details || bookingData?.area;
      if (areaData) {
        result.roomType = areaData.area_name || "Venue";
        result.imageUrl = areaData.area_image || "";
        result.guests = areaData.capacity || 0;
        result.price = bookingData?.total_price || 0;
        result.totalPrice = bookingData?.total_price;
        result.areaDetails = {
          area_image: areaData.area_image,
          area_name: areaData.area_name,
          price_per_hour: areaData.price_per_hour,
          capacity: areaData.capacity
        };
      }
    } else {
      const roomData = bookingData?.room_details || bookingData?.room;
      if (roomData) {
        const roomType = roomData.room_name || "Unknown Room";
        result.roomType = roomType;
        // Use image from database first, only fall back to static images if necessary
        result.imageUrl = roomData.room_image || deluxe_twin;
        result.guests = roomData.pax || 2;
        result.price = roomData.room_price || 0;
        result.roomDetails = roomData;
      }
    }

    return result;
  }, [effectiveBookingId, bookingData, navigate]);

  // Memoize loading component
  const renderLoading = useCallback(() => (
    <motion.div
      className="p-6 space-y-6 flex justify-center items-center min-h-[300px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
      </div>
    </motion.div>
  ), []);

  // Memoize error component
  const renderError = useCallback(() => (
    <motion.div
      className="p-6 text-center text-red-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <p>Error loading booking: {error instanceof Error ? error.message : 'An error occurred'}</p>
    </motion.div>
  ), [error]);

  // Memoize empty results component
  const renderEmpty = useCallback(() => (
    <motion.div
      className="text-center p-10 bg-white rounded-lg shadow-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
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
    </motion.div>
  ), [effectiveBookingId]);

  if (isLoading) return renderLoading();
  if (error) return renderError();
  if (!formattedBooking) return renderEmpty();

  return (
    <AnimatePresence>
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="w-full">
          <BookingCard {...formattedBooking} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

BookingData.displayName = "BookingData";

export default withSuspense(BookingData);