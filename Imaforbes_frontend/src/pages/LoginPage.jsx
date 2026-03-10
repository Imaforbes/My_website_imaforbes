// src/pages/LoginPage.jsx
/**
 * LoginPage - Modern & Contemporary Design 2025
 * 
 * DESIGN FEATURES:
 * - Modern gradient background with subtle animation
 * - Enhanced glassmorphism card design
 * - Improved form inputs with better focus states
 * - Modern button with hover effects
 * - Smooth animations and transitions
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { API_CONFIG } from "../config/api.js";
import { safeLocalStorage } from "../utils/storage.js";

// Modern animated background
const HeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    {/* Modern gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a]"></div>
    {/* Subtle animated grid pattern */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
  </div>
);

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // --- LÓGICA AÑADIDA ---
  // Esta función ahora envía los datos de login al backend.
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Use centralized API config URL
      const response = await fetch(`${API_CONFIG.getBaseURL()}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // Importante para manejar cookies de sesión
      });
      
      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      let result;
      
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        // If not JSON, get text to see the error
        const text = await response.text();
        if (import.meta.env.DEV) {
          console.error("Login error (non-JSON):", text);
        }
        setError("Error del servidor. Por favor, intenta de nuevo.");
        return;
      }
      
      // Log response in development mode for debugging
      if (import.meta.env.DEV) {
        console.log("Login response:", { ok: response.ok, status: response.status, result });
      }
      
      if (response.ok && result.success) {
        // Save authentication indicator to localStorage
        // The API uses session-based authentication (cookies), but we need
        // a localStorage flag so the Dashboard knows the user is authenticated
        if (result.data && result.data.token) {
          // If API returns a token, use it
          safeLocalStorage.setItem('auth_token', result.data.token);
        } else {
          // For session-based auth, create a session indicator
          // Format: 'session_' + timestamp + '_' + user_id (if available)
          const userId = result.data?.id || result.data?.user?.id || 'unknown';
          safeLocalStorage.setItem('auth_token', `session_${Date.now()}_${userId}`);
        }
        
        // Store user info if available
        if (result.data) {
          const userData = result.data.user || result.data;
          safeLocalStorage.setItem('user', JSON.stringify(userData));
        }
        
        // Small delay to ensure localStorage is saved before navigation
        setTimeout(() => {
          navigate("/admin");
        }, 100);
      } else {
        setError(result.message || result.error || "Error al iniciar sesión.");
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Login error:", error);
      }
      setError("Error de conexión. Verifica que el servidor esté funcionando e inténtalo de nuevo.");
    }
  };
  // --- FIN DE LA LÓGICA AÑADIDA ---

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white p-4 sm:p-6">
      <HeroBackground />
      
      {/* Modern glassmorphism card with enhanced design */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-xl p-8 sm:p-10 md:p-12 modern-border modern-shadow-xl modern-card-lg border border-gray-200/50 dark:border-gray-800/50">
          {/* Logo/Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 dark:bg-gray-800 rounded-2xl modern-shadow-md">
              <Lock className="w-8 h-8 text-gray-700 dark:text-gray-300" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-light mb-2 leading-tight tracking-tight text-gray-900 dark:text-white">
              Admin Login
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
              Accede a tu panel de administración
            </p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all duration-300 modern-shadow-sm focus:modern-shadow-md"
                  placeholder="Ingresa tu usuario"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all duration-300 modern-shadow-sm focus:modern-shadow-md"
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 focus:outline-none"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
              >
                <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">
                  {error}
                </p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-base font-medium tracking-wide rounded-xl modern-shadow-md hover:modern-shadow-lg transition-all duration-300 modern-hover"
            >
              Entrar
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
