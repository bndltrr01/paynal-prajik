const RoomAmenities = () => {
  return (
    <div className="bg-gray-100 p-6 md:p-10 rounded-lg shadow-sm w-full max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-playfair font-semibold mb-4">Amenities</h2>
      <hr className="border-gray-300 mb-4" />
      <div className="grid grid-cols-3 gap-4 text-gray-700">
        <div className="flex items-center gap-2">
          <i className="fas fa-snowflake text-lg text-blue-500"></i>
          <span>Air Conditioner</span>
        </div>
        <div className="flex items-center gap-2">
          <i className="fas fa-wifi text-lg text-yellow-500"></i>
          <span>High-Speed WiFi</span>
        </div>
        <div className="flex items-center gap-2">
          <i className="fas fa-shower text-lg text-green-500"></i>
          <span>Shower</span>
        </div>
      </div>
    </div>
  );
};

export default RoomAmenities;
