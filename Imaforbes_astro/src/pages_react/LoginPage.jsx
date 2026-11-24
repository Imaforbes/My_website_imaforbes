import withProviders from '../components/withProviders.jsx';
// src/pages_react/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, User, Eye, EyeOff, Loader } from "lucide-react";
import { api } from "../services/api.js";
import { safeLocalStorage } from "../utils/storage.js";

const HeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden bg-background">
    <div
      className="absolute inset-0 opacity-60 pointer-events-none"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 30%, rgba(150,150,150,0.08) 0%, transparent 65%)",
      }}
    />
  </div>
);

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = (path) => {
    window.location.href = path;
  };

  // Redirect to /admin if user already has a valid active session
  useEffect(() => {
    let mounted = true;
    const checkExistingSession = async () => {
      const token = safeLocalStorage.getItem("auth_token");
      if (!token) return;
      const res = await api.auth.verify();
      if (mounted && res?.success && res?.data?.user) {
        window.location.replace("/admin");
      }
    };
    checkExistingSession();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);

    try {
      const result = await api.auth.login({
        email: username.trim(),
        password,
      });

      if (!result.success) {
        setError(result.error || "Credenciales inválidas. Verifica tu correo y contraseña.");
        setIsSubmitting(false);
        return;
      }

      if (result.data?.token) {
        safeLocalStorage.setItem("auth_token", result.data.token);
        safeLocalStorage.setItem("user", JSON.stringify(result.data.user || {}));
        navigate("/admin");
      } else {
        setError("No se pudo iniciar la sesión.");
        setIsSubmitting(false);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Login error:", err);
      }
      setError("Error de conexión. Verifica tu conexión a internet.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background text-text p-4 sm:p-6">
      <HeroBackground />

      {/* Botón de Regresar */}
      <a
        href="/"
        className="absolute top-6 left-6 z-50 text-xs font-semibold tracking-widest uppercase text-text-muted hover:text-text transition-colors duration-300 flex items-center gap-2"
      >
        <span style={{ fontSize: "1.1rem" }}>←</span> Regresar al sitio web
      </a>

      {/* Minimalist Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="card-premium p-8 sm:p-10 md:p-12">
          <div className="text-center mb-10">
            <h1
              className="text-3xl sm:text-4xl font-extrabold mb-2 uppercase tracking-[0.1em] text-text"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Login
            </h1>
            <p className="text-xs uppercase tracking-widest text-text-muted font-semibold mt-3">
              Panel de Administración
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="username" className="sr-only">
                Correo electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-text-muted group-focus-within:text-text transition-colors" />
                </div>
                <input
                  type="email"
                  id="username"
                  name="email"
                  autoComplete="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-8 pr-4 py-3 bg-transparent border-b-2 border-strong text-text placeholder:text-text-muted/60 focus:outline-none focus:border-text transition-all duration-300 text-sm tracking-wider"
                  placeholder="CORREO (EMAIL)"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-text-muted group-focus-within:text-text transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-8 pr-12 py-3 bg-transparent border-b-2 border-strong text-text placeholder:text-text-muted/60 focus:outline-none focus:border-text transition-all duration-300 text-sm tracking-wider"
                  placeholder="CONTRASEÑA"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center text-text-muted hover:text-text transition-colors duration-200 focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl"
              >
                <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">
                  {error}
                </p>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-premium btn-premium-solid w-full mt-6 py-3.5 rounded-full text-xs font-bold tracking-[0.15em] uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>VERIFICANDO...</span>
                </>
              ) : (
                <span>ENTRAR</span>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default withProviders(LoginPage);
