// src/components/LanguageToggle.jsx
// Reusable language toggle component

import React from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "../contexts/SettingsContext.jsx";

const LanguageToggle = ({ className = "", size = "default" }) => {
  const { i18n, t } = useTranslation();
  const { updateLanguage } = useSettings();

  const handleLanguageChange = (lang) => {
    updateLanguage(lang);
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    default: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <div
      className={`flex items-center p-1 bg-surface dark:bg-background rounded-full ${className}`}
    >
      <button
        onClick={() => handleLanguageChange("es")}
        className={`${
          sizeClasses[size]
        } font-semibold rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          (i18n.language || "es").startsWith("es")
            ? "bg-surface text-text shadow dark:bg-background dark:text-text"
            : "bg-transparent text-text hover:text-text dark:text-text-muted dark:hover:text-text"
        }`}
        aria-label={t("language.switchToSpanish") || "Switch to Spanish"}
        aria-pressed={(i18n.language || "es").startsWith("es")}
      >
        🇲🇽
      </button>
      <button
        onClick={() => handleLanguageChange("en")}
        className={`${
          sizeClasses[size]
        } font-semibold rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          (i18n.language || "es").startsWith("en")
            ? "bg-surface text-text shadow dark:bg-background dark:text-text"
            : "bg-transparent text-text hover:text-text dark:text-text-muted dark:hover:text-text"
        }`}
        aria-label={t("language.switchToEnglish") || "Switch to English"}
        aria-pressed={(i18n.language || "es").startsWith("en")}
      >
        🇬🇧
      </button>
    </div>
  );
};

export default LanguageToggle;
