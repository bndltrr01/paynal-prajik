import room_bg from "../assets/room_bg.jpg";

const RoomHero = () => {
  return (
    <>
      <section
        className="h-screen bg-cover bg-center relative before:absolute before:inset-0 before:bg-black/60 before:z-0"
        style={{ backgroundImage: `url(${room_bg})` }}
      >
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-28">
          <h1 className="text-white text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight drop-shadow-md font-playfair">
            Discover Your Perfect Stay
          </h1>
          <p className="text-white mt-4  text-[clamp(1.1rem,1.4vw,1.3rem)] max-w-3xl leading-relaxed drop-shadow-sm font-montserrat">
            Experience a blend of elegance and comfort in our beautifully
            designed rooms. Whether for a relaxing getaway or a business trip,
            our suites offer an unforgettable experience filled with style and
            modern amenities.
          </p>
        </div>
      </section>
    </>
  );
};

export default RoomHero;
