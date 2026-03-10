// src/components/Footer.jsx
/**
 * Footer - Modern & Contemporary Design
 * 
 * DESIGN FEATURES:
 * - Modern grid layout with better visual hierarchy
 * - Smooth animations with framer-motion
 * - Contemporary typography and spacing
 * - Interactive hover effects
 * - Clean, organized sections
 */
import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Mail, ArrowUpRight } from 'lucide-react';

const Footer = memo(() => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const navItems = [
    { path: "/", label: "header.home" },
    { path: "/about", label: "header.about-me" },
    { path: "/projects", label: "header.proyects" },
    { path: "/blog", label: "header.blog" },
    { path: "/contact", label: "header.contact" },
  ];

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
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <footer className="relative bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 dark:via-gray-900/20 to-transparent pointer-events-none"></div>
      
      <motion.div
        className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Main Footer Content - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 mb-12 md:mb-16">
          {/* Brand Section */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-4 lg:col-span-5"
          >
            <Link
              to="/"
              className="inline-block mb-4 group"
            >
              <h3 className="text-2xl md:text-3xl font-light tracking-tight text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                IMAFORBES
              </h3>
            </Link>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-light leading-relaxed max-w-md">
              {t("footer.description") || "Building digital experiences with passion and precision."}
            </p>
          </motion.div>

          {/* Navigation Section */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-4 lg:col-span-3"
          >
            <h4 className="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wider mb-6">
              {t("footer.navigation") || "Navigation"}
            </h4>
            <nav aria-label="Footer navigation">
              <ul className="space-y-3">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="group flex items-center gap-2 text-sm md:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 font-light"
                    >
                      <span className={`transition-transform duration-300 group-hover:translate-x-1 ${
                        location.pathname === item.path ? 'text-gray-900 dark:text-white font-medium' : ''
                      }`}>
                        {t(item.label)}
                      </span>
                      {location.pathname === item.path && (
                        <motion.div
                          layoutId="footerActive"
                          className="w-1 h-1 rounded-full bg-gray-900 dark:bg-white"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-4 lg:col-span-4"
          >
            <h4 className="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wider mb-6">
              {t("footer.get-in-touch") || "Get in Touch"}
            </h4>
            <div className="space-y-4">
              <motion.a
                href="mailto:imanol@imaforbes.com"
                className="group flex items-center gap-3 text-sm md:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 font-light"
                whileHover={{ x: 4 }}
              >
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors duration-300">
                  <Mail size={18} className="text-gray-700 dark:text-gray-300" />
                </div>
                <span className="flex-1">imanol@imaforbes.com</span>
                <ArrowUpRight 
                  size={16} 
                  className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 text-gray-600 dark:text-gray-400" 
                />
              </motion.a>
              
              <div className="pt-2">
                <p className="text-xs text-gray-500 dark:text-gray-500 font-light">
                  {t("footer.response-time") || "Usually responds within 24 hours"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section - Divider and Copyright */}
        <motion.div
          variants={itemVariants}
          className="pt-8 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 font-light text-center md:text-left">
              © {currentYear} Imanol Pérez Arteaga. {t("footer.copyright")}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600 font-light">
              <span>{t("footer.made-with") || "Made with"}</span>
              <span className="text-red-500 dark:text-red-400">♥</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;