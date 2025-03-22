import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

interface AlertProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onClose: () => void;
}

const Alert = ({ message, type, onClose }: AlertProps) => {
  const [show, setShow] = useState(true);

  // Animation variants for Framer Motion
  const alertVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // Map alert type to Tailwind CSS background colors
  let bgColor: string;
  switch (type) {
    case "success":
      bgColor = "bg-green-500";
      break;
    case "error":
      bgColor = "bg-red-500";
      break;
    case "warning":
      bgColor = "bg-yellow-500";
      break;
    default:
      bgColor = "bg-blue-500";
      break;
  }

  // Choose icon based on alert type using switch-case
  let Icon;
  switch (type) {
    case "success":
      Icon = CheckCircle;
      break;
    case "error":
      Icon = XCircle;
      break;
    case "warning":
      Icon = AlertTriangle;
      break;
    default:
      Icon = Info;
      break;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`fixed top-25 left-1/2 transform -translate-x-1/2 z-[9999] max-w-md w-full mx-4 p-4 rounded shadow-lg text-white ${bgColor}`}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={alertVariants}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Icon className="h-10 w-10 mr-1" />
              <span className="text-lg text-center">{message}</span>
            </div>
            <button onClick={() => setShow(false)} className="ml-4 focus:outline-none">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;
