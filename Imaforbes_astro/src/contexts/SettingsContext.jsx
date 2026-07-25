// src/contexts/SettingsContext.jsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_CONFIG } from '../config/api.js';
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
  const applyLanguage = React.useCallback((newLanguage) => {
    if (i18n.language !== newLanguage) {
      i18n.changeLanguage(newLanguage);
    }
    safeLocalStorage.setItem('app_language', newLanguage);
  }, [i18n]);

  // Initialize language from localStorage on client-side to prevent hydration mismatch
  useEffect(() => {
    const savedLang = safeLocalStorage.getItem('app_language');
    let browserLang = 'es';
    if (typeof navigator !== 'undefined' && navigator.language) {
      browserLang = navigator.language.startsWith('en') ? 'en' : 'es';
    }
    const targetLang = savedLang || browserLang;
    
    if (targetLang !== 'es') {
      setLanguage(targetLang);
    }
  }, []);

  // Load settings from API on mount
  useEffect(() => {
    loadSettingsFromAPI();
  }, []);

  // Apply theme to document when it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Apply language to i18n when it changes
  useEffect(() => {
    applyLanguage(language);
  }, [language, applyLanguage]);

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
      const baseURL = API_CONFIG.getBaseURL();
      const response = await fetch(`${baseURL}/api/settings.php`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      // Handle 401/403 errors silently (expected for non-authenticated users)
      if (response.status === 401 || response.status === 403) {
        // User is not authenticated, use localStorage values
        setLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.settings) {
          const apiSettings = data.data.settings;
          
          // Parse appearance settings
          const appearance = apiSettings.appearance?.value 
            ? (typeof apiSettings.appearance.value === 'string' 
                ? JSON.parse(apiSettings.appearance.value) 
                : apiSettings.appearance.value)
            : null;

          if (appearance) {
            // Solo sobrescribimos si no hay una preferencia local ya guardada
            // o si estamos forzando la sincronización.
            const hasLocalTheme = !!safeLocalStorage.getItem('app_theme');
            const hasLocalLanguage = !!safeLocalStorage.getItem('app_language');

            if (appearance.theme && !hasLocalTheme) {
              setTheme(appearance.theme);
              safeLocalStorage.setItem('app_theme', appearance.theme);
            }
            if (appearance.language && !hasLocalLanguage) {
              setLanguage(appearance.language);
              safeLocalStorage.setItem('app_language', appearance.language);
            }
          }
        }
      } else {
        // Other errors (not 401/403) - log but don't break the app
        if (import.meta.env.DEV) {
          console.warn('Settings API returned non-ok status:', response.status);
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
    setLanguage(newLanguage);
    applyLanguage(newLanguage);
    
    // Si el usuario está autenticado, sincronizar el idioma con la base de datos
    const authToken = safeLocalStorage.getItem('auth_token');
    if (authToken) {
      try {
        const { api } = await import('../services/api.js');
        await api.settings.update({ appearance: { theme, language: newLanguage } });
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

