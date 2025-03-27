import { useQuery } from '@tanstack/react-query';
import { addDays, format, isAfter, isBefore, isSameDay } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
import { useUserContext } from '../contexts/AuthContext';
import { BookingFormData, createBooking, fetchRoomById } from '../services/Booking';

interface Amenity {
  id: number;
  description: string;
}

interface RoomData {
  id: number;
  room_name: string;
  room_type: string;
  status: string;
  room_price: string;
  room_image: string;
  description: string;
  capacity: string;
  amenities: Amenity[];
}

interface UnavailableDate {
  checkIn: string;
  checkOut: string;
}

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useUserContext();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const roomId = searchParams.get('roomId');
  const arrival = searchParams.get('arrival');
  const departure = searchParams.get('departure');

  const [selectedArrival, setSelectedArrival] = useState(arrival || '');
  const [selectedDeparture, setSelectedDeparture] = useState(departure || '');
  const [dateSelectionCompleted, setDateSelectionCompleted] = useState(!!arrival && !!departure);
  const [dateError, setDateError] = useState<string | null>(null);
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [calculatedTotalPrice, setCalculatedTotalPrice] = useState<number>(0);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    emailAddress: '',
    validId: null as File | null,
    specialRequests: ''
  });

  const [validIdPreview, setValidIdPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Fetch room data
  const { data: roomData, isLoading } = useQuery<RoomData>({
    queryKey: ['room', roomId],
    queryFn: () => fetchRoomById(roomId),
    enabled: !!roomId
  });

  // Fetch room availability
  const { data: availabilityData, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['roomAvailability', roomId],
    queryFn: async () => {
      try {
        // In a real implementation, call your backend API to get unavailable dates
        // const response = await fetchRoomAvailability(roomId);
        // return response.data;

        // For now, using mock data
        console.log(`Fetching availability for room ${roomId}`);
        const mockUnavailableDates: UnavailableDate[] = [
          { checkIn: '2023-12-24', checkOut: '2023-12-26' },
          { checkIn: '2024-01-01', checkOut: '2024-01-03' }
        ];
        return { unavailableDates: mockUnavailableDates };
      } catch (error) {
        console.error('Error fetching room availability:', error);
        throw error;
      }
    },
    enabled: !!roomId
  });

  useEffect(() => {
    if (availabilityData?.unavailableDates) {
      setUnavailableDates(availabilityData.unavailableDates);
    }
  }, [availabilityData]);

  useEffect(() => {
    if (!isLoading && !roomData) {
      setError('Failed to load room details. Please try again.');
    }
  }, [isLoading, roomData]);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
    }
  }, [roomId, navigate]);

  // Calculate price when dates or room data changes
  useEffect(() => {
    if (roomData && selectedArrival && selectedDeparture) {
      const nights = calculateNights();

      // Parse the room price from string
      const priceString = roomData.room_price.replace(/[₱,]/g, '');
      const roomPrice = parseFloat(priceString);

      if (!isNaN(roomPrice)) {
        setCalculatedTotalPrice(roomPrice * nights);
      }
    }
  }, [roomData, selectedArrival, selectedDeparture]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        validId: file
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setValidIdPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    return () => {
      if (validIdPreview) {
        URL.revokeObjectURL(validIdPreview);
      }
    };
  }, [validIdPreview]);

  // Check if a date is unavailable
  const isDateUnavailable = (dateStr: string): boolean => {
    const date = new Date(dateStr);

    // Past dates are unavailable
    if (isBefore(date, new Date(today))) {
      return true;
    }

    // Check against booked dates
    return unavailableDates.some(unavailable => {
      const checkIn = new Date(unavailable.checkIn);
      const checkOut = new Date(unavailable.checkOut);

      // If the date is within any booked range
      return (
        (isSameDay(date, checkIn) || isAfter(date, checkIn)) &&
        (isBefore(date, checkOut) || isSameDay(date, checkOut))
      );
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'arrival-date') {
      // If the selected date is unavailable, show error
      if (isDateUnavailable(value)) {
        setDateError('This date is not available. Please select another date.');
        return;
      }

      setSelectedArrival(value);

      // If departure date is before new arrival date, reset it
      if (selectedDeparture && isBefore(new Date(selectedDeparture), new Date(value))) {
        setSelectedDeparture('');
      }

      setDateError(null);
    } else if (name === 'departure-date') {
      // If the selected date is unavailable, show error
      if (isDateUnavailable(value)) {
        setDateError('This date is not available. Please select another date.');
        return;
      }

      // Check if there are any unavailable dates between arrival and departure
      if (selectedArrival) {
        const start = new Date(selectedArrival);
        const end = new Date(value);

        let hasUnavailableDate = false;
        let currentDate = addDays(start, 1); // Start checking from the day after arrival

        while (isBefore(currentDate, end)) {
          if (isDateUnavailable(format(currentDate, 'yyyy-MM-dd'))) {
            hasUnavailableDate = true;
            break;
          }
          currentDate = addDays(currentDate, 1);
        }

        if (hasUnavailableDate) {
          setDateError('There are unavailable dates in your selected range. Please choose a different range.');
          return;
        }
      }

      setSelectedDeparture(value);
      setDateError(null);
    }
  };

  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedArrival || !selectedDeparture) {
      setDateError('Please select both check-in and check-out dates');
      return;
    }

    const arrivalDate = new Date(selectedArrival);
    const departureDate = new Date(selectedDeparture);

    if (departureDate <= arrivalDate) {
      setDateError('Check-out date must be after check-in date');
      return;
    }

    // Check for unavailable dates in range
    let hasUnavailableDate = false;
    let currentDate = arrivalDate;

    while (isBefore(currentDate, departureDate)) {
      if (isDateUnavailable(format(currentDate, 'yyyy-MM-dd'))) {
        hasUnavailableDate = true;
        break;
      }
      currentDate = addDays(currentDate, 1);
    }

    if (hasUnavailableDate) {
      setDateError('There are unavailable dates in your selected range. Please choose a different range.');
      return;
    }

    setDateSelectionCompleted(true);
    setDateError(null);
  };

  const handleProceedClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLoginModal(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!roomId || !selectedArrival || !selectedDeparture) {
      setError('Missing required booking information');
      return;
    }

    if (!formData.validId) {
      setError('Please upload a valid ID');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const bookingData: BookingFormData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        emailAddress: formData.emailAddress,
        specialRequests: formData.specialRequests,
        validId: formData.validId,
        roomId: roomId,
        checkIn: selectedArrival,
        checkOut: selectedDeparture,
        status: 'pending',
        totalPrice: calculatedTotalPrice
      };

      // Call API to create booking
      const response = await createBooking(bookingData);

      // Handle successful booking
      setSuccess(true);

      // Redirect to booking confirmation page after 2 seconds
      setTimeout(() => {
        navigate(`/my-booking?bookingId=${response.id}&success=true`);
      }, 2000);

    } catch (err) {
      setError('Failed to create booking. Please try again.');
      console.error('Error creating booking:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format dates for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[date.getDay()];
    const dayOfMonth = date.getDate();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}, ${dayOfMonth} ${month}, ${year}`;
  };

  // Calculate number of nights
  const calculateNights = () => {
    if (!selectedArrival || !selectedDeparture) return 1;

    const arrivalDate = new Date(selectedArrival);
    const departureDate = new Date(selectedDeparture);
    const diffTime = Math.abs(departureDate.getTime() - arrivalDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays || 1;
  };

  const nights = calculateNights();
  const formattedArrivalDate = formatDate(selectedArrival);
  const formattedDepartureDate = formatDate(selectedDeparture);

  if (isLoading || isLoadingAvailability) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-16">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">Confirm Booking</h1>
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  // If dates are not selected yet, show date selection form
  if (!dateSelectionCompleted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-16">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">Select Your Stay Dates</h1>

        {/* Room Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-2xl mx-auto">
          <div className="flex items-center space-x-4">
            <img
              loading="lazy"
              src={roomData?.room_image}
              alt={roomData?.room_name || "Room"}
              className="w-24 h-24 object-cover rounded-md"
            />
            <div>
              <h2 className="text-xl font-bold">{roomData?.room_name}</h2>
              <p className="text-gray-600">{roomData?.room_type}</p>
              <p className="text-lg font-semibold mt-1">{roomData?.room_price}</p>
            </div>
          </div>
        </div>

        {/* Unavailable Dates Information */}
        {unavailableDates.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded max-w-2xl mx-auto">
            <h3 className="font-semibold mb-2">Unavailable Dates</h3>
            <p className="text-sm mb-2">The following dates are already booked:</p>
            <ul className="list-disc pl-5 text-sm">
              {unavailableDates.map((period, index) => (
                <li key={index}>
                  {format(new Date(period.checkIn), 'MMM dd, yyyy')} to {format(new Date(period.checkOut), 'MMM dd, yyyy')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {dateError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded max-w-2xl mx-auto">
            <p>{dateError}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <form onSubmit={handleDateSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="arrival-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="arrival-date"
                  name="arrival-date"
                  className={`w-full px-3 py-2 border ${hoveredDate === 'arrival' ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  required
                  value={selectedArrival}
                  onChange={handleDateChange}
                  min={today}
                  onMouseEnter={() => setHoveredDate('arrival')}
                  onMouseLeave={() => setHoveredDate(null)}
                />
              </div>
              <div>
                <label htmlFor="departure-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="departure-date"
                  name="departure-date"
                  className={`w-full px-3 py-2 border ${hoveredDate === 'departure' ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  required
                  value={selectedDeparture}
                  onChange={handleDateChange}
                  min={selectedArrival || today}
                  onMouseEnter={() => setHoveredDate('departure')}
                  onMouseLeave={() => setHoveredDate(null)}
                />
              </div>
            </div>

            {selectedArrival && selectedDeparture && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex flex-col md:flex-row md:justify-between">
                  <div>
                    <span className="text-blue-800 font-medium">Selected Stay:</span>
                    <span className="ml-2 text-blue-700">
                      {format(new Date(selectedArrival), 'MMM dd, yyyy')} to {format(new Date(selectedDeparture), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className="text-blue-800 font-medium">Duration:</span>
                    <span className="ml-2 text-blue-700">{nights} night{nights !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-blue-800 font-medium">Estimated Price:</span>
                  <span className="ml-2 text-blue-700 font-semibold">
                    ₱{calculatedTotalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate('/rooms')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back to Rooms
              </button>
              <button
                type="submit"
                className={`px-6 py-2 ${!selectedArrival || !selectedDeparture || !!dateError
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={!selectedArrival || !selectedDeparture || !!dateError}
              >
                Continue to Booking
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl mt-16">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">Confirm Booking</h1>

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p>Booking successfully created! You will be redirected to your booking details.</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section - Takes 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <form id="booking-form" onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Your details</h2>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="firstName" className="block text-md font-medium text-gray-700 mb-1">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-md font-medium text-gray-700 mb-1">
                  Last name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="phoneNumber" className="block text-md font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="emailAddress" className="block text-md font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="emailAddress"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
                />
              </div>
            </div>

            {/* Address and Valid ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="validId" className="block text-md font-medium text-gray-700 mb-1">
                  Valid ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  id="validId"
                  name="validId"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                  className="w-full py-2"
                />

                {/* Valid ID Preview Container */}
                {validIdPreview && (
                  <div className="mt-2 relative">
                    <div className="relative border rounded-md overflow-hidden" style={{ height: '120px' }}>
                      <img
                        loading="lazy"
                        src={validIdPreview}
                        alt="ID Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setValidIdPreview(null);
                        setFormData({ ...formData, validId: null });
                      }}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                      aria-label="Remove image"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <div>
                {/* Empty space for layout balance - you can add another field here if needed */}
              </div>
            </div>

            {/* Check-in/out Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="checkIn" className="block text-md font-medium text-gray-700 mb-1">
                  Check in <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="checkIn"
                  name="checkIn"
                  disabled
                  value={selectedArrival}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="checkOut" className="block text-md font-medium text-gray-700 mb-1">
                  Check Out <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="checkOut"
                  name="checkOut"
                  disabled
                  value={selectedDeparture}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
                />
              </div>
            </div>

            {/* Special Requests */}
            <div className="mb-6">
              <label htmlFor="specialRequests" className="block text-md font-medium text-gray-700 mb-1">
                Special requests to hotel
              </label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100 resize-none"
              ></textarea>
            </div>

            {/* Submit Button for Mobile View */}
            <div className="lg:hidden mt-6">
              <button
                type="submit"
                disabled={isSubmitting || !isAuthenticated}
                onClick={!isAuthenticated ? handleProceedClick : undefined}
                className={`w-full py-3 px-6 rounded-md text-white text-center cursor-pointer font-semibold ${!isAuthenticated
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }`}
              >
                {!isAuthenticated
                  ? 'Please Login to Proceed'
                  : isSubmitting
                    ? 'Processing...'
                    : 'Proceed'
                }
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar - Takes 1/3 width on large screens */}
        <div className="lg:col-span-1">
          {/* Room Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="relative mb-4">
              <img
                loading="lazy"
                src={roomData?.room_image}
                alt={roomData?.room_name || "Room"}
                className="w-full h-40 object-cover rounded-md"
              />
            </div>
            <h3 className="text-2xl font-semibold mb-4">{roomData?.room_name || "Room"}</h3>

            {/* Amenities */}
            <div className="space-y-2">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Room Amenities</h4>
              {roomData?.amenities && roomData.amenities.length > 0 ? (
                roomData.amenities.map((amenity) => (
                  <div key={`amenity-${amenity.id}`} className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-md text-gray-600">{amenity.description}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No amenities listed</p>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Your booking details</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-lg text-gray-800 font-semibold">Check-in :</p>
                <p className="font-semibold">{formattedArrivalDate}</p>
                <p className="text-md text-gray-500">From 12:00 PM</p>
              </div>
              <div>
                <p className="text-lg text-gray-800 font-semibold">Check-out :</p>
                <p className="font-semibold">{formattedDepartureDate}</p>
                <p className="text-md text-gray-500">Until 02:00 PM</p>
              </div>
            </div>

            <div className="mb-2">
              <p className="text-md font-medium">{roomData?.room_name || "Deluxe Room"}</p>
              <p className="text-md text-gray-600">{nights} night{nights > 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Pricing Summary</h3>
            <div className="text-md mb-2">
              <p className="text-gray-600">1 room x {nights} night{nights > 1 ? 's' : ''}</p>
            </div>
            <div className="text-md mb-4">
              <p className="font-medium">{roomData?.room_name || "Room"}</p>
              <p className="text-sm text-gray-600">
                {roomData?.room_price} per night
              </p>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-semibold text-2xl">Total Price :</span>
              <span className="font-bold text-2xl">₱{calculatedTotalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="hidden lg:block">
            <button
              type="submit"
              form="booking-form"
              disabled={isSubmitting || !isAuthenticated}
              onClick={!isAuthenticated ? handleProceedClick : undefined}
              className={`w-full py-3 px-6 rounded-md text-white text-center font-semibold ${!isAuthenticated
                ? 'bg-gray-400 cursor-not-allowed'
                : isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
            >
              {!isAuthenticated
                ? 'Please Login to Proceed'
                : isSubmitting
                  ? 'Processing...'
                  : 'Proceed'
              }
            </button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <LoginModal
            toggleLoginModal={() => setShowLoginModal(false)}
            openSignupModal={() => {
              setShowLoginModal(false);
              // You can add signup modal state here if needed
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ConfirmBooking;