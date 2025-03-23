const RoomRule = () => {
  return (
    <div className="bg-gray-100 p-6 md:p-10 rounded-lg shadow-sm w-full max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-playfair font-semibold mb-4">House Rules</h2>
      <hr className="border-gray-300 mb-4" />
      <ul className="space-y-3 text-gray-700">
        <li className="flex items-center gap-2">
          <i className="fas fa-ban text-red-500"></i>
          <span>No smoking, parties, or events.</span>
        </li>
        <li className="flex items-center gap-2">
          <i className="fas fa-clock text-blue-500"></i>
          <span>Check-in from 2 PM, check-out by 12 NN.</span>
        </li>
        <li className="flex items-center gap-2">
          <i className="fas fa-car text-gray-700"></i>
          <span>Time-to-time car parking.</span>
        </li>
      </ul>
    </div>
  );
};

export default RoomRule;
