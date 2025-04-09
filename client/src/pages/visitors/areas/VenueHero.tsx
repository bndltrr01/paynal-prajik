import { motion } from "framer-motion";
import reservation_bg from "../../../assets/reservation_bg.jpg";

const VenueHero = () => {
  const headingVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      rotateX: 70,
      scale: 0.9
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        type: "spring",
        stiffness: 100,
        damping: 8
      }
    })
  };

  const paragraphVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: 0.8 + (i * 0.02),
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };

  const headingText = "Reserve the Perfect Area for Your Event".split(" ");
  const paragraphText = "Make every occasion special with our exclusive area reservations. Whether it's a private celebration, business event, or family gathering, we offer elegant spaces tailored to your needs, complete with modern amenities and exceptional service.".split(" ");

  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${reservation_bg})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-28">
        {/* Title */}
        <h1 className="text-white text-5xl font-bold leading-tight drop-shadow-md font-playfair perspective-[1000px]">
          {headingText.map((word, index) => (
            <motion.span
              key={`head-${index}`}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={headingVariants}
              className="inline-block mr-[0.25em] origin-top transform-gpu"
              style={{ transformStyle: "preserve-3d" }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Description */}
        <p className="text-white mt-4 text-xl max-w-3xl leading-relaxed drop-shadow-sm font-montserrat flex flex-wrap justify-center">
          {paragraphText.map((word, index) => (
            <motion.span
              key={`para-${index}`}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={paragraphVariants}
              className="inline-block mr-[0.3em]"
            >
              {word}
            </motion.span>
          ))}
        </p>
      </div>
    </section>
  );
};

export default VenueHero;
