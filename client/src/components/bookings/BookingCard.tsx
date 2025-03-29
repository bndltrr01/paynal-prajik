import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { cancelBooking } from "../../services/Booking";
import BookingDetailsModal from "./BookingDetailsModal";
import CancellationModal from "./CancellationModal";

interface BookingCardProps {
  roomType: string;
  imageUrl: string;
  dates: string;
  guests: number | string;
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

const BookingCard = ({
  roomType,
  imageUrl,
  dates,
  guests,
  price,
  status,
  bookingId,
  isVenueBooking,
  roomDetails,
  areaDetails,
  userDetails,
  specialRequest,
  validId,
  bookingDate,
  cancellationReason,
  cancellationDate,
  totalPrice,
}: BookingCardProps) => {
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const queryClient = useQueryClient();

  const normalizedStatus = status.toLowerCase();
  const isCancelled = normalizedStatus === "cancelled" || normalizedStatus === "canceled";

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => cancelBooking(bookingId.toString(), reason),
    onSuccess: () => {
      setShowCancellationModal(false);
      queryClient.invalidateQueries({ queryKey: ['booking'] });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
    },
  });

  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-500 text-white",
    reserved: "bg-green-500 text-white",
    booked: "bg-green-500 text-white",
    confirmed: "bg-green-500 text-white",
    checked_in: "bg-blue-500 text-white",
    checked_out: "bg-gray-500 text-white",
    cancelled: "bg-red-500 text-white",
    canceled: "bg-red-500 text-white",
    noshow: "bg-black text-white",
  };

  const styleClass = statusStyles[normalizedStatus] || statusStyles.pending;

  const canCancel = normalizedStatus === "pending" ||
    normalizedStatus === "confirmed" ||
    normalizedStatus === "booked" ||
    normalizedStatus === "reserved";

  const getDisplayStatus = () => {
    if (normalizedStatus === "booked") {
      return "CONFIRMED";
    }

    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleCancelClick = () => setShowCancellationModal(true);
  const handleConfirmCancel = (reason: string) => cancelMutation.mutate(reason);
  const toggleDetailsModal = () => setShowDetailsModal(!showDetailsModal);

  return (
    <div className="w-full max-w-7xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl mb-6">
      {/* Main booking info */}
      <div className="flex flex-col md:flex-row">
        {/* Image container */}
        <div className="w-full md:w-64 h-48 md:h-auto">
          <img
            src={isVenueBooking ? (areaDetails?.area_image || imageUrl) : (roomDetails?.room_image || imageUrl)}
            alt={roomType}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Booking info container */}
        <div className="flex-grow p-4 md:p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold">{roomType}</h2>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  {isVenueBooking ? (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Area Booking</span>
                  ) : (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Room Booking</span>
                  )}
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded ${styleClass} uppercase`}>
                    {getDisplayStatus()}
                  </span>
                </div>
              </div>

              {bookingDate && (
                <p className="text-sm text-gray-500">Booked on: {bookingDate}</p>
              )}
            </div>

            <p className="text-gray-600 flex items-center text-sm">
              <span className="mr-2">👥</span>{guests} {isVenueBooking ? 'capacity' : 'guests'}
            </p>

            <p className="text-blue-600 font-semibold">
              {isVenueBooking ? (
                <>
                  <span className="text-lg">TOTAL: {typeof totalPrice === 'number' ? totalPrice.toLocaleString() : (totalPrice || price.toLocaleString())}</span>
                  {areaDetails?.price_per_hour && <span className="text-xs text-gray-600 ml-2">({areaDetails.price_per_hour}/hour)</span>}
                </>
              ) : (
                <span className="text-lg">PRICE: {typeof price === 'number' ? price.toLocaleString() : price}</span>
              )}
            </p>

            {isCancelled && (
              <p className="text-red-600 flex items-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium">Booking Cancelled</span>
                {cancellationDate && <span className="ml-1">on {cancellationDate}</span>}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
            <div className="flex flex-wrap gap-2">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex-grow sm:flex-grow-0 cursor-pointer"
                onClick={toggleDetailsModal}
              >
                View Details
              </button>

              {canCancel && (
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex-grow sm:flex-grow-0 cursor-pointer"
                  onClick={handleCancelClick}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? 'Processing...' : 'Cancel Booking'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={showDetailsModal}
        onClose={toggleDetailsModal}
        roomType={roomType}
        status={status}
        styleClass={styleClass}
        getDisplayStatus={getDisplayStatus}
        dates={dates}
        userDetails={userDetails}
        isVenueBooking={isVenueBooking}
        areaDetails={areaDetails}
        totalPrice={totalPrice}
        price={price}
        isCancelled={isCancelled}
        cancellationDate={cancellationDate}
        cancellationReason={cancellationReason}
        specialRequest={specialRequest}
        validId={validId}
      />

      {/* Cancellation Modal */}
      <CancellationModal
        isOpen={showCancellationModal}
        onClose={() => setShowCancellationModal(false)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
};

export default BookingCard;
