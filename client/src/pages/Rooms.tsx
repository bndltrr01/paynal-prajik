import RoomAbout from "../components/rooms/RoomAbout";
import RoomFeatures from "../components/rooms/RoomFeatures";
import RoomIncluded from "../components/rooms/RoomIncluded";
import RoomList from "../components/rooms/RoomList";
import withSuspense from "../hoc/withSuspense";
import RoomHero from "../layout/RoomHero";

const Rooms = () => {
  return (
    <>
      <RoomHero />
      <RoomFeatures />
      <RoomAbout />
      <RoomIncluded />
      <RoomList />
    </>
  );
};

export default withSuspense(Rooms, { loaderType: "card", count: 3 });
