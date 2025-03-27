import { useQuery } from '@tanstack/react-query';
import { addMonths, eachDayOfInterval, endOfMonth, format, isAfter, isBefore, isSameDay, isWithinInterval, startOfDay, startOfMonth } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchRoomById } from '../services/Booking';

interface RoomData {
    id: number;
    room_name: string;
    room_type: string;
    status: string;
    room_price: string;
    room_image: string;
    description: string;
    capacity: string;
    amenities: Array<{
        id: number;
        description: string;
    }>;
}

interface UnavailableDate {
    start_date: string;
    end_date: string;
}

const BookingCalendar = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(null);
    const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null);
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
    const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);

    // Fetch room data
    const { data: roomData, isLoading: isLoadingRoom } = useQuery<RoomData>({
        queryKey: ['room', roomId],
        queryFn: () => fetchRoomById(roomId || ''),
        enabled: !!roomId
    });

    const { data: availabilityData, isLoading: isLoadingAvailability } = useQuery({
        queryKey: ['availability', roomId],
        queryFn: async () => {
            try {
                return {
                    unavailable_dates: [] as UnavailableDate[]
                };
            } catch (error) {
                console.error('Error fetching availability:', error);
                return { unavailable_dates: [] as UnavailableDate[] };
            }
        },
        enabled: !!roomId
    });

    useEffect(() => {
        if (availabilityData?.unavailable_dates) {
            setUnavailableDates(availabilityData.unavailable_dates);
        }
    }, [availabilityData]);

    const months = [currentMonth, addMonths(currentMonth, 1)];

    const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const isDateUnavailable = (date: Date) => {
        // Only consider dates before today as unavailable
        if (isBefore(date, startOfDay(new Date()))) {
            return true;
        }

        // Check if the date is in the unavailable dates from the API
        return unavailableDates.some(unavailableDate => {
            const startDate = new Date(unavailableDate.start_date);
            const endDate = new Date(unavailableDate.end_date);
            return isWithinInterval(date, { start: startDate, end: endDate });
        });
    };

    const handleDateClick = (date: Date) => {
        if (isDateUnavailable(date)) {
            return;
        }

        if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
            setSelectedCheckIn(date);
            setSelectedCheckOut(null);
        } else {
            if (isBefore(date, selectedCheckIn)) {
                setSelectedCheckIn(date);
                setSelectedCheckOut(null);
            } else {
                setSelectedCheckOut(date);
            }
        }
    };

    const handleDateHover = (date: Date) => {
        setHoveredDate(date);
    };

    const getDateCellClass = (date: Date) => {
        const isUnavailable = isDateUnavailable(date);
        const isCheckIn = selectedCheckIn && isSameDay(date, selectedCheckIn);
        const isCheckOut = selectedCheckOut && isSameDay(date, selectedCheckOut);
        const isToday = isSameDay(date, new Date());

        let inRange = false;
        if (selectedCheckIn && !selectedCheckOut && hoveredDate) {
            if (
                (isAfter(hoveredDate, selectedCheckIn) && isWithinInterval(date, { start: selectedCheckIn, end: hoveredDate })) ||
                (isBefore(hoveredDate, selectedCheckIn) && isWithinInterval(date, { start: hoveredDate, end: selectedCheckIn }))
            ) {
                inRange = true;
            }
        } else if (selectedCheckIn && selectedCheckOut) {
            inRange = isWithinInterval(date, { start: selectedCheckIn, end: selectedCheckOut }) &&
                !isSameDay(date, selectedCheckIn) && !isSameDay(date, selectedCheckOut);
        }

        let className = "h-10 w-10 flex items-center justify-center text-sm";

        if (isUnavailable) {
            className += " bg-gray-400 text-gray-100 cursor-not-allowed";
        } else {
            if (isCheckIn) {
                className += " bg-blue-600 text-white cursor-pointer";
            } else if (isCheckOut) {
                className += " bg-amber-600 text-white cursor-pointer";
            } else if (inRange) {
                className += " bg-amber-500 text-white cursor-pointer";
            } else {
                className += " bg-white border border-gray-300 hover:bg-gray-100 cursor-pointer";
            }
        }

        return className;
    };

    const handleProceed = () => {
        if (selectedCheckIn && selectedCheckOut) {
            const checkInStr = format(selectedCheckIn, 'yyyy-MM-dd');
            const checkOutStr = format(selectedCheckOut, 'yyyy-MM-dd');
            navigate(`/confirm-booking?roomId=${roomId}&arrival=${checkInStr}&departure=${checkOutStr}`);
        }
    };

    if (isLoadingRoom) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <h2 className="text-4xl font-semibold mb-6 text-center">Book Your Stay</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold mb-4">Select Your Stay Dates</h3>

                        {/* Selected Dates */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <span className="text-gray-600">Check-in:</span>
                                <span className="ml-2 font-semibold">
                                    {selectedCheckIn ? format(selectedCheckIn, 'EEE, MMM dd, yyyy') : 'Select a date'}
                                </span>
                            </div>
                            <div className="mt-2 md:mt-0">
                                <span className="text-gray-600">Check-out:</span>
                                <span className="ml-2 font-semibold">
                                    {selectedCheckOut ? format(selectedCheckOut, 'EEE, MMM dd, yyyy') : 'Select a date'}
                                </span>
                            </div>
                            {selectedCheckIn && selectedCheckOut && (
                                <div className="mt-2 md:mt-0 bg-blue-100 px-3 py-1 rounded-full text-blue-800 text-sm font-semibold">
                                    {Math.round((selectedCheckOut.getTime() - selectedCheckIn.getTime()) / (1000 * 60 * 60 * 24))} nights
                                </div>
                            )}
                        </div>

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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                        {/* Calendar Legend - Moved below the calendar */}
                        <div className="mt-6 border-t pt-4">
                            <h4 className="text-sm font-medium mb-3">LEGEND</h4>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                <div className="flex items-center">
                                    <div className="h-6 w-6 bg-white border border-gray-300 mr-2"></div>
                                    <span className="text-sm">Available Date</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-6 w-6 bg-blue-600 mr-2"></div>
                                    <span className="text-sm">Check-in Date</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-6 w-6 bg-gray-400 mr-2"></div>
                                    <span className="text-sm">Invalid Date</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-6 w-6 bg-amber-600 mr-2"></div>
                                    <span className="text-sm">Check-out Date</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-6 w-6 bg-gray-500 mr-2"></div>
                                    <span className="text-sm">Not Available</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-6 w-6 bg-amber-500 mr-2"></div>
                                    <span className="text-sm">Period of Stay</span>
                                </div>
                            </div>
                        </div>

                        {/* Proceed Button */}
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleProceed}
                                disabled={!selectedCheckIn || !selectedCheckOut}
                                className={`px-6 py-2 rounded-md font-semibold ${selectedCheckIn && selectedCheckOut
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Proceed to Booking
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Room Info (1/3 width on large screens) */}
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
                            <h3 className="text-xl font-bold mb-2">{roomData.room_name}</h3>
                            <div className="flex items-center mb-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                    {roomData.room_type}
                                </span>
                            </div>
                            <p className="text-lg font-semibold text-blue-600 mb-3">{roomData.room_price}</p>

                            <div className="flex items-center text-gray-600 mb-3">
                                <span className="mr-2">👥</span>
                                <span>Capacity: {roomData.capacity}</span>
                            </div>

                            <div className="border-t border-gray-200 pt-3 mt-3">
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-gray-700 text-sm">{roomData.description}</p>
                            </div>

                            {roomData.amenities && roomData.amenities.length > 0 && (
                                <div className="border-t border-gray-200 pt-3 mt-3">
                                    <h4 className="font-medium mb-2">Amenities</h4>
                                    <ul className="grid grid-cols-1 gap-1">
                                        {roomData.amenities.map(amenity => (
                                            <li key={amenity.id} className="flex items-center text-sm">
                                                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                {amenity.description}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedCheckIn && selectedCheckOut && (
                                <div className="border-t border-gray-200 pt-3 mt-3">
                                    <h4 className="font-medium mb-2">Your Selection</h4>
                                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Check-in:</span>
                                            <span className="font-medium">{format(selectedCheckIn, 'EEE, MMM dd, yyyy')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Check-out:</span>
                                            <span className="font-medium">{format(selectedCheckOut, 'EEE, MMM dd, yyyy')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Duration:</span>
                                            <span className="font-medium">{Math.round((selectedCheckOut.getTime() - selectedCheckIn.getTime()) / (1000 * 60 * 60 * 24))} nights</span>
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