import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

interface CancellationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    bookingId?: string | number;
}

const CancellationModal = ({ isOpen, onClose, onConfirm, bookingId }: CancellationModalProps) => {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (!reason.trim()) {
            setError('Please provide a reason for cancellation');
            return;
        }
        setError('');
        setIsSubmitting(true);
        onConfirm(reason);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        key="modal-content"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
                    >
                        <h2 className="text-xl font-bold mb-4">Cancel Reservation</h2>

                        {bookingId && (
                            <p className="text-sm text-gray-500 mb-3">
                                Booking ID: {bookingId}
                            </p>
                        )}

                        <p className="text-gray-600 mb-4">
                            Are you sure you want to cancel your reservation? Please provide a reason for cancellation:
                        </p>

                        <div className="mb-4">
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                                Reason for Cancellation <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="reason"
                                rows={4}
                                className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 resize-none focus:ring-blue-500`}
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    if (e.target.value.trim()) setError('');
                                }}
                                placeholder="Please explain why you're cancelling this reservation..."
                            />
                            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                        </div>

                        <div className="flex justify-between mt-6">
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-2 bg-red-600 text-white rounded-md ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'} transition-colors`}
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm Cancellation'}
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 mt-4">
                            Please note: Cancellations may be subject to a fee based on our policy.
                            View our <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a> for more information.
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CancellationModal;