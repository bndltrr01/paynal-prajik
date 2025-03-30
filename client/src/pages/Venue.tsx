import VenueList from "./visitors/areas/VenueList";
import VenueHero from "./visitors/areas/VenueHero";
import withSuspense from "../hoc/withSuspense";

const Venue = () => {
  return (
    <>
      <VenueHero />
      <VenueList />
    </>
  );
};

export default withSuspense(Venue, { loaderType: "card", count: 3 });
