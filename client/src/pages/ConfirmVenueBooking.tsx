import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import { useUserContext } from '../contexts/AuthContext';
import { ReservationFormData, createReservation, fetchAreaById } from '../services/Booking';
import { BookCheck } from 'lucide-react';

// Define area data interface
interface AreaData {
  id: number;
  area_name: string;
  description: string;
  area_image: string;
  status: string;
  capacity: number;
  price_per_hour: string;
}

const ConfirmVenueBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useUserContext();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [savedFormData, setSavedFormData] = useState<any>(null);

  const areaId = searchParams.get('areaId');
  const startTime = searchParams.get('startTime');
  const endTime = searchParams.get('endTime');
  const totalPrice = searchParams.get('totalPrice');

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

  const { data: areaData, isLoading } = useQuery<AreaData>({
    queryKey: ['area', areaId],
    queryFn: () => fetchAreaById(areaId as string),
    enabled: !!areaId
  });

  useEffect(() => {
    if (!isLoading && !areaData) {
      setError('Failed to load venue details. Please try again.');
    }
  }, [isLoading, areaData]);

  useEffect(() => {
    if (!areaId || !startTime || !endTime) {
      navigate('/venues');
    }
  }, [areaId, navigate, startTime, endTime]);

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

  // Function to handle automatic form submission after login
  const handleSuccessfulLogin = useCallback(async () => {
    if (!savedFormData || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Call API to create reservation
      const response = await createReservation(savedFormData);
      console.log('Venue booking response:', response);

      if (!response || !response.id) {
        throw new Error('Invalid response from server');
      }

      // Handle successful booking
      setSuccess(true);
      // Clear saved form data to prevent duplicate submissions
      setSavedFormData(null);

      // Redirect to booking confirmation page after 2 seconds
      setTimeout(() => {
        navigate(`/my-booking?bookingId=${response.id}&success=true`);
      }, 2000);

    } catch (err: any) {
      console.error('Error creating venue booking:', err);
      let errorMessage = 'Failed to create venue booking. Please try again.';

      // Extract more detailed error message if available
      if (err.response && err.response.data && err.response.data.error) {
        if (typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        } else if (typeof err.response.data.error === 'object') {
          // If error is an object with multiple fields
          errorMessage = Object.values(err.response.data.error).join('. ');
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [navigate, savedFormData, isSubmitting]);

  // Effect to check if auth status changed and we have saved form data
  useEffect(() => {
    // Only proceed if not already submitting and not previously submitted
    if (isAuthenticated && savedFormData && !isSubmitting && !success) {
      handleSuccessfulLogin();
    }
  }, [isAuthenticated, savedFormData, handleSuccessfulLogin, isSubmitting, success]);

  const handleProceedClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) return;

    // Validate form data first
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber || !formData.emailAddress) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.validId) {
      setError('Please upload a valid ID');
      return;
    }

    if (!areaId || !startTime || !endTime || !totalPrice) {
      setError('Missing required booking information');
      return;
    }

    // Parse the datetime strings to ensure consistent format
    const parsedStartTime = startTime ? new Date(startTime).toISOString() : null;
    const parsedEndTime = endTime ? new Date(endTime).toISOString() : null;

    // Create reservation data object
    const reservationData: ReservationFormData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      emailAddress: formData.emailAddress,
      specialRequests: formData.specialRequests,
      validId: formData.validId,
      areaId: areaId,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      totalPrice: parseFloat(totalPrice || '0'),
      status: 'pending',
      isVenueBooking: true
    };

    setSavedFormData(reservationData);

    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      // If user is already authenticated, submit the form
      handleSuccessfulLogin();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Use the same logic as button click to ensure consistent flow
    // This prevents duplicate submission logic and potential bugs
    handleProceedClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
  };

  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return '';

    const date = new Date(dateTimeString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[date.getDay()];
    const dayOfMonth = date.getDate();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${day}, ${dayOfMonth} ${month}, ${year} at ${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const calculateDuration = () => {
    if (!startTime || !endTime) return 1;

    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    return diffHours || 1;
  };

  const formattedStartTime = formatDateTime(startTime);
  const formattedEndTime = formatDateTime(endTime);
  const durationHours = calculateDuration();

  const openSignupModal = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const openLoginModal = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-16">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">Confirm Area Booking</h1>
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading area details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl mt-16">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">Confirm Area Booking</h1>

      {!isAuthenticated && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-300 text-blue-800 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Login Required</h3>
              <p className="text-sm mt-1">
                You'll need to log in or create an account to complete your venue booking. Don't worry - your booking information will be saved during the process.
              </p>
            </div>
          </div>
        </div>
      )}

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

            {/* Valid ID */}
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
                        loading='lazy'
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
                {/* Empty space for layout balance */}
              </div>
            </div>

            {/* Booking Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="startTime" className="block text-md font-medium text-gray-700 mb-1">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="startTime"
                  name="startTime"
                  disabled
                  value={formattedStartTime}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-md font-medium text-gray-700 mb-1">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="endTime"
                  name="endTime"
                  disabled
                  value={formattedEndTime}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
                />
              </div>
            </div>

            {/* Special Requests */}
            <div className="mb-6">
              <label htmlFor="specialRequests" className="block text-md font-medium text-gray-700 mb-1">
                Special requests
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
                type="button"
                disabled={isSubmitting}
                onClick={handleProceedClick}
                className={`w-full py-3 px-6 rounded-md text-white text-center cursor-pointer font-semibold ${isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }`}
              >
                {isSubmitting ? 'Processing...' : isAuthenticated ? (
                  <>
                    <BookCheck className="w-5 h-5 mr-2" />
                    Complete Booking
                  </>
                ) : 'Continue to Login'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar - Takes 1/3 width on large screens */}
        <div className="lg:col-span-1">
          {/* Venue Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="relative mb-4">
              <img
                loading='lazy'
                src={areaData?.area_image}
                alt={areaData?.area_name || "Venue"}
                className="w-full h-40 object-cover rounded-md"
              />
            </div>
            <h3 className="text-2xl font-semibold mb-4">{areaData?.area_name || "Venue"}</h3>

            {/* Additional Venue Details */}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Capacity:</span>
                <span className="font-semibold">{areaData?.capacity} people</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold">{areaData?.price_per_hour}</span>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Your booking details</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-lg text-gray-800 font-semibold">Start:</p>
                <p className="font-semibold">{formattedStartTime}</p>
              </div>
              <div>
                <p className="text-lg text-gray-800 font-semibold">End:</p>
                <p className="font-semibold">{formattedEndTime}</p>
              </div>
            </div>

            <div className="mb-2">
              <p className="text-md font-medium">{areaData?.area_name || "Venue"}</p>
              <p className="text-md text-gray-600">{durationHours} hour{durationHours > 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Pricing Summary</h3>
            <div className="text-md mb-2">
              <p className="text-gray-600">Full day booking ({durationHours} hour{durationHours > 1 ? 's' : ''})</p>
            </div>
            <div className="text-md mb-4">
              <p className="font-medium">{areaData?.area_name || "Venue"}</p>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-semibold text-2xl">Total Price:</span>
              <span className="font-bold text-2xl">₱{parseFloat(totalPrice || '0').toLocaleString()}</span>
            </div>
          </div>

          <div className="hidden lg:block">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleProceedClick}
              className={`w-full py-3 px-6 rounded-md text-white text-center text-xl font-semibold flex items-center justify-center ${isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
            >
              {isSubmitting ? 'Processing...' : isAuthenticated ? (
                <>
                  <BookCheck className="w-8 h-8 mr-2" />
                  Complete Booking
                </>
              ) : 'Continue to Login'}
            </button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <LoginModal
            toggleLoginModal={() => setShowLoginModal(false)}
            openSignupModal={openSignupModal}
            onSuccessfulLogin={handleSuccessfulLogin}
            bookingInProgress={true}
          />
        </div>
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <SignupModal
            toggleRegisterModal={() => setShowSignupModal(false)}
            openLoginModal={openLoginModal}
            onSuccessfulSignup={handleSuccessfulLogin}
          />
        </div>
      )}
    </div>
  );
};

export default ConfirmVenueBooking;
