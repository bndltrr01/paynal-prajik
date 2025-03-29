import { AnimatePresence, motion } from "framer-motion";
import { FC, memo, useCallback, useEffect } from "react";

interface NotificationProps {
  icon?: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

const notificationVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 }
};

const typeStyles: Record<string, string> = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
  warning: 'bg-yellow-500 text-gray-800'
};

const Notification: FC<NotificationProps> = ({ icon, message, type, onClose }) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(handleClose, 4000);
    return () => clearTimeout(timer);
  }, [handleClose]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={`fixed bottom-4 right-4 z-[9999] w-full max-w-sm p-4 rounded-lg shadow-lg ${typeStyles[type || 'info']}`}
        variants={notificationVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start">
          {icon && (
            <div className="mr-2 flex-shrink-0">
              <i className={`${icon} text-xl`}></i>
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm">{message}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default memo(Notification);