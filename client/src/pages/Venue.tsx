import withSuspense from "../hoc/withSuspense";
import VenueHero from "./visitors/areas/VenueHero";
import VenueList from "./visitors/areas/VenueList";

const Venue = () => {
  return (
    <>
      <VenueHero />
      <VenueList />
    </>
  );
};

export default withSuspense(Venue, { height: "300px" });
