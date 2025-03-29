import { useQuery } from '@tanstack/react-query';
import { addMonths, eachDayOfInterval, endOfMonth, format, isBefore, isEqual, isWithinInterval, parseISO, startOfDay, startOfMonth } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fetchRoomBookings, fetchRoomById } from '../services/Booking';

interface AmenityObject {
    id: number;
    description: string;
}

interface RoomData {
    id: number;
    room_name: string;
    room_type: string;
    description: string;
    room_image: string;
    status: string;
    capacity: number;
    amenities: Array<AmenityObject | string>;
    price_per_night?: string;
    room_price?: string;
}

interface BookingData {
    id: number;
    check_in_date: string;
    check_out_date: string;
    status: string;
}

interface BookingsByDate {
    [date: string]: {
        status: string;
        bookingId: number;
    };
}

// Add a type guard function
function isAmenityObject(amenity: any): amenity is AmenityObject {
    return amenity && typeof amenity === 'object' && 'description' in amenity;
}

const BookingCalendar = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const [searchParams] = useSearchParams();
    const arrivalParam = searchParams.get("arrival");
    const departureParam = searchParams.get("departure");
    const navigate = useNavigate();

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [checkInDate, setCheckInDate] = useState<Date | null>(null);
    const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
    const [numberOfNights, setNumberOfNights] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);
    const [bookingsByDate, setBookingsByDate] = useState<BookingsByDate>({});

    useEffect(() => {
        if (arrivalParam && departureParam) {
            try {
                const arrival = parseISO(arrivalParam);
                const departure = parseISO(departureParam);
                setCheckInDate(arrival);
                setCheckOutDate(departure);
                setCurrentMonth(arrival);
            } catch (error) {
                console.error('Error parsing dates from URL:', error);
            }
        }
    }, [arrivalParam, departureParam]);

    // Fetch room data
    const { data: roomData, isLoading: isLoadingRoom } = useQuery<RoomData>({
        queryKey: ['room', roomId],
        queryFn: async () => {
            console.log(`Fetching room details for ID: ${roomId}`);
            try {
                const data = await fetchRoomById(roomId || '');
                console.log('Room data received:', data);
                return data;
            } catch (error) {
                console.error('Error fetching room:', error);
                throw error;
            }
        },
        enabled: !!roomId
    });

    // Fetch room bookings data
    const { data: bookingsData, isLoading: isLoadingBookings } = useQuery<{ data: BookingData[] }>({
        queryKey: ['roomBookings', roomId, currentMonth],
        queryFn: async () => {
            // Calculate a date range that covers two months
            const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const endDate = format(endOfMonth(addMonths(currentMonth, 1)), 'yyyy-MM-dd');
            return fetchRoomBookings(roomId || '', startDate, endDate);
        },
        enabled: !!roomId
    });

    // Process bookings data to map by date
    useEffect(() => {
        if (bookingsData?.data) {
            const newBookingsByDate: BookingsByDate = {};

            bookingsData.data.forEach(booking => {
                const checkInDate = parseISO(booking.check_in_date);
                const checkOutDate = parseISO(booking.check_out_date);

                // Mark all dates in the booking range
                const datesInRange = eachDayOfInterval({ start: checkInDate, end: checkOutDate });

                datesInRange.forEach(date => {
                    const dateString = format(date, 'yyyy-MM-dd');
                    newBookingsByDate[dateString] = {
                        status: booking.status,
                        bookingId: booking.id
                    };
                });
            });

            setBookingsByDate(newBookingsByDate);
        }
    }, [bookingsData]);

    useEffect(() => {
        if (checkInDate && checkOutDate && roomData) {
            const days = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
            setNumberOfNights(days);

            // Get price from either price_per_night or room_price field
            const priceString = roomData.price_per_night || roomData.room_price || '0';

            // Convert price string to a number, handling various formats
            let priceValue = 0;
            try {
                // Remove any non-numeric characters except decimal point
                const numericValue = priceString.toString().replace(/[^\d.]/g, '');
                priceValue = parseFloat(numericValue) || 0;
            } catch (error) {
                console.error('Error parsing room price:', error);
                priceValue = 0;
            }

            setTotalPrice(priceValue * days);
        }
    }, [checkInDate, checkOutDate, roomData]);

    const months = [currentMonth, addMonths(currentMonth, 1)];

    const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const isDateBooked = (date: Date): boolean => {
        const dateString = format(date, 'yyyy-MM-dd');
        const booking = bookingsByDate[dateString];

        // Check if this date is already booked with specific statuses
        if (booking && booking.status && ['checked_in', 'reserved', 'occupied', 'pending', 'no_show'].includes(booking.status.toLowerCase())) {
            return true;
        }

        // Dates with checked_out status are considered available
        return false;
    };

    const getDateStatus = (date: Date): string | null => {
        const dateString = format(date, 'yyyy-MM-dd');
        return bookingsByDate[dateString]?.status || null;
    };

    const isDateUnavailable = (date: Date) => {
        // Always consider dates before today as unavailable
        if (isBefore(date, startOfDay(new Date()))) {
            return true;
        }

        // Dates with specific booking statuses are unavailable
        return isDateBooked(date);
    };

    const handleDateClick = (date: Date) => {
        if (isDateUnavailable(date)) {
            return; // Do nothing for unavailable dates
        }

        if (!checkInDate || (checkInDate && checkOutDate)) {
            // Start new selection
            setCheckInDate(date);
            setCheckOutDate(null);
        } else {
            // Complete selection
            if (isBefore(date, checkInDate)) {
                // If user clicks a date before check-in, swap the dates
                setCheckOutDate(checkInDate);
                setCheckInDate(date);
            } else {
                setCheckOutDate(date);
            }
        }
    };

    const handleDateHover = (date: Date) => {
        if (!isDateUnavailable(date)) {
            setHoveredDate(date);
        }
    };

    const isDateInRange = (date: Date) => {
        if (checkInDate && checkOutDate) {
            return isWithinInterval(date, { start: checkInDate, end: checkOutDate });
        }
        if (checkInDate && hoveredDate && !checkOutDate) {
            // Handle the case when user is selecting the end date
            if (isBefore(hoveredDate, checkInDate)) {
                return isWithinInterval(date, { start: hoveredDate, end: checkInDate });
            } else {
                return isWithinInterval(date, { start: checkInDate, end: hoveredDate });
            }
        }
        return false;
    };

    const getDateCellClass = (date: Date) => {
        const isUnavailable = isDateUnavailable(date);
        const isToday = isEqual(date, startOfDay(new Date()));
        const isCheckinDate = checkInDate && isEqual(date, checkInDate);
        const isCheckoutDate = checkOutDate && isEqual(date, checkOutDate);
        const isInRange = !isUnavailable && isDateInRange(date);
        const isHovered = !isUnavailable && hoveredDate && isEqual(date, hoveredDate);
        const dateStatus = getDateStatus(date);

        let className = "relative h-10 w-10 flex items-center justify-center text-sm rounded-full";

        // First check date status and apply appropriate styling
        if (dateStatus) {
            switch (dateStatus.toLowerCase()) {
                case 'reserved':
                    className += " bg-green-100 text-green-800 border border-green-500";
                    break;
                case 'checked_in':
                case 'occupied':
                    className += " bg-blue-100 text-blue-800 border border-blue-500";
                    break;
                case 'checked_out':
                    // Make checked_out dates appear as normal available dates
                    if (isCheckinDate || isCheckoutDate) {
                        className += " bg-blue-600 text-white";
                    } else if (isInRange) {
                        className += " bg-blue-200 text-blue-800";
                    } else if (isHovered) {
                        className += " bg-blue-100 border border-blue-300";
                    } else {
                        className += " bg-white border border-gray-300 hover:bg-gray-100";
                    }
                    break;
                case 'no_show':
                    className += " bg-purple-100 text-purple-800 border border-purple-500";
                    break;
                case 'rejected':
                    className += " bg-red-100 text-red-800 border border-red-500";
                    break;
                default:
                    // Apply standard styles if status doesn't match any of the above
                    if (isCheckinDate || isCheckoutDate) {
                        className += " bg-blue-600 text-white";
                    } else if (isInRange) {
                        className += " bg-blue-200 text-blue-800";
                    } else if (isHovered) {
                        className += " bg-blue-100 border border-blue-300";
                    } else {
                        className += " bg-white border border-gray-300 hover:bg-gray-100";
                    }
            }
        } else {
            // No booking status - apply standard styles
            if (isUnavailable) {
                className += " bg-gray-300 text-gray-500 cursor-not-allowed";
            } else if (isCheckinDate || isCheckoutDate) {
                className += " bg-blue-600 text-white";
            } else if (isInRange) {
                className += " bg-blue-200 text-blue-800";
            } else if (isHovered) {
                className += " bg-blue-100 border border-blue-300";
            } else {
                className += " bg-white border border-gray-300 hover:bg-gray-100";
            }
        }

        // Add today indicator
        if (isToday && !isCheckinDate && !isCheckoutDate && !isUnavailable) {
            className += " border-blue-500 border-2";
        }

        // Add cursor style
        if (isUnavailable) {
            className += " cursor-not-allowed";
        } else {
            className += " cursor-pointer";
        }

        return className;
    };

    const handleProceed = () => {
        if (checkInDate && checkOutDate && numberOfNights > 0) {
            navigate(`/confirm-booking?roomId=${roomId}&arrival=${format(checkInDate, 'yyyy-MM-dd')}&departure=${format(checkOutDate, 'yyyy-MM-dd')}&totalPrice=${totalPrice}`);
        }
    };

    if (isLoadingRoom || isLoadingBookings) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <h2 className="text-4xl font-semibold mb-6 text-center">Book Your Room</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-2xl font-bold mb-4">Select Your Stay Dates</h3>

                        {/* Selected Dates */}
                        <div className="flex flex-col text-lg md:flex-row md:items-center md:justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <span className="text-gray-600">Check-in:</span>
                                <span className="ml-2 font-semibold">
                                    {checkInDate ? format(checkInDate, 'EEE, MMM dd, yyyy') : 'Select date'}
                                </span>
                            </div>
                            <div className="mt-2 md:mt-0">
                                <span className="text-gray-600">Check-out:</span>
                                <span className="ml-2 font-semibold">
                                    {checkOutDate ? format(checkOutDate, 'EEE, MMM dd, yyyy') : 'Select date'}
                                </span>
                            </div>
                            <div className="mt-2 md:mt-0">
                                <span className="text-gray-600">Nights:</span>
                                <span className="ml-2 font-semibold">
                                    {checkInDate && checkOutDate ? numberOfNights : 0}
                                </span>
                            </div>
                        </div>

                        {arrivalParam && departureParam ? (
                            // If we have dates from URL, focus on confirmation
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <p className="font-medium text-blue-800">
                                    Dates pre-selected: {checkInDate && checkOutDate
                                        ? `${format(checkInDate, 'MMMM dd')} to ${format(checkOutDate, 'MMMM dd, yyyy')} (${numberOfNights} nights)`
                                        : ''}
                                </p>
                                <p className="text-sm text-blue-600 mt-1">
                                    Please confirm your booking by clicking Proceed below.
                                </p>
                            </div>
                        ) : (
                            // Show calendar for date selection if no dates in URL
                            <>
                                {/* Calendar Controls */}
                                <div className="flex justify-between items-center mb-4">
                                    <button
                                        onClick={prevMonth}
                                        className="p-2 rounded-full hover:bg-gray-100"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div className="text-lg font-semibold">
                                        {format(currentMonth, 'MMMM yyyy')}
                                    </div>
                                    <button
                                        onClick={nextMonth}
                                        className="p-2 rounded-full hover:bg-gray-100"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    {months.map((month, monthIndex) => {
                                        const monthStart = startOfMonth(month);
                                        const monthEnd = endOfMonth(month);
                                        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

                                        // Get the weekday index of the first day (0 for Sunday, 1 for Monday, etc.)
                                        const startWeekday = monthStart.getDay();

                                        // Create an array of days including empty spots for proper alignment
                                        const calendarDays = [];

                                        // Add empty slots for days of the week before the first day of the month
                                        for (let i = 0; i < startWeekday; i++) {
                                            calendarDays.push(null);
                                        }

                                        // Add the actual days of the month
                                        calendarDays.push(...days);

                                        return (
                                            <div key={monthIndex}>
                                                <div className="text-center font-medium mb-2">
                                                    {format(month, 'MMMM yyyy')}
                                                </div>
                                                <div className="grid grid-cols-7 gap-1">
                                                    {/* Weekday headers */}
                                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                                        <div key={day} className="text-center text-xs text-gray-500 font-medium py-2">
                                                            {day}
                                                        </div>
                                                    ))}

                                                    {/* Calendar days */}
                                                    {calendarDays.map((day, i) => (
                                                        <div key={i} className="h-10 flex items-center justify-center">
                                                            {day ? (
                                                                <div
                                                                    className={getDateCellClass(day)}
                                                                    onClick={() => handleDateClick(day)}
                                                                    onMouseEnter={() => handleDateHover(day)}
                                                                    onMouseLeave={() => setHoveredDate(null)}
                                                                >
                                                                    {format(day, 'd')}
                                                                </div>
                                                            ) : (
                                                                <div></div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Calendar Legend */}
                                <div className="mt-6 border-t pt-4">
                                    <h4 className="text-sm font-medium mb-3">LEGEND</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4">
                                        <div className="flex items-center">
                                            <div className="h-6 w-6 bg-white border border-gray-300 mr-2 rounded-full"></div>
                                            <span className="text-sm">Available Date</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="h-6 w-6 bg-blue-600 mr-2 rounded-full"></div>
                                            <span className="text-sm">Selected Date</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="h-6 w-6 bg-blue-200 mr-2 rounded-full"></div>
                                            <span className="text-sm">Date Range</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="h-6 w-6 bg-gray-300 mr-2 rounded-full"></div>
                                            <span className="text-sm">Unavailable Date</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="h-6 w-6 bg-green-100 border border-green-500 mr-2 rounded-full"></div>
                                            <span className="text-sm">Reserved</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="h-6 w-6 bg-blue-100 border border-blue-500 mr-2 rounded-full"></div>
                                            <span className="text-sm">Occupied</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Proceed Button */}
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleProceed}
                                disabled={!checkInDate || !checkOutDate}
                                className={`px-6 py-2 rounded-md font-semibold ${checkInDate && checkOutDate
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Proceed to Booking
                            </button>
                        </div>
                    </div>
                </div>

                {/* Room Info Card - Right Side */}
                <div className="lg:col-span-1">
                    {roomData && (
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <div className="mb-4">
                                <img
                                    loading="lazy"
                                    src={roomData.room_image}
                                    alt={roomData.room_name}
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold">{roomData.room_name}</h3>
                            </div>
                            <p className="text-lg font-semibold text-blue-600 mb-3">
                                {roomData.price_per_night || roomData.room_price || '₱0'}
                            </p>

                            <div className="flex flex-col space-y-2 mb-4">
                                <div className="flex items-center text-gray-600">
                                    <span className="mr-2">🏠</span>
                                    <span>{roomData.room_type}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <span className="mr-2">👥</span>
                                    <span>Capacity: {roomData.capacity} guests</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-3 mb-3">
                                <h4 className="font-medium mb-2">Amenities</h4>
                                <div className="flex flex-wrap gap-2">
                                    {roomData.amenities && roomData.amenities.map((amenity, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                        >
                                            {isAmenityObject(amenity) ? amenity.description : String(amenity)}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {checkInDate && checkOutDate && (
                                <div className="border-t border-gray-200 pt-3 mt-3">
                                    <h4 className="font-medium mb-2">Your Booking</h4>
                                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                                        <div className="flex justify-between">
                                            <span>Check-in:</span>
                                            <span className="font-medium">{format(checkInDate, 'EEE, MMM dd, yyyy')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Check-out:</span>
                                            <span className="font-medium">{format(checkOutDate, 'EEE, MMM dd, yyyy')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Nights:</span>
                                            <span className="font-medium">{numberOfNights}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-semibold text-blue-600 pt-2 border-t border-gray-200">
                                            <span>Total Price:</span>
                                            <span>₱{totalPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingCalendar; 