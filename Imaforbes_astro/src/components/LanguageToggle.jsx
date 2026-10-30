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
    default: "px-2.5 py-1 text-xs",
    lg: "px-4 py-2 text-sm",
  };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        padding: "3px",
        borderRadius: "999px",
        background: "var(--color-faint)",
        border: "1px solid var(--color-border)",
      }}
      className={className}
    >
      <button
        onClick={() => handleLanguageChange("es")}
        style={{
          fontFamily: "var(--font-sans)",
          letterSpacing: "0.06em",
          borderRadius: "999px",
          background: (i18n.language || "es").startsWith("es") ? "var(--color-surface)" : "transparent",
          color: (i18n.language || "es").startsWith("es") ? "var(--color-text)" : "var(--color-text-muted)",
          boxShadow: (i18n.language || "es").startsWith("es") ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
          border: "none",
          cursor: "pointer",
        }}
        className={`${sizeClasses[size]} font-semibold transition-all duration-200`}
        aria-label={t("language.switchToSpanish") || "Switch to Spanish"}
        aria-pressed={(i18n.language || "es").startsWith("es")}
      >
        ES
      </button>
      <button
        onClick={() => handleLanguageChange("en")}
        style={{
          fontFamily: "var(--font-sans)",
          letterSpacing: "0.06em",
          borderRadius: "999px",
          background: (i18n.language || "es").startsWith("en") ? "var(--color-surface)" : "transparent",
          color: (i18n.language || "es").startsWith("en") ? "var(--color-text)" : "var(--color-text-muted)",
          boxShadow: (i18n.language || "es").startsWith("en") ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
          border: "none",
          cursor: "pointer",
        }}
        className={`${sizeClasses[size]} font-semibold transition-all duration-200`}
        aria-label={t("language.switchToEnglish") || "Switch to English"}
        aria-pressed={(i18n.language || "es").startsWith("en")}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;
