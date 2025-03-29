import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import { Book, Eye } from "lucide-react";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

interface AreaCardProps {
  id: number;
  title: string;
  priceRange: string;
  capacity: number;
  image: string;
  status: string;
}

const VenueCard: FC<AreaCardProps> = ({
  id,
  title,
  priceRange,
  capacity,
  image,
  status,
}) => {
  const navigate = useNavigate();

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/venues/${id}`);
  };

  const isBookingDisabled = (): boolean => {
    const lowerStatus = status.toLowerCase();
    return lowerStatus === 'maintenance' || lowerStatus === 'occupied' || lowerStatus === 'reserved';
  };

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isBookingDisabled()) {
      navigate(`/venue-booking/${id}`);
    }
  };

  const getStatusBadgeColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'text-green-700 bg-green-100';
      case 'occupied':
        return 'text-red-700 bg-red-100';
      case 'maintenance':
        return 'text-gray-700 bg-gray-100';
      case 'reserved':
        return 'text-amber-700 bg-amber-100';
      case 'unavailable':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-blue-700 bg-blue-100';
    }
  };

  // Format status display name if needed
  const getDisplayStatus = (status: string): string => {
    // If status is in lowercase, capitalize first letter
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
      <motion.img
        loading="lazy"
        src={image}
        alt={title}
        className="w-full h-64 object-cover"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          {/* Title + Featured Tag */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold">{title}</h3>
            <span className={`text-sm font-bold uppercase px-2 py-1 rounded-full ${getStatusBadgeColor(status)}`}>
              {getDisplayStatus(status)}
            </span>
          </div>

          {/* Capacity Section */}
          <div className="flex justify-between items-center text-sm mt-4 text-gray-700">
            <span className="font-medium flex items-center gap-1">
              <FontAwesomeIcon icon={faUsers} className="text-blue-500" />{" "}
              {capacity} pax
            </span>
          </div>
        </div>

        {/* Price and Button */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <span className="font-semibold text-lg font-montserrat">
            {priceRange}
          </span>
          <div className="flex gap-2 flex-wrap justify-end font-montserrat">
            <button
              className="bg-blue-600 text-sm text-white px-3 py-2 rounded-lg font-montserrat hover:bg-blue-700 transition cursor-pointer flex items-center gap-1"
              onClick={handleViewDetails}
            >
              <Eye size={16} /> <span>View</span>
            </button>

            <button
              className={`text-sm text-white px-3 py-2 rounded-lg font-montserrat transition flex items-center gap-1 ${isBookingDisabled()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 cursor-pointer'
                }`}
              onClick={handleBookNow}
              disabled={isBookingDisabled()}
              title={isBookingDisabled() ? `Cannot book a venue that is ${status}` : "Book this venue"}
            >
              <Book size={16} /> <span>Book</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
