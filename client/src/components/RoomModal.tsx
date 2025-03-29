import { FC, useEffect } from "react";
import CustomerDetailsForm from "./bookings/CustomerDetailsForm"; // Adjust this path as needed

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: {
    id: string;
    title: string;
    image: string;
    bedType: string;
    capacity: number;
    price: number;
  };
}

const RoomModal: FC<RoomModalProps> = ({ isOpen, onClose, room }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl relative overflow-auto max-h-[90vh]">
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl md:text-2xl font-bold font-playfair text-gray-800">
            Room Booking - {room.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-600 text-2xl p-2 rounded-md"
          >
            <i className="fa fa-times"></i>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <img
            loading="lazy"
            src={room.image}
            alt={room.title}
            className="w-full h-56 object-cover rounded-md"
          />

          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-playfair">{room.title}</h3>
            <p className="text-gray-600 font-montserrat">
              <strong>Bed Type:</strong> {room.bedType}
            </p>
            <p className="text-gray-600 font-montserrat">
              <strong>Capacity:</strong> {room.capacity} pax
            </p>
            <p className="text-gray-600 font-montserrat">
              <strong>Price:</strong> ₱{room.price.toLocaleString()}
            </p>
          </div>

          <CustomerDetailsForm />
        </div>
      </div>
    </div>
  );
};

export default RoomModal;
