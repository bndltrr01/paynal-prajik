import { Suspense, lazy } from "react";
import Hero from "../layout/Hero";
import AboutUs from "./visitors/home/AboutUs";
import Promotion from "./visitors/home/Promotion";
import Values from "./visitors/home/Values";

const LoadingHydrate = lazy(() => import("../motions/loaders/LoadingHydrate"));

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
