import { Book, Eye } from "lucide-react";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

interface RoomCardProps {
  id: string | number;
  name: string;
  image: string;
  title: string;
  status: string;
  capacity: string;
  price: string | number;
}

const RoomCard: FC<RoomCardProps> = ({
  id,
  name,
  image,
  title,
  status,
  capacity,
  price,
}) => {
  const navigate = useNavigate();

  const getStatusBadgeColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-700';
      case 'occupied':
        return 'bg-red-100 text-red-700';
      case 'maintenance':
        return 'bg-gray-100 text-gray-700';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const isBookingDisabled = (): boolean => {
    const lowerStatus = status.toLowerCase();
    return lowerStatus === 'maintenance' || lowerStatus === 'occupied' || lowerStatus === 'reserved';
  };

  const handleReserveClick = () => {
    if (!isBookingDisabled()) {
      navigate(`/booking/${id}`);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg">
      <img loading="lazy" src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="flex flex-col flex-1 p-4">
        <div className="mb-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">{name}</h1>
            <span
              className={`text-sm font-semibold px-2 py-1 rounded-full ${getStatusBadgeColor(status)}`}
            >
              {status.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap pb-4 gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <i className="fa fa-users text-green-500"></i>
            <span>{capacity}</span>
          </div>
        </div>
        <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-between font-montserrat">
          <span className="text-xl font-semibold text-gray-900">
            {price}
          </span>
          <div className="flex gap-2 flex-wrap">
            <button
              className="bg-blue-600 text-white text-sm px-3 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1"
              onClick={() => navigate(`/rooms/${id}`)}
            >
              <Eye size={16} /> <span>View</span>
            </button>
            <button
              className={`text-white text-sm px-3 py-2 rounded-md transition-colors flex items-center gap-1 ${isBookingDisabled()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 cursor-pointer'
                }`}
              onClick={handleReserveClick}
              disabled={isBookingDisabled()}
              title={isBookingDisabled() ? `Cannot book a room that is ${status}` : "Book this room"}
            >
              <Book size={16} /> <span>Book</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
