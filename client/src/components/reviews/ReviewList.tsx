import { motion } from "framer-motion";
import { Star, User } from "lucide-react";
import { ReviewData } from "../../services/Booking";

interface ReviewListProps {
    reviews: ReviewData[];
    isLoading: boolean;
    error: Error | null;
}

const ReviewList = ({ reviews, isLoading, error }: ReviewListProps) => {
    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-lg text-red-600">
                <p>Error loading reviews: {error.message}</p>
            </div>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
                <p className="text-gray-500 font-medium">No reviews yet</p>
                <p className="text-gray-400 mt-2">Be the first to leave a review!</p>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const reviewVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 200
            }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {reviews.map((review) => (
                <motion.div
                    key={review.id}
                    variants={reviewVariants}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {review.user_profile_image ? (
                                    <img
                                        src={review.user_profile_image}
                                        alt={review.user_name || "Guest"}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <User size={20} className="text-blue-600" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-gray-900">{review.user_name || "Anonymous"}</p>
                                    <p className="text-sm text-gray-500">{review.formatted_date || "Unknown date"}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={18}
                                        className={`${star <= (review.rating || 0)
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-gray-300"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-gray-700">{review.review_text}</p>
                        </div>
                        {review.booking_details && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-sm text-gray-500">
                                    <span className="font-medium">
                                        {review.booking_details.type === "room" ? "Room" : "Venue"}:
                                    </span>{" "}
                                    {review.booking_details.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    <span className="font-medium">Stay:</span>{" "}
                                    {new Date(review.booking_details.check_in_date).toLocaleDateString()} -{" "}
                                    {new Date(review.booking_details.check_out_date).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default ReviewList; 