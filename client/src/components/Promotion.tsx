import resort from "../assets/resort.jpg";

const Promotion = () => {
  return (
    <div className=" bg-gray-50">
      <div className="flex flex-col md:flex-row items-center p-8 mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16 2xl:mx-20">
        {/* Image - Fluid Scaling */}
        <div className="w-full md:w-[750px] md:h-[620px] flex justify-center mb-8 md:mb-0 md:mr-8">
          <img
            src={resort}
            alt="Luxury Hotel Experience"
            className="rounded-lg shadow-md w-full md:w-auto h-auto object-cover"
            loading="lazy"
            width="750"
            height="620"
          />
        </div>

        {/* Text Content */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <div className="py-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl text-gray-900 mb-6 font-playfair font-medium">
              Unparalleled luxury, timeless comfort
            </h2>
            <p className="text-gray-600 font-montserrat text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed">
              Elevate the guest experience with a seamless and sophisticated
              hotel management solution. Designed for premium resorts and luxury
              accommodations, it streamlines operations while delivering
              unparalleled comfort, efficiency, and elegance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotion;
