// src/contexts/SettingsContext.jsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { safeLocalStorage, safeMatchMedia } from '../utils/storage.js';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState(() => {
    // Load from localStorage first, then default to 'dark'
    const savedTheme = safeLocalStorage.getItem('app_theme');
    return savedTheme || 'dark';
  });
  const [language, setLanguage] = useState('es'); // SSR default
  const [loading, setLoading] = useState(true);

  // Define applyTheme function
  const applyTheme = React.useCallback((newTheme) => {
    const root = document.documentElement;
    if (!root) return;
    
    // Add a temporary class to indicate theme is switching (for CSS optimization)
    root.classList.add('theme-switching');
    
    // Use requestAnimationFrame to ensure theme change happens synchronously
    // This prevents flashing during the transition
    requestAnimationFrame(() => {
      root.classList.remove('light', 'dark', 'auto');
      
      if (newTheme === 'auto') {
        // Use system preference with safe fallback
        const mediaQuery = safeMatchMedia('(prefers-color-scheme: dark)');
        const prefersDark = mediaQuery.matches;
        root.classList.add(prefersDark ? 'dark' : 'light');
        
        // Listen for system theme changes (only if matchMedia is supported)
        if (mediaQuery.addEventListener) {
          const handleChange = (e) => {
            root.classList.add('theme-switching');
            requestAnimationFrame(() => {
              root.classList.remove('light', 'dark');
              root.classList.add(e.matches ? 'dark' : 'light');
              // Remove theme-switching class after a brief moment
              setTimeout(() => {
                root.classList.remove('theme-switching');
              }, 50);
            });
          };
          mediaQuery.addEventListener('change', handleChange);
          
          // Store cleanup function
          root._themeCleanup = () => {
            if (mediaQuery.removeEventListener) {
              mediaQuery.removeEventListener('change', handleChange);
            }
          };
        }
      } else {
        root.classList.add(newTheme);
        // Cleanup auto theme listener if it exists
        if (root._themeCleanup) {
          root._themeCleanup();
          delete root._themeCleanup;
        }
      }

      // Also update body class for compatibility (only if body exists)
      if (document.body) {
        document.body.classList.remove('light-theme', 'dark-theme', 'auto-theme');
        document.body.classList.add(`${newTheme}-theme`);
      }
      
      // Remove the theme-switching class after the change is complete
      // Use a small timeout to ensure the browser has applied the changes
      setTimeout(() => {
        root.classList.remove('theme-switching');
      }, 50);
    });
    
    safeLocalStorage.setItem('app_theme', newTheme);
  }, []);

  // Define applyLanguage function
  const applyLanguage = React.useCallback((newLanguage, persist = false) => {
    const normalized = newLanguage && newLanguage.startsWith('en') ? 'en' : 'es';
    if (i18n.language !== normalized) {
      i18n.changeLanguage(normalized);
    }
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = normalized;
    }
    if (persist) {
      safeLocalStorage.setItem('app_language', normalized);
    }
  }, [i18n]);

  // Initialize language from localStorage on client-side and sync across Astro islands
  useEffect(() => {
    const savedLang = safeLocalStorage.getItem('app_language');
    let browserLang = 'es';
    if (typeof navigator !== 'undefined' && navigator.language) {
      browserLang = navigator.language.startsWith('en') ? 'en' : 'es';
    }
    const rawLang = savedLang || (i18n.language && i18n.language !== 'es' ? i18n.language : browserLang);
    const targetLang = rawLang && rawLang.startsWith('en') ? 'en' : 'es';

    setLanguage(targetLang);
    applyLanguage(targetLang, !!savedLang);

    const handleI18nLangChanged = (lng) => {
      const next = lng && lng.startsWith('en') ? 'en' : 'es';
      setLanguage((prev) => (prev === next ? prev : next));
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.lang = next;
      }
    };

    const handleWindowLangChange = (e) => {
      if (e?.detail) {
        handleI18nLangChanged(e.detail);
      }
    };

    const handleWindowThemeChange = (e) => {
      if (e?.detail) {
        setTheme((prev) => (prev === e.detail ? prev : e.detail));
      }
    };

    i18n.on('languageChanged', handleI18nLangChanged);
    if (typeof window !== 'undefined') {
      window.addEventListener('app:language-change', handleWindowLangChange);
      window.addEventListener('app:theme-change', handleWindowThemeChange);
    }

    return () => {
      i18n.off('languageChanged', handleI18nLangChanged);
      if (typeof window !== 'undefined') {
        window.removeEventListener('app:language-change', handleWindowLangChange);
        window.removeEventListener('app:theme-change', handleWindowThemeChange);
      }
    };
  }, [i18n, applyLanguage]);

  // Load settings from API on mount
  useEffect(() => {
    loadSettingsFromAPI();
  }, []);

  // Apply theme to document when it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const loadSettingsFromAPI = async () => {
    // Check if user is authenticated before making API call
    // Settings endpoint requires authentication, so skip if not logged in
    const authToken = safeLocalStorage.getItem('auth_token');
    if (!authToken) {
      // No auth token, skip API call and use localStorage values
      setLoading(false);
      return;
    }

    try {
      const { api } = await import('../services/api.js');
      const result = await api.settings.get();

      if (result.success && result.data) {
        const apiSettings = result.data.settings || result.data;
        
        // Parse appearance settings
        const rawAppearance = apiSettings.appearance?.value ?? apiSettings.appearance;
        const appearance = rawAppearance
          ? (typeof rawAppearance === 'string' 
              ? JSON.parse(rawAppearance) 
              : rawAppearance)
          : null;

        if (appearance) {
          const hasLocalTheme = !!safeLocalStorage.getItem('app_theme');
          const hasLocalLanguage = !!safeLocalStorage.getItem('app_language');

          if (appearance.theme && !hasLocalTheme) {
            setTheme(appearance.theme);
            safeLocalStorage.setItem('app_theme', appearance.theme);
          }
          if (appearance.language && !hasLocalLanguage) {
            setLanguage(appearance.language);
            applyLanguage(appearance.language, true);
          }
        }
      }
    } catch (error) {
      // Only log errors in development, and skip network errors
      if (import.meta.env.DEV && error.name !== 'TypeError') {
        console.warn('Error loading settings from API:', error);
      }
      // Fallback to localStorage values
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = async (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:theme-change', { detail: newTheme }));
    }
    
    // Si el usuario está autenticado, sincronizar el tema con la base de datos
    // para que no se sobrescriba al recargar la página.
    const authToken = safeLocalStorage.getItem('auth_token');
    if (authToken) {
      try {
        // Importación dinámica para evitar problemas de dependencias circulares si las hubiera
        const { api } = await import('../services/api.js');
        await api.settings.update({ appearance: { theme: newTheme, language } });
      } catch (error) {
        console.warn('Failed to sync theme with API:', error);
      }
    }
  };

  const updateLanguage = async (newLanguage) => {
    const normalized = newLanguage && newLanguage.startsWith('en') ? 'en' : 'es';
    setLanguage(normalized);
    applyLanguage(normalized, true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:language-change', { detail: normalized }));
    }
    
    // Si el usuario está autenticado, sincronizar el idioma con la base de datos
    const authToken = safeLocalStorage.getItem('auth_token');
    if (authToken) {
      try {
        const { api } = await import('../services/api.js');
        await api.settings.update({ appearance: { theme, language: normalized } });
      } catch (error) {
        console.warn('Failed to sync language with API:', error);
      }
    }
  };

  const value = {
    theme,
    language,
    updateTheme,
    updateLanguage,
    loading,
    loadSettingsFromAPI,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

