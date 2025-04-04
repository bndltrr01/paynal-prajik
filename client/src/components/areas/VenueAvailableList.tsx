import { useState } from "react";
import VenueAvailable from "./VenueAvailable";
import VenueModal from "../VenueModal";

import emerald_hall from "../../assets/emerald_hall.webp";
import grand_ballroom from "../../assets/grand_ballroom.avif";
import ruby_lounge from "../../assets/ruby_lounge.jpg";
import conference_hall from "../../assets/conference_hall.webp";
import rooftop_garden from "../../assets/rooftop_garden.jpg";

const VenueAvailableList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);

  const handleOpenModal = (venue) => {
    setSelectedVenue(venue);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVenue(null);
  };

  const areas = [
    {
      image: emerald_hall,
      title: "Emerald Hall",
      capacity: 120,
      price: 70000,
      available: true,
    },
    {
      image: grand_ballroom,
      title: "Grand Ballroom",
      capacity: 150,
      price: 100000,
      available: true,
    },
    {
      image: ruby_lounge,
      title: "Ruby Lounge",
      capacity: 60,
      price: 50000,
      available: true,
    },
    {
      image: conference_hall,
      title: "Conference Hall",
      capacity: 100,
      price: 60000,
      available: true,
    },
    {
      image: rooftop_garden,
      title: "Rooftop Garden",
      capacity: 80,
      price: 80000,
      available: true,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 p-6">
        {areas.map((area, index) => (
          <VenueAvailable
            key={index}
            {...area}
            onBookNow={() => handleOpenModal(area)}
          />
        ))}
      </div>

      <VenueModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        venue={selectedVenue}
      />
    </>
  );
};

export default VenueAvailableList;
