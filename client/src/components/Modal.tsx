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
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex flex-col items-center">
                {icon && (
                  <div className="w-16 h-16 flex items-center justify-center text-3xl bg-gray-100 rounded-full mb-4">
                    <i className={icon}></i>
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-800 text-center">
                  {title}
                </h3>
                {description && (
                  <p className="mt-2 text-gray-600 text-center">
                    {description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-evenly p-4 space-x-2 border-t border-gray-200">
              <button
                type="button"
                onClick={cancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md uppercase font-bold hover:bg-gray-300 transition-all duration-300 cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={className}
                disabled={loading}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(Modal);
