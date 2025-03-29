import { FC } from "react";

interface BookingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomType: string;
    status: string;
    styleClass: string;
    getDisplayStatus: () => string;
    dates: string;
    userDetails?: {
        fullName: string;
        email: string;
        phoneNumber?: string;
    };
    isVenueBooking?: boolean;
    areaDetails?: {
        capacity?: number;
        price_per_hour?: string;
    };
    totalPrice?: number;
    price: number;
    isCancelled: boolean;
    cancellationDate?: string;
    cancellationReason?: string;
    specialRequest?: string;
    validId?: string;
}

const BookingDetailsModal: FC<BookingDetailsModalProps> = ({
    isOpen,
    onClose,
    roomType,
    styleClass,
    getDisplayStatus,
    dates,
    userDetails,
    isVenueBooking,
    areaDetails,
    totalPrice,
    price,
    isCancelled,
    cancellationDate,
    cancellationReason,
    specialRequest,
    validId,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>

            {/* Modal container */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4 z-10">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-20">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                        {roomType} Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Guest Information */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-lg text-gray-800 border-b border-gray-200 pb-2 mb-3">Guest Information</h3>

                            {userDetails ? (
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:justify-between">
                                        <span className="font-medium text-gray-700">Name:</span>
                                        <span className="text-gray-800">{userDetails.fullName}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between">
                                        <span className="font-medium text-gray-700">Email:</span>
                                        <span className="text-gray-800 break-all">{userDetails.email}</span>
                                    </div>
                                    {userDetails.phoneNumber && (
                                        <div className="flex flex-col sm:flex-row sm:justify-between">
                                            <span className="font-medium text-gray-700">Phone:</span>
                                            <span className="text-gray-800">{userDetails.phoneNumber}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">Guest information not available</p>
                            )}
                        </div>

                        {/* Booking Details */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-lg text-gray-800 border-b border-gray-200 pb-2 mb-3">Booking Details</h3>

                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <span className="font-medium text-gray-700">Status:</span>
                                    <span className={`px-2.5 py-0.5 rounded text-sm ${styleClass}`}>{getDisplayStatus()}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <span className="font-medium text-gray-700">{isVenueBooking ? 'Start/End Time:' : 'Check-in/out:'}</span>
                                    <span className="text-gray-800">{dates}</span>
                                </div>
                                {isVenueBooking && areaDetails && (
                                    <>
                                        <div className="flex flex-col sm:flex-row sm:justify-between">
                                            <span className="font-medium text-gray-700">Capacity:</span>
                                            <span className="text-gray-800">{areaDetails.capacity} people</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between">
                                            <span className="font-medium text-gray-700">Price per hour:</span>
                                            <span className="text-gray-800">{areaDetails.price_per_hour}</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between">
                                            <span className="font-medium text-gray-700">Total Price:</span>
                                            <span className="text-gray-800 font-semibold">{typeof totalPrice === 'number' ? totalPrice.toLocaleString() : totalPrice || price.toLocaleString()}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Cancellation Information (if cancelled) */}
                        {isCancelled && (
                            <div className="md:col-span-2">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-red-500">
                                    <h3 className="font-semibold text-lg text-red-600 border-b border-gray-200 pb-2 mb-3">Cancellation Information</h3>

                                    <div className="space-y-3">
                                        {cancellationDate && (
                                            <div className="flex flex-col sm:flex-row sm:justify-between">
                                                <span className="font-medium text-gray-700">Cancelled on:</span>
                                                <span className="text-gray-800">{cancellationDate}</span>
                                            </div>
                                        )}
                                        {cancellationReason ? (
                                            <div>
                                                <p className="font-medium text-gray-700 mb-2">Cancellation Reason:</p>
                                                <p className="text-gray-800 bg-gray-50 p-3 rounded-md border border-gray-200">{cancellationReason}</p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-700">No cancellation reason provided.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Special Requests (if any) */}
                        {specialRequest && specialRequest.trim() !== '' && (
                            <div className="md:col-span-2">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <h3 className="font-semibold text-lg text-gray-800 border-b border-gray-200 pb-2 mb-3">Special Requests</h3>
                                    <p className="text-gray-800 bg-gray-50 p-3 rounded-md border border-gray-200">{specialRequest}</p>
                                </div>
                            </div>
                        )}

                        {/* Valid ID (if available) */}
                        {validId && (
                            <div className="md:col-span-2">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <h3 className="font-semibold text-lg text-gray-800 border-b border-gray-200 pb-2 mb-3">Valid ID</h3>
                                    <div className="bg-gray-100 rounded-md overflow-hidden flex justify-center">
                                        <img
                                            src={validId}
                                            alt="Valid ID"
                                            className="w-full max-w-md h-auto object-contain"
                                            loading="lazy"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailsModal; 