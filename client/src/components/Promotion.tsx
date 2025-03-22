import resort from "../assets/resort.jpg";

const Promotion = () => {
  return (
    <div className="flex flex-col md:flex-row items-center p-8 bg-gray-50">
      <div className="w-full md:w-[750px] md:h-[620px] flex justify-center">
        <img
          src={resort}
          alt="Luxury Hotel Experience"
          className="rounded-lg shadow-md w-full md:w-auto h-auto object-cover"
        />
      </div>

      {/* Text Content */}
      <div className="w-full md:w-1/2 text-center md:text-left md:pl-8">
        <div className="py-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl text-gray-900 mb-6 font-playfair font-medium">
            Unparalleled luxury, timeless comfort
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-gray-600 font-montserrat font-medium">
            Elevate the guest experience with a seamless and sophisticated hotel
            management solution. Designed for premium resorts and luxury
            accommodations, it streamlines operations while delivering
            unparalleled comfort, efficiency, and elegance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Promotion;
