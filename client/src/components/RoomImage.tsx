import deluxe_single from "../assets/deluxe_single.webp";

const RoomImage = () => {
  return (
    <div className="bg-white p-0 lg:p-10 mt-0 lg:mt-10 flex flex-col items-center">
      <div className="w-full max-w-[1200px]">
        {/* Text Container (Now Above the Image) */}
        <div className="w-full bg-gray-100 bg-opacity-95 p-6 md:p-9 text-center">
          <p className="text-xs md:text-sm font-semibold text-gray-500 font-montserrat tracking-widest leading-relaxed">
            Premium Rooms
          </p>
          <h2 className="text-4xl md:text-5xl font-medium text-gray-900 font-playfair tracking-wider">
            Deluxe Room
          </h2>
        </div>

        {/* Image */}
        <img
          src={deluxe_single}
          alt="Deluxe Room"
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
};

export default RoomImage;
