// src/App.jsx
/**
 * App - Main Application Component
 * 
 * DESIGN CHANGES:
 * - Updated background colors: clean white/dark instead of gray gradients
 * - Updated 404 page: minimalist design matching the rest of the portfolio
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Lazy loading of all routes for better code splitting
 * - Reduced initial bundle size
 */
import React, { Suspense, lazy } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTopButton from "./components/ScrollToTopButton";
import Breadcrumbs from "./components/Breadcrumbs";
import BrowserSupport from "./components/BrowserSupport";
import LoadingSpinner from "./components/LoadingSpinner";

import "./i18n"; // Configuración de internacionalización

// Lazy load all pages for better performance and code splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminMensajes = lazy(() => import("./pages/AdminMensajes"));
const AdminBlog = lazy(() => import("./pages/AdminBlog"));
const AdminExperiences = lazy(() => import("./pages/AdminExperiences"));
const StatisticsPage = lazy(() => import("./pages/StatisticsPage"));
const ConfigurationPage = lazy(() => import("./pages/ConfigurationPage"));

// 404 Not Found Page Component
const NotFoundPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="text-center px-4">
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-light mb-4 text-gray-900 dark:text-white">
          404
        </h1>
        <p className="text-xl sm:text-2xl mb-8 text-gray-600 dark:text-gray-400 font-light">
          {t("notFound.message")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-8 py-4 border border-gray-900 dark:border-white text-gray-900 dark:text-white font-medium tracking-wide transition-all duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:ring-offset-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t("notFound.goBack")}
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-medium tracking-wide transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2"
          >
            {t("notFound.backHome")}
          </a>
        </div>
      </div>
    </div>
  );
};

function App() {
  const location = useLocation();
  
  // Determine if we're on an admin or login page (hide header/footer/breadcrumbs)
  const isAdminPage = location.pathname.startsWith("/admin") || location.pathname === "/login";
  
  return (
    <ErrorBoundary>
      <BrowserSupport />
      <div className="flex flex-col min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
        {!isAdminPage && <Header />}
        {!isAdminPage && <Breadcrumbs />}
        <main className={`flex-grow ${!isAdminPage ? 'pt-16 md:pt-20' : ''}`}>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Rutas Públicas del Portafolio */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/contact" element={<ContactPage />} />

            {/* Rutas del Sistema de Admin */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/mensajes" element={<AdminMensajes />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/experiences" element={<AdminExperiences />} />
            <Route path="/admin/stats" element={<StatisticsPage />} />
            <Route path="/admin/settings" element={<ConfigurationPage />} />

              {/* Ruta para 404 - Página no encontrada */}
              <Route
                path="*"
                element={<NotFoundPage />}
              />
            </Routes>
          </Suspense>
        </main>
        {!isAdminPage && <Footer />}
        {!isAdminPage && <ScrollToTopButton />}
      </div>
    </ErrorBoundary>
  );
}

export default App;
