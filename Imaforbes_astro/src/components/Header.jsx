import withProviders from './withProviders.jsx';
// src/components/Header.jsx
import React, { useState, useEffect, memo, useCallback } from "react";

import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";

const Header = memo(({ currentPath }) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = { pathname: currentPath || (typeof window !== "undefined" ? window.location.pathname : "/") };

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isMenuOpen]);

  const handleNavLinkClick = () => setIsMenuOpen(false);

  const navItems = [
    { path: "/", label: "header.home" },
    { path: "/about", label: "header.about-me" },
    { path: "/projects", label: "header.projects" },
    { path: "/blog", label: "header.blog" },
    { path: "/contact", label: "header.contact" },
  ];

  const menuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { type: "tween", duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { type: "tween", duration: 0.2, ease: "easeIn" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.2 } }),
  };

  return (
    <>
      <motion.header
        className={`header-premium ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container-premium nav-premium">
          {/* Logo */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <a href="/" className="logo-premium" onClick={handleNavLinkClick}>
              IMAFORBES
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="nav-links-premium">
            {navItems.map((link) => (
              <motion.div key={link.path} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <a 
                  href={link.path}
                  className={`nav-item-premium ${location.pathname === link.path ? 'active' : ''}`}
                >
                  {t(link.label)}
                  {location.pathname === link.path && (
                    <motion.div
                      className="nav-active-indicator"
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </a>
              </motion.div>
            ))}
          </nav>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', paddingRight: '1rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.3 }}>
              <ThemeToggle />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 0.3 }}>
              <LanguageToggle />
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)' }}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)', zIndex: 40 }}
              className="lg:hidden"
            />

            <motion.nav
              initial="hidden" animate="visible" exit="exit" variants={menuVariants}
              style={{ position: 'fixed', top: '5rem', left: 0, right: 0, background: 'var(--color-bg-light)', zIndex: 50, borderTop: '1px solid var(--color-border-light)' }}
              className="lg:hidden dark:bg-dark"
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem' }}>
                {navItems.map((link) => (
                  <motion.div key={link.path} variants={itemVariants} onClick={handleNavLinkClick}>
                    <a 
                      href={link.path}
                      style={{ display: 'block', padding: '1rem', color: location.pathname === link.path ? 'var(--color-text-light)' : 'var(--color-text-muted-light)', textDecoration: 'none', borderBottom: '1px solid var(--color-border-light)' }}
                    >
                      {t(link.label)}
                    </a>
                  </motion.div>
                ))}

                <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', paddingTop: '1rem' }}>
                  <LanguageToggle size="lg" />
                  <ThemeToggle size="lg" />
                </motion.div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

Header.displayName = 'Header';
export default withProviders(Header);
