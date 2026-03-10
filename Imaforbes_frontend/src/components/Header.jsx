// src/components/Header.jsx
/**
 * Header - Minimalist & Deluxe Design
 * 
 * DESIGN CHANGES:
 * - Updated background: clean white/dark with subtle border
 * - Changed logo typography: font-light instead of font-extrabold
 * - Updated navigation links: minimalist underline indicator instead of colored background
 * - Simplified hover states: subtle color changes instead of colorful backgrounds
 * - Updated mobile menu: clean white/dark instead of dark gray
 * - Removed colorful accents, using neutral grays throughout
 */
import React, { useState, useEffect, memo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";

const Header = memo(() => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect - memoized callback
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close menu when clicking outside or on route change
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Keyboard shortcuts: Esc to close menu
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isMenuOpen]);

  const handleNavLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Unified navigation items
  const navItems = [
    { path: "/", label: "header.home" },
    { path: "/about", label: "header.about-me" },
    { path: "/projects", label: "header.proyects" },
    { path: "/blog", label: "header.blog" },
    { path: "/contact", label: "header.contact" },
  ];

  // Menu animation variants
  const menuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "tween", duration: 0.2, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { type: "tween", duration: 0.2, ease: "easeIn" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.2 },
    }),
  };

  // Unified header height - consistent across all breakpoints
  // Using standard Tailwind heights: 16 (64px), 20 (80px)
  const headerHeight = "h-16 md:h-20";
  const headerTopPosition = "top-16 md:top-20";

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-200 ${
          scrolled
            ? "bg-white dark:bg-[#0a0a0a] shadow-sm"
            : "bg-white dark:bg-[#0a0a0a] backdrop-blur-sm"
        } border-b border-gray-200 dark:border-gray-800 ${headerHeight}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <nav className="flex justify-between items-center h-full max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
          {/* Logo - Responsive sizing */}
          <Link
            to="/"
            className="text-gray-900 dark:text-white text-lg sm:text-xl md:text-2xl lg:text-2xl font-light tracking-tight hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 flex-shrink-0"
            onClick={handleNavLinkClick}
          >
            IMAFORBES
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map((link, index) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Link
                  to={link.path}
                  className={`relative text-gray-600 dark:text-gray-400 text-sm xl:text-base font-medium hover:text-gray-900 dark:hover:text-white transition-all duration-200 px-3 xl:px-4 py-2 group ${
                    location.pathname === link.path
                      ? "text-gray-900 dark:text-white font-medium"
                      : ""
                  }`}
                >
                  {t(link.label)}
                  {/* Minimalist underline */}
                  {location.pathname === link.path && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-px bg-black dark:bg-white"
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}

            {/* Language Toggle - Desktop */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="ml-2 xl:ml-4"
            >
              <LanguageToggle />
            </motion.div>

            {/* Theme Toggle - Desktop */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="ml-2 xl:ml-4"
            >
              <ThemeToggle />
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-gray-800 dark:text-gray-200 focus:outline-none p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors duration-200"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X size={24} className="text-gray-800 dark:text-gray-200" />
            ) : (
              <Menu size={24} className="text-gray-800 dark:text-gray-200" />
            )}
          </button>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Mobile Menu Panel */}
            <motion.nav
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={menuVariants}
              className={`lg:hidden bg-white dark:bg-[#0a0a0a] fixed ${headerTopPosition} left-0 right-0 w-full flex flex-col overflow-y-auto z-50 border-t border-gray-200 dark:border-gray-800 shadow-sm mobile-menu-nav`}
              onTouchMove={(e) => e.stopPropagation()} // Prevent body scroll when menu is open
            >
              <div className="flex flex-col py-4 px-4 space-y-1">
                {navItems.map((link, index) => (
                  <motion.div key={link.path} variants={itemVariants} onClick={handleNavLinkClick}>
                    <Link
                      to={link.path}
                      className={`block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#0f0f0f] active:bg-gray-100 dark:active:bg-[#0f0f0f] transition-all duration-200 px-4 py-3 w-full text-left ${
                        location.pathname === link.path
                          ? "text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-[#0f0f0f]"
                          : ""
                      }`}
                    >
                      {t(link.label)}
                    </Link>
                  </motion.div>
                ))}

                {/* Language Toggle - Mobile */}
                <motion.div variants={itemVariants} className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex justify-center gap-4">
                    <div className="mobile-menu-language-toggle">
                      <LanguageToggle size="lg" />
                    </div>
                    <ThemeToggle size="lg" />
                  </div>
                </motion.div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

Header.displayName = 'Header';

export default Header;
