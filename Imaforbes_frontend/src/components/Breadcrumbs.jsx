// src/components/Breadcrumbs.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const Breadcrumbs = () => {
  const location = useLocation();
  const { t } = useTranslation();

  // Don't show breadcrumbs on home page or admin pages
  if (location.pathname === "/" || location.pathname.startsWith("/admin") || location.pathname === "/login") {
    return null;
  }

  const pathnames = location.pathname.split("/").filter((x) => x);

  const getBreadcrumbName = (pathname) => {
    const translations = {
      about: t("header.about-me") || "About",
      projects: t("header.proyects") || "Projects",
      blog: t("header.blog") || "Blog",
      contact: t("header.contact") || "Contact",
    };

    return translations[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);
  };

  return (
    <nav
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-3 mt-16 md:mt-20"
      aria-label="Breadcrumb"
    >
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link
              to="/"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 flex items-center"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only">{t("breadcrumbs.home") || "Home"}</span>
            </Link>
          </li>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;

            return (
              <li key={name} className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-2" />
                {isLast ? (
                  <span className="text-gray-900 dark:text-gray-100 font-medium" aria-current="page">
                    {getBreadcrumbName(name)}
                  </span>
                ) : (
                  <Link
                    to={routeTo}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                  >
                    {getBreadcrumbName(name)}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumbs;

