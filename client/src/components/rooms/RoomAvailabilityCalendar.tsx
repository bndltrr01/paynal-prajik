import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Alert from "../Alert";
import { CalendarRange } from "lucide-react";

const RoomAvailabilityCalendar = () => {
  const navigate = useNavigate();
  const [arrivalDate, setArrivalDate] = useState<Date | null>(null);
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [alertInfo, setAlertInfo] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
  } | null>(null);

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleCheckAvailability = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!arrivalDate || !departureDate) {
      setAlertInfo({
        message:
          "Please provide both arrival and departure dates. Please try again",
        type: "error",
      });
      return;
    }
    if (arrivalDate < today) {
      setAlertInfo({
        message: "Arrival date cannot be in the past. Please try again",
        type: "error",
      });
      return;
    }
    if (departureDate < today) {
      setAlertInfo({
        message: "Departure date cannot be in the past. Please try again",
        type: "error",
      })
      return;
    }
    if (departureDate <= arrivalDate) {
      setAlertInfo({
        message:
          "Departure date must be greater than arrival date. Please try again",
        type: "error",
      });
      return;
    }

    setAlertInfo(null);
    const arrivalStr = formatLocalDate(arrivalDate);
    const departureStr = formatLocalDate(departureDate);

    navigate(`/availability?arrival=${arrivalStr}&departure=${departureStr}`);
  };

  return (
    <div className="relative">
      {/* Render custom alert if there's any error */}
      {alertInfo && (
        <Alert
          message={alertInfo.message}
          type={alertInfo.type}
          onClose={() => setAlertInfo(null)}
        />
      )}
      <div className="bg-gray-200 px-5 mb-8 sm:mb-15 w-full shadow-md drop-shadow-sm rounded-lg inset-shadow-md">
        <div className="py-3 font-montserrat">
          <div className="flex flex-col justify-around gap-3">
            {/* Header - Hidden on small screens */}
            <div className="hidden sm:flex justify-between items-center">
              <h1 className="text-base font-montserrat font-semibold text-gray-500">
                <i className="fas fa-calendar-check text-blue-500 text-lg mr-3"></i>
                Tell us when — your perfect stay awaits you.
              </h1>
            </div>

            {/* Form Section */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full">
              {/* Arrival Date */}
              <div className="flex flex-col w-full sm:min-w-[150px] sm:flex-grow bg-white px-6 py-4">
                <label
                  htmlFor="arrival"
                  className="text-sm font-medium tracking-tight mb-1"
                >
                  Arrival Date
                </label>
                <DatePicker
                  id="arrival"
                  selected={arrivalDate}
                  onChange={(date: Date) => setArrivalDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="border-b-2 outline-0 italic cursor-pointer text-lg"
                  placeholderText="Select arrival date"
                  minDate={new Date()}
                />
              </div>

              {/* Departure Date */}
              <div className="flex flex-col w-full sm:min-w-[150px] sm:flex-grow bg-white px-6 py-4">
                <label
                  htmlFor="departure"
                  className="text-sm font-medium tracking-tight mb-1"
                >
                  Departure Date
                </label>
                <DatePicker
                  id="departure"
                  selected={departureDate}
                  onChange={(date: Date) => setDepartureDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="border-b-2 outline-0 italic cursor-pointer text-lg"
                  placeholderText="Select departure date"
                  minDate={new Date()}
                />
              </div>

              {/* Search Button */}
              <div className="flex flex-col w-full sm:min-w-[150px] sm:flex-grow">
                <button
                  onClick={handleCheckAvailability}
                  className="p-7 rounded-md flex-1 bg-blue-600 uppercase font-semibold transition duration-300 cursor-pointer text-xl text-white w-full hover:bg-blue-700"
                >
                  <div className="flex items-center justify-center gap-2">
                    <CalendarRange size={35} />
                    <span>Check Availability</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomAvailabilityCalendar;
