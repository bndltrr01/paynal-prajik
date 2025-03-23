import deluxe_single from "../assets/deluxe_single.webp";

const RoomImage = () => {
  return (
    <div className="w-full h-screen flex justify-center items-start bg-white p-10 mt-[100px]">
      <div className="relative flex justify-center start w-full h-full max-w-[1200px]">
        {/* Image Container */}
        <div className="relative w-[600px] h-[400px] md:w-[800px] md:h-[500px] lg:w-[900px] lg:h-[550px] ">
          {/* Overlapping White Box (Fixed Size) */}
          <div className="relative top-0 left-0 my-5 lg:absolute lg:block  lg:-top-15 lg:-left-10 w-full bg-gray-50 bg-opacity-95 p-15  ">
            <p className="text-xs md:text-sm font-semibold text-gray-500">
              Premium Rooms
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Deluxe Room
            </h2>
          </div>

          {/* Image */}
          <img
            src={deluxe_single}
            alt="Deluxe Room"
            className="w-full h-full object-cover "
          />
        </div>
      </div>
    </div>
  );
};

export default RoomImage;
