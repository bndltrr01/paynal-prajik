import reservation_bg from "../assets/reservation_bg.jpg";

const VenueHero = () => {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${reservation_bg})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-28">
        {/* Title */}
        <h1 className="text-white text-5xl font-bold leading-tight drop-shadow-md font-playfair">
          Reserve the Perfect Area for Your Event
        </h1>

        {/* Description */}
        <p className="text-white mt-4 text-xl max-w-3xl leading-relaxed drop-shadow-sm font-montserrat">
          Make every occasion special with our exclusive area reservations.
          Whether it's a private celebration, business event, or family
          gathering, we offer elegant spaces tailored to your needs, complete
          with modern amenities and exceptional service.
        </p>
      </div>
    </section>
  );
};

export default VenueHero;
