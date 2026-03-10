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
      className={`flex items-center p-1 bg-gray-200 rounded-full ${className}`}
    >
      <button
        onClick={() => handleLanguageChange("es")}
        className={`${
          sizeClasses[size]
        } font-semibold rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          i18n.language.startsWith("es")
            ? "bg-white text-gray-800 shadow"
            : "bg-transparent text-gray-500 hover:text-gray-800"
        }`}
        aria-label={t("language.switchToSpanish") || "Switch to Spanish"}
        aria-pressed={i18n.language.startsWith("es")}
      >
        🇲🇽
      </button>
      <button
        onClick={() => handleLanguageChange("en")}
        className={`${
          sizeClasses[size]
        } font-semibold rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          i18n.language.startsWith("en")
            ? "bg-white text-gray-800 shadow"
            : "bg-transparent text-gray-500 hover:text-gray-800"
        }`}
        aria-label={t("language.switchToEnglish") || "Switch to English"}
        aria-pressed={i18n.language.startsWith("en")}
      >
        🇬🇧
      </button>
    </div>
  );
};

export default LanguageToggle;
