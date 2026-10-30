import withProviders from './withProviders.jsx';
// src/components/Breadcrumbs.jsx
import React from "react";

import { Home, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const Breadcrumbs = ({ currentPath }) => {
  const location = { pathname: currentPath || (typeof window !== "undefined" ? window.location.pathname : "/") };
  const { t } = useTranslation();

  // Don't show breadcrumbs on home page or admin pages
  if (location.pathname === "/" || location.pathname.startsWith("/admin") || location.pathname === "/login") {
    return null;
  }

  const pathnames = location.pathname.split("/").filter((x) => x);

  const getBreadcrumbName = (pathname) => {
    const translations = {
      about: t("header.about-me") || "About",
      trajectory: t("header.trajectory") || "Trajectory",
      projects: t("header.projects") || "Projects",
      blog: t("header.blog") || "Blog",
      contact: t("header.contact") || "Contact",
    };

    return translations[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);
  };

  return (
    <nav
      className="bg-transparent px-4 sm:px-6 lg:px-8 pt-6 pb-2 mt-[68px] relative z-10"
      aria-label="Breadcrumb"
    >
      <div className="container-premium">
        <ol
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '999px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin: 0,
            listStyle: 'none',
          }}
        >
          <li>
            <a
              href="/"
              className="text-text-muted hover:text-text transition-colors duration-200 flex items-center"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="sr-only">{t("breadcrumbs.home") || "Home"}</span>
            </a>
          </li>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;

            return (
              <li key={name} className="flex items-center shrink-0">
                <ChevronRight className="w-3.5 h-3.5 text-text-muted mx-1" />
                {isLast ? (
                  <span className="text-text font-bold truncate" aria-current="page">
                    {getBreadcrumbName(name)}
                  </span>
                ) : (
                  <a
                    href={routeTo}
                    className="text-text-muted hover:text-text transition-colors duration-200"
                  >
                    {getBreadcrumbName(name)}
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default withProviders(Breadcrumbs);
