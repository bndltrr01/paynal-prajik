import { AnimatePresence, motion } from "framer-motion";
import { FC, memo, ReactNode, useCallback, useEffect } from "react";

interface ModalProps {
  icon?: string;
  title: string;
  description?: string;
  cancel: () => void;
  onConfirm: () => void;
  className?: string;
  confirmText?: ReactNode;
  cancelText?: string;
  isOpen: boolean;
  loading?: boolean;
}

const Modal: FC<ModalProps> = ({
  icon,
  title,
  description,
  cancel,
  onConfirm,
  className,
  confirmText,
  cancelText,
  isOpen,
  loading = false
}) => {
  const handleCancel = useCallback(() => {
    cancel();
  }, [cancel]);

  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    };

    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleCancel]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: -20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="p-6">
              <div className="flex flex-col items-center">
                {icon && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-16 h-16 flex items-center justify-center text-3xl bg-gray-100 rounded-full mb-4"
                  >
                    <i className={icon}></i>
                  </motion.div>
                )}
                <motion.h3
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xl font-semibold text-gray-800 text-center"
                >
                  {title}
                </motion.h3>
                {description && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-2 text-gray-600 text-center"
                  >
                    {description}
                  </motion.p>
                )}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex justify-evenly p-4 space-x-2 border-t border-gray-200"
            >
              <motion.button
                type="button"
                onClick={cancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md uppercase font-bold hover:bg-gray-300 transition-all duration-300 cursor-pointer"
              >
                {cancelText}
              </motion.button>
              <motion.button
                type="button"
                onClick={handleConfirm}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={className}
                disabled={loading}
              >
                {confirmText}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(Modal);
