import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cancelBooking } from '../services/Booking';

const CancelReservation = () => {
    const navigate = useNavigate();
    const [bookingId, setBookingId] = useState('');
    const [guestName, setGuestName] = useState('');
    const [email, setEmail] = useState('');
    const [reason, setReason] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Cancel booking mutation
    const cancelMutation = useMutation({
        mutationFn: (cancelData: { bookingId: string, reason: string }) =>
            cancelBooking(cancelData.bookingId, cancelData.reason),
        onSuccess: () => {
            // Redirect to my-booking page with cancelled flag
            navigate('/my-booking?cancelled=true');
        },
        onError: (error: any) => {
            setFormError(error?.message || 'Failed to cancel booking. Please try again.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Reset error
        setFormError(null);

        // Validate form
        if (!bookingId.trim()) {
            setFormError('Please enter your booking ID');
            return;
        }

        if (!guestName.trim()) {
            setFormError('Please enter your name');
            return;
        }

        if (!email.trim()) {
            setFormError('Please enter your email address');
            return;
        }

        if (!reason.trim()) {
            setFormError('Please provide a reason for cancellation');
            return;
        }

        if (!isConfirmed) {
            setFormError('Please confirm that you want to cancel your reservation');
            return;
        }

        // Submit the cancellation
        cancelMutation.mutate({ bookingId, reason });
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-md mt-[104px] bg-black/40">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-center mb-6">Cancel Reservation</h1>

                {formError && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        <p>{formError}</p>
                    </div>
                )}

                {cancelMutation.isSuccess ? (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                        <p className="font-bold">Your reservation has been cancelled successfully.</p>
                        <p className="mt-2">You will receive a confirmation email shortly.</p>
                        <button
                            onClick={() => navigate('/my-booking')}
                            className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            View My Bookings
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="bookingId" className="block text-sm font-medium text-gray-700 mb-1">
                                Booking ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="bookingId"
                                value={bookingId}
                                onChange={(e) => setBookingId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your booking ID"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
                                Guest Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="guestName"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your email address"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                                Reason for Cancellation <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Please explain why you're cancelling this reservation..."
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    id="confirmation"
                                    checked={isConfirmed}
                                    onChange={(e) => setIsConfirmed(e.target.checked)}
                                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    required
                                />
                                <label htmlFor="confirmation" className="ml-2 text-sm text-gray-700">
                                    I confirm that I want to cancel my reservation.
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={cancelMutation.isPending}
                            className={`w-full py-3 px-6 rounded-md text-white text-center font-semibold ${cancelMutation.isPending
                                    ? 'bg-red-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 transition-colors'
                                }`}
                        >
                            {cancelMutation.isPending ? 'Processing...' : 'Cancel Booking'}
                        </button>
                    </form>
                )}

                <p className="text-xs text-gray-500 mt-4 text-center">
                    Please note: Cancellations may be subject to a fee based on our policy.
                    View our <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a> for more information.
                </p>
            </div>
        </div>
    );
};

export default CancelReservation; 