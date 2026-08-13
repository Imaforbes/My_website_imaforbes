// src/components/ThemeToggle.jsx
import React, { useState, useEffect, useRef } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext.jsx";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const ThemeToggle = ({ className = "", size = "default" }) => {
  const { theme, updateTheme } = useSettings();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    { value: "light", icon: Sun, label: t("theme.light") || "Light" },
    { value: "dark", icon: Moon, label: t("theme.dark") || "Dark" },
    { value: "auto", icon: Monitor, label: t("theme.auto") || "Auto" },
  ];

  const currentTheme = themes.find((t) => t.value === theme) || themes[1];
  // Force the first client render to match the server's default ('dark' -> Moon) to prevent hydration mismatch
  const CurrentIcon = mounted ? currentTheme.icon : themes[1].icon;

  const sizeClasses = {
    sm: "p-1.5",
    default: "p-2",
    lg: "p-3",
  };

  const iconSizes = {
    sm: 16,
    default: 20,
    lg: 24,
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleThemeChange = (newTheme) => {
    updateTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none shadow-sm`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={t("theme.toggleTheme") || "Toggle theme"}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <CurrentIcon size={iconSizes[size]} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute left-1/2 -translate-x-1/2 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                const isActive = theme === themeOption.value;

                return (
                  <motion.button
                    key={themeOption.value}
                    onClick={() => handleThemeChange(themeOption.value)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon size={18} />
                    <span>{themeOption.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTheme"
                        className="ml-auto w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                  </motion.button>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeToggle;

