import VenueList from "../components/bookings/VenueList";
import withSuspense from "../hoc/withSuspense";
import VenueHero from "../layout/VenueHero";

const Venue = () => {
  return (
    <>
      <VenueHero />
      <VenueList />
    </>
  );
};

export default withSuspense(Venue, { loaderType: "card", count: 3 });
