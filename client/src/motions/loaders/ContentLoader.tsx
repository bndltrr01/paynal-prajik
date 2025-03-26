import { motion } from "framer-motion";
import { FC } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface ContentLoaderProps {
    type?: "card" | "table" | "list" | "text";
    count?: number;
}

const ContentLoader: FC<ContentLoaderProps> = ({ type = "card", count = 3 }) => {
    const renderSkeleton = () => {
        switch (type) {
            case "card":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array(count)
                            .fill(0)
                            .map((_, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm p-4">
                                    <Skeleton height={150} className="mb-3" />
                                    <Skeleton count={1} height={24} className="mb-2" />
                                    <Skeleton count={2} height={16} className="mb-2" />
                                    <div className="flex justify-between mt-3">
                                        <Skeleton width={80} height={30} />
                                        <Skeleton width={80} height={30} />
                                    </div>
                                </div>
                            ))}
                    </div>
                );

            case "table":
                return (
                    <div className="w-full overflow-hidden rounded-lg">
                        <Skeleton height={40} className="mb-2" />
                        {Array(count)
                            .fill(0)
                            .map((_, index) => (
                                <Skeleton key={index} height={50} className="mb-1" />
                            ))}
                    </div>
                );

            case "list":
                return (
                    <div className="w-full">
                        {Array(count)
                            .fill(0)
                            .map((_, index) => (
                                <div key={index} className="flex items-center mb-3 p-2 bg-white rounded-lg">
                                    <Skeleton circle width={40} height={40} className="mr-3" />
                                    <div className="flex-1">
                                        <Skeleton count={1} height={16} className="mb-1" />
                                        <Skeleton count={1} height={12} width="60%" />
                                    </div>
                                </div>
                            ))}
                    </div>
                );

            case "text":
            default:
                return (
                    <div className="w-full max-w-2xl">
                        <Skeleton count={count} height={20} className="mb-2" />
                    </div>
                );
        }
    };

    return (
        <motion.div
            className="p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {renderSkeleton()}
        </motion.div>
    );
};

export default ContentLoader; 