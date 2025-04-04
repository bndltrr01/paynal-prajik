import { Suspense } from "react";
import Hero from "../layout/Hero";
import LoadingHydrate from "../motions/loaders/LoadingHydrate";
import AboutUs from "./visitors/home/AboutUs";
import Promotion from "./visitors/home/Promotion";
import Values from "./visitors/home/Values";

const Homepage = () => {
  return (
    <Suspense fallback={<LoadingHydrate />} >
      <Hero />
      <Promotion />
      <AboutUs />
      <Values />
    </Suspense>
  );
};

export default Homepage;
