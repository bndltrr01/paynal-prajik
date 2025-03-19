import { Link } from "react-router-dom";
import aboutUs_bg from "../assets/aboutUs_bg.jpg";
import philosophy from "../assets/philosophy.jpg";

const AboutUs = () => {
  return (
    <section className="py-12 px-6 bg-white">
      <div
        data-aos="fade-left"
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12"
      >
        <div>
          <img
            src={aboutUs_bg}
            alt="About Us"
            className="w-full h-auto rounded-2xl shadow-md"
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-blue-800 uppercase text-lg font-extralight font-montserrat tracking-widest flex items-center gap-2">
            <i className="fa fa-moon"></i> About Us
          </h3>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium font-playfair text-gray-800 leading-tight">
            Experience Luxury and Comfort at Azurea Hotel
          </h1>
          <p className="text-gray-600 font-montserrat text-base sm:text-sm lg:text-lg leading-relaxed">
            Discover a place where elegance meets comfort. Azurea Hotel offers
            top-notch amenities, personalized services, and a welcoming
            atmosphere that makes every stay unforgettable. Whether for business
            or leisure, Azurea is your perfect destination.
          </p>
          <button className="mt-4 inline-block font-montserrat bg-blue-800 text-white px-6 py-3 rounded-full shadow hover:bg-blue-700 transition-all">
            More about us &rarr;
          </button>
        </div>
      </div>

      <div
        data-aos="fade-right"
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
      >
        <div className="space-y-4">
          <h3 className="text-blue-800 uppercase text-lg font-extralight font-montserrat tracking-widest flex items-center gap-2">
            <i className="fa fa-moon"></i> Our Philosophy
          </h3>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium font-playfair text-gray-800 leading-tight">
            Creating Memorable Experiences
          </h1>
          <p className="text-gray-600 font-montserrat text-base sm:text-sm lg:text-lg leading-relaxed">
            We believe in offering more than just a place to stay. Azurea Hotel
            is a place where memories are made — whether you're on a romantic
            getaway, a family vacation, or a business trip.
          </p>
          <Link to="/availability">
            <button className="mt-4 inline-block font-montserrat bg-blue-800 text-white px-6 py-3 rounded-full shadow hover:bg-blue-700 transition-all">
              Book with us &rarr;
            </button>
          </Link>
        </div>

        <div className="order-1 md:order-2">
          <img
            src={philosophy}
            alt="Our Philosophy"
            className="w-full h-auto rounded-2xl shadow-md"
          />
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
