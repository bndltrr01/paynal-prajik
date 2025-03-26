import { motion } from "framer-motion";

const PageTransitionLoader = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
            <div className="text-center">
                <motion.div
                    className="inline-block w-12 h-12 mb-4 border-4 border-blue-600 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />

                <motion.div
                    className="text-blue-600 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Loading...
                </motion.div>
            </div>
        </div>
    );
};

export default PageTransitionLoader; 