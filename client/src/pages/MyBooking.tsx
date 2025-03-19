import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import BookingData from "../components/bookings/BookingData";

const MyBooking = () => {
  return (
    <>
      <div className="bg-gray-50">
        <Navbar />
        <div className="w-full my-20 ">
          <BookingData />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default MyBooking;
