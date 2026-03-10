// src/pages/Dashboard.jsx
/**
 * Dashboard - Minimalist & Deluxe Design
 * 
 * DESIGN CHANGES:
 * - Removed animated blob backgrounds
 * - Changed from colorful gradient backgrounds to clean white/dark
 * - Updated stats cards: minimalist white/dark cards with neutral icons
 * - Changed dashboard items: removed colorful backgrounds, using clean borders
 * - Updated buttons: minimalist black/white or border-only styles
 * - Added text reflection effect to title
 * - Simplified all animations for cleaner feel
 * - Changed typography to font-light throughout
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_CONFIG } from "../config/api.js";
import { safeLocalStorage } from "../utils/storage.js";
import {
  LogOut,
  MessageSquare,
  Users,
  Settings,
  BarChart3,
  Mail,
  Eye,
  Calendar,
  FileText,
  Briefcase,
} from "lucide-react";

// Modern animated background
const HeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    {/* Modern gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a]"></div>
    {/* Subtle animated grid pattern */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] opacity-60"></div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMessages: 0,
    newMessages: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Check if user is authenticated before making API call
    const authToken = safeLocalStorage.getItem('auth_token');
    if (!authToken) {
      // No auth token, redirect to login
      navigate("/login");
      return;
    }

    try {
      const baseURL = API_CONFIG.getBaseURL();

      // Fetch messages to get stats
      const response = await fetch(`${baseURL}/api/messages.php`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // Handle 401/403 errors silently (expected if session expired)
      if (response.status === 401 || response.status === 403) {
        // Only log in development mode
        if (import.meta.env.DEV) {
          console.warn("Dashboard: Authentication failed - redirecting to login");
        }
        navigate("/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        
        // Only log in development mode
        if (import.meta.env.DEV) {
          console.log("Dashboard API response:", data);
        }
        
        if (data.success && data.data) {
          // Handle paginated response
          const messages = Array.isArray(data.data.items) ? data.data.items : [];
          const pagination = data.data.pagination || {};
          
          const totalItems = pagination.total_items !== undefined ? pagination.total_items : messages.length;
          
          setStats({
            totalMessages: totalItems || 0,
            newMessages: totalItems || 0, // All messages are "new" since datos table doesn't have status column
            totalUsers: 1, // You have 1 admin user
          });
        } else {
          // Only log warnings in development mode
          if (import.meta.env.DEV) {
            console.warn("Unexpected API response format:", data);
          }
          // Set defaults if no data
          setStats({
            totalMessages: 0,
            newMessages: 0,
            totalUsers: 1,
          });
        }
      } else {
        // Only log errors in development mode
        if (import.meta.env.DEV) {
          try {
            const errorText = await response.text();
            console.warn("Dashboard API error:", response.status, errorText);
          } catch (e) {
            // Ignore text parsing errors
          }
        }
        // Even if there's an error, set loading to false so UI shows
        setStats({
          totalMessages: 0,
          newMessages: 0,
          totalUsers: 1,
        });
      }
    } catch (error) {
      // Only log errors in development mode (skip network errors)
      if (import.meta.env.DEV && error.name !== 'TypeError') {
        console.warn("Error fetching stats:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const baseURL = API_CONFIG.getBaseURL();

    await fetch(`${baseURL}/api/auth/logout.php`, {
      method: "POST",
      credentials: "include",
    });
    navigate("/login");
  };

  const dashboardItems = [
    {
      title: "Mensajes",
      description: "Gestionar mensajes de contacto",
      icon: MessageSquare,
      path: "/admin/mensajes",
      stats: `${stats.totalMessages} mensajes`,
    },
    {
      title: "Mi Blog",
      description: "Gestionar poemas y cartas",
      icon: FileText,
      path: "/admin/blog",
      stats: "Poemas y cartas",
    },
    {
      title: "Experiencias",
      description: "Gestionar experiencias laborales",
      icon: Briefcase,
      path: "/admin/experiences",
      stats: "Experiencias laborales",
    },
    {
      title: "Estadísticas",
      description: "Ver estadísticas del sitio",
      icon: BarChart3,
      path: "/admin/stats",
      stats: `${stats.newMessages} nuevos`,
    },
    {
      title: "Configuración",
      description: "Configurar el sistema",
      icon: Settings,
      path: "/admin/settings",
      stats: "Próximamente",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center text-gray-900 dark:text-white">
        <p className="text-gray-600 dark:text-gray-400 font-light">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white p-4 sm:p-8">
        <HeroBackground />
        <div className="relative z-10 container mx-auto max-w-7xl">
          {/* Page Title Section */}
          <div className="mb-8 sm:mb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-tight tracking-tight text-gray-900 dark:text-white text-reflection"
                data-text="Panel de Administración"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Panel de Administración
              </motion.h1>

              <motion.button
                onClick={handleLogout}
                className="group flex items-center justify-center gap-2 px-6 py-3 border border-gray-900 dark:border-white text-gray-900 dark:text-white text-sm font-medium tracking-wide transition-all duration-300 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black rounded-2xl modern-shadow-md hover:modern-shadow-lg modern-hover"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <LogOut size={16} />
                <span>Cerrar Sesión</span>
              </motion.button>
            </div>
          </div>

          {/* Stats Cards - Enhanced Modern Design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-sm p-5 sm:p-6 modern-border modern-shadow-md modern-card modern-hover border border-gray-200/50 dark:border-gray-800/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 modern-border modern-shadow rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="text-blue-600 dark:text-blue-400 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium mb-1">Total Mensajes</p>
                    <p className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
                      {stats.totalMessages}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-sm p-5 sm:p-6 modern-border modern-shadow-md modern-card modern-hover border border-gray-200/50 dark:border-gray-800/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 modern-border modern-shadow rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Eye className="text-green-600 dark:text-green-400 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium mb-1">Nuevos Mensajes</p>
                    <p className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
                      {stats.newMessages}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-sm p-5 sm:p-6 modern-border modern-shadow-md modern-card modern-hover sm:col-span-2 md:col-span-1 border border-gray-200/50 dark:border-gray-800/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 modern-border modern-shadow rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Users className="text-purple-600 dark:text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium mb-1">Usuarios Admin</p>
                    <p className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
                      {stats.totalUsers}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Dashboard Items - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {dashboardItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.button
                  key={item.title}
                  onClick={() => navigate(item.path)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                  className="bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-sm p-5 sm:p-6 modern-border modern-shadow-md modern-card modern-hover text-left group border border-gray-200/50 dark:border-gray-800/50"
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 modern-border modern-shadow rounded-xl group-hover:modern-shadow-md group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                      <IconComponent size={20} className="sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-light text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 font-light">
                    {item.description}
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-[10px] xs:text-xs font-light">{item.stats}</p>
                </motion.button>
              );
            })}
          </div>

          {/* Quick Actions - Responsive button layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6 sm:mt-8 bg-white dark:bg-[#0f0f0f] p-4 sm:p-6 modern-border modern-shadow-md modern-card"
          >
            <h3 className="text-lg sm:text-xl font-light text-gray-900 dark:text-white mb-3 sm:mb-4">
              Acciones Rápidas
            </h3>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => navigate("/admin/mensajes")}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-2xl modern-shadow-md hover:modern-shadow-lg modern-hover"
              >
                <MessageSquare size={14} className="sm:w-4 sm:h-4" />
                Ver Mensajes
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-900 dark:border-white text-gray-900 dark:text-white text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black rounded-2xl modern-shadow-md hover:modern-shadow-lg modern-hover"
              >
                <Eye size={14} className="sm:w-4 sm:h-4" />
                Ver Contacto
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-900 dark:border-white text-gray-900 dark:text-white text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black rounded-2xl modern-shadow-md hover:modern-shadow-lg modern-hover"
              >
                <Calendar size={14} className="sm:w-4 sm:h-4" />
                Ver Portfolio
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
