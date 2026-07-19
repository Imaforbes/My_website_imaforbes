// src/components/LoadingSpinner.jsx
import React, { memo } from "react";
import { motion } from "framer-motion";

const LoadingSpinner = memo(({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-white rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
