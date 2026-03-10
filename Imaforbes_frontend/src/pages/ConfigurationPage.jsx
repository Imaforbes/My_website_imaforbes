// src/pages/ConfigurationPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../services/api.js";
import { useSettings } from "../contexts/SettingsContext.jsx";
import {
  ArrowLeft,
  Settings,
  Save,
  RefreshCw,
  Database,
  Mail,
  Shield,
  Globe,
  Bell,
  Palette,
  User,
  Lock,
} from "lucide-react";

const HeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    {/* Minimalist subtle background */}
    <div className="absolute inset-0 bg-gray-50 dark:bg-[#0a0a0a]"></div>
  </div>
);

const ConfigurationPage = () => {
  const { theme, language, updateTheme, updateLanguage } = useSettings();
  const [settings, setSettings] = useState({
    site_name: "IMAFORBES",
    site_description: "Portfolio Personal",
    admin_email: "imanol@imaforbes.com",
    contact_email: "imanol@imaforbes.com",
    notifications: {
      newMessage: true,
      systemUpdates: true,
      weeklyReport: false,
    },
    security: {
      sessionTimeout: 30,
      requirePasswordChange: false,
      twoFactorAuth: false,
    },
    appearance: {
      theme: theme,
      language: language,
    },
    database: {
      backupFrequency: "daily",
      maxBackups: 7,
    },
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Use centralized API service which handles CSRF tokens and errors properly
      const result = await api.settings.get();

      if (!result.success) {
        // Check if it's an authentication error
        if (result.status === 401 || result.status === 403) {
          navigate("/login");
          return;
        }
        console.error("Failed to fetch settings:", result.error);
        return;
      }

      // API service returns { success: true, data: {...} } where data is the API response
      // API response structure: { success: true, data: { settings: {...}, system_status: {...} } }
      const apiResponse = result.data;
      
      if (apiResponse.success && apiResponse.data) {
        const apiSettings = apiResponse.data.settings || {};
        const apiSystemStatus = apiResponse.data.system_status || {};

          // Parse settings from API response
          // API returns: { 'setting_key': { 'value': '...', 'description': '...' } }
          const parseSetting = (key, defaultValue) => {
            if (apiSettings[key]?.value !== undefined) {
              const value = apiSettings[key].value;
              // Try to parse JSON if it's a complex object
              try {
                const parsed = JSON.parse(value);
                // If parsed value is an object, return it; otherwise return the original value
                return typeof parsed === 'object' && parsed !== null ? parsed : value;
              } catch {
                // Not JSON, return as-is
                return value;
              }
            }
            return defaultValue;
          };

          // Merge API settings with defaults
          // Ensure nested objects are properly initialized
          const defaultNotifications = {
            newMessage: true,
            systemUpdates: true,
            weeklyReport: false,
          };
          const defaultSecurity = {
            sessionTimeout: 30,
            requirePasswordChange: false,
            twoFactorAuth: false,
          };
          const defaultAppearance = {
            theme: theme,
            language: language,
          };
          const defaultDatabase = {
            backupFrequency: "daily",
            maxBackups: 7,
          };

          // Helper to safely merge nested objects
          const mergeNestedSetting = (key, defaultObj) => {
            const parsed = parseSetting(key, defaultObj);
            if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
              return { ...defaultObj, ...parsed };
            }
            return defaultObj;
          };

          const parsedAppearance = mergeNestedSetting('appearance', defaultAppearance);
          
          const mergedSettings = {
            site_name: parseSetting('site_name', settings.site_name) || parseSetting('site_title', settings.site_name),
            site_description: parseSetting('site_description', settings.site_description),
            admin_email: parseSetting('admin_email', settings.admin_email),
            contact_email: parseSetting('contact_email', settings.contact_email),
            notifications: mergeNestedSetting('notifications', defaultNotifications),
            security: mergeNestedSetting('security', defaultSecurity),
            appearance: parsedAppearance,
            database: mergeNestedSetting('database', defaultDatabase),
          };

          // Update context if appearance settings changed
          if (parsedAppearance.theme !== theme) {
            updateTheme(parsedAppearance.theme);
          }
          if (parsedAppearance.language !== language) {
            updateLanguage(parsedAppearance.language);
          }

          setSettings(mergedSettings);
          setSystemStatus(apiSystemStatus);
        }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Don't navigate to login on network errors, only on auth errors
      if (error.status === 401 || error.status === 403) {
        navigate("/login");
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Format settings for the API
      // Backend expects individual setting keys
      const settingsToSave = {
        site_name: settings.site_name,
        site_description: settings.site_description,
        admin_email: settings.admin_email,
        contact_email: settings.contact_email,
        notifications: settings.notifications,
        security: settings.security,
        appearance: settings.appearance,
        database: settings.database,
      };

      // Use centralized API service which handles CSRF tokens automatically
      const result = await api.settings.update(settingsToSave);

      // Check for authentication errors first
      if (result.status === 401 || result.status === 403) {
        navigate("/login");
        return;
      }

      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        
        // Apply theme and language changes immediately
        if (settings.appearance) {
          if (settings.appearance.theme !== theme) {
            updateTheme(settings.appearance.theme);
          }
          if (settings.appearance.language !== language) {
            updateLanguage(settings.appearance.language);
          }
        }
        
        // Refresh system status (but don't wait for it)
        fetchSettings().catch(err => {
          console.error("Error refreshing settings after save:", err);
        });
      } else {
        // Handle validation errors or other errors
        if (result.status === 422 && result.errors) {
          const errorMessages = Object.values(result.errors).join(', ');
          alert("Error de validación: " + errorMessages);
        } else {
          console.error("Failed to save settings:", result.error);
          alert("Error al guardar: " + (result.error || "Error desconocido"));
        }
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      // Only navigate to login if it's an auth error
      if (error.status === 401 || error.status === 403) {
        navigate("/login");
      } else {
        alert("Error al guardar la configuración: " + (error.message || "Error desconocido"));
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler for top-level fields (site_name, site_description, etc.)
  const handleTopLevelChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handler for nested fields (notifications.newMessage, security.sessionTimeout, etc.)
  const handleNestedChange = (section, key, value) => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      };
      
      return newSettings;
    });
  };

  // Apply theme/language changes when appearance settings change (defer to avoid render-time updates)
  useEffect(() => {
    if (initialLoading) return; // Wait for initial load to complete
    
    // Defer updates to next tick to avoid render-time state updates
    const timeoutId = setTimeout(() => {
      if (settings.appearance) {
        if (settings.appearance.theme && settings.appearance.theme !== theme) {
          updateTheme(settings.appearance.theme);
        }
        if (settings.appearance.language && settings.appearance.language !== language) {
          updateLanguage(settings.appearance.language);
        }
      }
    }, 0);
    
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.appearance?.theme, settings.appearance?.language, initialLoading]);

  const configSections = [
    {
      title: "Información del Sitio",
      icon: Globe,
      fields: [
        {
          label: "Nombre del Sitio",
          key: "site_name",
          type: "text",
          value: settings.site_name,
          onChange: (value) => handleTopLevelChange("site_name", value),
        },
        {
          label: "Descripción",
          key: "site_description",
          type: "textarea",
          value: settings.site_description,
          onChange: (value) => handleTopLevelChange("site_description", value),
        },
        {
          label: "Email de Administrador",
          key: "admin_email",
          type: "email",
          value: settings.admin_email,
          onChange: (value) => handleTopLevelChange("admin_email", value),
        },
        {
          label: "Email de Contacto",
          key: "contact_email",
          type: "email",
          value: settings.contact_email,
          onChange: (value) => handleTopLevelChange("contact_email", value),
        },
      ],
    },
    {
      title: "Notificaciones",
      icon: Bell,
      fields: [
        {
          label: "Nuevo Mensaje",
          key: "newMessage",
          type: "checkbox",
          value: settings.notifications?.newMessage ?? true,
          onChange: (value) =>
            handleNestedChange("notifications", "newMessage", value),
        },
        {
          label: "Actualizaciones del Sistema",
          key: "systemUpdates",
          type: "checkbox",
          value: settings.notifications?.systemUpdates ?? true,
          onChange: (value) =>
            handleNestedChange("notifications", "systemUpdates", value),
        },
        {
          label: "Reporte Semanal",
          key: "weeklyReport",
          type: "checkbox",
          value: settings.notifications?.weeklyReport ?? false,
          onChange: (value) =>
            handleNestedChange("notifications", "weeklyReport", value),
        },
      ],
    },
    {
      title: "Seguridad",
      icon: Shield,
      fields: [
        {
          label: "Timeout de Sesión (minutos)",
          key: "sessionTimeout",
          type: "number",
          value: settings.security?.sessionTimeout ?? 30,
          onChange: (value) =>
            handleNestedChange("security", "sessionTimeout", parseInt(value) || 30),
        },
        {
          label: "Requerir Cambio de Contraseña",
          key: "requirePasswordChange",
          type: "checkbox",
          value: settings.security?.requirePasswordChange ?? false,
          onChange: (value) =>
            handleNestedChange("security", "requirePasswordChange", value),
        },
        {
          label: "Autenticación de Dos Factores",
          key: "twoFactorAuth",
          type: "checkbox",
          value: settings.security?.twoFactorAuth ?? false,
          onChange: (value) =>
            handleNestedChange("security", "twoFactorAuth", value),
        },
      ],
    },
    {
      title: "Apariencia",
      icon: Palette,
      fields: [
        {
          label: "Tema",
          key: "theme",
          type: "select",
          value: settings.appearance?.theme ?? theme,
          options: [
            { value: "dark", label: "Oscuro" },
            { value: "light", label: "Claro" },
            { value: "auto", label: "Automático" },
          ],
          onChange: (value) =>
            handleNestedChange("appearance", "theme", value),
        },
        {
          label: "Idioma",
          key: "language",
          type: "select",
          value: settings.appearance?.language ?? language,
          options: [
            { value: "es", label: "Español" },
            { value: "en", label: "English" },
          ],
          onChange: (value) =>
            handleNestedChange("appearance", "language", value),
        },
      ],
    },
    {
      title: "Base de Datos",
      icon: Database,
      fields: [
        {
          label: "Frecuencia de Respaldo",
          key: "backupFrequency",
          type: "select",
          value: settings.database?.backupFrequency ?? "daily",
          options: [
            { value: "daily", label: "Diario" },
            { value: "weekly", label: "Semanal" },
            { value: "monthly", label: "Mensual" },
          ],
          onChange: (value) =>
            handleNestedChange("database", "backupFrequency", value),
        },
        {
          label: "Máximo de Respaldos",
          key: "maxBackups",
          type: "number",
          value: settings.database?.maxBackups ?? 7,
          onChange: (value) =>
            handleNestedChange("database", "maxBackups", parseInt(value) || 7),
        },
      ],
    },
  ];

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center text-gray-900 dark:text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-light">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white p-4 sm:p-8">
        <HeroBackground />
        <div className="relative z-10 container mx-auto max-w-7xl">
          {/* Page Title Section - More Prominent */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => navigate("/admin")}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={20} />
              </motion.button>
              <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-tight tracking-tight text-gray-900 dark:text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                Configuración del Sistema
              </motion.h1>
            </div>
          </div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-end mb-6"
          >
            <button
              onClick={handleSave}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-light transition-all duration-300 ${
                loading
                  ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400"
                  : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : saved ? (
                <>
                  <Save size={16} />
                  ¡Guardado!
                </>
              ) : (
                <>
                  <Save size={16} />
                  Guardar Cambios
                </>
              )}
            </button>
          </motion.div>

          {/* Configuration Sections */}
          <div className="space-y-6">
            {configSections.map((section, sectionIndex) => {
              const IconComponent = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * sectionIndex }}
                  className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
                >
                  <h3 className="text-xl font-light text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <IconComponent size={20} className="text-gray-700 dark:text-gray-300" />
                    {section.title}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {section.fields.map((field, fieldIndex) => (
                      <div key={field.key} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {field.label}
                        </label>

                        {field.type === "text" ||
                        field.type === "email" ||
                        field.type === "number" ? (
                          <input
                            type={field.type}
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all duration-300"
                          />
                        ) : field.type === "textarea" ? (
                          <textarea
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all duration-300"
                          />
                        ) : field.type === "select" ? (
                          <select
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all duration-300"
                          >
                            {field.options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : field.type === "checkbox" ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="w-4 h-4 text-gray-900 dark:text-white bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-700 rounded focus:ring-gray-900 dark:focus:ring-white focus:ring-2"
                            />
                            <span className="text-gray-700 dark:text-gray-300">Habilitado</span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 bg-white dark:bg-[#0f0f0f] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <h3 className="text-xl font-light text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Database size={20} className="text-gray-700 dark:text-gray-300" />
              Estado del Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  systemStatus?.database === "connected"
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    systemStatus?.database === "connected"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span className="text-gray-900 dark:text-white font-light">
                  Base de Datos:{" "}
                  {systemStatus?.database === "connected"
                    ? "Conectada"
                    : "Error"}
                </span>
              </div>
              <div
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  systemStatus?.api === "working"
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    systemStatus?.api === "working"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span className="text-gray-900 dark:text-white font-light">
                  API:{" "}
                  {systemStatus?.api === "working" ? "Funcionando" : "Error"}
                </span>
              </div>
              <div
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  systemStatus?.backup === "pending"
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                    : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    systemStatus?.backup === "pending"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                ></div>
                <span className="text-gray-900 dark:text-white font-light">
                  Respaldos:{" "}
                  {systemStatus?.backup === "pending"
                    ? "Pendiente"
                    : "Completado"}
                </span>
              </div>
            </div>
            {systemStatus && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-light text-gray-900 dark:text-white">
                    {systemStatus.message_count || 0}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-light">Total Mensajes</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Última verificación:</p>
                  <p className="text-gray-900 dark:text-white text-sm font-light">
                    {systemStatus.last_check || "N/A"}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ConfigurationPage;
