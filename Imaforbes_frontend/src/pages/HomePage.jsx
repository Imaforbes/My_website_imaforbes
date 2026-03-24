// src/pages/HomePage.jsx
/**
 * HomePage - Minimalist & Deluxe Design
 * 
 * DESIGN CHANGES:
 * - Removed animated blob backgrounds for clean, minimal look
 * - Changed from colorful gradients (blue/teal/purple) to neutral colors (black/white/grays)
 * - Updated typography to font-light for refined, elegant feel
 * - Added text reflection effect to main title for deluxe touch
 * - Simplified animations (subtle fade-in instead of spring animations)
 * - Clean button styles: black fill or border-only for minimalist aesthetic
 */
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowRight, FiMail, FiCode, FiStar } from "react-icons/fi";
import { useTranslation } from "react-i18next";

// Minimalist Hero Background
// Removed animated blob backgrounds - replaced with clean, subtle overlay
const HeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    {/* Clean background image with subtle overlay */}
    <img
      src="/img/baner.jpg"
      alt="Banner"
      width="1920"
      height="1080"
      className="w-full h-full object-cover opacity-40 dark:opacity-20"
    />
    {/* Minimal overlay for text readability */}
    <div className="absolute inset-0 bg-white/50 dark:bg-black/30"></div>
  </div>
);

const HomePage = () => {
  const { t } = useTranslation();
  
  // Minimalist animation variants
  // Simplified from spring animations to smooth fade-in for cleaner feel
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <HeroBackground />
      <div className="relative z-10 text-center max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center"
        >
          {/* Main Title - Clean and elegant with subtle reflection */}
          {/* Changed from gradient text to solid with reflection effect for deluxe feel */}
          <motion.h1
            variants={titleVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light mb-6 sm:mb-8 leading-tight tracking-tight text-gray-900 dark:text-white text-reflection"
            data-text={t("home.title")}
          >
            {t("home.title")}
          </motion.h1>

          {/* Subtitle - Minimalist */}
          <motion.h2
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light mb-8 sm:mb-10 text-gray-600 dark:text-gray-400 tracking-wide"
          >
            {t("home.subtitle")}
          </motion.h2>

          {/* Description - Clean typography */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-12 sm:mb-16 max-w-2xl mx-auto leading-relaxed px-4 font-light"
          >
            {t("home.description")}
          </motion.p>

          {/* Action Buttons - Minimalist design */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 w-full max-w-xl mx-auto"
          >
            <motion.div
              variants={buttonVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/projects"
                className="group flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-black dark:bg-white text-white dark:text-black text-sm sm:text-base font-medium tracking-wide transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 w-full sm:w-auto rounded-2xl"
              >
                <FiCode className="text-lg sm:text-xl" />
                <span>{t("home.view-projects")}</span>
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div
              variants={buttonVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/contact"
                className="flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-transparent border border-gray-900 dark:border-white text-gray-900 dark:text-white text-sm sm:text-base font-medium tracking-wide transition-all duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:ring-offset-2 w-full sm:w-auto rounded-2xl"
              >
                <FiMail className="text-lg sm:text-xl" />
                <span>{t("home.contact")}</span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomePage;
