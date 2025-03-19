import React from "react";
import BookingCard from "./BookingCard";
import deluxe_single from "../../assets/deluxe_single.webp";
import deluxe_double from "../../assets/deluxe_double.jpg";
import deluxe_twin from "../../assets/deluxe_twin.jpg";
import executive_king from "../../assets/executive_king.webp";
import executive_double from "../../assets/executive_double.avif";
import president_king from "../../assets/president_king.jpg";

const bookings = [
  {
    roomType: "Deluxe Twin Room",
    imageUrl: deluxe_twin,
    dates: "20 March - 22 March",
    guests: 4,
    price: 20000,
    status: "booked",
  },
  {
    roomType: "Deluxe Single Room",
    imageUrl: deluxe_single,
    dates: "25 March - 28 March",
    guests: 2,
    price: 35000,
    status: "pending",
  },
  {
    roomType: "Executive King Room",
    imageUrl: executive_king,
    dates: "5 April - 7 April",
    guests: 3,
    price: 15000,
    status: "canceled",
  },
  {
    roomType: "Executive Double Room",
    imageUrl: executive_double,
    dates: "10 April - 12 April",
    guests: 2,
    price: 25000,
    status: "checkedOut",
  },
  {
    roomType: "Presidential King Suite",
    imageUrl: president_king,
    dates: "15 April - 18 April",
    guests: 5,
    price: 50000,
    status: "booked",
  },
  // New bookings with different statuses
  {
    roomType: "Deluxe Double Room",
    imageUrl: deluxe_double,
    dates: "22 March - 25 March",
    guests: 3,
    price: 28000,
    status: "reserved", // Using the new "reserved" status
  },
  {
    roomType: "Presidential King Suite",
    imageUrl: president_king,
    dates: "1 May - 5 May",
    guests: 4,
    price: 65000,
    status: "checkedIn",
  },
  {
    roomType: "Executive King Room",
    imageUrl: executive_king,
    dates: "8 May - 10 May",
    guests: 2,
    price: 18000,
    status: "noShow",
  },
];

const BookingData: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {bookings.map((booking, index) => (
        <BookingCard key={index} {...booking} />
      ))}
    </div>
  );
};

export default BookingData;
