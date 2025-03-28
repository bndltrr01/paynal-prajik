import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <motion.div
        className="text-center max-w-lg mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Error Code */}
        <motion.div
          className="relative mb-8"
          variants={itemVariants}
        >
          <motion.h1
            className="text-[150px] sm:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 leading-none"
            animate={{
              textShadow: ["0 0 5px rgba(66, 153, 225, 0.5)", "0 0 20px rgba(66, 153, 225, 0.2)", "0 0 5px rgba(66, 153, 225, 0.5)"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            404
          </motion.h1>

          <motion.div
            className="absolute -top-10 right-0 sm:right-10"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          >
            <span className="text-6xl">👀</span>
          </motion.div>
        </motion.div>

        {/* Text Content */}
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4"
          variants={itemVariants}
        >
          Page Not Found
        </motion.h2>

        <motion.p
          className="text-gray-600 text-lg mb-8"
          variants={itemVariants}
        >
          The page you are looking for doesn't exist or has been moved.
        </motion.p>

        {/* Button */}
        <motion.button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl"
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          Return to Homepage
        </motion.button>

        {/* Decorative Elements */}
        <div className="absolute pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-70"
              style={{
                width: Math.random() * 30 + 10,
                height: Math.random() * 30 + 10,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: i % 2 === 0 ? '#6366F1' : '#8B5CF6',
              }}
              animate={{
                y: [0, Math.random() * 100 - 50, 0],
                x: [0, Math.random() * 100 - 50, 0],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;