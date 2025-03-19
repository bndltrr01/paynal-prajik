import resort from "../assets/resort.jpg";
import { motion } from "framer-motion";

const Promotion = () => {
  const headingText = "Unparalleled luxury, timeless comfort";
  const headingWords = headingText.split(" ");

  const paragraphText = "Elevate the guest experience with a seamless and sophisticated hotel management solution. Designed for premium resorts and luxury accommodations, it streamlines operations while delivering unparalleled comfort, efficiency, and elegance.";
  const pWords = paragraphText.split(" ");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: 0.5,
        staggerChildren: 0.1,
      },
    }
  };

  const wordVariants = {
    hidden: (custom: number) => ({
      opacity: 0,
      x: custom % 2 === 0 ? -50 : 50,
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    }
  };

  const paragraphVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.5 },
    }),
  };

  const imageVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  }

  return (
    <>
      <div className="flex flex-col md:flex-row items-center p-8">
        <div className="md:w-1/2 w-full flex justify-center">
          <motion.img
            src={resort}
            alt="Luxury Hotel Experience"
            variants={imageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.2 }}
            className="rounded-lg shadow-md w-full md:w-[90%]"
          />
        </div>

        <div className="md:w-1/2 w-full text-center md:text-left">
          <div className="py-10">
            <motion.h2 
              className="text-9xl text-gray-900 mb-10 font-playfair font-medium"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ amount: 0.2 }}
            >
              {headingWords.map((word, index) => (
                <motion.span
                  key={index}
                  custom={index}
                  variants={wordVariants}
                  className="inline-block mr-2"
                >
                  {word}
                </motion.span>
              ))}
            </motion.h2>
            <motion.p 
              className="text-gray-500 text-lg font-montserrat font-medium"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ amount: 0.2 }}
            >
              {pWords.map((word, index) => (
                <motion.span
                  key={index}
                  custom={index}
                  variants={paragraphVariants}
                  className="inline-block mr-2"
                >
                  {word}
                </motion.span>
              ))}
            </motion.p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Promotion;
