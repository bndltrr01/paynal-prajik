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
  roomDetails?: {
    room_image?: string;
  };
}

const BookingCard = ({
  roomType,
  imageUrl,
  dates,
  guests,
  price,
  status,
  bookingId,
  roomDetails,
}: BookingCardProps) => {
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const queryClient = useQueryClient();

  // Normalize status to lowercase for consistency
  const normalizedStatus = status.toLowerCase();

  // Cancel booking mutation
  const cancelMutation = useMutation({
    mutationFn: (reason: string) => cancelBooking(bookingId.toString(), reason),
    onSuccess: () => {
      // Close modal
      setShowCancellationModal(false);

      // Invalidate queries to refresh data
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

  // Use normalized status for style lookup, with fallback
  const styleClass = statusStyles[normalizedStatus] || statusStyles.pending;

  // Check if booking can be canceled (only pending or confirmed bookings)
  const canCancel = normalizedStatus === "pending" ||
    normalizedStatus === "confirmed" ||
    normalizedStatus === "booked" ||
    normalizedStatus === "reserved";

  // Function to get display status with better formatting
  const getDisplayStatus = () => {
    if (normalizedStatus === "booked") {
      return "CONFIRMED";
    }

    // Convert underscores to spaces and capitalize first letter of each word
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Handle cancel click
  const handleCancelClick = () => {
    setShowCancellationModal(true);
  };

  // Handle cancel confirmation
  const handleConfirmCancel = (reason: string) => {
    cancelMutation.mutate(reason);
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-white shadow-md rounded-lg p-6 flex flex-col md:flex-row gap-6 mb-6">
      <div className="w-full md:w-56 h-36 flex items-center justify-center overflow-hidden rounded-lg bg-gray-200">
        <img
          src={roomDetails?.room_image || imageUrl}
          alt={roomType}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to default image if room image fails to load
            (e.target as HTMLImageElement).src = imageUrl;
          }}
        />
      </div>

      <div className="flex-grow flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold">{roomType}</h2>
          <p className="text-gray-600">{dates}</p>
          <p className="text-gray-600 flex items-center">
            <span className="mr-2">👥</span> Persons: {guests}
          </p>
          <p className="text-blue-600 font-semibold text-lg">
            PRICE: {price.toLocaleString()}
          </p>
        </div>

        <div className="flex items-end justify-between mt-4">
          <span
            className={`px-4 py-1 text-sm font-bold rounded-lg ${styleClass} min-w-[100px] text-center`}
          >
            {getDisplayStatus()}
          </span>

          <div className="flex gap-3 ml-auto">
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
