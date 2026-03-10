// src/pages/ContactPage.jsx
/**
 * ContactPage - Minimalist & Deluxe Design
 * 
 * DESIGN CHANGES:
 * - Removed animated blob backgrounds
 * - Changed from colorful gradient backgrounds to clean white/dark
 * - Updated form inputs: clean borders with black/white focus states
 * - Updated contact info cards: minimalist white/dark cards with subtle borders
 * - Changed buttons: black/white minimalist style
 * - Added text reflection effect to title
 * - Updated social links: border style instead of colorful backgrounds
 * - Simplified animations and removed colorful accents
 */
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSend,
  FiMail,
  FiLinkedin,
  FiGithub,
  FiTwitter,
  FiLoader,
  FiCheckCircle,
  FiAlertTriangle,
  FiX,
  FiPhone,
  FiMapPin,
  FiClock,
  FiGlobe,
} from "react-icons/fi";
import { useContact } from "../hooks/useApi";
import { useTranslation } from "react-i18next";

const HeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    {/* Minimalist subtle background */}
    <div className="absolute inset-0 bg-gray-50 dark:bg-[#0a0a0a]"></div>
  </div>
);

const ContactPage = () => {
  const { t } = useTranslation();
  const { formData, status, validationErrors, handleChange, sendMessage, clearStatus } =
    useContact();

  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => clearStatus(), 5000);
      return () => clearTimeout(timer);
    }
  }, [status.message, clearStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendMessage(formData);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.5 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 15, stiffness: 100 },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 12, stiffness: 120 },
    },
    hover: {
      scale: 1.01,
      transition: { type: "spring", damping: 10, stiffness: 200 },
    },
  };

  const inputVariants = {
    focus: {
      scale: 1.02,
      transition: { type: "spring", damping: 8, stiffness: 200 },
    },
  };

  return (
    <>
      <motion.section
        id="contacto"
        className="relative min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <HeroBackground />
        <div className="relative z-10 container mx-auto max-w-7xl py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12 xl:mb-16">
            <motion.h2
              variants={itemVariants}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-4 text-gray-900 dark:text-white text-reflection"
              data-text={t("contact.title")}
            >
              {t("contact.title")}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed px-4 font-light"
            >
              {t("contact.description")}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="text-lg sm:text-xl md:text-2xl font-light mb-6 text-gray-900 dark:text-white">
                {t("contact.contact-info")}
              </h3>

              {/* Contact Methods Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <motion.a
                  href="mailto:imanol@imaforbes.com"
                  className="group flex items-center gap-3 p-4 bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800 hover:border-gray-900 dark:hover:border-gray-600 transition-all duration-200 rounded-2xl"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 transition-colors rounded-xl">
                    <FiMail className="text-gray-700 dark:text-gray-300" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                      imanol@imaforbes.com
                    </p>
                  </div>
                </motion.a>

                {/* Phone 
                <motion.a
                  href="tel:+1234567890"
                  className="group flex items-center gap-3 p-4 bg-gray-900/30 rounded-lg hover:bg-gray-800/50 transition-all duration-300 hover:scale-105"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                    <FiPhone className="text-green-400" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-white group-hover:text-green-300 transition-colors">
                      +1 (234) 567-890
                    </p>
                  </div>
                </motion.a>*/}

                {/* Location */}
                <motion.div
                  className="group flex items-center gap-3 p-4 bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800 hover:border-gray-900 dark:hover:border-gray-600 transition-all duration-200 rounded-2xl"
                  whileHover={{ y: -2 }}
                >
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 transition-colors rounded-xl">
                    <FiMapPin className="text-gray-700 dark:text-gray-300" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                      Mexico City, MX
                    </p>
                  </div>
                </motion.div>

                {/* Availability */}
                <motion.div
                  className="group flex items-center gap-3 p-4 bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800 hover:border-gray-900 dark:hover:border-gray-600 transition-all duration-200 rounded-2xl"
                  whileHover={{ y: -2 }}
                >
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 transition-colors rounded-xl">
                    <FiClock className="text-gray-700 dark:text-gray-300" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Available</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                      Mon - Fri, 9AM - 5PM
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Social Links */}
              <div className="pt-4">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                  Connect with me
                </h4>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <motion.a
                    href="https://www.linkedin.com/in/imanol-pérez-arteaga-a72a08235"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 rounded-2xl"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiLinkedin size={18} />
                    <span className="text-sm font-medium">LinkedIn</span>
                  </motion.a>

                  <motion.a
                    href="https://github.com/Imaforbes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 rounded-2xl"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiGithub size={18} />
                    <span className="text-sm font-medium">GitHub</span>
                  </motion.a>

                  <motion.a
                    href="https://twitter.com/imaforbes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 rounded-2xl"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiTwitter size={18} />
                    <span className="text-sm font-medium">Twitter</span>
                  </motion.a>

                  {/*<motion.a
                    href="https://imaforbes.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600/20 hover:bg-teal-600/30 rounded-lg text-teal-300 hover:text-teal-200 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiGlobe size={18} />
                    <span className="text-sm font-medium">Website</span>
                  </motion.a>*/}
                </div>
              </div>
            </motion.div>

            <motion.form
              variants={formVariants}
              onSubmit={handleSubmit}
              className="space-y-6"
              whileHover="hover"
            >
              {/* Form inputs - Responsive padding and sizing */}
              <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }}>
                <label
                  htmlFor="name"
                  className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-2"
                >
                  {t("contact.name")}
                </label>
                <motion.input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  maxLength={200}
                  className={`w-full p-3 sm:p-4 bg-white dark:bg-[#0f0f0f] border ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  } focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition text-sm sm:text-base text-gray-900 dark:text-white rounded-2xl`}
                  variants={inputVariants}
                  whileFocus="focus"
                />
                {validationErrors.name && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{validationErrors.name}</p>
                )}
              </motion.div>
              <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }}>
                <label
                  htmlFor="email"
                  className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-2"
                >
                  {t("contact.email")}
                </label>
                <motion.input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  maxLength={200}
                  className={`w-full p-3 sm:p-4 bg-white dark:bg-[#0f0f0f] border ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  } focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition text-sm sm:text-base text-gray-900 dark:text-white rounded-2xl`}
                  variants={inputVariants}
                  whileFocus="focus"
                />
                {validationErrors.email && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{validationErrors.email}</p>
                )}
              </motion.div>
              <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }}>
                <label
                  htmlFor="message"
                  className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-2"
                >
                  {t("contact.message")}
                </label>
                <motion.textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  maxLength={2000}
                  className={`w-full p-3 sm:p-4 bg-white dark:bg-[#0f0f0f] border ${
                    validationErrors.message ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  } focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition resize-none text-sm sm:text-base text-gray-900 dark:text-white rounded-2xl`}
                  variants={inputVariants}
                  whileFocus="focus"
                ></motion.textarea>
                {validationErrors.message && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{validationErrors.message}</p>
                )}
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1 text-right">
                  {formData.message.length}/2000
                </p>
              </motion.div>
              {/* Submit button - Full width on mobile, auto on larger screens */}
              <motion.button
                type="submit"
                disabled={status.sending}
                className="group flex items-center justify-center gap-2 px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-black dark:bg-white text-white dark:text-black text-sm sm:text-base lg:text-lg font-medium tracking-wide transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-wait w-full rounded-2xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {status.sending ? (
                  <>
                    <FiLoader className="animate-spin" />
                    <span>
                      {t("contact.sending")}
                    </span>
                  </>
                ) : (
                  <>
                    <span>{t("contact.send")}</span>
                    <FiSend />
                  </>
                )}
              </motion.button>
              
              {/* Privacy Notice */}
              <motion.div 
                variants={itemVariants}
                className="mt-4 p-4 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800"
              >
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  {t("contact.privacy-title")}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                  {t("contact.privacy-text")}
                </p>
              </motion.div>
            </motion.form>
          </div>
        </div>
      </motion.section>

      {/* Notification Toast - Positioned below header */}
      <div className="fixed top-20 md:top-24 left-1/2 -translate-x-1/2 w-[90%] md:w-full max-w-lg z-[60] pointer-events-none">
        <AnimatePresence>
          {status.message && (
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className={`relative w-full p-4 rounded-2xl shadow-2xl flex items-center space-x-4 pointer-events-auto
                ${status.type === "success" ? "bg-green-500" : ""}
                ${status.type === "error" ? "bg-red-500" : ""}
              `}
            >
              <div className="flex-shrink-0">
                {status.type === "success" && (
                  <FiCheckCircle className="w-6 h-6 text-white" />
                )}
                {status.type === "error" && (
                  <FiAlertTriangle className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm md:text-base font-semibold">
                  {status.message}
                </p>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={clearStatus}
                  className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* --> FIN DE LA SECCIÓN MODIFICADA */}
    </>
  );
};

export default ContactPage;
