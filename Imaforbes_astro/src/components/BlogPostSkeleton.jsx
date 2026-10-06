// src/components/BlogPostSkeleton.jsx
import React from "react";
import { motion } from "framer-motion";

const BlogPostSkeleton = () => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl shadow-lg bg-background/50 dark:bg-background/50 backdrop-blur-sm border border-strong/50 dark:border-strong/30 p-6 sm:p-8 space-y-6"
    >
      {/* Image Skeleton */}
      <div className="w-full h-48 sm:h-64 md:h-80 bg-background/50 dark:bg-background/50 rounded-2xl animate-pulse" />

      {/* Header Skeleton */}
      <div className="flex items-start gap-3">
        <div className="p-2 sm:p-3 bg-background/50 dark:bg-background/50 rounded-2xl w-12 h-12 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-background/50 dark:bg-background/50 rounded w-3/4 animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-4 bg-background/50 dark:bg-background/50 rounded w-20 animate-pulse" />
            <div className="h-4 bg-background/50 dark:bg-background/50 rounded w-24 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-3">
        <div className="h-4 bg-background/50 dark:bg-background/50 rounded w-full animate-pulse" />
        <div className="h-4 bg-background/50 dark:bg-background/50 rounded w-full animate-pulse" />
        <div className="h-4 bg-background/50 dark:bg-background/50 rounded w-5/6 animate-pulse" />
        <div className="h-4 bg-background/50 dark:bg-background/50 rounded w-full animate-pulse" />
        <div className="h-4 bg-background/50 dark:bg-background/50 rounded w-4/6 animate-pulse" />
      </div>
    </motion.article>
  );
};

export default BlogPostSkeleton;

