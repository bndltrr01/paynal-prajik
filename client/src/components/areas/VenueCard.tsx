import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import { Book, Eye } from "lucide-react";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts/AuthContext";

interface AreaCardProps {
  id: number;
  title: string;
  priceRange: string;
  capacity: number;
  image: string;
}

const VenueCard: FC<AreaCardProps> = ({
  id,
  title,
  priceRange,
  capacity,
  image
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserContext();

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/venues/${id}`);
  };

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthenticated) {
      navigate(`/venue-booking/${id}`);
    } else {
      // If user is not authenticated, navigate to login page or show login modal
      navigate(`/venues/${id}?showLogin=true`);
    }
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
              className={`${isAuthenticated ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'} text-sm text-white px-3 py-2 rounded-lg font-montserrat transition flex items-center gap-1`}
              onClick={handleBookNow}
              title={isAuthenticated ? "Book this venue" : "Login required to book"}
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
