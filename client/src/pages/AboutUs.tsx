import { Link } from "react-router-dom";
import aboutUs_bg from "../assets/aboutUs_bg.jpg";
import philosophy from "../assets/philosophy.jpg";

const AboutUs = () => {
  return (
    <section className="py-16 px-8 bg-white">
      {/* First Section */}
      <div className="max-w-[90%] lg:max-w-[85%] mx-auto flex flex-col md:flex-row-reverse gap-12 items-stretch mb-16">
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            loading="lazy"
            src={aboutUs_bg}
            alt="About Us"
            className="w-[90%] sm:w-[90%] md:w-full lg:w-[90%] xl:w-[85%] h-full object-cover rounded-2xl shadow-lg transition-all duration-300"
          />
        </div>
        <div className="w-full md:w-1/2  flex-col justify-center space-y-6">
          <h3 className="text-blue-800 uppercase text-sm sm:text-base md:text-lg font-light font-montserrat tracking-widest flex items-center gap-2">
            <i className="fa fa-moon"></i> About Us
          </h3>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold font-playfair text-gray-800 leading-snug">
            Experience Luxury and Comfort at Azurea Hotel
          </h1>
          <p className="text-gray-600 font-montserrat text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed">
            Discover a place where elegance meets comfort. Azurea Hotel offers
            top-notch amenities, personalized services, and a welcoming
            atmosphere that makes every stay unforgettable. Whether for business
            or leisure, Azurea is your perfect destination.
          </p>
          <button className="mt-6 inline-block font-montserrat bg-blue-800 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg rounded-full shadow-md hover:bg-blue-700 transition-all">
            More about us &rarr;
          </button>
        </div>
      </div>

      {/* Second Section */}
      <div className="max-w-[90%] lg:max-w-[85%] mx-auto flex flex-col md:flex-row gap-12 items-stretch">
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            loading="lazy"
            src={philosophy}
            alt="Our Philosophy"
            className="w-[90%] sm:w-[90%] md:w-full lg:w-[90%] xl:w-[85%] h-full object-cover rounded-2xl shadow-lg transition-all duration-300"
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
          <h3 className="text-blue-800 uppercase text-sm sm:text-base md:text-lg font-light font-montserrat tracking-widest flex items-center gap-2">
            <i className="fa fa-moon"></i> Our Philosophy
          </h3>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold font-playfair text-gray-800 leading-snug">
            Creating Memorable Experiences
          </h1>
          <p className="text-gray-600 font-montserrat text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed">
            We believe in offering more than just a place to stay. Azurea Hotel
            is a place where memories are made — whether you're on a romantic
            getaway, a family vacation, or a business trip.
          </p>
          <Link to="/availability">
            <button className="mt-6 inline-block font-montserrat bg-blue-800 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg rounded-full shadow-md hover:bg-blue-700 transition-all">
              Book with us &rarr;
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
