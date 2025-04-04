import { motion } from "framer-motion";
import { FC, memo } from "react";

interface ContentLoaderProps {
    height?: string;
}

const ContentLoader: FC<ContentLoaderProps> = ({ height = "200px" }) => {
    return (
        <div className={`w-full flex items-center justify-center`} style={{ height }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
                <svg
                    className="w-8 h-8 text-violet-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                </svg>
            </motion.div>
        </div>
    );
};

export default memo(ContentLoader); 