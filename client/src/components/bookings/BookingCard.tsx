interface BookingCardProps {
  roomType: string;
  imageUrl: string;
  dates: string;
  guests: number | string;
  price: number;
  status: string;
}

const BookingCard = ({
  roomType,
  imageUrl,
  dates,
  guests,
  price,
  status,
}: BookingCardProps) => {
  // Normalize status to lowercase for consistency
  const normalizedStatus = status.toLowerCase();

  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-500 text-white",
    reserved: "bg-green-500 text-white",
    booked: "bg-green-500 text-white", // Keep both booked and reserved with the same style
    checkedin: "bg-blue-500 text-white",
    checkedout: "bg-gray-500 text-white",
    canceled: "bg-red-500 text-white",
    noshow: "bg-black text-white",
  };

  // Use normalized status for style lookup, with fallback
  const styleClass = statusStyles[normalizedStatus] || statusStyles.pending;

  // Helper function to check if status matches either booked or reserved
  const isReservedOrBooked = () =>
    normalizedStatus === "reserved" || normalizedStatus === "booked";

  // Function to get display status - convert "booked" to "reserved"
  const getDisplayStatus = () => {
    if (normalizedStatus === "booked") {
      return "RESERVED";
    }
    return status.toUpperCase();
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-white shadow-md rounded-lg p-6 flex flex-col md:flex-row gap-6 mb-6">
      <div className="w-full md:w-56 h-36 flex items-center justify-center overflow-hidden rounded-lg bg-gray-200">
        <img
          src={imageUrl}
          alt={roomType}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-grow flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold">{dates}</h2>
          <p className="text-gray-600 flex items-center">
            <span className="mr-2">👥</span> Persons: {guests}
          </p>
          <p className="text-blue-600 font-semibold text-lg">
            PRICE: {price.toLocaleString()}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            A Deluxe Room offers a spacious and elegant setting with modern
            amenities, featuring a comfortable king-sized bed, a luxurious
            en-suite bathroom, and stunning views.
          </p>
        </div>

        <div className="flex items-end justify-between mt-4">
          <span
            className={`px-4 py-1 text-sm font-bold rounded-lg ${styleClass} min-w-[100px] text-center`}
          >
            {getDisplayStatus()}
          </span>

          <div className="flex gap-3 ml-auto">
            {isReservedOrBooked() && (
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Check In
              </button>
            )}
            {normalizedStatus === "checkedin" && (
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                Check Out
              </button>
            )}
            {(normalizedStatus === "pending" || isReservedOrBooked()) && (
              <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
