const RoomAbout = () => {
  return (
    <section className="py-16 px-4 sm:px-8 md:px-16 lg:px-32 bg-white text-center">
      {/* Small Title with Icon */}
      <div className="flex flex-col justify-center items-center mb-6">
        <i className="fa fa-moon text-2xl sm:text-3xl text-blue-800 mb-3"></i>
        <h3 className="text-gray-500 uppercase tracking-widest text-sm sm:text-base md:text-lg">
          Hotel Rooms
        </h3>
      </div>

      {/* Main Heading */}
      <h1
        className="font-playfair font-bold text-gray-900 mb-6 leading-tight"
        style={{
          fontSize: "clamp(2rem, 5vw, 3.8rem)",
          lineHeight: "1.2",
        }}
      >
        A Blend of Comfort and Elegance
      </h1>

      {/* Description */}
      <p
        className="text-gray-600 font-montserrat mx-auto mb-10"
        style={{
          maxWidth: "70ch",
          fontSize: "clamp(1rem, 2.5vw, 1.35rem)",
          lineHeight: "1.7",
        }}
      >
        Our rooms are designed to offer a peaceful retreat with a perfect mix of
        style and comfort. Enjoy a restful stay enhanced by modern amenities and
        thoughtful details, all crafted to make you feel at home.
      </p>

      {/* Button */}
      <button className="relative inline-flex items-center text-blue-800 hover:text-blue-900 font-semibold text-lg tracking-wide group">
        View Rooms
        <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">
          &rarr;
        </span>
        <span className="absolute left-0 bottom-[-4px] w-full h-[1px] bg-blue-800"></span>
      </button>
    </section>
  );
};

export default RoomAbout;
