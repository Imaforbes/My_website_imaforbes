import withProviders from '../components/withProviders.jsx';
// src/pages_react/Dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { api } from "../services/api.js";
import { useAdminAuth } from "../hooks/useAdminAuth.js";
import {
  LogOut,
  MessageSquare,
  Settings,
  BarChart3,
  Mail,
  Eye,
  Heart,
  Calendar,
  FileText,
  Briefcase,
} from "lucide-react";

const HeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-background"></div>
  </div>
);

const Dashboard = () => {
  const { isCheckingAuth, isAuthenticated, logout } = useAdminAuth();
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalMessages: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = (path) => {
    window.location.href = path;
  };

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const result = await api.admin.getStats();
      if (result.success && result.data) {
        setStats({
          totalPosts: result.data.total_posts || 0,
          totalViews: result.data.total_views || 0,
          totalLikes: result.data.total_likes || 0,
          totalMessages: result.data.total_messages || 0,
          totalComments: result.data.total_comments || 0,
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("Error fetching stats:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated, fetchStats]);

  const dashboardItems = [
    {
      title: "Mensajes",
      description: "Gestionar mensajes de contacto recibidos",
      icon: Mail,
      path: "/admin/mensajes",
      stats: `${stats.totalMessages} mensajes`,
    },
    {
      title: "Mi Blog",
      description: "Crear, editar y publicar poemas, cartas y artículos",
      icon: FileText,
      path: "/admin/blog",
      stats: `${stats.totalPosts} publicaciones`,
    },
    {
      title: "Comentarios",
      description: "Moderar y eliminar comentarios del blog",
      icon: MessageSquare,
      path: "/admin/blog?tab=comments",
      stats: `${stats.totalComments} comentarios`,
    },
    {
      title: "Experiencias",
      description: "Gestionar trayectoria y experiencias laborales",
      icon: Briefcase,
      path: "/admin/experiences",
      stats: "Trayectoria profesional",
    },
    {
      title: "Estadísticas",
      description: "Métricas de lectura, likes y actividad del sitio",
      icon: BarChart3,
      path: "/admin/stats",
      stats: `${stats.totalViews} vistas · ${stats.totalLikes} likes`,
    },
    {
      title: "Configuración",
      description: "Ajustes generales, apariencia y estado del sistema",
      icon: Settings,
      path: "/admin/settings",
      stats: "Sistema y apariencia",
    },
  ];

  if (isCheckingAuth || !isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-text">
        <p className="text-text-muted font-light">Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-text p-4 sm:p-8">
      <HeroBackground />
      <div className="relative z-10 container mx-auto max-w-7xl">
        {/* Page Title Section */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <motion.h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-tight tracking-tight text-text"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Panel de Administración
            </motion.h1>

            <motion.button
              onClick={logout}
              className="btn-premium btn-premium-surface flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium cursor-pointer"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </motion.button>
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-surface p-5 sm:p-6 rounded-2xl border border-strong shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-3 bg-background rounded-2xl border border-strong flex-shrink-0">
                <FileText className="text-text w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-text-muted text-xs sm:text-sm font-light mb-1">Publicaciones</p>
                <p className="text-2xl sm:text-3xl font-semibold text-text">{stats.totalPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface p-5 sm:p-6 rounded-2xl border border-strong shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-3 bg-background rounded-2xl border border-strong flex-shrink-0">
                <Eye className="text-text w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-text-muted text-xs sm:text-sm font-light mb-1">Total Vistas</p>
                <p className="text-2xl sm:text-3xl font-semibold text-text">{stats.totalViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface p-5 sm:p-6 rounded-2xl border border-strong shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-3 bg-background rounded-2xl border border-strong flex-shrink-0">
                <Heart className="text-text w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-text-muted text-xs sm:text-sm font-light mb-1">Total Likes</p>
                <p className="text-2xl sm:text-3xl font-semibold text-text">{stats.totalLikes}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface p-5 sm:p-6 rounded-2xl border border-strong shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-3 bg-background rounded-2xl border border-strong flex-shrink-0">
                <Mail className="text-text w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-text-muted text-xs sm:text-sm font-light mb-1">Mensajes</p>
                <p className="text-2xl sm:text-3xl font-semibold text-text">{stats.totalMessages}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {dashboardItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.button
                key={item.title}
                onClick={() => navigate(item.path)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * (index + 1) }}
                className="bg-surface p-5 sm:p-6 rounded-2xl border border-strong shadow-sm text-left group hover:border-text transition-all duration-200 cursor-pointer"
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="p-3 bg-background border border-strong rounded-2xl group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                    <IconComponent size={20} className="sm:w-6 sm:h-6 text-text" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-medium text-text">{item.title}</h2>
                </div>
                <p className="text-text-muted text-xs sm:text-sm mb-3 font-light">
                  {item.description}
                </p>
                <p className="text-text text-xs font-medium">{item.stats}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-surface p-5 sm:p-6 rounded-2xl border border-strong shadow-sm">
          <h2 className="text-lg sm:text-xl font-light text-text mb-4">Acciones Rápidas</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <button
              onClick={() => navigate("/admin/blog")}
              className="btn-premium btn-premium-solid flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium cursor-pointer"
            >
              <FileText size={15} />
              <span>Gestionar Blog</span>
            </button>
            <button
              onClick={() => navigate("/admin/mensajes")}
              className="btn-premium btn-premium-surface flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium cursor-pointer"
            >
              <MessageSquare size={15} />
              <span>Ver Mensajes</span>
            </button>
            <button
              onClick={() => navigate("/blog")}
              className="btn-premium btn-premium-surface flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium cursor-pointer"
            >
              <Eye size={15} />
              <span>Ver Blog Público</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="btn-premium btn-premium-surface flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium cursor-pointer"
            >
              <Calendar size={15} />
              <span>Ir al Portafolio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withProviders(Dashboard);
