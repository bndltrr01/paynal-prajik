import { motion } from "framer-motion";
import room_bg from "../../../assets/room_bg.jpg";

const RoomHero = () => {
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

  const headingText = "Discover Your Perfect Stay".split(" ");
  const paragraphText = "Experience a blend of elegance and comfort in our beautifully designed rooms. Whether for a relaxing getaway or a business trip, our suites offer an unforgettable experience filled with style and modern amenities.".split(" ");

  return (
    <>
      <section
        className="h-screen bg-cover bg-center relative before:absolute before:inset-0 before:bg-black/60 before:z-0"
        style={{ backgroundImage: `url(${room_bg})` }}
      >
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-28">
          <h1 className="text-white text-6xl font-bold leading-tight drop-shadow-md font-playfair perspective-[1000px]">
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
    </>
  );
};

export default RoomHero;
