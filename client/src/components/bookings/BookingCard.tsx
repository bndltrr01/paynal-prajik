import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { cancelBooking } from "../../services/Booking";
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
  const [showDetails, setShowDetails] = useState(false);
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

  const toggleDetails = () => setShowDetails(!showDetails);

  return (
    <div className="w-full max-w-7xl mx-auto bg-white shadow-md rounded-lg p-6 flex flex-col gap-6 mb-6">
      {/* Main booking info */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-60 h-auto flex items-center justify-center overflow-hidden rounded-lg bg-gray-200">
          <img
            src={isVenueBooking ? (areaDetails?.area_image || imageUrl) : (roomDetails?.room_image || imageUrl)}
            alt={roomType}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold">{roomType}</h2>
                {isVenueBooking ? (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Venue Booking</span>
                ) : (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Room Booking</span>
                )}
              </div>
              {bookingDate && (
                <p className="text-md text-gray-500">Booked on: {bookingDate}</p>
              )}
            </div>
            <p className="text-gray-600 flex items-center my-2">
              <span className="mr-2">👥</span>{guests} {isVenueBooking ? 'capacity' : 'guests'}
            </p>
            <p className="text-blue-600 font-semibold text-lg">
              {isVenueBooking ? (
                <>
                  TOTAL: {typeof totalPrice === 'number' ? totalPrice.toLocaleString() : (totalPrice || price.toLocaleString())}
                  {areaDetails?.price_per_hour && <span className="text-sm text-gray-600 ml-2">({areaDetails.price_per_hour}/hour)</span>}
                </>
              ) : (
                <>PRICE: {typeof price === 'number' ? price.toLocaleString() : price}</>
              )}
            </p>

            {isCancelled && (
              <p className="text-red-600 mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium">Booking Cancelled</span>
                {cancellationDate && <span className="ml-1">on {cancellationDate}</span>}
              </p>
            )}
          </div>

          <div className="flex items-end justify-between mt-4">
            <span
              className={`px-4 py-2 text-sm font-bold rounded-lg ${styleClass} min-w-[100px] text-center uppercase`}
            >
              {getDisplayStatus()}
            </span>

            <div className="flex gap-3 ml-auto">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                onClick={toggleDetails}
              >
                {showDetails ? 'Hide Details' : 'View Details'}
              </button>

              {canCancel && (
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
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

      {/* Expanded details section */}
      {showDetails && (
        <div className="border-t pt-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guest Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-2xl border-b pb-2">Guest Information</h3>

              {userDetails ? (
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{userDetails.fullName}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{userDetails.email}</span>
                  </p>
                  {userDetails.phoneNumber && (
                    <p className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span>{userDetails.phoneNumber}</span>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Guest information not available</p>
              )}
            </div>

            {/* Additional Booking Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-2xl border-b pb-2">Booking Details</h3>

              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-0.5 rounded text-sm ${styleClass}`}>{getDisplayStatus()}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">{isVenueBooking ? 'Start/End Time:' : 'Check-in/out:'}</span>
                  <span>{dates}</span>
                </p>
                {isVenueBooking && areaDetails && (
                  <>
                    <p className="flex justify-between">
                      <span className="font-medium">Capacity:</span>
                      <span>{areaDetails.capacity} people</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium">Price per hour:</span>
                      <span>{areaDetails.price_per_hour}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium">Total Price:</span>
                      <span>{typeof totalPrice === 'number' ? totalPrice.toLocaleString() : totalPrice || price.toLocaleString()}</span>
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Cancellation Information (if cancelled) */}
            {isCancelled && (
              <div className="md:col-span-2 space-y-2">
                <h3 className="font-semibold text-lg border-b pb-2 text-red-600">Cancellation Information</h3>
                <div className="bg-red-50 p-4 rounded-md">
                  {cancellationDate && (
                    <p className="flex justify-between mb-2">
                      <span className="font-medium">Cancelled on:</span>
                      <span>{cancellationDate}</span>
                    </p>
                  )}
                  {cancellationReason ? (
                    <div>
                      <p className="font-medium mb-1">Cancellation Reason:</p>
                      <p className="text-gray-700 bg-white p-3 rounded-md border border-red-100">{cancellationReason}</p>
                    </div>
                  ) : (
                    <p className="text-gray-700">No cancellation reason provided.</p>
                  )}
                </div>
              </div>
            )}

            {/* Special Requests (if any) */}
            {specialRequest && specialRequest.trim() !== '' && (
              <div className="md:col-span-2 space-y-2">
                <h3 className="font-semibold text-2xl border-b pb-2">Special Requests</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{specialRequest}</p>
              </div>
            )}

            {/* Valid ID (if available) */}
            {validId && (
              <div className="md:col-span-2 space-y-2">
                <h3 className="font-semibold text-2xl border-b pb-2">Valid ID</h3>
                <div className="rounded-md overflow-hidden">
                  <img
                    src={validId}
                    alt="Valid ID"
                    className="w-full h-auto max-h-64 object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      <CancellationModal
        isOpen={showCancellationModal}
        onClose={() => setShowCancellationModal(false)}
        onConfirm={handleConfirmCancel}
        bookingId={bookingId}
      />
    </div>
  );
};

export default BookingCard;
