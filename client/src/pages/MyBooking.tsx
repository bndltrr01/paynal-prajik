import Navbar from "../layout/Navbar";
import BookingData from "../components/bookings/BookingData";

const MyBooking = () => {
  return (
    <>
      <div className="bg-gray-50">
        <Navbar />
        <div className="w-full mt-[104px] ">
          <BookingData />
        </div>
      </div>
    </>
  );
};

export default MyBooking;
