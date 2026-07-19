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
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { API_CONFIG } from "../config/api.js";
import { safeLocalStorage } from "../utils/storage.js";

// Minimal cinematic background
const HeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden bg-black">
    {/* Subtle dark gradient to simulate depth */}
    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80"></div>
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
    <div className="relative min-h-screen flex items-center justify-center bg-black text-white p-4 sm:p-6">
      <HeroBackground />
      
      {/* Botón de Regresar (Cinemático y discreto) */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-50 text-xs font-semibold tracking-widest uppercase text-gray-500 hover:text-white transition-colors duration-300 flex items-center gap-2"
      >
        <span style={{ fontSize: '1.2rem' }}>←</span> Regresar al sitio web
      </Link>
      
      {/* Minimalist Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-transparent p-8 sm:p-10 md:p-12">
          {/* Logo/Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 uppercase tracking-[0.1em] text-white" style={{ fontFamily: 'var(--font-serif)' }}>
              Login
            </h1>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mt-4">
              Administración
            </p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-8 pr-4 py-3 bg-transparent border-b-2 border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-white transition-all duration-300 text-sm tracking-wider"
                  placeholder="USUARIO"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-8 pr-12 py-3 bg-transparent border-b-2 border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-white transition-all duration-300 text-sm tracking-wider"
                  placeholder="CONTRASEÑA"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center text-gray-600 hover:text-white transition-colors duration-200 focus:outline-none"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
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
              className="w-full mt-8 py-3 bg-transparent border-b-2 border-white text-white text-xs font-bold tracking-[0.15em] uppercase hover:opacity-70 transition-opacity"
            >
              ENTRAR
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
