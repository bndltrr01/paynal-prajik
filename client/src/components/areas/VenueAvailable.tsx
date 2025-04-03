import { FC } from "react";

interface VenueAvailableProps {
  image: string;
  title: string;
  capacity: number;
  price: number;
  available: boolean;
  onBookNow: () => void;
}

const VenueAvailable: FC<VenueAvailableProps> = ({
  image,
  title,
  capacity,
  price,
  available,
  onBookNow,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex flex-col">
      {/* Venue Image */}
      <img loading="lazy" src={image} alt={title} className="h-44 w-full object-cover" />

      {/* Venue Details */}
      <div className="p-4 space-y-3">
        {/* Venue Title */}
        <h2 className="text-lg font-bold text-gray-800 font-playfair">
          {title}
        </h2>

        {/* Capacity */}
        <div className="flex justify-between text-sm text-gray-600 font-montserrat">
          <span className="flex items-center gap-1">
            <i className="fas fa-users"></i> {capacity} pax
          </span>
        </div>

        {/* Availability */}
        <div
          className={`flex items-center gap-2 ${available ? "text-green-600" : "text-red-500"
            } font-semibold text-sm font-montserrat`}
        >
          <i
            className={`fas ${available ? "fa-check-circle" : "fa-times-circle"
              }`}
          ></i>
          {available ? "Available" : "Not Available"}
        </div>

        {/* Price and Button */}
        <div className="flex justify-between items-center mt-2">
          <div className="text-lg font-bold text-gray-900 font-montserrat">
            ₱{price.toLocaleString()}
          </div>
          <button
            onClick={onBookNow}
            className={`px-4 py-2 rounded-lg text-white font-semibold font-montserrat ${available
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
              }`}
            disabled={!available}
          >
            {available ? "Book Now" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VenueAvailable;
