import { AnimatePresence, motion } from "framer-motion";
import { FC, memo, useCallback, useEffect, useRef } from "react";

interface NotificationProps {
  icon?: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Notification: FC<NotificationProps> = memo(({
  icon,
  message,
  type = 'info',
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    clearTimer();
    onClose();
  }, [onClose, clearTimer]);

  useEffect(() => {
    if (autoClose) {
      timerRef.current = window.setTimeout(() => {
        handleClose();
      }, duration);
    }

    return clearTimer;
  }, [autoClose, duration, handleClose, clearTimer]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed z-50 top-4 right-4 p-4 rounded-lg shadow-md border ${getTypeStyles()} max-w-sm`}
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start">
          {icon && <i className={`${icon} mr-3 text-lg`}></i>}
          <div className="flex-1">{message}</div>
          <button
            onClick={handleClose}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

Notification.displayName = 'Notification';

export default Notification;