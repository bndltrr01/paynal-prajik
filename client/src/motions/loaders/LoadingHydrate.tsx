import { FC } from "react"
import { motion } from "framer-motion"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

const LoadingHydrate: FC = () => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-50"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="mb-8"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      >
        <svg
          className="w-16 h-16 text-violet-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v4m0 4v4m0 4v4m4-12h4m-4 4h4m-4 4h4M4 12h4m-4 4h4m-4 4h4"
          />
        </svg>
      </motion.div>

      <div className="w-full max-w-md">
        <Skeleton count={3} height={20} className="mb-4" />
        <Skeleton count={1} height={200} />
      </div>

      {/* Animated loading message */}
      <motion.div
        className="mt-8 text-gray-600 text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        Loading your experience...
      </motion.div>
    </motion.div>
  )
}

export default LoadingHydrate