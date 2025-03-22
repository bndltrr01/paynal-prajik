import { Suspense, lazy } from "react";
import VenueList from "../components/bookings/VenueList";
import VenueHero from "../layout/VenueHero";

const LoadingHydrate = lazy(() => import("../motions/loaders/LoadingHydrate"));

const Venue = () => {
  return (
    <Suspense fallback={<LoadingHydrate />} >
      <VenueHero />
      <VenueList />
    </Suspense>
  );
};

export default Venue;
