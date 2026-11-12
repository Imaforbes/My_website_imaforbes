// src/components/LazyImage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";

const LazyImage = ({ src, alt, className, priority = false, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className || ""}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-surface animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-strong border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <motion.img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        {...(priority ? { fetchPriority: "high" } : { loading: "lazy" })}
        decoding="async"
        {...props}
      />
    </div>
  );
};

export default LazyImage;
