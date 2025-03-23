import RoomHero from "../layout/RoomHero";
import RoomList from "../components/rooms/RoomList";
import RoomFeatures from "../components/rooms/RoomFeatures";
import RoomIncluded from "../components/rooms/RoomIncluded";
import RoomAbout from "../components/rooms/RoomAbout";
import { Suspense, lazy } from "react";

const LoadingHydrate = lazy(() => import("../motions/loaders/LoadingHydrate"));

const Rooms = () => {
  return (
    <Suspense fallback={<LoadingHydrate />}>
      <RoomHero />
      <RoomFeatures />
      <RoomAbout />
      <RoomIncluded />
      <RoomList />
    </Suspense>
  );
};

export default Rooms;
