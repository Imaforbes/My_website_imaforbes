import withProviders from '../components/withProviders.jsx';
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

import { motion } from "framer-motion";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { API_CONFIG } from "../config/api.js";
import { safeLocalStorage } from "../utils/storage.js";

// Minimal cinematic background
const HeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden bg-background">
    {/* Subtle dark gradient to simulate depth */}
    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80"></div>
  </div>
);

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = (path) => { window.location.href = path; };

  // --- LÓGICA AÑADIDA ---
  // Esta función ahora envía los datos de login al backend.
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { supabase } = await import('../services/supabase.js');
      // Supabase usa email, así que el campo 'username' lo usaremos como email
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: username,
        password: password
      });
      
      if (signInError) {
        setError(signInError.message || "Error al iniciar sesión.");
        return;
      }
      
      if (data.session) {
        localStorage.setItem('auth_token', data.session.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setTimeout(() => {
          navigate("/admin");
        }, 100);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Login error:", err);
      }
      setError("Error de conexión. Verifica que el servidor esté funcionando.");
    }
  };

  // --- FIN DE LA LÓGICA AÑADIDA ---

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background text-text p-4 sm:p-6">
      <HeroBackground />
      
      {/* Botón de Regresar (Cinemático y discreto) */}
      <a 
        href="/" 
        className="absolute top-6 left-6 z-50 text-xs font-semibold tracking-widest uppercase text-text hover:text-text transition-colors duration-300 flex items-center gap-2"
      >
        <span style={{ fontSize: '1.2rem' }}>←</span> Regresar al sitio web
      </a>
      
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
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 uppercase tracking-[0.1em] text-text" style={{ fontFamily: 'var(--font-sans)' }}>
              Login
            </h1>
            <p className="text-xs uppercase tracking-widest text-text-muted font-semibold mt-4">
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
                  <User className="w-4 h-4 text-text group-focus-within:text-text transition-colors" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-8 pr-4 py-3 bg-transparent border-b-2 border-strong text-text placeholder-gray-600 focus:outline-none focus:border-white transition-all duration-300 text-sm tracking-wider"
                  placeholder="CORREO (EMAIL)"
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
                  <Lock className="w-4 h-4 text-text group-focus-within:text-text transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-8 pr-12 py-3 bg-transparent border-b-2 border-strong text-text placeholder-gray-600 focus:outline-none focus:border-white transition-all duration-300 text-sm tracking-wider"
                  placeholder="CONTRASEÑA"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center text-text hover:text-text transition-colors duration-200 focus:outline-none"
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
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl"
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
              className="w-full mt-8 py-3 bg-transparent border-b-2 border-white text-text text-xs font-bold tracking-[0.15em] uppercase hover:opacity-70 transition-opacity"
            >
              ENTRAR
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default withProviders(LoginPage);
