const RoomIncluded = () => {
  const features = [
    "Large Bathroom",
    "Fast WiFi",
    "Soft and Clean Bed Sheets",
    "Smart TV",
    "24/7 Room Service",
    "Free Breakfast",
    "Air Conditioning",
    "Work Desk",
    "Free Toiletries",
    "Safe for Valuables",
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center px-4">
        <h2 className="uppercase text-blue-800 text-base md:text-lg tracking-wide mb-8">
          All hotels rooms come with:
        </h2>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 xl:gap-4 2xl:gap-3">
          {features.map((feature, index) => (
            <span
              key={index}
              className="text-base md:text-lg lg:text-3xl xl:text-3xl 2xl:text-4xl text-gray-800 font-serif xl:px-3 2xl:px-3.5"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoomIncluded;
