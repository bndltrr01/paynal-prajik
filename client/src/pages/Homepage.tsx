import AboutUs from "./AboutUs";
import Promotion from "../components/Promotion";
import Values from "../components/Values";
import Footer from "../layout/Footer";
import Hero from "../layout/Hero";

const Homepage = () => {
  return (
    <section>
      <Hero />
      <Promotion />
      <AboutUs />
      <Values />
      <Footer />
    </section>
  );
};

export default Homepage;
