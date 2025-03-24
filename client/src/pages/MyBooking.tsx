import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BookingData from "../components/bookings/BookingData";

const MyBooking = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [pageTitle, setPageTitle] = useState("My Bookings");

  const isSuccess = searchParams.get('success') === 'true';
  const isCancelled = searchParams.get('cancelled') === 'true';

  useEffect(() => {
    if (bookingId) {
      setPageTitle("Booking Details");
      window.scrollTo(0, 0);
    } else {
      setPageTitle("My Bookings");
    }
  }, [bookingId]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 mt-[104px]">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-center">{pageTitle}</h1>
          {bookingId && (
            <p className="text-center text-gray-600 mt-2">
              Booking ID: <span className="font-semibold">{bookingId}</span>
            </p>
          )}
        </div>

        {/* Success message when redirected from booking confirmation */}
        {bookingId && isSuccess && (
          <div className="mb-6 max-w-3xl mx-auto">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> Your booking has been confirmed. Details are shown below.</span>
            </div>
          </div>
        )}

        {/* Cancellation success message */}
        {isCancelled && (
          <div className="mb-6 max-w-3xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Booking Cancelled!</strong>
              <span className="block sm:inline"> Your booking has been successfully cancelled.</span>
            </div>
          </div>
        )}

        {/* Booking Data Component */}
        <div className="max-w-5xl mx-auto">
          <BookingData bookingId={bookingId} />
        </div>
      </div>
    </div>
  );
};

export default MyBooking;
