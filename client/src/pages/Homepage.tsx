import { Suspense, lazy } from "react";
import Promotion from "../components/Promotion";
import Values from "../components/Values";
import Hero from "../layout/Hero";
import AboutUs from "./AboutUs";

const LoadingHydrate = lazy(() => import("../motions/loaders/LoadingHydrate"));

const Homepage = () => {
  return (
    <Suspense fallback={<LoadingHydrate />} >
      <section>
        <Hero />
        <Promotion />
        <AboutUs />
        <Values />
      </section>
    </Suspense>
  );
};

export default Homepage;
