import { FC } from "react";
import { Link, useNavigate } from "react-router-dom";

interface RoomCardProps {
  id: string | number;
  name: string;
  image: string;
  title: string;
  admission: string;
  bedType: string;
  capacity: number;
  price: number;
}

const RoomCard: FC<RoomCardProps> = ({
  id,
  name,
  image,
  title,
  bedType,
  capacity,
  price,
  admission,
}) => {
  const navigate = useNavigate();

  // Use a badge color based on admission type:
  const admissionBadge =
    admission.toLowerCase() === "vip" ? "bg-yellow-500" : "bg-blue-500";

  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="flex flex-col flex-1 p-4">
        <div className="mb-3">
          <h1 className="text-xl font-bold text-gray-800">{name}</h1>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm text-gray-600">{title}</span>
            <span
              className={`text-xs font-semibold text-white px-2 py-1 rounded-full ${admissionBadge}`}
            >
              {admission.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <i className="fa fa-bed text-blue-500"></i>
            <span>{bedType}</span>
          </div>
          <div className="flex items-center space-x-1">
            <i className="fa fa-users text-green-500"></i>
            <span>{capacity} pax</span>
          </div>
        </div>
        <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-800">
            ₱{price.toLocaleString()}
          </span>
          <div className="flex gap-2">
            <button
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => navigate(`/rooms/${id}`)}
            >
              View Details
            </button>
            <Link to="/availability">
              <button className="bg-green-600 text-white text-sm px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                Reserve Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
