import { useQuery } from '@tanstack/react-query';
import { addMonths, eachDayOfInterval, endOfMonth, format, isBefore, isSameDay, parseISO, startOfDay, startOfMonth } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fetchAreaBookings, fetchAreaById } from '../services/Booking';

interface AreaData {
    id: number;
    area_name: string;
    description: string;
    area_image: string;
    status: string;
    capacity: number;
    price_per_hour: string; // Still named price_per_hour for API compatibility
}

interface BookingData {
    id: number;
    check_in_date: string;
    check_out_date: string;
    status: string;
    start_time: string | null;
    end_time: string | null;
}

interface UnavailableTime {
    start_time: string;
    end_time: string;
    status: string;
}

interface BookingsByDate {
    [date: string]: {
        status: string;
        bookingId: number;
        unavailableTimes: UnavailableTime[];
    };
}

const VenueBookingCalendar = () => {
    const { areaId } = useParams<{ areaId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const arrivalParam = searchParams.get("arrival");

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [bookingsByDate, setBookingsByDate] = useState<BookingsByDate>({});
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
    const [price, setPrice] = useState<number>(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (arrivalParam) {
            try {
                const parsedDate = parseISO(arrivalParam);
                setSelectedDate(parsedDate);
                setCurrentMonth(parsedDate);
            } catch (error) {
                console.error('Error parsing arrival date from URL:', error);
            }
        }
    }, [arrivalParam]);

    // Fetch area data
    const { data: areaData, isLoading: isLoadingArea } = useQuery<AreaData>({
        queryKey: ['area', areaId],
        queryFn: async () => {
            console.log(`Fetching area details for ID: ${areaId}`);
            try {
                const data = await fetchAreaById(areaId || '');
                console.log('Area data received:', data);
                return data;
            } catch (error) {
                console.error('Error fetching area:', error);
                throw error;
            }
        },
        enabled: !!areaId
    });

    // Fetch area bookings data
    const { data: bookingsData, isLoading: isLoadingBookings } = useQuery<{ data: BookingData[] }>({
        queryKey: ['areaBookings', areaId, currentMonth],
        queryFn: async () => {
            // Calculate a date range that covers two months
            const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const endDate = format(endOfMonth(addMonths(currentMonth, 1)), 'yyyy-MM-dd');
            return fetchAreaBookings(areaId || '', startDate, endDate);
        },
        enabled: !!areaId
    });

    // Process bookings data to map by date
    useEffect(() => {
        if (bookingsData?.data) {
            const newBookingsByDate: BookingsByDate = {};

            bookingsData.data.forEach(booking => {
                const dateString = format(parseISO(booking.check_in_date), 'yyyy-MM-dd');

                // Initialize the date if it doesn't exist
                if (!newBookingsByDate[dateString]) {
                    newBookingsByDate[dateString] = {
                        status: booking.status,
                        bookingId: booking.id,
                        unavailableTimes: []
                    };
                }

                // Add time slot info if available
                if (booking.start_time && booking.end_time) {
                    newBookingsByDate[dateString].unavailableTimes.push({
                        start_time: booking.start_time,
                        end_time: booking.end_time,
                        status: booking.status
                    });
                }
            });

            setBookingsByDate(newBookingsByDate);
        }
    }, [bookingsData]);

    useEffect(() => {
        if (areaData) {
            try {
                // Parse price from price_per_hour (using it as is)
                const priceString = areaData.price_per_hour || '0';
                const numericValue = priceString.toString().replace(/[^\d.]/g, '');
                const venuePrice = parseFloat(numericValue) || 0;

                // Set the price as is, without multiplication by 24
                setPrice(venuePrice);
            } catch (error) {
                console.error('Error parsing area price:', error);
                setPrice(0);
            }
        }
    }, [areaData]);

    const months = [currentMonth, addMonths(currentMonth, 1)];

    const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const isDateBooked = (date: Date): boolean => {
        const dateString = format(date, 'yyyy-MM-dd');
        const booking = bookingsByDate[dateString];

        // Check if the date has any booking status
        if (booking && booking.status && ['checked_in', 'reserved', 'occupied'].includes(booking.status.toLowerCase())) {
            return true;
        }

        return false;
    };

    const getDateStatus = (date: Date): string | null => {
        const dateString = format(date, 'yyyy-MM-dd');
        return bookingsByDate[dateString]?.status || null;
    };

    const isDateUnavailable = (date: Date) => {
        // Only consider dates before today as unavailable
        if (isBefore(date, startOfDay(new Date()))) {
            return true;
        }

        // Days with any booking status are also unavailable
        return isDateBooked(date);
    };

    const handleDateClick = (date: Date) => {
        if (isDateUnavailable(date)) {
            return;
        }
        setSelectedDate(date);
        setErrorMessage(null);
    };

    const handleDateHover = (date: Date) => {
        if (!isDateUnavailable(date)) {
            setHoveredDate(date);
        }
    };

    const getDateCellClass = (date: Date) => {
        const isUnavailable = isDateUnavailable(date);
        const isSelected = selectedDate && isSameDay(date, selectedDate);
        const isHovered = hoveredDate && isSameDay(date, hoveredDate);
        const isToday = isSameDay(date, new Date());
        const dateStatus = getDateStatus(date);

        let className = "relative h-10 w-10 flex items-center justify-center text-sm rounded-full";

        // First check date status and apply appropriate styling
        if (dateStatus) {
            switch (dateStatus.toLowerCase()) {
                case 'reserved':
                    className += " bg-green-100 text-green-800 border border-green-500";
                    break;
                case 'checked_in':
                    className += " bg-blue-100 text-blue-800 border border-blue-500";
                    break;
                case 'occupied':
                    className += " bg-blue-100 text-blue-800 border border-blue-500";
                    break;
                case 'checked_out':
                    className += " bg-gray-100 text-gray-800 border border-gray-500";
                    break;
                case 'rejected':
                    className += " bg-red-100 text-red-800 border border-red-500";
                    break;
                case 'missed_reservation':
                    className += " bg-orange-100 text-orange-800 border border-orange-500";
                    break;
                default:
                    // Apply standard styles if status doesn't match any of the above
                    if (isSelected) {
                        className += " bg-blue-600 text-white";
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
            } else if (isSelected) {
                className += " bg-blue-600 text-white";
            } else if (isHovered) {
                className += " bg-blue-100 border border-blue-300";
            } else {
                className += " bg-white border border-gray-300 hover:bg-gray-100";
            }
        }

        // Add today indicator
        if (isToday && !isSelected && !isUnavailable) {
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

    const getDateContent = (date: Date) => {
        return (
            <>
                {format(date, 'd')}
            </>
        );
    };

    const handleProceed = () => {
        if (selectedDate) {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');

            // Create full day booking (8:00 AM to 5:00 PM)
            const startTime = `${dateStr}T08:00:00`;
            const endTime = `${dateStr}T17:00:00`;

            navigate(`/confirm-venue-booking?areaId=${areaId}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}&totalPrice=${price}`);
        }
    };

    if (isLoadingArea || isLoadingBookings) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <h2 className="text-4xl font-semibold mb-6 text-center">Book Your Venue</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-2xl font-bold mb-4">Select Your Booking Date</h3>

                        {/* Selected Date */}
                        <div className="flex flex-col text-lg md:flex-row md:items-center md:justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <span className="text-gray-600">Selected Date:</span>
                                <span className="ml-2 font-semibold">
                                    {selectedDate ? format(selectedDate, 'EEE, MMM dd, yyyy') : 'Select a date'}
                                </span>
                            </div>
                            <div className="mt-2 md:mt-0">
                                <span className="text-gray-600">Duration:</span>
                                <span className="ml-2 font-semibold">Full Day (8AM - 5PM)</span>
                            </div>
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                                <p>{errorMessage}</p>
                            </div>
                        )}

                        {arrivalParam ? (
                            // If we have arrival date from URL, focus on confirmation
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <p className="font-medium text-blue-800">
                                    Date pre-selected: {selectedDate ? format(selectedDate, 'EEEE, MMMM dd, yyyy') : ''}
                                </p>
                                <p className="text-sm text-blue-600 mt-1">
                                    This venue is available for full-day rental only.
                                </p>
                            </div>
                        ) : (
                            // Show calendar for date selection if no arrival date in URL
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
                                                                    {getDateContent(day)}
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
                            </>
                        )}

                        {/* Full Day Booking Information */}
                        {selectedDate && (
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-semibold text-blue-800 mb-2">Full Day Booking Details</h4>
                                <p className="text-blue-700">
                                    This venue is available for full-day rental only. Your booking will be for the entire day on {selectedDate ? format(selectedDate, 'EEE, MMM dd, yyyy') : ''}.
                                </p>
                                <p className="text-blue-700 mt-2">
                                    Check-in: 8:00 AM | Check-out: 5:00 PM
                                </p>
                            </div>
                        )}

                        {/* Calendar Legend - only show if calendar is visible */}
                        {!arrivalParam && (
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
                        )}

                        {/* Proceed Button */}
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleProceed}
                                disabled={!selectedDate}
                                className={`px-6 py-2 rounded-md font-semibold ${selectedDate
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Proceed to Booking
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Area Info (1/3 width on large screens) */}
                <div className="lg:col-span-1">
                    {areaData && (
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <div className="mb-4">
                                <img
                                    loading='lazy'
                                    src={areaData.area_image}
                                    alt={areaData.area_name}
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold mb-2">{areaData.area_name}</h3>
                                <span className={`px-2 py-1 ${areaData.status === 'available'
                                    ? 'bg-green-100 text-green-800'
                                    : areaData.status === 'reserved'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-red-100 text-red-800'
                                    } text-md font-medium rounded-full`}>
                                    {areaData.status.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-lg font-semibold text-blue-600 mb-3">₱{price.toLocaleString()} per day</p>

                            <div className="flex items-center text-gray-600 text-lg mb-3">
                                <span className="mr-2">👥</span>
                                <span>Capacity: {areaData.capacity} pax</span>
                            </div>

                            {selectedDate && (
                                <div className="mt-auto">
                                    <div className="border-t border-gray-200 pt-3 mt-3">
                                        <h4 className="font-medium mb-2">Your Selection</h4>
                                        <div className="bg-gray-50 p-3 rounded-md space-y-2">
                                            <div className="flex justify-between text-lg">
                                                <span>Date:</span>
                                                <span className="font-medium">{format(selectedDate, 'EEE, MMM dd, yyyy')}</span>
                                            </div>
                                            <div className="flex justify-between text-lg">
                                                <span>Duration:</span>
                                                <span className="font-medium">Full Day (8AM - 5PM)</span>
                                            </div>
                                            <div className="flex justify-between text-2xl font-semibold text-blue-600 pt-2 border-t border-gray-200">
                                                <span>Total Price:</span>
                                                <span>₱{price.toLocaleString()}</span>
                                            </div>
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

export default VenueBookingCalendar; 
