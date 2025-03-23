import RoomAvailabilityCalendar from "../components/rooms/RoomAvailabilityCalendar";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { slides } from "../constants/HomepageHeroSlides";

const Hero = () => {
  return (
    <section className="relative w-full h-screen">
      <Swiper
        modules={[Autoplay]}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className="h-screen bg-cover bg-center relative before:absolute before:inset-0 before:bg-black/60 before:z-0"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="flex flex-col justify-center items-center h-screen z-10 relative text-center px-6 sm:px-12 md:px-20">
                <div className="text-white max-w-4xl">
                  <h1 className="font-playfair mb-4 text-[clamp(2rem,4vw,3.5rem)] leading-tight">
                    {slide.heading}
                  </h1>
                  <p className="font-montserrat text-[clamp(1.1rem,1.4vw,1.3rem)] leading-relaxed">
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute bottom-10 w-full flex justify-center z-20">
        <div className="lg:w-9/12 xl:w-8/12 2xl:w-7/12">
          <RoomAvailabilityCalendar />
        </div>
      </div>
    </section>
  );
};

export default Hero;
