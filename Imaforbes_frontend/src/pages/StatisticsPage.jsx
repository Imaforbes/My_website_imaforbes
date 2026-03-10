// src/pages/StatisticsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_CONFIG } from "../config/api.js";
import { api } from "../services/api.js";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Mail,
  Calendar,
  Eye,
  Clock,
  Heart,
  FileText,
} from "lucide-react";

const HeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    {/* Minimalist subtle background */}
    <div className="absolute inset-0 bg-gray-50 dark:bg-[#0a0a0a]"></div>
  </div>
);

const StatisticsPage = () => {
  const [stats, setStats] = useState({
    totalMessages: 0,
    newMessages: 0,
    readMessages: 0,
    repliedMessages: 0,
    messagesByMonth: [],
    recentActivity: [],
  });
  const [blogStats, setBlogStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    viewsLast7Days: 0,
    viewsLast30Days: 0,
    mostViewed: [],
    mostLiked: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatistics();
    fetchBlogStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const baseURL = API_CONFIG.getBaseURL();

      const response = await fetch(`${baseURL}/api/messages.php`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        navigate("/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const messages = data.data.items || data.data;
          
          // Calculate statistics
          const totalMessages = messages.length;
          const newMessages = messages.filter(msg => !msg.status || msg.status === "new").length;
          const readMessages = messages.filter(msg => msg.status === "read").length;
          const repliedMessages = messages.filter(msg => msg.status === "replied").length;
          
          // Group messages by month
          const messagesByMonth = messages.reduce((acc, msg) => {
            const date = new Date(msg.created_at);
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            acc[month] = (acc[month] || 0) + 1;
            return acc;
          }, {});

          // Recent activity (last 5 messages)
          const recentActivity = messages
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);

          setStats({
            totalMessages,
            newMessages,
            readMessages,
            repliedMessages,
            messagesByMonth: Object.entries(messagesByMonth).map(([month, count]) => ({
              month,
              count,
            })),
            recentActivity,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const fetchBlogStatistics = async () => {
    try {
      const result = await api.blog.getStats();
      
      // Check for authentication errors
      if (result.status === 401 || result.status === 403 || (result.success === false && (result.error?.includes('Authentication') || result.error?.includes('Unauthorized') || result.error?.includes('Forbidden')))) {
        console.error("Blog Stats: Authentication failed - redirecting to login");
        navigate("/login");
        return;
      }
      
      if (result.success && result.data?.success) {
        const data = result.data.data || result.data;
        setBlogStats({
          totalPosts: data.total_posts || 0,
          totalViews: data.total_views || 0,
          totalLikes: data.total_likes || 0,
          viewsLast7Days: data.views_last_7_days || 0,
          viewsLast30Days: data.views_last_30_days || 0,
          mostViewed: data.most_viewed || [],
          mostLiked: data.most_liked || [],
        });
      } else if (result.success && result.data) {
        // Handle case where data is directly in result.data
        const data = result.data;
        setBlogStats({
          totalPosts: data.total_posts || 0,
          totalViews: data.total_views || 0,
          totalLikes: data.total_likes || 0,
          viewsLast7Days: data.views_last_7_days || 0,
          viewsLast30Days: data.views_last_30_days || 0,
          mostViewed: data.most_viewed || [],
          mostLiked: data.most_liked || [],
        });
      }
    } catch (error) {
      console.error("Error fetching blog statistics:", error);
      // If it's an authentication error, redirect to login
      if (error.status === 401 || error.status === 403) {
        navigate("/login");
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center text-gray-900 dark:text-white">
        <p className="font-light">Cargando estadísticas...</p>
      </div>
    );
  }

  const messageStatCards = [
    {
      title: "Total Mensajes",
      value: stats.totalMessages,
      icon: Mail,
      color: "bg-blue-600",
      iconColor: "text-blue-400",
    },
    {
      title: "Nuevos Mensajes",
      value: stats.newMessages,
      icon: Eye,
      color: "bg-green-600",
      iconColor: "text-green-400",
    },
    {
      title: "Leídos",
      value: stats.readMessages,
      icon: Clock,
      color: "bg-yellow-600",
      iconColor: "text-yellow-400",
    },
    {
      title: "Respondidos",
      value: stats.repliedMessages,
      icon: TrendingUp,
      color: "bg-purple-600",
      iconColor: "text-purple-400",
    },
  ];

  const blogStatCards = [
    {
      title: "Total Posts",
      value: blogStats.totalPosts,
      icon: FileText,
      color: "bg-indigo-600",
      iconColor: "text-indigo-400",
    },
    {
      title: "Total Vistas",
      value: blogStats.totalViews,
      icon: Eye,
      color: "bg-cyan-600",
      iconColor: "text-cyan-400",
    },
    {
      title: "Total Likes",
      value: blogStats.totalLikes,
      icon: Heart,
      color: "bg-pink-600",
      iconColor: "text-pink-400",
    },
    {
      title: "Vistas (7 días)",
      value: blogStats.viewsLast7Days,
      icon: TrendingUp,
      color: "bg-emerald-600",
      iconColor: "text-emerald-400",
    },
  ];

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
                className="p-2 bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#151515] rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={20} className="text-gray-900 dark:text-white" />
              </motion.button>
              <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-tight tracking-tight text-gray-900 dark:text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                Estadísticas del Sitio
              </motion.h1>
            </div>
          </div>

          {/* Message Stats Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-light text-gray-900 dark:text-white mb-4">Estadísticas de Mensajes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {messageStatCards.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg">
                        <IconComponent className="text-gray-700 dark:text-gray-300" size={24} />
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-light">{card.title}</p>
                        <p className="text-2xl font-light text-gray-900 dark:text-white">{card.value}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Blog Stats Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-light text-gray-900 dark:text-white mb-4">Estadísticas del Blog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {blogStatCards.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * (index + 4) }}
                    className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg">
                        <IconComponent className="text-gray-700 dark:text-gray-300" size={24} />
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-light">{card.title}</p>
                        <p className="text-2xl font-light text-gray-900 dark:text-white">{card.value}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Messages by Month */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
            >
              <h3 className="text-xl font-light text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-gray-700 dark:text-gray-300" />
                Mensajes por Mes
              </h3>
              <div className="space-y-3">
                {stats.messagesByMonth.length > 0 ? (
                  stats.messagesByMonth.map((item, index) => (
                    <div key={item.month} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300 font-light">{item.month}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-gray-900 dark:bg-white h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${(item.count / Math.max(...stats.messagesByMonth.map(m => m.count))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-gray-900 dark:text-white font-light w-8 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 font-light">No hay datos disponibles</p>
                )}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
            >
              <h3 className="text-xl font-light text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock size={20} className="text-gray-700 dark:text-gray-300" />
                Actividad Reciente (Mensajes)
              </h3>
              <div className="space-y-3">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="p-2 bg-gray-100 dark:bg-[#0a0a0a] rounded-lg">
                        <Mail size={16} className="text-gray-700 dark:text-gray-300" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white text-sm font-light">{activity.name}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-xs font-light">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 font-light">No hay actividad reciente</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Blog Top Posts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Most Viewed Posts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
            >
              <h3 className="text-xl font-light text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Eye size={20} className="text-gray-700 dark:text-gray-300" />
                Posts Más Vistos
              </h3>
              <div className="space-y-3">
                {blogStats.mostViewed.length > 0 ? (
                  blogStats.mostViewed.map((post, index) => (
                    <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white text-sm font-light line-clamp-1">{post.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-gray-600 dark:text-gray-400 text-xs flex items-center gap-1 font-light">
                            <Eye size={12} />
                            {post.views_count || 0}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 text-xs flex items-center gap-1 font-light">
                            <Heart size={12} />
                            {post.likes_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 font-light">No hay posts disponibles</p>
                )}
              </div>
            </motion.div>

            {/* Most Liked Posts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
            >
              <h3 className="text-xl font-light text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Heart size={20} className="text-gray-700 dark:text-gray-300" />
                Posts Más Liked
              </h3>
              <div className="space-y-3">
                {blogStats.mostLiked.length > 0 ? (
                  blogStats.mostLiked.map((post, index) => (
                    <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white text-sm font-light line-clamp-1">{post.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-gray-600 dark:text-gray-400 text-xs flex items-center gap-1 font-light">
                            <Heart size={12} />
                            {post.likes_count || 0}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 text-xs flex items-center gap-1 font-light">
                            <Eye size={12} />
                            {post.views_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 font-light">No hay posts disponibles</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <h3 className="text-xl font-light text-gray-900 dark:text-white mb-4">Resumen del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-light text-gray-900 dark:text-white">{stats.totalMessages}</p>
                <p className="text-gray-600 dark:text-gray-400 font-light">Total de Mensajes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-light text-gray-900 dark:text-white">
                  {stats.totalMessages > 0 ? Math.round((stats.readMessages / stats.totalMessages) * 100) : 0}%
                </p>
                <p className="text-gray-600 dark:text-gray-400 font-light">Tasa de Lectura</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-light text-gray-900 dark:text-white">
                  {stats.totalMessages > 0 ? Math.round((stats.repliedMessages / stats.totalMessages) * 100) : 0}%
                </p>
                <p className="text-gray-600 dark:text-gray-400 font-light">Tasa de Respuesta</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default StatisticsPage;
