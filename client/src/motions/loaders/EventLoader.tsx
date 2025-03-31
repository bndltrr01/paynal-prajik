import { motion } from "framer-motion";
import { FC } from "react";

interface LoaderProps {
  size?: string;
  text?: string;
  type?: "default" | "reserve" | "checkin" | "checkout" | "noshow";
}

const EventLoader: FC<LoaderProps> = ({
  size = "80px",
  text = "Processing...",
  type = "default"
}) => {
  const getColors = () => {
    switch (type) {
      case "reserve":
        return ["#4f46e5", "#10b981"];
      case "checkin":
        return ["#3b82f6", "#60a5fa"];
      case "checkout":
        return ["#8b5cf6", "#a78bfa"];
      case "noshow":
        return ["#d97706", "#fbbf24"];
      default:
        return ["#4f46e5", "#6366f1"];
    }
  };

  const [primaryColor, secondaryColor] = getColors();
  const repeatType = "reverse" as const;

  // Background gradient animation
  const bgVariants = {
    animate: {
      background: [
        `radial-gradient(circle at 50% 50%, ${primaryColor}20 0%, transparent 70%)`,
        `radial-gradient(circle at 60% 40%, ${secondaryColor}25 0%, transparent 70%)`,
        `radial-gradient(circle at 40% 60%, ${primaryColor}20 0%, transparent 70%)`
      ],
      transition: {
        duration: 5,
        repeat: Infinity,
        repeatType,
        ease: "easeInOut"
      }
    }
  };

  const textVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.3
      }
    }
  };

  const bubbleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: (i: number) => ({
      scale: [0, 1, 0],
      opacity: [0, 0.7, 0],
      y: [0, -(30 + Math.random() * 50)],
      x: [0, (Math.random() * 20) - 10],
      transition: {
        duration: 2 + Math.random(),
        repeat: Infinity,
        delay: Math.random() * 2 + i * 0.2
      }
    })
  };

  const planetVariants = {
    initial: { scale: 0, opacity: 0, rotate: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      rotate: 360,
      transition: {
        scale: { duration: 0.5, ease: "easeOut" },
        opacity: { duration: 0.5, ease: "easeOut" },
        rotate: {
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }
      }
    }
  };

  const orbitPathVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: [0.1, 0.2, 0.1],
      scale: 1,
      transition: {
        opacity: {
          duration: 3,
          repeat: Infinity,
          repeatType,
          ease: "easeInOut"
        },
        scale: {
          duration: 1,
          ease: "easeOut"
        }
      }
    }
  };

  const moonOrbitVariants = {
    initial: { rotate: 0, opacity: 0 },
    animate: {
      rotate: 360,
      opacity: 1,
      transition: {
        rotate: {
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        },
        opacity: {
          duration: 0.5,
          ease: "easeOut"
        }
      }
    }
  };

  const moonVariants = {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden z-[9999]">
      {/* Dark overlay underneath everything for maximum contrast */}
      <div className="absolute inset-0 bg-black/70 z-0" />

      {/* Backdrop blur layer */}
      <div className="absolute inset-0 backdrop-blur-2xl z-10" />

      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 z-20"
        initial="initial"
        animate="animate"
        variants={bgVariants}
      />

      {/* Main animation container */}
      <div className="relative z-30" style={{ width: size, height: size }}>
        {/* Orbit paths */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-opacity-20"
          style={{
            width: `calc(${size} * 1.8)`,
            height: `calc(${size} * 1.8)`,
            borderColor: primaryColor
          }}
          initial="initial"
          animate="animate"
          variants={orbitPathVariants}
        />

        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-opacity-20"
          style={{
            width: `calc(${size} * 1.4)`,
            height: `calc(${size} * 1.4)`,
            borderColor: secondaryColor
          }}
          initial="initial"
          animate="animate"
          variants={orbitPathVariants}
        />

        {/* Central planet */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg flex items-center justify-center"
          style={{
            width: `calc(${size} * 0.35)`,
            height: `calc(${size} * 0.35)`,
            background: `radial-gradient(circle at 30% 30%, ${primaryColor}, ${secondaryColor})`
          }}
          initial="initial"
          animate="animate"
          variants={planetVariants}
        >
          {/* Inner glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: `0 0 15px 5px ${primaryColor}70`
            }}
            animate={{
              boxShadow: [
                `0 0 15px 5px ${primaryColor}40`,
                `0 0 20px 8px ${primaryColor}70`,
                `0 0 15px 5px ${primaryColor}40`
              ],
              transition: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          />
        </motion.div>

        {/* Orbiting objects */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: `calc(${size} * 1.8)`,
            height: `calc(${size} * 1.8)`
          }}
          initial="initial"
          animate="animate"
          variants={moonOrbitVariants}
        >
          <motion.div
            className="absolute rounded-full shadow-lg"
            style={{
              top: "0%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: `calc(${size} * 0.15)`,
              height: `calc(${size} * 0.15)`,
              background: secondaryColor
            }}
            variants={moonVariants}
          />
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: `calc(${size} * 1.4)`,
            height: `calc(${size} * 1.4)`,
            rotate: "120deg"
          }}
          initial="initial"
          animate="animate"
          variants={moonOrbitVariants}
          custom={2}
        >
          <motion.div
            className="absolute rounded-full shadow-lg"
            style={{
              top: "0%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: `calc(${size} * 0.1)`,
              height: `calc(${size} * 0.1)`,
              background: primaryColor
            }}
            variants={moonVariants}
          />
        </motion.div>

        {/* Rising bubbles */}
        <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={`bubble-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${10 + Math.random() * 80}%`,
                bottom: "10%",
                width: `calc(${size} * ${0.03 + Math.random() * 0.06})`,
                height: `calc(${size} * ${0.03 + Math.random() * 0.06})`,
                background: i % 2 === 0 ? primaryColor : secondaryColor,
                opacity: 0.7
              }}
              initial="initial"
              animate="animate"
              variants={bubbleVariants}
              custom={i}
            />
          ))}
        </div>
      </div>

      {/* Text */}
      {text && (
        <motion.div
          className="relative z-30 mt-8"
          initial="initial"
          animate="animate"
          variants={textVariants}
        >
          <div
            className="text-center font-medium text-xl"
            style={{ color: "white", textShadow: `0 2px 10px ${primaryColor}90` }}
          >
            {text}
          </div>
          <div className="flex justify-center mt-2 space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`dot-${i}`}
                className="h-2 w-2 rounded-full"
                style={{ background: secondaryColor }}
                animate={{
                  opacity: [0.4, 1, 0.4],
                  scale: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EventLoader;
