import withSuspense from "../hoc/withSuspense";
import RoomAbout from "./visitors/rooms/RoomAbout";
import RoomFeatures from "./visitors/rooms/RoomFeatures";
import RoomHero from "./visitors/rooms/RoomHero";
import RoomIncluded from "./visitors/rooms/RoomIncluded";
import RoomList from "./visitors/rooms/RoomList";

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

export default withSuspense(Rooms, { height: "300px" });
